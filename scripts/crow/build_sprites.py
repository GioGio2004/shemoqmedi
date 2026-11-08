#!/usr/bin/env python3
"""
Living crow: green-screen clips -> black silhouette WebP sprite sheets.

Run once from the repo root (needs Python 3.10+, OpenCV, NumPy, Pillow):

    python -m pip install -r scripts/crow/requirements.txt
    python scripts/crow/build_sprites.py [--preview DIR]

Sources live in assets/crow-raw/. The intended clips are walk.mp4, idle.mp4,
hop.mp4 and takeoff.mp4 (24 fps, one crow, side view facing right). Any of
them that is missing is cut instead from forage.mp4, a single take of the
same kind of crow walking, pecking, hopping and turning (see FORAGE below),
so the site works today and gets better as soon as the real clips land.

Output, in public/crow/:
    <name>.webp   horizontal sprite sheet, RGBA, crow ~160 px tall (2x)
    <name>.json   frames, frameWidth, frameHeight, fps, anchor, ...
    index.json    which animations exist + the shared frame geometry

Every animation shares one frame size and one anchor (the point between the
feet on the ground), so poses line up exactly when the player switches.
"""

from __future__ import annotations

import argparse
import io
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "assets" / "crow-raw"
OUT = ROOT / "public" / "crow"

INK = 11  # #0B0B0B
PIXEL_RATIO = 2  # sprite px per CSS px
TARGET_H = 160  # standing crow height in sprite px (80 CSS px)
MAX_BYTES = 600_000
MIN_SPECK = 150  # px, connected components (and holes) smaller than this go
GROUND_TOL = 0.025  # fraction of standing height: closer than this = on the ground
PAD = 4  # sprite px around the union of all poses


# --------------------------------------------------------------------------
# Clip definitions
# --------------------------------------------------------------------------


@dataclass
class Clip:
    name: str
    file: str
    # Source frame indices, in play order (may repeat, e.g. a ping-pong loop).
    # None = every frame of the file.
    seq: list[int] | None = None
    fps: float = 24.0
    # How the horizontal anchor is found:
    #   track = alpha centroid per frame, smoothed over 5 frames (spec default)
    #   feet  = foot position on the ground, interpolated through the air
    #   fixed = one anchor for the whole clip (crow stands still in the source)
    anchor: str = "track"
    loop: bool = True
    auto_loop: tuple[int, int] | None = None  # search a seamless loop of P frames in [a, b]
    pingpong: bool = False  # player hint: idle swings back and forth
    air: bool = False  # find airborne frames (hop, takeoff)
    leaves: bool = False  # crow exits the source frame (takeoff): drop clipped frames
    loop_start: int | None = None  # player loops seq[loop_start:] (takeoff flap)
    feather_left: int = 0  # source px: soften a silhouette cut by the frame edge
    front: bool = False  # turn: trim to the most frontal (narrowest) pose
    notes: list[str] = field(default_factory=list)


SPEC = {
    "walk": Clip("walk", "walk.mp4", auto_loop=(8, 40)),
    "idle": Clip("idle", "idle.mp4", anchor="feet", pingpong=False),
    "hop": Clip("hop", "hop.mp4", anchor="feet", loop=False, air=True),
    "takeoff": Clip("takeoff", "takeoff.mp4", anchor="feet", loop=False, air=True, leaves=True),
}

