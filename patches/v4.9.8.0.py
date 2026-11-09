"""v4.9.8.0: lighter start-up downloads, smoother animations and page changes, less main-thread work.

See patches/v4.9.8.0/docs/CHANGES-v4.9.8.0.txt for the record.
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

if 'id="v4.9.8.0"' in h:
    raise SystemExit('v4.9.8.0 already applied')
if 'id="v4.9.7.6"' not in h:
    raise SystemExit('apply v4.9.7.6 first')
OLD_V, B_OLD, V, B = '4.9.7.6', '2026-10-27', '4.9.8.0', '2026-10-28'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# network: the site-prefetch script no longer downloads every die at start-up (its Retro-face warm-up stays)
rep(';r(),r()};"complete"===document.readyState?e(t,{timeout:4e3}):addEventListener("load",(()=>e(t,{timeout:4e3})),{once:!0});',
    ';r(),r()};')
# network: the die-face engraver no longer loads every die's picture in idle time (amWarmDie warms the one in use)
rep(',(window.requestIdleCallback||(s=>setTimeout(s,1200)))((()=>{for(const s of DieFace.keys())DieFace.preload(s)}))}()', '}()')
# network: the bestiary and hedge lists are no longer fetched in idle time after load
rep('if(el&&el.dataset.src){const go=()=>(window.requestIdleCallback||(f=>setTimeout(f,300)))(()=>AM49L.load(),{timeout:2500});\n "complete"===document.readyState?go():window.addEventListener("load",go,{once:!0})}\n', '')

# motion: the sound button's overlap check (v4.8.4.0) runs once scrolling settles, not on every scrolled frame
# (5 elementsFromPoint hit tests per frame), and its change watcher waits for 300 ms of quiet instead of
# re-running every 300 ms through an animation
rep('window.amSndCheck=d;window.addEventListener("scroll",d,{passive:!0}),', 'window.amSndCheck=d;let q975=0;window.addEventListener("scroll",(()=>{clearTimeout(q975),q975=setTimeout(d,140)}),{passive:!0}),')
rep('let t=0;const r=()=>{t||(t=setTimeout((()=>{t=0,d()}),300))};new MutationObserver(r)', 'let t=0;const r=()=>{clearTimeout(t),t=setTimeout((()=>{t=0,d()}),300)};new MutationObserver(r)')
# motion: Retro pixel sigils hidden under the menu or a roll stop redrawing until they are uncovered
rep('if(e-p>=33){p=e;for(const[t,n]of o)t.isConnected?!1!==n.vis&&d(n,e):(o.delete(t),i&&i.unobserve(t))}',
    'if(e-p>=33){p=e;const ov=window.amTopLayer?amTopLayer():null;for(const[t,n]of o)t.isConnected?!1!==n.vis&&(!ov||ov.contains(t))&&d(n,e):(o.delete(t),i&&i.unobserve(t))}')

# main thread: the first-run chooser positions its previews after the first layout instead of forcing a layout
# of the half-parsed page (its ResizeObserver already does this once the halves have a size)
rep('(e.innerHTML=`<img alt="" src="${t}">`)}))})))),g()}const b=(e,t)=>{', '(e.innerHTML=`<img alt="" src="${t}">`)}))})))),document.documentElement.hasAttribute("data-booting")?requestAnimationFrame(g):g()}const b=(e,t)=>{')

# main thread: the chooser's palette lookup reads the style sheets once per sheet count, keeping only :root rules,
# instead of walking every rule twice on each redraw
rep('const s={},o=[];let i="";for(const t of document.styleSheets){let a;try{a=t.cssRules}catch(e){continue}if(a)for(const t of a)1===t.type&&(o.push(t),"retro"===e&&\':root[data-skin="retro"] .menu::before\'===t.selectorText&&t.style.background&&(i=t.style.background))}', 'const s={};let o,i="";{const n=document.styleSheets.length,Z=window.__amxRules;if(!Z||Z.n!==n){const r=[];let q="";for(const t of document.styleSheets){let a;try{a=t.cssRules}catch(e){continue}if(a)for(const t of a)1===t.type&&(t.selectorText.startsWith(":root")&&r.push(t),\':root[data-skin="retro"] .menu::before\'===t.selectorText&&t.style.background&&(q=t.style.background))}window.__amxRules={n:n,o:r,i:q}}o=window.__amxRules.o,"retro"===e&&(i=window.__amxRules.i)}')

mod = ROOT / 'patches' / 'v4.9.8.0'
CL = (mod / 'changelog.js').read_text(encoding='utf-8') if (mod / 'changelog.js').exists() else ''
parts = [mod / n for n in ('net.js', 'motion.js', 'main.js') if (mod / n).exists()]
js = '!function(){\n"use strict";\n' + '\n'.join(p.read_text(encoding='utf-8') for p in parts) + '\n' + CL + '\n}();'
css = (mod / 'motion.css').read_text(encoding='utf-8') if (mod / 'motion.css').exists() else ''
if '</script' in js.lower() or '</style' in css.lower():
    raise SystemExit('module contains a closing tag')
h = h.rstrip('\n') + ('\n<style id="v4.9.8.0-css">' + css + '</style>' if css else '') + '\n<script id="v4.9.8.0">' + js + '</script>\n'
P.write_text(h, encoding='utf-8', newline='\n')

D = ROOT / 'src' / 'docs'; M = mod / 'docs'
if (M / f'CHANGES-v{V}.txt').exists():
    shutil.copy(M / f'CHANGES-v{V}.txt', D / f'CHANGES-v{V}.txt')
    old = D / f'PLAYER-CHANGELOG-v{OLD_V}.md'
    pc = old.read_text(encoding='utf-8'); anchor = f'\n## v{OLD_V} — '
    if pc.count(f'through v{OLD_V}') != 2 or pc.count(anchor) != 1:
        raise SystemExit('player changelog layout changed')
    pc = pc.replace(f'through v{OLD_V}', f'through v{V}'); i = pc.index(anchor) + 1
    pc = pc[:i] + (M / 'player-section.md').read_text(encoding='utf-8') + pc[i:]
    (D / f'PLAYER-CHANGELOG-v{V}.md').write_text(pc, encoding='utf-8', newline='\n'); old.unlink()
print('patched to', V)
