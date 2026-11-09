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
    step: int = 1  # keep every n-th frame (fps / n): long, slow clips
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
    beak: bool = True  # export the beak tip per frame (side view clips)
    feather: dict[str, int] = field(default_factory=dict)  # edge -> px, e.g. {"top": 30}
    # Standing frames (inclusive) to measure ground/height/offsets on, for
    # clips that are airborne in the frames they use (fly, land, takeoff).
    stand_frames: tuple[int, int] | None = None
    # Peek: sprite px for the tallest visible bust (it has its own scale).
    target_h: float | None = None
    # Source frames from this one on are airborne (when the feet hang at the
    # ground line, as in fly_loop.mp4, the lowest pixel can't tell).
    airborne_from: int | None = None
    # Named source frames, exported as sheet indices ("loop" sets loopStart).
    marks: dict[str, int] = field(default_factory=dict)
    marks_at: dict[str, int] = field(default_factory=dict)  # names -> sheet index directly
    # Airborne vertical anchor: "body" (smoothed centre + standing offset) or
    # "feet" (smoothed lowest pixel, for a hop whose feet stay visible).
    air_anchor: str = "body"
    reverse_after: bool = False  # player: play forwards, then backwards to frame 0
    ground_follow: bool = False  # ay = each frame's own lowest pixel (smoothed): walk
    # Source frame ranges where the head faces the camera: the beak point is
    # interpolated across them instead of measured.
    beak_interp: list[tuple[int, int]] = field(default_factory=list)
    beak_hold_from: int | None = None  # source frame: hold the beak from here on
    notes: list[str] = field(default_factory=list)