# Segments of forage.mp4 (1280x720, 24 fps, 190 frames). Frame numbers were
# picked by eye from contact sheets; see the notes printed by the script.
FORAGE = {
    "walk": Clip("walk", "forage.mp4", seq=list(range(16, 38)), auto_loop=(8, 22)),
    "idle": Clip("idle", "forage.mp4", seq=list(range(135, 143)), anchor="fixed", pingpong=True),
    "peck": Clip("peck", "forage.mp4", seq=list(range(112, 134)), anchor="fixed", loop=False),
    # Right side -> facing the camera, feet planted. The player plays it
    # forwards, mirrors at the front view and plays it back: an in-place turn.
    # (From frame 148 on the crow steps away, so the source's own left-facing
    # end is not used.)
    "turn": Clip("turn", "forage.mp4", seq=list(range(134, 148)), anchor="fixed", loop=False, front=True),
    "hop": Clip("hop", "forage.mp4", seq=list(range(2, 14)), anchor="feet", loop=False, air=True, feather_left=40),
    # No real fly-away exists in forage.mp4: the wing-flap hop's lift-off,
    # then its wing beat (frames 5-9) ping-ponged as a flight loop.
    "takeoff": Clip(
        "takeoff",
        "forage.mp4",
        seq=list(range(2, 10)) + [8, 7, 6, 5, 6, 7, 8, 9],
        anchor="feet",
        loop=False,
        air=True,
        loop_start=8,
        feather_left=40,
    ),
}

ORDER = ["walk", "idle", "hop", "takeoff", "peck", "turn"]


# --------------------------------------------------------------------------
# Matte
# --------------------------------------------------------------------------


def matte(bgr: np.ndarray, feather_left: int = 0) -> np.ndarray:
    """Soft alpha from a green screen, specks removed, small holes filled."""
    f = bgr.astype(np.int16)
    greenness = f[..., 1] - np.maximum(f[..., 2], f[..., 0])
    alpha = np.clip((60.0 - greenness) / 40.0, 0.0, 1.0).astype(np.float32)

    # Specks: solid components smaller than MIN_SPECK go. The soft edge is
    # kept only within a few px of what remains, which also clears the faint
    # haze the ground shadow leaves around the feet.
    core = (alpha > 0.5).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(core, connectivity=8)
    small = stats[:, cv2.CC_STAT_AREA] < MIN_SPECK
    small[0] = True
    core[small[lab]] = 0
    near = cv2.dilate(core, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    alpha[near == 0] = 0.0

    # Holes: green showing through the body (iridescent sheen keys out).
    h, w = alpha.shape
    bg = (alpha < 0.5).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(bg, connectivity=4)
    x, y, bw, bh, area = (stats[:, i] for i in range(5))
    touches = (x == 0) | (y == 0) | (x + bw >= w) | (y + bh >= h)
    hole = (area < MIN_SPECK) & ~touches
    hole[0] = False
    alpha[hole[lab]] = 1.0

    if feather_left:
        ramp = np.clip(np.arange(w, dtype=np.float32) / feather_left, 0, 1)
        alpha *= (ramp * ramp * (3 - 2 * ramp))[None, :]
    return alpha


@dataclass
class Frame:
    alpha: np.ndarray
    x0: int
    y0: int
    x1: int
    y1: int  # bottom row (feet, or lowest point)
    cx: float  # alpha centroid x
    foot_x: float  # centroid of the lowest band
    touches_edge: bool


def measure(alpha: np.ndarray) -> Frame | None:
    solid = alpha > 0.5
    ys, xs = np.nonzero(solid)
    if xs.size == 0:
        return None
    x0, x1, y0, y1 = int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max())
    cols = alpha.sum(axis=0)
    cx = float((cols * np.arange(alpha.shape[1])).sum() / max(cols.sum(), 1e-6))
    band = max(3, int((y1 - y0) * 0.04))
    foot = alpha[y1 - band : y1 + 1].sum(axis=0)
    foot_x = float((foot * np.arange(alpha.shape[1])).sum() / max(foot.sum(), 1e-6))
    h, w = alpha.shape
    edge = x0 <= 1 or y0 <= 1 or x1 >= w - 2 or y1 >= h - 2
    return Frame(alpha, x0, y0, x1, y1, cx, foot_x, edge)


