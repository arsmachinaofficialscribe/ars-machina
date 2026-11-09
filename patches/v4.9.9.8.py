"""v4.9.9.8: sample companions and grogs in New Character (the Definitive Edition's templates, DE pp. 32-34).
Numbered as a patch, following the author's recent releases. See patches/v4.9.9.8/docs/CHANGES-v4.9.9.8.txt.
"""
import pathlib, shutil
ROOT = pathlib.Path(__file__).resolve().parents[1]
P = ROOT / 'src' / 'index.html'
h = P.read_text(encoding='utf-8')

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if n != count:
        raise SystemExit(f'expected {count} of {old[:70]!r}, found {n}')
    h = h.replace(old, new)

if 'id="v4.9.9.8"' in h: raise SystemExit('v4.9.9.8 already applied')
if 'id="v4.9.9.7"' not in h: raise SystemExit('apply v4.9.9.7 first')
OLD_V, B_OLD, V, B = '4.9.9.7', '2026-10-28', '4.9.9.8', '2026-10-28'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# New Character: companions and grogs start from two book templates each; the magus keeps the example
EX = '\\n        <button type="button" data-mn-from="example" aria-pressed="${"example"===MN.newFrom}"><b>The example</b><small>A finished magus to study and change</small></button>'
rep(EX + '</div></div>', '${"magus"!==MN.newType&&window.AMSAMPLE?AMSAMPLE.chips(MN.newType,MN.newFrom):`' + EX + '`}</div></div>')
rep('${"example"===MN.newFrom?\'<p class="mn-note">The example is a magus of House Merinita; the choices above are set from it.</p>\':""}',
    '${"magus"!==MN.newType&&window.AMSAMPLE?AMSAMPLE.note(MN.newType,MN.newFrom):"example"===MN.newFrom?\'<p class="mn-note">The example is a magus of House Merinita; the choices above are set from it.</p>\':""}')
rep('function mnStartNew(){const e=MN.newType;if("example"===MN.newFrom?(st=exampleState(),st.example=!1):(',
    'function mnStartNew(){const e=MN.newType,smp=window.AMSAMPLE&&AMSAMPLE.make(MN.newFrom,e);if(smp?(st=smp):"example"===MN.newFrom&&"magus"===e?(st=exampleState(),st.example=!1):(')
rep('toast("example"===MN.newFrom?"The example is open. Change anything you like.":`A blank ${e} is ready.`,"ok")',
    'toast(smp?`${st.info.name} is open. Change anything you like.`:"example"===MN.newFrom&&"magus"===e?"The example is open. Change anything you like.":`A blank ${e} is ready.`,"ok")')
rep('"A blank magus, companion or grog, or the example to learn from."', '"A blank magus, companion or grog, or a finished one to learn from."')

mod = ROOT / 'patches' / 'v4.9.9.8'
js = '!function(){\n"use strict";\n' + (mod / 'samples998.js').read_text(encoding='utf-8') + '\n' + (mod / 'changelog.js').read_text(encoding='utf-8') + '\n}();'
if '</script' in js.lower(): raise SystemExit('module contains a closing tag')
h = h.rstrip('\n') + '\n<script id="v4.9.9.8">' + js + '</script>\n'
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