SPEC = {
    # walk.mp4 (Flow, 2026-11-09): a treadmill walk from a static camera, so it
    # is anchored in place (anchor="fixed") and the stride is the belt speed
    # (stance-only planted-foot velocity) x loop length. Two head-down dips
    # (~42-62, ~110-130); 66-109 is the cleanest stretch and holds the best
    # two-step loop. The still stand at 152-170 sets the scale and the feet x.
    "walk": Clip(
        "walk",
        "walk.mp4",
        seq=list(range(66, 110)),
        auto_loop=(33, 33),
        anchor="fixed",
        stand_frames=(152, 170),
        ground_follow=True,
    ),
    # idle.mp4: 8 s, head turns to the camera and back (44-100), feet locked.
    "idle": Clip(
        "idle",
        "idle.mp4",
        seq=list(range(0, 187)),  # 187+ starts the next head turn
        anchor="feet",
        step=3,
        beak_interp=[(44, 100)],
        marks_at={"away_start": 15, "away_end": 37},  # head faces the camera: don't stop here
    ),
    # fly_loop.mp4: stands 0-11, crouches from 12, lifts off at 25, hovers with
    # three slow wingbeats; 75-178 loops. Static camera and the bird stays in
    # place, so no tracking (anchor="static"). One sheet does takeoff (0 ->
    # loopStart), flight (loop) and landing (played backwards to "liftoff").
    # Every upstroke leaves the top of the frame: those tips are feathered.
    "takeoff": Clip(
        "takeoff",
        "fly_loop.mp4",
        seq=list(range(8, 26)) + list(range(26, 179, 3)),
        anchor="static",
        loop=False,
        air=True,
        stand_frames=(0, 11),
        feather={"top": 80},
        airborne_from=26,
        beak_hold_from=26,
        marks={"liftoff": 25, "loop": 77},
    ),
    # pickup.mp4: bends from 32, beak on the ground 63-73. The beak gapes after
    # the second peck (100-132), so the rise is the bend played backwards.
    "pickup": Clip(
        "pickup",
        "pickup.mp4",
        seq=list(range(30, 74)),
        anchor="fixed",
        loop=False,
        reverse_after=True,
        marks={"contact": 70, "grab": 71},
    ),
    # place.mp4: the first tap (34-39) spliced onto the third tap's rise
    # (103-140): the beak opens as the head comes up (the release) and closes
    # by 124, upright by 135.
    "place": Clip(
        "place",
        "place.mp4",
        seq=list(range(13, 39)) + list(range(103, 141)),
        anchor="fixed",
        loop=False,
        marks={"contact": 37, "release": 107},
    ),
    # peek.mp4: a front-view bust cut by the bottom edge, 47-172: rises from a
    # bow (55), looks left (74), turns up-right (100), stares into the camera
    # (108-157), bows again (157-172). It never sinks out of frame and opens
    # with the crow walking into close-up (0-46), so the player slides the
    # bust up from below the screen edge and back down.
    "peek": Clip(
        "peek",
        "peek.mp4",
        seq=list(range(47, 173)),
        step=2,
        anchor="peek",
        loop=False,
        beak=False,
        target_h=240,
        marks={"rise": 55, "look_left": 74, "look_camera": 108, "sink": 157},
    ),
    # caw.mp4: calls at 40-58 and 95-122, head to the camera between (61-95);
    # from 157 the bird morphs into a different-looking crow, so it stops there.
    "caw": Clip(
        "caw",
        "caw.mp4",
        seq=list(range(34, 157)),
        step=2,
        anchor="feet",
        loop=False,
        beak_interp=[(61, 95)],
        marks={"call1": 40, "call2": 95},
    ),
    # ruffle.mp4 is a standing wing-stretch (four big flaps 32-80, wings fold,
    # head to the camera and back), not a feather shake. Starts and ends on
    # the reference pose. Frame 51's tips touch the top edge.
    "stretch": Clip("stretch", "ruffle.mp4", step=2, anchor="feet", loop=False, feather={"top": 24}),
    # turn.mp4 (Flow): faces right 0-44, turns through a front view (68-72)
    # to face left by ~100, then turns back. 44-100 is one whole turn-around;
    # played mirrored it turns the other way.
    "turn": Clip("turn", "turn.mp4", seq=list(range(44, 101)), anchor="feet", loop=False, beak=False),
    # rest.mp4: settles low 38-105, rests 105-128 (after 128 the head turns to
    # the camera and the beak vanishes). The settle is played backwards to get
    # up again: hold between marks "loop" and "rise", then play on to the end.
    "rest": Clip(
        "rest",
        "rest.mp4",
        seq=list(range(0, 129, 2)) + list(range(126, -1, -2)),
        fps=12,
        anchor="feet",
        loop=False,
        marks={"loop": 112},
        marks_at={"rise": 65},
    ),
}
# A hop from the same take-off: crouch, lift-off, the first upstroke (stops at
# 36, before the wing tips leave the frame at 37), the upstroke backwards, then
# the lift-off backwards as the landing and back up out of the crouch.
SPEC["hop"] = Clip(
    "hop",
    "fly_loop.mp4",
    seq=list(range(12, 26, 2)) + list(range(26, 37, 2)) + list(range(34, 25, -2)) + list(range(25, 11, -2)),
    anchor="static",
    loop=False,
    air=True,
    stand_frames=(0, 11),
    airborne_from=26,
)
# Not used: takeoff.mp4 (camera push-in 28-37, wing tips cut, sluggish),
# glide.mp4 (front-facing flapping, never glides), hop.mp4 (huge flapping
# jump, wings cut 54-66/98-106, a hand-like wing at 68-75), turn.mp4 (walks
# 0.7 body lengths while turning, then turns its back). hop and turn still
# come from forage.mp4 below; "peck" is now pickup.

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
    "turn": Clip("turn", "forage.mp4", seq=list(range(137, 145)), fps=16, anchor="fixed", loop=False, front=True, beak=False),
    "hop": Clip("hop", "forage.mp4", seq=list(range(2, 14)), anchor="feet", loop=False, air=True, feather_left=40, air_anchor="feet"),
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

ORDER = ["walk", "idle", "hop", "takeoff", "pickup", "place", "peek", "caw", "stretch", "rest", "turn"]


# --------------------------------------------------------------------------
# Matte
# --------------------------------------------------------------------------