def read_frames(path: Path, wanted: set[int] | None) -> dict[int, np.ndarray]:
    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened():
        raise RuntimeError(f"cannot open {path}")
    out, i = {}, 0
    last = max(wanted) if wanted else None
    while True:
        ok, fr = cap.read()
        if not ok or (last is not None and i > last):
            break
        if wanted is None or i in wanted:
            out[i] = fr
        i += 1
    cap.release()
    return out


def smooth(v: np.ndarray, k: int = 5) -> np.ndarray:
    if len(v) < 2:
        return v.copy()
    pad = k // 2
    p = np.pad(v, pad, mode="edge")
    return np.convolve(p, np.ones(k) / k, mode="valid")


# --------------------------------------------------------------------------
# Per clip analysis
# --------------------------------------------------------------------------


@dataclass
class Analysed:
    clip: Clip
    seq: list[int]  # source indices in play order
    frames: dict[int, Frame]
    ax: dict[int, float]  # anchor x per source frame
    ay: dict[int, float]  # anchor y per source frame
    ground: float
    stand_h: float  # standing height in source px
    airborne: set[int]
    scale: float = 1.0  # source px -> sprite px
    fps: float = 24.0
    notes: list[str] = field(default_factory=list)


def analyse(clip: Clip) -> Analysed:
    path = RAW / clip.file
    raw = read_frames(path, set(clip.seq) if clip.seq else None)
    seq = clip.seq if clip.seq else sorted(raw)
    notes: list[str] = []

    frames: dict[int, Frame] = {}
    for i in sorted(set(seq)):
        m = measure(matte(raw[i], clip.feather_left))
        if m is None:
            notes.append(f"frame {i}: empty after keying, dropped")
            continue
        frames[i] = m
    seq = [i for i in seq if i in frames]

    if clip.leaves:
        # Keep frames until the crow first touches the frame edge after lift-off.
        kept = []
        for i in seq:
            if frames[i].touches_edge and kept:
                notes.append(f"takeoff: crow reaches the frame edge at frame {i}; later frames dropped")
                break
            kept.append(i)
        seq = kept
    elif any(frames[i].touches_edge for i in seq) and not clip.feather_left:
        notes.append("crow touches the frame edge in some frames (silhouette may be cut)")

    src = sorted(set(seq))
    bottoms = np.array([frames[i].y1 for i in src], dtype=np.float32)
    ground = float(np.percentile(bottoms, 75))
    heights = np.array([ground - frames[i].y0 for i in src])
    first_h = float(np.median(heights[: min(3, len(heights))]))
    stand_h = float(np.median(heights)) if not clip.air else first_h
    tol = GROUND_TOL * stand_h
    airborne = {i for i in src if frames[i].y1 < ground - tol}

    # Horizontal anchor. Smoothing runs over the contiguous source range.
    ax: dict[int, float] = {}
    if clip.anchor == "fixed":
        v = float(np.median([frames[i].foot_x for i in src]))
        ax = {i: v for i in src}
    elif clip.anchor == "feet":
        xs = np.array([frames[i].foot_x for i in src], dtype=np.float64)
        on = np.array([i not in airborne for i in src])
        if on.any():
            idx = np.arange(len(src))
            xs = np.interp(idx, idx[on], xs[on])
        xs = smooth(xs)
        ax = dict(zip(src, xs.tolist()))
    else:
        # Body centre, smoothed, then moved by one constant so it sits
        # between the feet like the other modes (the player positions the
        # crow by its feet, so poses line up across animations).
        xs = smooth(np.array([frames[i].cx for i in src], dtype=np.float64))
        off = float(np.median([frames[i].cx - frames[i].foot_x for i in src if i not in airborne] or [0.0]))
        ax = dict(zip(src, (xs - off).tolist()))

    # Vertical anchor: the ground line, or the feet while airborne (the
    # crow stays in place; the player draws the jump arc itself).
    ay = {i: (float(frames[i].y1) if i in airborne else ground) for i in src}

    if clip.air and not airborne:
        notes.append("no airborne frames detected")
    return Analysed(clip, seq, frames, ax, ay, ground, stand_h, airborne, fps=clip.fps, notes=notes)


