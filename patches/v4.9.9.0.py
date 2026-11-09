"""v4.9.9.0: Faerie and Magic in play.

Faerie Realm fable, offers and leaving (RoP:F pp. 23, 25-30); magic characters' Acclimation and transformation
(RoP:M pp. 41, 52-54); Things of Virtue and warped animals (RoP:M pp. 78-79, 124-130); taming and the mundane
beasts (DE pp. 384-386, 429-435); Beasts of Virtue and elementals in Build (RoP:M pp. 55-56, 133-139; DE pp. 449-451);
Spirit Away added to the bestiary powers. See patches/v4.9.9.0/docs/CHANGES-v4.9.9.0.txt.
"""
import pathlib, shutil, json, zlib, base64, re
ROOT = pathlib.Path(__file__).resolve().parents[1]
P = ROOT / 'src' / 'index.html'
h = P.read_text(encoding='utf-8')

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if n != count:
        raise SystemExit(f'expected {count} of {old[:70]!r}, found {n}')
    h = h.replace(old, new)

if 'id="v4.9.9.0"' in h: raise SystemExit('v4.9.9.0 already applied')
if 'id="v4.9.8.1"' not in h: raise SystemExit('apply v4.9.8.1 first')
OLD_V, B_OLD, V, B = '4.9.8.1', '2026-10-28', '4.9.9.0', '2026-10-28'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# bestiary powers: Spirit Away (RoP:F p. 23)
m = re.search(r'(<script type="application/json" id="am49-data" data-z="1">)(.*?)(</script>)', h, re.S)
if not m: raise SystemExit('am49-data block not found')
d = json.loads(zlib.decompress(base64.b64decode(m.group(2).strip())).decode('utf-8'))
if any(p.get('n') == 'Spirit Away' for p in d['powers']): raise SystemExit('Spirit Away already present')
d['powers'].append({'b': 'F', 'n': 'Spirit Away', 'c': 'variable', 'i': '0', 'f': 'Vim', 'r': '', 'd': '', 't': '',
  'x': 'Greater Faerie Power, variable points, Init 0, Vim. The faerie adds Threshold points to the total a mortal or a group has already gathered, at 1 Might Point per Threshold point; it cannot be their only source. They must still face the Guardian of the Threshold (who may be the faerie itself), though a faerie that wants them inside may show the right path. It can also send characters away from the Faerie Realm, at 3 Might Points each.',
  's': 'Adds Threshold points to a mortal’s total at 1 Might each, or sends a character out of Faerie for 3 Might.', 'ref': 0, 'p': 23})
enc = base64.b64encode(zlib.compress(json.dumps(d, ensure_ascii=False, separators=(',', ':')).encode('utf-8'), 9)).decode()
h = h[:m.start(2)] + enc + h[m.end(2):]

mod = ROOT / 'patches' / 'v4.9.9.0'
beasts = json.loads((mod / 'de-beasts.json').read_text(encoding='utf-8'))
src = (mod / 'realms990.js').read_text(encoding='utf-8')
if src.count('__BEASTS__') != 1: raise SystemExit('beast placeholder')
src = src.replace('__BEASTS__', json.dumps(beasts, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c'))
js = '!function(){\n"use strict";\n' + src + '\n' + (mod / 'changelog.js').read_text(encoding='utf-8') + '\n}();'
css = (mod / 'realms990.css').read_text(encoding='utf-8')
if '</script' in js.lower() or '</style' in css.lower(): raise SystemExit('module contains a closing tag')
h = h.rstrip('\n') + '\n<style id="v4.9.9.0-css">' + css + '</style>\n<script id="v4.9.9.0">' + js + '</script>\n'
P.write_text(h, encoding='utf-8', newline='\n')

D = ROOT / 'src' / 'docs'; M = mod / 'docs'
shutil.copy(M / f'CHANGES-v{V}.txt', D / f'CHANGES-v{V}.txt')
shutil.copy(M / f'SOURCE-VERIFICATION-v{V}.txt', D / f'SOURCE-VERIFICATION-v{V}.txt')
old = D / f'PLAYER-CHANGELOG-v{OLD_V}.md'
pc = old.read_text(encoding='utf-8'); anchor = f'\n## v{OLD_V} — '
if pc.count(f'through v{OLD_V}') != 2 or pc.count(anchor) != 1: raise SystemExit('player changelog layout changed')
pc = pc.replace(f'through v{OLD_V}', f'through v{V}'); i = pc.index(anchor) + 1
pc = pc[:i] + (M / 'player-section.md').read_text(encoding='utf-8') + pc[i:]
(D / f'PLAYER-CHANGELOG-v{V}.md').write_text(pc, encoding='utf-8', newline='\n'); old.unlink()
print('patched to', V)
