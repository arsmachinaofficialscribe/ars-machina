"""v4.9.11.4: the odds yardstick moves to the console's Modifiers tab, off until ticked, and no longer writes the
roll's Ease Factor. See patches/v4.9.11.4/docs/CHANGES-v4.9.11.4.txt."""
import pathlib, shutil
ROOT = pathlib.Path(__file__).resolve().parents[1]
mod = ROOT / 'patches' / 'v4.9.11.4'
P = ROOT / 'src' / 'index.html'
h = P.read_text(encoding='utf-8')

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if n != count:
        raise SystemExit(f'expected {count} of {old[:70]!r}, found {n}')
    h = h.replace(old, new)

def cut(start, end):
    """remove the text from marker `start` up to (not including) marker `end`; each must occur once"""
    global h
    if h.count(start) != 1 or h.count(end) != 1: raise SystemExit(f'markers: {start[:40]!r} {h.count(start)}, {end[:40]!r} {h.count(end)}')
    a, b = h.index(start), h.index(end)
    if b <= a: raise SystemExit('markers out of order')
    h = h[:a] + h[b:]

if 'id="v4.9.11.4"' in h: raise SystemExit('v4.9.11.4 already applied')
if 'id="v4.9.11.3"' not in h: raise SystemExit('apply v4.9.11.3 first')
OLD_V, V, B_OLD, B = '4.9.11.3', '4.9.11.4', '2026-11-09', '2026-11-10'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# the 4.9.11.1 caption goes: styles, script, and its call
cut('/* N5 what the odds badges are measured against */', '/* N6 tablet widths: the header stays on one row')
cut("  /* N5: the odds badges' yardstick, with a control.", "  /* the console's Reset shows only when a manual modifier differs")
rep('    try { odds(); } catch (e) {}\n', '')

css = '/* 4.9.11.4 */\n.cbody fieldset.f9114>.note{margin:0 0 8px}\n'
js = '!function(){\n"use strict";\n' + (mod / 'odds.js').read_text(encoding='utf-8') + '\n' + (mod / 'changelog.js').read_text(encoding='utf-8') + '\n}();'
if '</script' in js.lower(): raise SystemExit('module contains a closing tag')
h = h.rstrip('\n') + '\n<style id="v4.9.11.4-css">' + css + '</style>\n<script id="v4.9.11.4">' + js + '</script>\n'
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