# --------------------------------------------------------------------------
# Rendering
# --------------------------------------------------------------------------


def pose_box(a: Analysed, i: int) -> tuple[float, float, float, float]:
    f, s = a.frames[i], a.scale
    return ((f.x0 - a.ax[i]) * s, (f.y0 - a.ay[i]) * s, (f.x1 + 1 - a.ax[i]) * s, (f.y1 + 1 - a.ay[i]) * s)


def render(a: Analysed, i: int, W: int, H: int, AX: float, AY: float) -> np.ndarray:
    f, s = a.frames[i], a.scale
    m = 3
    h, w = f.alpha.shape
    cx0, cy0 = max(f.x0 - m, 0), max(f.y0 - m, 0)
    cx1, cy1 = min(f.x1 + m + 1, w), min(f.y1 + m + 1, h)
    crop = f.alpha[cy0:cy1, cx0:cx1]
    sw, sh = max(1, round(crop.shape[1] * s)), max(1, round(crop.shape[0] * s))
    small = cv2.resize(crop, (sw, sh), interpolation=cv2.INTER_AREA)
    tx = AX + (cx0 - a.ax[i]) * s
    ty = AY + (cy0 - a.ay[i]) * s
    M = np.float32([[1, 0, tx], [0, 1, ty]])
    return cv2.warpAffine(small, M, (W, H), flags=cv2.INTER_LINEAR, borderValue=0)


def find_loop(a: Analysed, rendered: dict[int, np.ndarray], pmin: int, pmax: int) -> tuple[int, int, float]:
    src = a.seq
    tiny = {i: cv2.resize(rendered[i], None, fx=0.25, fy=0.25, interpolation=cv2.INTER_AREA) for i in src}
    best = (0, len(src), 1e9)
    for p in range(pmin, min(pmax, len(src) - 1) + 1):
        for s in range(0, len(src) - p):
            A, B = tiny[src[s]], tiny[src[s + p]]
            d = float(np.abs(A - B).sum() / max(A.sum(), 1e-6))
            if d < best[2] - 1e-9:
                best = (s, p, d)
    return best


def stride_from_feet(a: Analysed, loop: list[int]) -> float:
    """Planted-foot drift over one cycle in the anchored frames (source px)."""
    band = max(3, int(a.stand_h * 0.025))
    total = 0.0
    seq = loop + [loop[0]] if len(loop) > 1 else loop
    for i, j in zip(seq, seq[1:]):
        if j <= i:  # wrap: no motion across the loop seam
            continue
        p, q = [
            a.frames[k].alpha[int(a.ground) - band : int(a.ground) + 1].sum(axis=0) for k in (i, j)
        ]
        # Shift q by the anchor difference so both are in anchored coordinates.
        best, best_s = -1.0, 0
        da = a.ax[j] - a.ax[i]
        for sft in range(-40, 41):
            qs = np.roll(q, -int(round(da)) - sft)
            c = float((p * qs).sum())
            if c > best:
                best, best_s = c, sft
        total += best_s
    return -total  # planted foot moves backwards; crow moves forwards


