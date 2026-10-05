"""Counts app pixels painted outside the phone frame.

Every screenshot taken with {"frame": true} has a sidecar JSON with the frame's
box. Outside that box the only thing allowed is the plain background, so any
pixel that differs from it is something escaping the frame.
usage: python scripts/frame-escape.py <dir>
"""
import json, os, sys
from PIL import Image

BG = (0x02, 0x08, 0x05)  # bgAlt-0, the backdrop around the frame
TOL = 14

d = sys.argv[1]
bad = 0
for f in sorted(os.listdir(d)):
    if not f.endswith('.png'):
        continue
    meta = json.load(open(os.path.join(d, f + '.json')))
    im = Image.open(os.path.join(d, f)).convert('RGB')
    W, H = im.size
    x0, y0 = int(meta['x']) - 1, int(meta['y']) - 1
    x1, y1 = int(meta['x'] + meta['w']) + 1, int(meta['y'] + meta['h']) + 1
    px = im.load()
    n = 0
    first = None
    step = 2
    for y in range(0, H, step):
        for x in range(0, W, step):
            if x0 <= x < x1 and y0 <= y < y1:
                continue
            p = px[x, y]
            if max(abs(p[i] - BG[i]) for i in range(3)) > TOL:
                n += 1
                first = first or (x, y, p)
    status = 'OK ' if n == 0 else 'ESCAPE'
    bad += n > 0
    print(f'{status} {f:48s} frame {int(meta["w"])}x{int(meta["h"])} at {int(meta["x"])},{int(meta["y"])}  outside-pixels {n}' + (f'  first {first}' if first else ''))
print('screens with escapes:', bad)