def matte(bgr: np.ndarray, feather: dict[str, int] | None = None) -> np.ndarray:
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

    # A silhouette cut by the frame edge (tail, raised wing tips) fades out
    # over the last few px instead of ending in a straight line.
    for edge, px in (feather or {}).items():
        n = w if edge in ("left", "right") else h
        ramp = np.clip(np.arange(n, dtype=np.float32) / px, 0, 1)
        ramp = ramp * ramp * (3 - 2 * ramp)
        if edge in ("right", "bottom"):
            ramp = ramp[::-1]
        alpha *= ramp[None, :] if edge in ("left", "right") else ramp[:, None]
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
    cy: float = 0.0  # alpha centroid y
    beak: tuple[float, float] = (0.0, 0.0)  # front-most point (crow facing right)


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
    rows = alpha.sum(axis=1)
    cy = float((rows * np.arange(h)).sum() / max(rows.sum(), 1e-6))
    # Beak tip: the front-most solid pixels (the crow faces right); their
    # mean height, so a material can be pinned to it.
    front = ys[xs >= x1 - 2]
    beak = (float(x1), float(front.mean()) if front.size else float(y0))
    return Frame(alpha, x0, y0, x1, y1, cx, foot_x, edge, cy, beak)


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


def track_beak(clip: Clip, frames: dict[int, "Frame"], src: list[int]) -> None:
    """Beak tip per frame, followed from frame to frame.

    The front-most pixel is wrong whenever the beak points down (it finds the
    forehead) or a wing sweeps forward in flight (it finds the wing tip). So:
    start from the head (above the body centre) in the first frame, then only
    look near the previous tip, and take the extreme down-and-forward point.
    """
    prev = None
    ends = {b for _, b in clip.beak_interp}
    last = None
    for i in src:
        f = frames[i]
        if last is not None and any(last <= b < i for b in ends):
            prev = None  # the head is back in profile: find the beak afresh
        last = i
        ys, xs = np.nonzero(f.alpha > 0.5)
        h = f.y1 - f.y0
        band = max(3, int(h * 0.04))
        keep = ys < f.y1 - 2 * band  # not the feet
        if prev is None:
            # Seed: the front-most point of the head (well above the body
            # centre), which is the beak tip on the standing reference pose.
            m = keep & (ys < f.cy - 0.1 * h)
            if not m.any():
                m = keep
            k = int(np.argmax(xs[m] - 0.05 * ys[m]))
        else:
            # Follow: the extreme down-and-forward point near the previous tip,
            # penalising jumps so a wing sweeping past can't capture it.
            r = max(10.0, 0.1 * h)
            d = np.hypot(xs - prev[0], ys - prev[1])
            m = keep & (d < r)
            if not m.any():
                m = keep & (d < 2.5 * r)
            if not m.any():
                m = keep if keep.any() else np.ones_like(xs, bool)
            k = int(np.argmax(xs[m] + 0.6 * ys[m] - 0.5 * d[m]))
            # Hill-climb: the tip can move further than one window per frame
            # (a fast dip), so keep stepping while the extreme moves.
            for _ in range(12):
                cx_, cy_ = float(xs[m][k]), float(ys[m][k])
                d2 = np.hypot(xs - cx_, ys - cy_)
                m2 = keep & (d2 < r)
                k2 = int(np.argmax(xs[m2] + 0.6 * ys[m2]))
                if xs[m2][k2] + 0.6 * ys[m2][k2] <= cx_ + 0.6 * cy_ + 0.5:
                    break
                m, k = m2, k2
        prev = (float(xs[m][k]), float(ys[m][k]))
        f.beak = prev
    # Flying in place (fly_loop.mp4): the head hardly moves once airborne, but
    # the wings sweep past it, so hold the beak where the first hover frames
    # put it.
    if clip.beak_hold_from is not None:
        held = [i for i in src if i >= clip.beak_hold_from]
        if held:
            ref = held[: max(1, min(4, len(held)))]
            bx = float(np.median([frames[i].beak[0] for i in ref]))
            by = float(np.median([frames[i].beak[1] for i in ref]))
            for i in held:
                frames[i].beak = (bx, by)
    # Head facing the camera: interpolate between the profile frames around it.
    for a, b in clip.beak_interp:
        inside = [i for i in src if a <= i <= b]
        before = [i for i in src if i < a]
        after = [i for i in src if i > b]
        if not inside or not before or not after:
            continue
        p0, p1 = frames[before[-1]].beak, frames[after[0]].beak
        for i in inside:
            t = (i - before[-1]) / (after[0] - before[-1])
            px, py = p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t
            ys, xs = np.nonzero(frames[i].alpha > 0.5)
            j = int(np.argmin((xs - px) ** 2 + (ys - py) ** 2))  # onto the face
            frames[i].beak = (float(xs[j]), float(ys[j]))