def encode(sheet: np.ndarray, nframes: int) -> tuple[bytes, str]:
    h, w = sheet.shape
    rgba = np.empty((h, w, 4), np.uint8)
    rgba[..., :3] = INK
    rgba[..., 3] = np.clip(sheet * 255 + 0.5, 0, 255).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA")
    buf = io.BytesIO()
    img.save(buf, "WEBP", lossless=True, method=6, exact=False)
    if buf.tell() <= MAX_BYTES:
        return buf.getvalue(), "lossless"
    for q in (95, 90, 80, 70):
        buf = io.BytesIO()
        img.save(buf, "WEBP", quality=q, alpha_quality=q, method=6)
        if buf.tell() <= MAX_BYTES:
            return buf.getvalue(), f"lossy q{q}"
    return b"", "too big"


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", type=Path, help="also write PNG previews on grey here")
    args = ap.parse_args()

    clips: dict[str, Clip] = {}
    for name in ORDER:
        if name in SPEC and (RAW / SPEC[name].file).exists():
            clips[name] = SPEC[name]
        elif name in FORAGE and (RAW / FORAGE[name].file).exists():
            clips[name] = FORAGE[name]
    if "walk" not in clips:
        print("No walk source found in assets/crow-raw/.", file=sys.stderr)
        return 1

    print("Analysing:")
    an: dict[str, Analysed] = {}
    for name, clip in clips.items():
        print(f"  {name:8s} <- {clip.file}" + (f" frames {clip.seq[0]}-{max(clip.seq)}" if clip.seq else ""))
        an[name] = analyse(clip)

    # Scale: clips from the same file share the walk's standing height (same
    # camera), other files are scaled by their own standing height.
    ref = {an["walk"].clip.file: an["walk"].stand_h}
    for a in an.values():
        ref.setdefault(a.clip.file, a.stand_h)
    for a in an.values():
        a.scale = TARGET_H / ref[a.clip.file]

    # One frame for everything: union of every pose around the shared anchor.
    boxes = [pose_box(a, i) for a in an.values() for i in a.seq]
    L = min(b[0] for b in boxes) - PAD
    T = min(b[1] for b in boxes) - PAD
    R = max(b[2] for b in boxes) + PAD
    B = max(max(b[3] for b in boxes), 0) + PAD
    W, H = int(np.ceil(R - L)), int(np.ceil(B - T))
    W += W % 2
    H += H % 2
    AX, AY = round(-L), round(-T)
    print(f"Frame {W}x{H} sprite px, anchor ({AX}, {AY})")

    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*"):
        if old.suffix in (".webp", ".json"):
            old.unlink()

    index = {"pixelRatio": PIXEL_RATIO, "frameWidth": W, "frameHeight": H, "anchor": {"x": AX, "y": AY}, "animations": {}}
    problems: list[str] = []

    for name, a in an.items():
        rendered = {i: render(a, i, W, H, AX, AY) for i in set(a.seq)}
        seq = list(a.seq)
        meta: dict = {}

        if name == "walk":
            pmin, pmax = a.clip.auto_loop or (8, 40)
            s, p, d = find_loop(a, rendered, pmin, pmax)
            seq = a.seq[s : s + p]
            travel = (a.ax[a.seq[s + p]] - a.ax[a.seq[s]]) if s + p < len(a.seq) else 0.0
            feet = stride_from_feet(a, seq)
            stride_src = travel if abs(travel) > 0.1 * a.stand_h else feet
            stride = stride_src * a.scale / PIXEL_RATIO
            meta["stride"] = round(stride, 2)
            meta["speed"] = round(stride / (p / a.fps), 2)
            meta["loopSeam"] = round(d, 3)
            a.notes.append(
                f"loop frames {seq[0]}-{seq[-1]} (P={p}, seam diff {d:.2f}); "
                f"stride {stride:.1f} CSS px/cycle (body travel {travel * a.scale / PIXEL_RATIO:.1f}, "
                f"planted-foot drift {feet * a.scale / PIXEL_RATIO:.1f})"
            )
            if d > 0.25:
                problems.append(f"walk: loop seam is not clean (diff {d:.2f}), expect a small pop")
            if abs(travel) < 0.1 * a.stand_h and feet == 0:
                problems.append("walk: could not measure a stride, feet will slide")

        if a.clip.air:
            idx = [k for k, i in enumerate(seq) if i in a.airborne]
            if a.clip.loop_start is not None:
                idx = [k for k in idx if k < a.clip.loop_start]
            if idx:
                lift = {i: a.ground - a.frames[i].y1 for i in seq}
                peak = max(idx, key=lambda k: lift[seq[k]])
                meta["air"] = {"start": idx[0], "peak": peak, "end": idx[-1]}
                a.notes.append(f"airborne frames {idx[0]}-{idx[-1]}, peak {peak} (sheet indices)")
        if a.clip.loop_start is not None:
            meta["loopStart"] = a.clip.loop_start
        if a.clip.front:
            # Facing the camera = narrow and centred over the feet. The player
            # mirrors the crow around this pose's centre (frontOffset).
            def mid(i: int) -> float:
                return (a.frames[i].x0 + a.frames[i].x1) / 2 - a.ax[i]

            half = seq[len(seq) // 2 :]
            k = min(half, key=lambda i: (a.frames[i].x1 - a.frames[i].x0) + 2 * abs(mid(i)))
            seq = seq[: seq.index(k) + 1]
            sym = mid(k) * a.scale / PIXEL_RATIO
            meta["frontOffset"] = round(sym, 1)
            a.notes.append(f"front view at frame {k}; its centre is {sym:+.1f} CSS px from the feet")

        frames = [rendered[i] for i in seq]
        fps = a.fps
        # Keep each sheet under MAX_BYTES; halve the frame rate if needed.
        while True:
            sheet = np.concatenate(frames, axis=1)
            data, how = encode(sheet, len(frames))
            if data or len(frames) <= 2:
                break
            frames, fps = frames[::2], fps / 2
            problems.append(f"{name}: halved frame count to fit {MAX_BYTES // 1000} KB")
        if not data:
            problems.append(f"{name}: could not fit under {MAX_BYTES // 1000} KB, skipped")
            continue

        boxes = [pose_box(a, i) for i in seq]
        bounds = {
            "left": round(min(b[0] for b in boxes) / PIXEL_RATIO, 1),
            "top": round(min(b[1] for b in boxes) / PIXEL_RATIO, 1),
            "right": round(max(b[2] for b in boxes) / PIXEL_RATIO, 1),
            "bottom": round(max(b[3] for b in boxes) / PIXEL_RATIO, 1),
        }
        (OUT / f"{name}.webp").write_bytes(data)
        info = {
            "name": name,
            "src": f"/crow/{name}.webp",
            "frames": len(frames),
            "frameWidth": W,
            "frameHeight": H,
            "fps": fps,
            "anchor": {"x": AX, "y": AY},
            "pixelRatio": PIXEL_RATIO,
            "loop": a.clip.loop,
            "pingpong": a.clip.pingpong,
            "bounds": bounds,  # CSS px around the anchor, union of all frames
            "source": a.clip.file,
            **meta,
        }
        (OUT / f"{name}.json").write_text(json.dumps(info, indent=2) + "\n")
        index["animations"][name] = f"/crow/{name}.json"
        print(f"  {name:8s} {len(frames):3d} frames  {len(data) / 1000:6.1f} KB  {how}")
        for n in a.notes:
            print(f"           - {n}")

        if args.preview:
            args.preview.mkdir(parents=True, exist_ok=True)
            bg = np.full((H, W * len(frames), 3), 200, np.uint8)
            al = sheet[..., None]
            prev = (bg * (1 - al) + INK * al).astype(np.uint8)
            cv2.line(prev, (0, AY), (prev.shape[1], AY), (0, 0, 255), 1)
            for k in range(len(frames)):
                cv2.line(prev, (k * W + AX, 0), (k * W + AX, H), (255, 0, 0), 1)
            cv2.imwrite(str(args.preview / f"{name}.png"), prev)

    (OUT / "index.json").write_text(json.dumps(index, indent=2) + "\n")

    missing = [n for n in ("walk", "idle", "hop", "takeoff") if not (RAW / SPEC[n].file).exists()]
    if missing:
        problems.insert(0, "missing source clips " + ", ".join(f"{m}.mp4" for m in missing) + " (cut from forage.mp4 instead)")
    if problems:
        print("\nProblems:")
        for p in problems:
            print(f"  - {p}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
