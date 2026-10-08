"""The compare loop's diff: how far a render is from its Figma frame.

    python scripts/diff.py <figma.png> <render.png> [<render2.png> ...]

Prints the percentage of differing pixels over the common area (a channel
difference above TOL counts), the bounding box of the difference, and the bands
of rows where it sits, so a report can say what differs and where.

Rule 5: prove the render before trusting this number. A blank page or a
redirect diffs against a frame as a plausible percentage, not an error, so the
script refuses a render that is almost one flat colour.
"""
import sys

from PIL import Image, ImageChops

TOL = 24


def flat(im: Image.Image) -> bool:
    """True when nine tenths of a render is a single colour: a dead or empty page."""
    small = im.resize((96, 96))
    colours = small.getcolors(96 * 96) or []
    return bool(colours) and max(c for c, _ in colours) > 0.9 * 96 * 96


def diff(a: str, b: str):
    A, B = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
    if flat(B):
        raise SystemExit(f'{b}: the render is nearly one flat colour. Check the dev server and the route before diffing (Rule 5).')
    w, h = min(A.width, B.width), min(A.height, B.height)
    d = ImageChops.difference(A.crop((0, 0, w, h)), B.crop((0, 0, w, h))).convert('L').point(lambda v: 255 if v > TOL else 0)
    n = d.histogram()[255]
    rows = [y for y in range(h) if d.crop((0, y, w, y + 1)).getbbox()]
    bands: list[list[int]] = []
    for y in rows:
        if bands and y - bands[-1][1] <= 6:
            bands[-1][1] = y
        else:
            bands.append([y, y])
    return n / (w * h) * 100, d.getbbox(), bands, A.size, B.size


if __name__ == '__main__':
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    base = sys.argv[1]
    for other in sys.argv[2:]:
        pct, box, bands, sa, sb = diff(base, other)
        where = ', '.join(f'{y0}-{y1}' for y0, y1 in bands[:10]) + (' ...' if len(bands) > 10 else '')
        size = '' if sa == sb else f'  (sizes differ: {sa} vs {sb}, compared the common area)'
        print(f'{other}: {pct:.2f}% differing  box {box}  rows {where}{size}')