def analyse(clip: Clip) -> Analysed:
    path = RAW / clip.file
    stand = list(range(clip.stand_frames[0], clip.stand_frames[1] + 1)) if clip.stand_frames else []
    raw = read_frames(path, (set(clip.seq) | set(stand)) if clip.seq else None)
    seq = clip.seq if clip.seq else sorted(raw)
    notes: list[str] = []

    feather = dict(clip.feather)
    if clip.feather_left:
        feather["left"] = clip.feather_left
    frames: dict[int, Frame] = {}
    for i in sorted(set(seq) | set(stand)):
        m = measure(matte(raw[i], feather))
        if m is None:
            if i in seq:
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
    elif any(frames[i].touches_edge for i in seq) and not feather and clip.anchor != "peek":
        notes.append("crow touches the frame edge in some frames (silhouette may be cut)")

    src = sorted(set(seq))
    if stand:
        # A clip that is (mostly) airborne measures the ground, the standing
        # height and the centre-to-feet offsets on its standing frames.
        ref = [i for i in stand if i in frames]
        ground = float(np.median([frames[i].y1 for i in ref]))
        stand_h = float(np.median([ground - frames[i].y0 for i in ref]))
    else:
        bottoms = np.array([frames[i].y1 for i in src], dtype=np.float32)
        ground = float(np.percentile(bottoms, 75))
        heights = np.array([ground - frames[i].y0 for i in src])
        first_h = float(np.median(heights[: min(3, len(heights))]))
        # Opening pose (every clip starts on the standing reference pose);
        # a median over the clip would shrink with bending and crouching.
        stand_h = first_h if clip.name != "walk" else float(np.median(heights))
        ref = []
    tol = GROUND_TOL * stand_h
    airborne = {i for i in src if frames[i].y1 < ground - tol}
    if clip.airborne_from is not None:
        airborne = {i for i in src if i >= clip.airborne_from}
    if clip.anchor == "body":
        airborne = set(src)

    # Horizontal anchor. Smoothing runs over the contiguous source range.
    ax: dict[int, float] = {}
    if clip.anchor == "peek":
        # Front-view bust cut by the bottom edge: anchored on that cut line.
        v = float(np.median([frames[i].cx for i in src]))
        ax = {i: v for i in src}
        h = frames[src[0]].alpha.shape[0]
        ay = {i: float(h) for i in src}
        return Analysed(clip, seq, frames, ax, ay, float(h), stand_h, set(), fps=clip.fps, notes=notes)
    if clip.anchor == "static":
        # Static camera, bird in place (fly_loop.mp4): no tracking at all.
        # Feet x from the standing frames, the ground line for every frame;
        # the runtime supplies the climb.
        v = float(np.median([frames[i].foot_x for i in (ref or src)]))
        ax = {i: v for i in src}
        ay = {i: ground for i in src}
        track_beak(clip, frames, src)
        return Analysed(clip, seq, frames, ax, ay, ground, stand_h, airborne, fps=clip.fps, notes=notes)
    if clip.anchor == "body":
        # Flying the whole time: smoothed body centre, moved by the standing
        # centre-to-feet offset so it lines up with takeoff and landing.
        dx = float(np.median([frames[i].foot_x - frames[i].cx for i in ref])) if ref else 0.0
        xs = smooth(np.array([frames[i].cx for i in src], dtype=np.float64)) + dx
        ax = dict(zip(src, xs.tolist()))
    elif clip.anchor == "fixed":
        v = float(np.median([frames[i].foot_x for i in (ref or src)]))
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

    # Vertical anchor: the ground line while standing. In the air the crow
    # stays in place (the player draws the arc): its "feet" are the smoothed
    # body centre plus the clip's standing centre-to-feet offset, so the
    # anchor does not jump with every wingbeat the way the lowest pixel does.
    grounded = ref or [i for i in src if i not in airborne]
    feet_off = float(np.median([ground - frames[i].cy for i in grounded])) if grounded else 0.0
    if clip.air_anchor == "feet":
        cys = smooth(np.array([frames[i].y1 for i in src], dtype=np.float64)) - feet_off
    else:
        cys = smooth(np.array([frames[i].cy for i in src], dtype=np.float64))
    ay = {i: (float(c) + feet_off if i in airborne else ground) for i, c in zip(src, cys)}
    if clip.ground_follow:
        lows = smooth(np.array([frames[i].y1 for i in src], dtype=np.float64), 3)
        ay = {i: float(v) for i, v in zip(src, lows)}
    track_beak(clip, frames, src)

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


