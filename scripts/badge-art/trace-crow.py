# Traces the badge crow (art/crow-source.jpg, a black silhouette on white)
# into the SVG path in art/crow.svg. Needs OpenCV (pip install opencv-python).
#   python scripts/badge-art/trace-crow.py 0.6 <out.d>
# then put the path in art/crow.svg (viewBox 0 0 1000 <height it prints>)
# and run build.mjs. 0.6 is the simplification tolerance in source pixels.
import cv2, numpy as np, json, sys, os
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "art", "crow-source.jpg")
UP = 4
g = cv2.imread(SRC, cv2.IMREAD_GRAYSCALE)
big = cv2.resize(g, None, fx=UP, fy=UP, interpolation=cv2.INTER_CUBIC)
big = cv2.GaussianBlur(big, (0, 0), 1.6)
_, mask = cv2.threshold(big, 128, 255, cv2.THRESH_BINARY_INV)
# Drop JPEG specks: keep components bigger than a few pixels.
n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
keep = np.zeros_like(mask)
for i in range(1, n):
    if stats[i, cv2.CC_STAT_AREA] > 400: keep[labels == i] = 255
contours, hier = cv2.findContours(keep, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
x0, y0, w, h = cv2.boundingRect(np.vstack(contours))
scale = 1000 / w
eps = float(sys.argv[1]) if len(sys.argv) > 1 else 1.2
def fmt(v): return str(round(v, 1)).rstrip("0").rstrip(".")
def smooth_path(pts):
    # Closed Catmull-Rom through the simplified points, as cubic Beziers.
    n = len(pts); d = ""
    P = [((x - x0) * scale, (y - y0) * scale) for x, y in pts]
    d += f"M{fmt(P[0][0])} {fmt(P[0][1])}"
    for i in range(n):
        p0, p1, p2, p3 = P[i - 1], P[i], P[(i + 1) % n], P[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f"C{fmt(c1[0])} {fmt(c1[1])} {fmt(c2[0])} {fmt(c2[1])} {fmt(p2[0])} {fmt(p2[1])}"
    return d + "Z"
d = ""; counts = []
for c in contours:
    if cv2.contourArea(c) < 400: continue
    a = cv2.approxPolyDP(c, eps * UP, True).reshape(-1, 2)
    counts.append(len(a))
    d += smooth_path([tuple(p) for p in a])
H = round(h * scale, 1)
print(json.dumps({"w": 1000, "h": H, "contours": counts, "len": len(d)}), file=sys.stderr)
open(sys.argv[2] if len(sys.argv) > 2 else "crow-new.d", "w").write(d)
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -20 1040 {H+40}" width="1040" height="{int(H+40)}"><rect x="-20" y="-20" width="1040" height="{H+40}" fill="#fff"/><path fill="#000" fill-rule="evenodd" d="{d}"/></svg>'
open((sys.argv[2] if len(sys.argv) > 2 else "crow-new.d") + ".svg", "w").write(svg)
