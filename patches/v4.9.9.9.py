"""v4.9.9.9: defect fixes from the 2026-10-29 UI audit (D1-D8): first-visit jump on phones, touch targets,
field names, section headers, ARIA in Play, contrast, the sound button, the Settings menu note.
See patches/v4.9.9.9/docs/CHANGES-v4.9.9.9.txt.
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

if 'id="v4.9.9.9"' in h: raise SystemExit('v4.9.9.9 already applied')
if 'id="v4.9.9.8"' not in h: raise SystemExit('apply v4.9.9.8 first')
OLD_V, B_OLD, V, B = '4.9.9.8', '2026-10-28', '4.9.9.9', '2026-10-29'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# D1: on a phone the chooser's three controls keep one row while the web font loads (in the chooser's own style block,
# which is parsed before the chooser paints)
rep('.amx-controls{flex-wrap:wrap;align-items:center;gap:10px 16px;display:flex}',
    '.amx-controls{flex-wrap:wrap;align-items:center;gap:10px 16px;display:flex}@media (min-width:360px) and (max-width:560px){.amx-controls{display:grid;grid-template-columns:repeat(3,max-content);gap:10px 12px}}')
# D4: a section header is not itself a button (its Fold button is); no nested controls
rep('n&&(n.setAttribute("role","button"),n.setAttribute("tabindex","0"),n.setAttribute("aria-expanded",String(!t)),n.title=t?"Show this section":"Hide this section")',
    'n&&(n.removeAttribute("role"),n.removeAttribute("tabindex"),n.removeAttribute("aria-expanded"),n.title=t?"Show this section":"Hide this section")')
# D5: the aura cell is not a toggle; the console's tab list holds only tabs
rep('<span class="sx-chip sx-aura" aria-pressed="${"None"!==e.realm}">', '<span class="sx-chip sx-aura" data-on="${"None"!==e.realm}">')
rep('<nav class="ctabs" role="tablist">${[["roll","Roll"],["mods","Modifiers"],["legend","Legend"]].map((([t,a])=>`<button type="button" role="tab" aria-selected="${e.ctab===t}" data-pact="ctab" data-t="${t}">${a}</button>`)).join("")}${sfxButton()}</nav>',
    '<nav class="ctabs" aria-label="Roll console"><div class="ctabs-t" role="tablist">${[["roll","Roll"],["mods","Modifiers"],["legend","Legend"]].map((([t,a])=>`<button type="button" role="tab" aria-selected="${e.ctab===t}" tabindex="${e.ctab===t?0:-1}" data-pact="ctab" data-t="${t}">${a}</button>`)).join("")}</div>${sfxButton()}</nav>')
# D8 and D7: Settings notes
rep('The menu is always one click away under the ☰ button at the top left.', 'The main menu is always one click away: select the seal at the top left.')
rep('The speaker button in the bottom corner does the same, and hides itself whenever it would cover part of the page.',
    'The speaker button in the header does the same; over the main menu it sits in the bottom corner.')

mod = ROOT / 'patches' / 'v4.9.9.9'
js = '!function(){\n"use strict";\n' + (mod / 'fix999.js').read_text(encoding='utf-8') + '\n' + (mod / 'changelog.js').read_text(encoding='utf-8') + '\n}();'
css = (mod / 'fix999.css').read_text(encoding='utf-8')
if '</script' in js.lower() or '</style' in css.lower(): raise SystemExit('module contains a closing tag')
h = h.rstrip('\n') + '\n<style id="v4.9.9.9-css">' + css + '</style>\n<script id="v4.9.9.9">' + js + '</script>\n'
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
