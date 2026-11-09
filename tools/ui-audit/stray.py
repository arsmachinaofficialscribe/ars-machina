"""Stray-pixel scan for the UI audit (report only).
    python3 tools/ui-audit/stray.py AUDIT_DIR
For each <key>.png with its <key>.json (element rects from audit.js), marks every pixel that stands out from its
neighbourhood, removes everything inside a box that legitimately paints (text runs, controls, icons, bordered or
shadowed boxes, pseudo-element hosts), and reports the small marks that are left: possible stray pixels.
Writes <key>-stray.png crops (8x) of the first findings."""
import json, sys, pathlib
import numpy as np
from PIL import Image
from scipy import ndimage

D = pathlib.Path(sys.argv[1])
summary = {}
for js in sorted(D.glob('*-build.json')) + sorted(D.glob('*-play.json')):
    key = js.stem; png = D / f'{key}.png'
    if not png.exists():
        continue
    meta = json.loads(js.read_text())
    im = np.asarray(Image.open(png).convert('RGB')).astype(np.int16)
    H, W, _ = im.shape
    lum = im.mean(axis=2)
    bg = ndimage.median_filter(lum, size=9)
    cand = np.abs(lum - bg) > 40
    mask = np.zeros((H, W), bool)
    for x, y, w, h, kind in meta['rects']:
        x0, y0 = max(0, int(x) - 2), max(0, int(y) - 2); x1, y1 = min(W, int(x + w) + 3), min(H, int(y + h) + 3)
        if kind == 'b':   # a painted box: only its edges and shadow band may paint, not its interior
            band = 6
            mask[y0:y1, x0:min(x1, x0 + band)] = True; mask[y0:y1, max(x0, x1 - band):x1] = True
            mask[y0:min(y1, y0 + band), x0:x1] = True; mask[max(y0, y1 - band):y1, x0:x1] = True
        else:
            mask[y0:y1, x0:x1] = True
    left = cand & ~mask
    lab, n = ndimage.label(left)
    if n == 0:
        summary[key] = {'marks': 0}; continue
    sizes = ndimage.sum(left, lab, range(1, n + 1))
    objs = ndimage.find_objects(lab)
    small = [(int(sizes[i]), objs[i]) for i in range(n) if sizes[i] <= 40]
    big = [(int(sizes[i]), objs[i]) for i in range(n) if sizes[i] > 40]
    rows = sorted({(s[0].start // 40) * 40 for _, s in small})
    summary[key] = {'small': len(small), 'larger': len(big), 'small_at': [[s[1].start, s[0].start, a] for a, s in small[:30]],
                    'larger_at': [[s[1].start, s[0].start, s[1].stop - s[1].start, s[0].stop - s[0].start, a] for a, s in big[:15]]}
    crops = []
    for a, s in (small + big)[:6]:
        cy, cx = (s[0].start + s[0].stop) // 2, (s[1].start + s[1].stop) // 2
        y0, x0 = max(0, cy - 20), max(0, cx - 30)
        crops.append(Image.fromarray(im[y0:y0 + 40, x0:x0 + 60].astype(np.uint8)).resize((240, 160), Image.NEAREST))
    if crops:
        sheet = Image.new('RGB', (240 * len(crops), 160), 'magenta')
        for i, c in enumerate(crops):
            sheet.paste(c, (240 * i, 0))
        sheet.save(D / f'{key}-stray.png')
(D / 'stray.json').write_text(json.dumps(summary, indent=1))
for k, v in summary.items():
    print(k, {a: b for a, b in v.items() if not a.endswith('_at')})