def find_loop(
    a: Analysed, rendered: dict[int, np.ndarray], pmin: int, pmax: int, ay: int
) -> tuple[int, int, float]:
    """Best seamless loop: whole silhouette, plus the legs weighted 3x (the
    body dominates a whole-frame score, but a leg pop is what shows)."""
    src = a.seq
    tiny = {i: cv2.resize(rendered[i], None, fx=0.25, fy=0.25, interpolation=cv2.INTER_AREA) for i in src}
    legs = {i: rendered[i][max(0, ay - 40) : ay + 4] for i in src}
    best = (0, len(src), 1e9)
    for p in range(pmin, min(pmax, len(src) - 1) + 1):
        for s in range(0, len(src) - p):
            A, B = tiny[src[s]], tiny[src[s + p]]
            d = float(np.abs(A - B).sum() / max(A.sum(), 1e-6))
            La, Lb = legs[src[s]], legs[src[s + p]]
            d += 3 * float(np.abs(La - Lb).sum() / max(La.sum(), 1e-6))
            if d < best[2] - 1e-9:
                best = (s, p, d)
    return best


def belt_speed(a: Analysed, src: list[int]) -> float:
    """Treadmill walk, static camera: the planted foot slides back at the belt
    speed. Median shift per source frame over stance-only pairs (same number
    of feet on the ground in both frames), in source px, positive = forwards."""
    band = max(3, int(a.stand_h * 0.025))
    g = int(round(a.ground))

    def profile(i: int) -> np.ndarray:
        return (a.frames[i].alpha[g - band : g + 1] > 0.5).any(axis=0).astype(np.float32)

    def contacts(p: np.ndarray) -> int:
        d = np.diff(np.concatenate([[0], p, [0]]))
        starts, ends = np.nonzero(d == 1)[0], np.nonzero(d == -1)[0]
        return int(sum(1 for s0, e0 in zip(starts, ends) if e0 - s0 >= 6))

    shifts = []
    for i, j in zip(src, src[1:]):
        if j != i + 1:
            continue
        p, q = profile(i), profile(j)
        if contacts(p) != contacts(q) or not p.any():
            continue
        best, best_s = -1.0, 0
        for sft in range(-40, 41):
            c = float((p * np.roll(q, -sft)).sum())
            if c > best:
                best, best_s = c, sft
        shifts.append(best_s)
    return -float(np.median(shifts)) if shifts else 0.0


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


# Phones' GPUs cap textures at 4096-8192 px a side, so long sheets wrap into
# balanced rows no wider than this.
MAX_SHEET_W = 4096


