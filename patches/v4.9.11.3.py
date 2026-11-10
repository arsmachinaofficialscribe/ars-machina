"""v4.9.11.3: Retro shows the pre-4.9.11.1 seal and crest again. See patches/v4.9.11.3/docs/CHANGES-v4.9.11.3.txt."""
import pathlib, shutil, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
mod = ROOT / 'patches' / 'v4.9.11.3'
sys.path.insert(0, str(ROOT / 'patches' / 'v4.9.11.1'))
import seal
P = ROOT / 'src' / 'index.html'
h = P.read_text(encoding='utf-8')

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if n != count:
        raise SystemExit(f'expected {count} of {old[:70]!r}, found {n}')
    h = h.replace(old, new)

if 'id="v4.9.11.3"' in h: raise SystemExit('v4.9.11.3 already applied')
if 'id="v4.9.11.2"' not in h: raise SystemExit('apply v4.9.11.2 first')
OLD_V, V, B = '4.9.11.2', '4.9.11.3', '2026-11-09'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# the seal carries both drawings: sn = the 4.9.11.1 seal (Modern), so = the earlier seal at 3x (Retro)
new = seal.inner()
def tag(s, a, b):
    if s.count(a) != 1: raise SystemExit('seal markup changed: ' + a)
    return s.replace(a, b)
sn = new
for c in ('turn', 'turn-mid', 'turn-in'): sn = tag(sn, f'<g class="{c}" ', f'<g class="{c} sn" ')
sn = tag(sn, '<path class="s-f" fill="none" stroke="currentColor" stroke-width=".8" d="M49.5 60', '<path class="s-f sn" fill="none" stroke="currentColor" stroke-width=".8" d="M49.5 60')
sn = tag(sn, '<circle class="s-c" ', '<circle class="s-c sn" ')
dots = ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" stroke="none"/>' for x, y, r in (
    (87.72, 71.49, 2.85), (71.49, 87.72, 1.8), (48.51, 87.72, 2.85), (32.28, 71.49, 1.8),
    (32.28, 48.51, 2.85), (48.51, 32.28, 1.8), (71.49, 32.28, 2.85), (87.72, 48.51, 1.8)))
so = ('<g class="turn so" fill="none" stroke="currentColor" stroke-width="3"><circle cx="60" cy="60" r="55.5" stroke-dasharray="6 9"/>'
      '<rect x="24" y="24" width="72" height="72" transform="rotate(45 60 60)"/><rect x="24" y="24" width="72" height="72"/></g>'
      '<g class="turn-in so" fill="currentColor" stroke="currentColor"><circle cx="60" cy="60" r="18" fill="none" stroke-width="3.6"/>'
      '<path d="M60 37.8v8.4M60 73.8v8.4M37.8 60h8.4M73.8 60h8.4" stroke-width="3" fill="none"/>' + dots + '</g>'
      '<circle class="so" cx="60" cy="60" r="5.4" fill="currentColor"/>')
rep(new, sn + so, 2)
OLD_L, NEW_L = ':is(g.so>*,.so:not(g))', ':is(g.sn>*,.sn:not(g))'
rep('<style id="v4.9.11.1-seal">', '<style id="v4.9.11.1-seal">'
    f':is(.sigil,[data-amx-sigil] svg,.amx-brand svg) {OLD_L}{{display:none}}'
    f':root[data-skin=retro] :is(.sigil,.amx-brand svg) {NEW_L},.amx-half--retro [data-amx-sigil] {NEW_L}{{display:none!important}}'
    f':root[data-skin=retro] :is(.sigil,.amx-brand svg) {OLD_L},.amx-half--retro [data-amx-sigil] {OLD_L}{{display:inline}}')
# the crest: Retro keeps the earlier drawing
rep('      var s = C0.apply(this, arguments);\n      try { return',
    '      var s = C0.apply(this, arguments);\n      if (document.documentElement.getAttribute("data-skin") === "retro") return s;\n      try { return')

rep(':root[data-skin=retro] .crest-svg :is(.turn,.turn-mid,.turn-in) :is(circle,polygon,line){stroke-width:2.4px;opacity:1}\n', '')
js = '!function(){\n"use strict";\n' + (mod / 'changelog.js').read_text(encoding='utf-8') + '\n}();'
if '</script' in js.lower(): raise SystemExit('module contains a closing tag')
h = h.rstrip('\n') + '\n<script id="v4.9.11.3">' + js + '</script>\n'
P.write_text(h, encoding='utf-8', newline='\n')

D = ROOT / 'src' / 'docs'; M = mod / 'docs'
shutil.copy(M / f'CHANGES-v{V}.txt', D / f'CHANGES-v{V}.txt')
old = D / f'PLAYER-CHANGELOG-v{OLD_V}.md'
pc = old.read_text(encoding='utf-8'); anchor = f'\n## v{OLD_V} — '
if pc.count(f'through v{OLD_V}') != 2 or pc.count(anchor) != 1: raise SystemExit('player changelog layout changed')
pc = pc.replace(f'through v{OLD_V}', f'through v{V}'); i = pc.index(anchor) + 1
pc = pc[:i] + (M / 'player-section.md').read_text(encoding='utf-8') + pc[i:]
(D / f'PLAYER-CHANGELOG-v{V}.md').write_text(pc, encoding='utf-8', newline='\n'); old.unlink()
print('patched to', V)
