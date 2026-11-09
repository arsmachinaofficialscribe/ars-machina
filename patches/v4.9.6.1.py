"""v4.9.6.1: optimisation (patch).
1. One start-up draw: three scripts each redrew the whole sheet while the page loaded (about 155 ms in all); while the
   page is still loading they now mark a redraw as due, and it runs once just before the page is shown.
2. Bestiary and hedge-magic data on demand (hosted build): the 663 KB block is fetched as a cached asset with an
   integrity check, after start-up in idle time, instead of riding in every copy of the page; the panels that use it
   redraw when it arrives. The offline file keeps it inline. (pack.py writes the asset: LAZY_JSON.)
"""
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

if 'id="v4.9.6.1"' in h:
    raise SystemExit('v4.9.6.1 already applied')
OLD_V, B_OLD, V, B = '4.9.6.0', '2026-10-27', '4.9.6.1', '2026-10-27'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# 1. Coalesce the start-up draws. amBootRender is defined in the first script; the boot mark's DOMContentLoaded
#    handler (registered first) runs the one due draw before it reveals the page.
rep('var r=function(){d.removeAttribute("data-booting")};',
    'window.amBootRender=function(){if(d.hasAttribute("data-booting")){window.__amRenderDue=1;return}renderAll()};'
    'var r=function(){if(window.__amRenderDue){window.__amRenderDue=0;var f=document.activeElement;try{renderAll()}catch(e){console.error(e)}f&&f!==document.body&&f.isConnected&&f!==document.activeElement&&f.focus({preventScroll:!0})}d.removeAttribute("data-booting")};')
rep('renderAll(),ptSquareUp();</script>', 'amBootRender(),ptSquareUp();</script>')
rep('"play"===MODE?renderPlay():renderAll(),document.getElementById("menu")&&!document.getElementById("menu").hidden&&drawMenu()}();',
    'amBootRender(),document.getElementById("menu")&&!document.getElementById("menu").hidden&&drawMenu()}();')
rep('value,d=0,B())})),"play"===MODE?renderPlay():renderAll()}();</script>',
    'value,d=0,B())})),amBootRender()}();</script>')

#    The menu focuses its first item 20 ms after drawing; not while the first-run chooser sits on top of it.
rep('setTimeout((()=>{const t=e.querySelector(\'.mn-item, [aria-pressed="true"], .btn.primary, .mn-drop\');t&&t.focus({preventScroll:!0})}),20)',
    'setTimeout((()=>{if(document.querySelector(".amx-start"))return;const t=e.querySelector(\'.mn-item, [aria-pressed="true"], .btn.primary, .mn-drop\');t&&t.focus({preventScroll:!0})}),20)')

#    The sound button changes only when two readings agree; when a reading differs, take the confirming one shortly
#    after instead of waiting for some later change to the page (fewer start-up redraws exposed the wait).
rep('t===e._sndLast&&e.classList.toggle("am-snd-away",t),e._sndLast=t}',
    't===e._sndLast?e.classList.toggle("am-snd-away",t):setTimeout(window.amSndCheck,350),e._sndLast=t}')
rep('const d=()=>{i||(i=requestAnimationFrame(a))};window.addEventListener("scroll",d,{passive:!0})',
    'const d=()=>{i||(i=requestAnimationFrame(a))};window.amSndCheck=d;window.addEventListener("scroll",d,{passive:!0})')

#    While the menu is open, only the menu's own contents can make the sound button step aside (it used to count the
#    sheet hidden under the menu).
rep('e.style.pointerEvents="none";const r=innerWidth*innerHeight;', 'e.style.pointerEvents="none";const r=innerWidth*innerHeight,M=(e=>e&&!e.hidden?e:null)(document.getElementById("menu"));')
rep('d===document.body||d===document.documentElement)continue;', 'd===document.body||d===document.documentElement||M&&!M.contains(d))continue;')

# 2. The bestiary and hedge data: read from the asset once it has arrived; until then an empty set, not cached.
EMPTY = '{spells:[],guides:[],rg:[],rs:[],quals:{},powers:[],best:[],orders:[],choirs:[],scale:[],fmight:{}}'
rep('const t=()=>{if(e)return e;const t=document.getElementById("am49-data");return e=t?JSON.parse(amInflate(t.textContent.trim())):' + EMPTY + ',e}',
    'const t=()=>{if(e)return e;const t=document.getElementById("am49-data");if(t&&t.dataset.src){if(!window.__am49)return window.AM49L&&AM49L.load(),' + EMPTY + ';return e=window.__am49}return e=t?JSON.parse(amInflate(t.textContent.trim())):' + EMPTY + ',e}')
#    the familiar list completes itself once; not before the data is there
rep('let i=!1;function o(){if(i)return;i=!0,', 'let i=!1;function o(){if(i)return;if(window.AM49L&&!AM49L.ready())return;i=!0,')

JS = r'''!function(){"use strict";
/* on-demand bestiary and hedge data (hosted build): fetched with its integrity hash, after start-up in idle time or
   as soon as a panel asks; the panels redraw when it arrives */
const el=document.getElementById("am49-data");let p=null;
window.AM49L={ready:()=>!el||!el.dataset.src||!!window.__am49,
 load(){if(!el||!el.dataset.src||window.__am49)return Promise.resolve();
  return p||(p=fetch(el.dataset.src,{integrity:el.dataset.sri,credentials:"same-origin"}).then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.json()})
   .then(j=>{window.__am49=j;const f=document.activeElement;try{"undefined"!=typeof renderAll&&renderAll();const m=document.getElementById("menu");m&&!m.hidden&&"function"==typeof drawMenu&&drawMenu()}catch(z){console.error(z)}f&&f!==document.body&&f.isConnected&&f!==document.activeElement&&f.focus({preventScroll:!0})})
   .catch(z=>{p=null;console.error("Bestiary data could not be loaded: "+z.message)}))}};
if(el&&el.dataset.src){const go=()=>(window.requestIdleCallback||(f=>setTimeout(f,300)))(()=>AM49L.load(),{timeout:2500});
 "complete"===document.readyState?go():window.addEventListener("load",go,{once:!0})}
const C=window.CHANGELOG&&window.CHANGELOG[0];
C&&C.items.unshift(["4.9.6.1","Faster start",["The sheet is drawn once while the page loads instead of three times, which saves about a seventh of a second on a typical computer.","The hosted site no longer carries the bestiary and hedge-magic lists inside the page: they arrive as a separate file, cached by the browser between visits and releases, shortly after the page opens. The page is about a quarter smaller. The offline file still has everything inside."]]);
}();'''
h = h.rstrip('\n') + '\n<script id="v4.9.6.1">' + JS + '</script>\n'
P.write_text(h, encoding='utf-8', newline='\n')
print('patched to', V)