def tile(frames: list[np.ndarray], W: int, H: int) -> tuple[np.ndarray, int]:
    """One horizontal strip, wrapped into balanced rows when it would be too wide."""
    rows = max(1, -(-len(frames) * W // MAX_SHEET_W))
    cols = -(-len(frames) // rows)
    sheet = np.zeros((rows * H, cols * W), np.float32)
    for k, f in enumerate(frames):
        y, x = (k // cols) * H, (k % cols) * W
        sheet[y : y + H, x : x + W] = f
    return sheet, cols


def encode(sheet: np.ndarray, nframes: int) -> tuple[bytes, str]:
    h, w = sheet.shape
    rgba = np.empty((h, w, 4), np.uint8)
    rgba[..., :3] = INK
    rgba[..., 3] = np.clip(sheet * 255 + 0.5, 0, 255).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA")
    # Lossless, or lossy when that is smaller (a flat black silhouette loses
    # nothing visible at q85 / alpha 90).
    best: tuple[bytes, str] | None = None
    for how, kw in (("lossless", dict(lossless=True, exact=False)), ("lossy q85", dict(quality=85, alpha_quality=90))):
        buf = io.BytesIO()
        img.save(buf, "WEBP", method=6, **kw)
        if buf.tell() <= MAX_BYTES and (best is None or buf.tell() < len(best[0])):
            best = (buf.getvalue(), how)
    if best:
        return best
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
    ap.add_argument("--set", default="", help="write to public/crow/<set>/ (e.g. nav) instead of public/crow/")
    ap.add_argument("--height", type=float, default=TARGET_H, help="standing crow height in sprite px (2x)")
    ap.add_argument("--only", default="", help="comma-separated animations to build")
    args = ap.parse_args()
    global OUT
    out_dir = OUT / args.set if args.set else OUT
    url_dir = f"/crow/{args.set}" if args.set else "/crow"
    target_h = args.height
    wanted = [n for n in args.only.split(",") if n] or ORDER

    clips: dict[str, Clip] = {}
    for name in wanted:
        if name in SPEC and (RAW / SPEC[name].file).exists():
            clips[name] = SPEC[name]
        elif name in FORAGE and (RAW / FORAGE[name].file).exists():
            clips[name] = FORAGE[name]
    if not clips:
        print("No source clips found in assets/crow-raw/.", file=sys.stderr)
        return 1

    print("Analysing:")
    an: dict[str, Analysed] = {}
    for name, clip in clips.items():
        print(f"  {name:8s} <- {clip.file}" + (f" frames {clip.seq[0]}-{max(clip.seq)}" if clip.seq else ""))
        an[name] = analyse(clip)

    # Scale: clips from the same file share the walk's standing height (same
    # camera), other files are scaled by their own standing height.
    ref = {an["walk"].clip.file: an["walk"].stand_h} if "walk" in an else {}
    for file in {a.clip.file for a in an.values()} - set(ref):
        same = [a for a in an.values() if a.clip.file == file and not a.clip.target_h]
        if not same:
            continue
        standing = [a.stand_h for a in same if not a.clip.air] or [same[0].stand_h]
        ref[file] = float(np.median(standing))
    for a in an.values():
        if a.clip.target_h:
            # Own scale (the peek is a close-up): tallest visible bust.
            tallest = max(a.frames[i].alpha.shape[0] - a.frames[i].y0 for i in a.seq)
            a.scale = a.clip.target_h * target_h / TARGET_H / tallest
        else:
            a.scale = target_h / ref[a.clip.file]

    OUT = out_dir
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*"):
        if old.suffix in (".webp", ".json"):
            old.unlink()

    # Each animation gets its own tight frame (a frame shared by every clip
    # would be sized for spread wings and bloat every sheet). Poses still line
    # up: every JSON gives its anchor, the point between the feet.
    index = {"pixelRatio": PIXEL_RATIO, "animations": {}}
    problems: list[str] = []

    for name, a in an.items():
        boxes = [pose_box(a, i) for i in a.seq]
        L = min(b[0] for b in boxes) - PAD
        T = min(b[1] for b in boxes) - PAD
        R = max(b[2] for b in boxes) + PAD
        B = max(max(b[3] for b in boxes), 0) + PAD
        W, H = int(np.ceil(R - L)), int(np.ceil(B - T))
        W += W % 2
        H += H % 2
        AX, AY = round(-L), round(-T)
        rendered = {i: render(a, i, W, H, AX, AY) for i in set(a.seq)}
        seq = list(a.seq)
        meta: dict = {}

        if name == "walk":
            pmin, pmax = a.clip.auto_loop or (8, 40)
            s, p, d = find_loop(a, rendered, pmin, pmax, AY)
            seq = a.seq[s : s + p]
            travel = (a.ax[a.seq[s + p]] - a.ax[a.seq[s]]) if s + p < len(a.seq) else 0.0
            if a.clip.anchor in ("fixed", "static"):
                feet = belt_speed(a, a.seq) * p  # treadmill: belt speed x loop length
            else:
                feet = stride_from_feet(a, seq)
            stride_src = travel if abs(travel) > 0.1 * a.stand_h else feet
            stride = stride_src * a.scale / PIXEL_RATIO
            meta["stride"] = round(stride, 2)
            meta["speed"] = round(stride / (p / a.fps), 2)
            a.notes.append(
                f"loop frames {seq[0]}-{seq[-1]} (P={p}, seam diff {d:.2f}); "
                f"stride {stride:.1f} CSS px/cycle (body travel {travel * a.scale / PIXEL_RATIO:.1f}, "
                f"planted-foot drift {feet * a.scale / PIXEL_RATIO:.1f})"
            )
            # Seam check on the legs: the jump across the seam vs an ordinary
            # frame-to-frame step.
            def legs_d(x: int, y: int) -> float:
                A, B = rendered[x][max(0, AY - 40) : AY + 4], rendered[y][max(0, AY - 40) : AY + 4]
                return float(np.abs(A - B).sum() / max(A.sum(), 1e-6))

            steps = [legs_d(x, y) for x, y in zip(seq, seq[1:])]
            seam = legs_d(seq[-1], seq[0])
            meta["loopSeam"] = round(seam / max(float(np.median(steps)), 1e-6), 2)
            if seam > 1.5 * float(np.median(steps)):
                problems.append(f"walk: legs jump at the loop seam ({meta['loopSeam']}x a normal step)")
            if abs(travel) < 0.1 * a.stand_h and feet == 0:
                problems.append("walk: could not measure a stride, feet will slide")

        if a.clip.step > 1:
            seq = seq[:: a.clip.step]
        if a.clip.loop_start is not None:
            meta["loopStart"] = a.clip.loop_start
        if a.clip.marks:
            # Source frame -> first sheet index that reaches it (in play order).
            def index_of(src: int) -> int:
                for k, i in enumerate(seq):
                    if i == src or (k and (seq[k - 1] < src <= i or seq[k - 1] > src >= i)):
                        return k
                return min(range(len(seq)), key=lambda k: abs(seq[k] - src))

            meta["marks"] = {m: index_of(f) for m, f in a.clip.marks.items()}
        if a.clip.marks_at:
            meta.setdefault("marks", {}).update(a.clip.marks_at)
        if "loop" in meta.get("marks", {}):
            meta["loopStart"] = meta["marks"]["loop"]

        if a.clip.air:
            idx = [k for k, i in enumerate(seq) if i in a.airborne]
            if "loopStart" in meta:
                idx = [k for k in idx if k < meta["loopStart"]]
            if idx:
                lift = {i: a.ground - a.frames[i].y1 for i in seq}
                peak = max(idx, key=lambda k: lift[seq[k]])
                meta["air"] = {"start": idx[0], "peak": peak, "end": idx[-1]}
                a.notes.append(f"airborne frames {idx[0]}-{idx[-1]}, peak {peak} (sheet indices)")
        if a.clip.front:
            # Facing the camera = narrow and centred over the feet. The player
            # mirrors the crow around this pose's centre (frontOffset).
            def mid(i: int) -> float:
                return (a.frames[i].x0 + a.frames[i].x1) / 2 - a.ax[i]

            # The seam is the last frame; the mirror axis is where the head and
            # upper body are most symmetric (not the bbox middle).
            k = seq[-1]
            f = a.frames[k]
            top = (f.alpha[f.y0 : (f.y0 + f.y1) // 2] > 0.5).astype(np.float32)
            best_c, best_iou = (f.x0 + f.x1) / 2, -1.0
            for c2 in range(2 * f.x0, 2 * f.x1 + 1):  # axis at c2 / 2
                xs_ = np.arange(f.x0, f.x1 + 1)
                mx = c2 - xs_
                ok = (mx >= 0) & (mx < top.shape[1])
                A = top[:, xs_[ok]]
                B = top[:, mx[ok]]
                inter, union = float((A * B).sum()), float(np.maximum(A, B).sum())
                if union and inter / union > best_iou:
                    best_iou, best_c = inter / union, c2 / 2
            sym = (best_c - a.ax[k]) * a.scale / PIXEL_RATIO
            meta["frontOffset"] = round(sym, 1)
            a.notes.append(f"front view at frame {k}; its centre is {sym:+.1f} CSS px from the feet")

        frames = [rendered[i] for i in seq]
        fps = a.fps / a.clip.step
        # Keep each sheet under MAX_BYTES; halve the frame rate if needed.
        while True:
            sheet, cols = tile(frames, W, H)
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
        if a.clip.beak and len(frames) == len(seq):
            # CSS px from the anchor, per sheet frame, crow facing right.
            meta["beak"] = [
                [
                    round((a.frames[i].beak[0] - a.ax[i]) * a.scale / PIXEL_RATIO, 1),
                    round((a.frames[i].beak[1] - a.ay[i]) * a.scale / PIXEL_RATIO, 1),
                ]
                for i in seq
            ]
        (OUT / f"{name}.webp").write_bytes(data)
        info = {
            "name": name,
            "src": f"{url_dir}/{name}.webp",
            "frames": len(frames),
            "columns": cols,  # frame k is at column k % columns, row k // columns
            "frameWidth": W,
            "frameHeight": H,
            "fps": fps,
            "anchor": {"x": AX, "y": AY},
            "pixelRatio": PIXEL_RATIO,
            "loop": a.clip.loop,
            "pingpong": a.clip.pingpong,
            "reverseAfter": a.clip.reverse_after,
            "bounds": bounds,  # CSS px around the anchor, union of all frames
            "source": a.clip.file,
            **meta,
        }
        (OUT / f"{name}.json").write_text(json.dumps(info, indent=2) + "\n")
        index["animations"][name] = f"{url_dir}/{name}.json"
        print(f"  {name:8s} {len(frames):3d} frames  {len(data) / 1000:6.1f} KB  {how}")
        for n in a.notes:
            print(f"           - {n}")

        if args.preview:
            args.preview.mkdir(parents=True, exist_ok=True)
            bg = np.full((*sheet.shape, 3), 200, np.uint8)
            al = sheet[..., None]
            prev = (bg * (1 - al) + INK * al).astype(np.uint8)
            for k in range(len(frames)):
                x, y = (k % cols) * W, (k // cols) * H
                cv2.line(prev, (x, y + AY), (x + W, y + AY), (0, 0, 255), 1)
                cv2.line(prev, (x + AX, y), (x + AX, y + H), (255, 0, 0), 1)
            cv2.imwrite(str(args.preview / f"{name}.png"), prev)

    (OUT / "index.json").write_text(json.dumps(index, indent=2) + "\n")

    fallback = [n for n in clips if clips[n].file == "forage.mp4"]
    if fallback:
        problems.insert(0, "still cut from forage.mp4: " + ", ".join(fallback))
    if problems:
        print("\nProblems:")
        for p in problems:
            print(f"  - {p}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
