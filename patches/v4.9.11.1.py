"""v4.9.11.1: the 2026-11-09 UI audit (N1-N12, S1-S7, the console and spell-card items) and redrawn art
(the seal, the roll circle, the Play crest). No rule change; save formats unchanged.
See patches/v4.9.11.1/docs/CHANGES-v4.9.11.1.txt.
"""
import pathlib, shutil, re, zlib, base64, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
mod = ROOT / 'patches' / 'v4.9.11.1'
sys.path.insert(0, str(mod))
import seal, scale
P = ROOT / 'src' / 'index.html'
h = P.read_text(encoding='utf-8')

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if n != count:
        raise SystemExit(f'expected {count} of {old[:70]!r}, found {n}')
    h = h.replace(old, new)

if 'id="v4.9.11.1"' in h: raise SystemExit('v4.9.11.1 already applied')
if 'id="v4.9.11.0"' not in h: raise SystemExit('apply v4.9.11.0 first')
OLD_V, B_OLD, V, B = '4.9.11.0', '2026-11-09', '4.9.11.1', '2026-11-09'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# --- S1, S2: one type scale and one set of corner radii, applied to every <style> block -------------------------
h, SCALE_REPORT = scale.apply(h)

# --- the seal (header, and the first-run chooser's copy) --------------------------------------------------------
m = re.search(r'<svg class="sigil" viewBox="0 0 40 40" aria-hidden="true">(.*?)</svg>', h, re.S)
if not m: raise SystemExit('header seal not found')
old_inner = m.group(1)
rep('viewBox="0 0 40 40" aria-hidden="true">' + old_inner + '</svg>', 'viewBox="0 0 120 120" aria-hidden="true">' + seal.inner() + '</svg>', 2)
# Retro pixel renderer: the new turning layers
rep('{sel:"svg.sigil",layers:[".turn",".turn-in"],font:"Jacquard 12 AM"}', '{sel:"svg.sigil",layers:[".turn",".turn-mid",".turn-in"],font:"Jacquard 12 AM"}')
rep('{sel:"svg.crest-svg",layers:[".turn",".turn-in"],font:"Jacquard 12 AM"}', '{sel:"svg.crest-svg",layers:[".turn",".turn-mid",".turn-in"],font:"Jacquard 12 AM"}')
rep('{sel:"svg.fx-circle",layers:[".fx-r1",".fx-r2",".fx-r3",".fx-r4"],font:"Silkscreen AM",fx:!0}', '{sel:"svg.fx-circle",layers:[".fx-r1",".fx-r2",".fx-r3",".fx-r4",".fx-r5"],font:"Silkscreen AM",fx:!0}')
seal_css = (mod / 'seal.css').read_text(encoding='utf-8')
if '</style' in seal_css.lower(): raise SystemExit('seal.css contains a closing tag')
rep('<header class="top"><div class="wrap top-in">', '<style id="v4.9.11.1-seal">' + seal_css + '</style>\n<header class="top"><div class="wrap top-in">')
(ROOT / 'src' / 'favicon.svg').write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><style>.s-f,.s-r,.s-b{display:none}.s-a{stroke-width:5px}.s-c{r:8px}</style>'
    '<circle cx="60" cy="60" r="60" fill="#14110d"/><g color="#e1be63">' + seal.inner() + '</g></svg>\n', encoding='utf-8', newline='\n')

exec((mod / 'edits.py').read_text(encoding='utf-8'))

# --- module ------------------------------------------------------------------------------------------------------
ARTS = ['Cr', 'In', 'Mu', 'Pe', 'Re', 'An', 'Aq', 'Au', 'Co', 'He', 'Ig', 'Im', 'Me', 'Te', 'Vi']
lit = ','.join(f'.fx[data-fx={a}] .fx-m-{a} .fx-mc,.fx[data-fxt={a}] .fx-m-{a} .fx-mc' for a in ARTS)
lit_i = ','.join(f'.fx[data-fx={a}] .fx-m-{a} .fx-ico,.fx[data-fxt={a}] .fx-m-{a} .fx-ico' for a in ARTS)
lit_r = ','.join(f':root[data-skin=retro] .fx[data-fx={a}] .fx-m-{a} .fx-mc,:root[data-skin=retro] .fx[data-fxt={a}] .fx-m-{a} .fx-mc' for a in ARTS)
art_css = (mod / 'art.css').read_text(encoding='utf-8') + (
    f'\n{lit}{{stroke:var(--fx-c,#e1be63);stroke-width:2.4px;opacity:1;fill:color-mix(in srgb,var(--fx-c,#e1be63) 26%,#0a0d14)}}'
    f'\n{lit_i}{{stroke:#fff6dc;stroke-width:2px}}\n{lit_r}{{fill:#fff6dc;stroke:var(--fx-c,#e1be63)}}\n')
css = (mod / 'fix.css').read_text(encoding='utf-8') + '\n' + art_css
parts = ['fix.js', 'art.js', 'changelog.js']
js = '!function(){\n"use strict";\n' + '\n'.join((mod / f).read_text(encoding='utf-8') for f in parts) + '\n}();'
if '</script' in js.lower() or '</style' in css.lower(): raise SystemExit('module contains a closing tag')
h = h.rstrip('\n') + '\n<style id="v4.9.11.1-css">' + css + '</style>\n<script id="v4.9.11.1">' + js + '</script>\n'
P.write_text(h, encoding='utf-8', newline='\n')

D = ROOT / 'src' / 'docs'; M = mod / 'docs'
if (M / f'CHANGES-v{V}.txt').exists():
    shutil.copy(M / f'CHANGES-v{V}.txt', D / f'CHANGES-v{V}.txt')
    old = D / f'PLAYER-CHANGELOG-v{OLD_V}.md'
    pc = old.read_text(encoding='utf-8'); anchor = f'\n## v{OLD_V} — '
    if pc.count(f'through v{OLD_V}') != 2 or pc.count(anchor) != 1: raise SystemExit('player changelog layout changed')
    pc = pc.replace(f'through v{OLD_V}', f'through v{V}'); i = pc.index(anchor) + 1
    pc = pc[:i] + (M / 'player-section.md').read_text(encoding='utf-8') + pc[i:]
    (D / f'PLAYER-CHANGELOG-v{V}.md').write_text(pc, encoding='utf-8', newline='\n'); old.unlink()
print('patched to', V, '|', SCALE_REPORT)
