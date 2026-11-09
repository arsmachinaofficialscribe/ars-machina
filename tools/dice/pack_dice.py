"""Pack rendered dice into app assets.

python3 pack_dice.py <render dir> <src/assets dir> <manifest.json> key[,key...]

From <render dir>/<key>/ (hero.png 600 px, face0-9.png and face10.png 300 px, tumble00-11.png 352 px) it writes,
named by the first 12 hex digits of their SHA-256 like every other asset:
  h   hero, 300 px webp (blank faces: Modern engraves the numbers at roll time)
  t   tumble sheet, 12 x 176 px webp
  p   Retro hero, 46 px palette PNG;   pt  Retro tumble, 12 x 46 px palette PNG
  rp  Retro faces 0-9 and "10", 46 px; rc  Retro chips 0-9 and "10", 40 px
  c   roll-log chip, 72 px webp;       pc  Retro roll-log chip, 24 px palette PNG
and DIE_FACE_DATA shade: the mean colour and relative luminance of each visible face of the hero.
"""
import hashlib, json, os, sys
from PIL import Image, ImageDraw

RD, AS, MAN, KEYS = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4].split(',')
SPECS = json.loads(os.popen("node -e \"const s=require('./specs.js');const o={};for(const k in s)o[k]={ink:s[k].ink};console.log(JSON.stringify(o))\"").read())
# visible face outlines in the hero (DIE_FACE_DATA.geo, faces 0, 1, 4, 5, 9)
KITES = [[(.5, .0466), (.7783, .6346), (.5, .7804), (.2217, .6346)], [(.5, .0466), (.2217, .6346), (.0914, .6091), (.1185, .3982)],
         [(.5, .0466), (.8815, .3982), (.9086, .6091), (.7783, .6346)], [(.5, .8798), (.5, .7804), (.2217, .6346), (.0914, .6091)],
         [(.5, .8798), (.9086, .6091), (.7783, .6346), (.5, .7804)]]

def save(im, ext, **kw):
    import io
    b = io.BytesIO(); im.save(b, ext.upper() if ext != 'webp' else 'WEBP', **kw); data = b.getvalue()
    name = hashlib.sha256(data).hexdigest()[:12] + '.' + ext
    open(os.path.join(AS, name), 'wb').write(data); return 'assets/' + name

def pixel(im, size, colors=18):
    """Retro sprite: area-downscale, hard alpha, adaptive palette, 1 px dark outline."""
    sm = im.convert('RGBA').resize((size, size), Image.LANCZOS)
    a = sm.getchannel('A').point(lambda v: 255 if v > 110 else 0)
    rgb = Image.new('RGB', sm.size, (0, 0, 0)); rgb.paste(sm.convert('RGB'), mask=a)
    q = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    out = Image.new('RGBA', sm.size, (0, 0, 0, 0)); out.paste(q, mask=a)
    px, A = out.load(), a.load(); W, H = out.size
    dark = min((q.getpixel((x, y)) for y in range(H) for x in range(W) if A[x, y]), key=sum)
    edge = tuple(int(c * .45) for c in dark) + (255,)
    for y in range(H):
        for x in range(W):
            if not A[x, y] and any(0 <= x + dx < W and 0 <= y + dy < H and A[x + dx, y + dy] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                px[x, y] = edge
    return out.quantize(colors=colors + 2, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)

def lin(c):
    c /= 255; return c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4

def shade(hero):
    h = hero.convert('RGBA').resize((300, 300), Image.LANCZOS); out = []
    for k in KITES:
        cx, cy = sum(p[0] for p in k) / 4, sum(p[1] for p in k) / 4
        poly = [((cx + (x - cx) * .7) * 300, (cy + (y - cy) * .7) * 300) for x, y in k]
        m = Image.new('L', (300, 300), 0); ImageDraw.Draw(m).polygon(poly, fill=255)
        px = [h.getpixel((x, y)) for y in range(300) for x in range(300) if m.getpixel((x, y)) and h.getpixel((x, y))[3] > 200]
        rgb = [round(sum(p[i] for p in px) / len(px)) for i in range(3)]
        L = .2126 * lin(rgb[0]) + .7152 * lin(rgb[1]) + .0722 * lin(rgb[2])
        out.append({'rgb': rgb, 'L': round(L, 4)})
    return out

man = json.load(open(MAN)) if os.path.exists(MAN) else {}
for k in KEYS:
    d = os.path.join(RD, k); hero = Image.open(os.path.join(d, 'hero.png')).convert('RGBA')
    faces = [Image.open(os.path.join(d, f'face{v}.png')).convert('RGBA') for v in range(10)]
    ten = Image.open(os.path.join(d, 'face10.png')).convert('RGBA')
    tum = [Image.open(os.path.join(d, f'tumble{i:02d}.png')).convert('RGBA') for i in range(12)]
    rfaces = [Image.open(os.path.join(d, f'rface{v}.png')).convert('RGBA') for v in range(10)]
    rten = Image.open(os.path.join(d, 'rface10.png')).convert('RGBA')
    rtum = [Image.open(os.path.join(d, f'rtumble{i:02d}.png')).convert('RGBA') for i in range(12)]
    e = {}
    e['h'] = save(hero.resize((300, 300), Image.LANCZOS), 'webp', quality=86, method=6)
    sheet = Image.new('RGBA', (176 * 12, 176), (0, 0, 0, 0))
    for i, t in enumerate(tum): sheet.alpha_composite(t.resize((176, 176), Image.LANCZOS), (176 * i, 0))
    e['t'] = save(sheet, 'webp', quality=82, method=6)
    e['p'] = save(pixel(hero, 46), 'png', optimize=True)
    ps = Image.new('RGBA', (46 * 12, 46), (0, 0, 0, 0))
    for i, t in enumerate(rtum): ps.alpha_composite(pixel(t, 46).convert('RGBA'), (46 * i, 0))
    e['pt'] = save(ps.quantize(colors=200, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE), 'png', optimize=True)
    e['rp'] = [save(pixel(f, 46), 'png', optimize=True) for f in rfaces]; e['rp10'] = save(pixel(rten, 46), 'png', optimize=True)
    e['rc'] = [save(pixel(f, 40), 'png', optimize=True) for f in rfaces]; e['rc10'] = save(pixel(rten, 40), 'png', optimize=True)
    e['c'] = save(hero.resize((72, 72), Image.LANCZOS), 'webp', quality=86, method=6)
    e['pc'] = save(pixel(hero, 24, 12), 'png', optimize=True)
    e['ink'] = SPECS[k]['ink']; e['shade'] = shade(hero)
    man[k] = e; print(k, 'shade', [s['L'] for s in e['shade']])
json.dump(man, open(MAN, 'w'), indent=1)
