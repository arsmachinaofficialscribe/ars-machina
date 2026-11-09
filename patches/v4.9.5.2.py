"""v4.9.5.2: main menu tiles evenly spaced. The Book catalogues tile (an <li>) was inserted before the About
button, inside About's own <li>, so the list's 10 px gap was lost between the last two tiles. It now goes
before About's <li>. Its title is put in sentence case."""
import pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
P = ROOT / 'src' / 'index.html'
h = P.read_text(encoding='utf-8')

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if n != count:
        raise SystemExit(f'expected {count} of {old[:70]!r}, found {n}')
    h = h.replace(old, new)

if 'id="v4.9.5.2"' in h:
    raise SystemExit('v4.9.5.2 already applied')
OLD_V, B_OLD, V, B = '4.9.5.1', '2026-10-26', '4.9.5.2', '2026-10-26'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

ITEM = 'mnItem("catalogues","credits","Book Catalogues","Reference: supplement spells, creatures and equipment, by book.")'
NEW_ITEM = 'mnItem("catalogues","credits","Book catalogues","Reference: supplement spells, creatures and equipment, by book.")'
# v3.3 catalogue integration
rep('e&&!document.querySelector(\'#menu [data-mn="catalogues"]\')&&e.insertAdjacentHTML("beforebegin",' + ITEM + ')',
    'e&&!document.querySelector(\'#menu [data-mn="catalogues"]\')&&(e.closest("li")||e).insertAdjacentHTML("beforebegin",' + NEW_ITEM + ')')
# v4.9.1.0 menu observer
rep('e&&!n.querySelector(\'[data-mn="catalogues"]\')&&"function"==typeof mnItem&&e.insertAdjacentHTML("beforebegin",' + ITEM + ')',
    'e&&!n.querySelector(\'[data-mn="catalogues"]\')&&"function"==typeof mnItem&&(e.closest("li")||e).insertAdjacentHTML("beforebegin",' + NEW_ITEM + ')')
rep('<h2>Book Catalogues</h2>', '<h2>Book catalogues</h2>')

CL = '''window.CHANGELOG&&window.CHANGELOG[0]&&window.CHANGELOG[0].items.unshift(["4.9.5.2","Even menu spacing",["Main menu: Book catalogues and About Ars Machina had no space between them, because the catalogue tile was placed inside the About tile’s list entry. All four tiles are now evenly spaced, in Modern and Retro. The tile and its page title read “Book catalogues”."]]);'''
h = h.rstrip('\n') + '\n<script id="v4.9.5.2">' + CL + '</script>\n'
P.write_text(h, encoding='utf-8', newline='\n')
print('patched to', V)
