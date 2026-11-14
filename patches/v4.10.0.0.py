"""v4.10.0.0: keyed Build redraw keeps every section of a multi-section part (Grogs and Companions lost Virtues and
Flaws); creation grants (experience pools, Abilities at score 1, Redcaps, custom Virtue grants);
Faerie Blood varieties and Faerie Legacy.
See patches/v4.10.0.0/docs/CHANGES-v4.10.0.0.txt."""
import pathlib, shutil, re
ROOT = pathlib.Path(__file__).resolve().parents[1]
mod = ROOT / 'patches' / 'v4.10.0.0'
P = ROOT / 'src' / 'index.html'
h = P.read_text(encoding='utf-8')

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if n != count:
        raise SystemExit(f'expected {count} of {old[:70]!r}, found {n}')
    h = h.replace(old, new)

if 'id="v4.10.0.0"' in h: raise SystemExit('v4.10.0.0 already applied')
if 'id="v4.9.11.4"' not in h: raise SystemExit('apply v4.9.11.4 first')
OLD_V, V, B_OLD, B = '4.9.11.4', '4.10.0.0', '2026-11-10', '2026-11-13'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# amWorkSet (v4.9.10.0 script): replace the whole function
a = '  window.amWorkSet = function (parts) {\n'
b = '    if (cur.length !== next.length) return full();\n  };\n'
if h.count(a) != 1 or h.count(b) != 1: raise SystemExit('amWorkSet markers changed')
i = h.index(a); j = h.index(b, i) + len(b)
h = h[:i] + (mod / 'worksset.js').read_text(encoding='utf-8') + h[j:]

js = '!function(){\n"use strict";\n' + ''.join((mod / f).read_text(encoding='utf-8') + '\n' for f in ('grants.js', 'faerie.js', 'wizard.js')) + (mod / 'changelog.js').read_text(encoding='utf-8') + '\n}();'
if '</script' in js.lower(): raise SystemExit('module contains a closing tag')
h = h.rstrip('\n') + '\n<script id="v4.10.0.0">' + js + '</script>\n'
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
