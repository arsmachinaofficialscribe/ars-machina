"""v4.9.8.1: Speed Index. The first-run chooser shows as soon as it exists, over a backdrop that already has its
layout, instead of after the whole page has been read. See patches/v4.9.8.1/docs/CHANGES-v4.9.8.1.txt."""
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

if 'id="v4.9.8.1"' in h: raise SystemExit('v4.9.8.1 already applied')
if 'id="v4.9.8.0"' not in h: raise SystemExit('apply v4.9.8.0 first')
OLD_V, B_OLD, V, B = '4.9.8.0', '2026-10-28', '4.9.8.1', '2026-10-28'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# boot script: mark a first run (the chooser will open), and hold clicks on the chooser until the page is ready,
# then replay them
rep('d.setAttribute("data-booting","");window.amBootRender=',
    'd.setAttribute("data-booting","");try{"1"!==localStorage.getItem("arm5-startup-setup-v46")&&d.setAttribute("data-boot-first","")}catch(e){}'
    'var q=null;window.addEventListener("click",function(e){if(!d.hasAttribute("data-booting"))return;var b=e.target&&e.target.closest&&e.target.closest(".amx-start button,.amx-start [data-amx-half]");if(!b)return;e.preventDefault(),e.stopImmediatePropagation(),q=b},!0);'
    'window.amBootRender=')
rep('d.removeAttribute("data-booting")};document.addEventListener("DOMContentLoaded",r)',
    'd.removeAttribute("data-booting");if(q){var b=q;q=null;b.isConnected&&setTimeout(function(){b.click()},0)}};document.addEventListener("DOMContentLoaded",r)')
# boot style: the chooser is not hidden; a first run in the dark palette paints the chooser's bar, halves and footer
# from the first frame, with the app's name where the chooser's title will be
rep('@keyframes am-boot-in{from{opacity:0}}</style>',
    '@keyframes am-boot-in{from{opacity:0}}'
    'html[data-booting] body>.amx-start:not(#am-load-err){opacity:1!important;pointer-events:auto!important}'
    'html[data-booting]:has(body>.amx-start)::after{content:none}'
    'html[data-booting][data-boot-first]:not([data-theme=light]){background:linear-gradient(#04060a,#04060a) top/100% 63px no-repeat,linear-gradient(#04060a,#04060a) bottom/100% 36px no-repeat,linear-gradient(#0c1018,#080b10) left/50% 100% no-repeat,linear-gradient(#0f0b07,#1c120a) right/50% 100% no-repeat,#06080c;background-attachment:fixed}'
    'html[data-booting][data-boot-first]:not([data-theme=light])::after{content:"Ars Machina";inset:0 auto auto 0;display:block;padding:20px 0 0 70px;font:600 19px/1 Georgia,serif;color:#f3ecdb;letter-spacing:.02em;animation:none}'
    '@media (max-width:860px){html[data-booting][data-boot-first]:not([data-theme=light]){background:linear-gradient(#04060a,#04060a) top/100% 105px no-repeat,linear-gradient(#04060a,#04060a) bottom/100% 57px no-repeat,linear-gradient(#0e1320,#080b10),#06080c;background-attachment:fixed}html[data-booting][data-boot-first]:not([data-theme=light])::after{padding:16px 0 0 54px}}'
    '</style>')

# the chooser now paints before the Title Case observer (4.9.7.6) exists: write its headings in Title Case
i = h.index('id="v4.6.0.0-style-menu-and-ui-sounds"'); j = h.index('</script>', i); seg = h[i:j]
for old, new in (('in clear light', 'in Clear Light'), ('by torchlight', 'by Torchlight'), ('Concept and setting', 'Concept and Setting')):
    if seg.count(old) != 1: raise SystemExit(f'chooser: expected 1 of {old!r}')
    seg = seg.replace(old, new)
h = h[:i] + seg + h[j:]

mod = ROOT / 'patches' / 'v4.9.8.1'
CL = (mod / 'changelog.js').read_text(encoding='utf-8')
js = '!function(){\n"use strict";\n' + CL + '\n}();'
if '</script' in js.lower(): raise SystemExit('module contains a closing tag')
h = h.rstrip('\n') + '\n<script id="v4.9.8.1">' + js + '</script>\n'
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
