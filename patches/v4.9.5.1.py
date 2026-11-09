"""v4.9.5.1: no flash of the Build workspace or the main menu while the page loads.
The page is one large document; the browser paints while it is still being read, so the Build
markup (near the top) showed first, then the menu (made by a script about 2.7 MB in), then the
first-run style chooser (about 3.5 MB in). The page now stays on its themed background until
every script has run (DOMContentLoaded), then shows the finished screen at once."""
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

if 'id="v4.9.5.1"' in h:
    raise SystemExit('v4.9.5.1 already applied')
OLD_V, B_OLD, V, B = '4.9.5.0', '2026-10-26', '4.9.5.1', '2026-10-26'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# 1. The first theme script marks the page as booting and clears the mark once parsing is done.
rep('document.documentElement.setAttribute("data-theme",t),document.documentElement.style.colorScheme=t}();</script>',
    'var d=document.documentElement;d.setAttribute("data-theme",t),d.style.colorScheme=t,d.setAttribute("data-booting","");'
    'var r=function(){d.removeAttribute("data-booting")};document.addEventListener("DOMContentLoaded",r),setTimeout(r,15e3)}();</script>')

# 2. While booting: the themed background and a quiet "Loading" line; the app is laid out but not shown.
#    opacity (not visibility) keeps elements focusable, so the chooser and menu keep their focus.
BOOT = ('<style id="am-boot">html[data-booting]{background:#0d1016;color:#8d929c}'
        'html[data-booting][data-theme=light]{background:#eceee9;color:#5d6158}'
        'html[data-booting][data-skin=retro]{background:#17130f;color:#a8987c}'
        'html[data-booting][data-skin=retro][data-theme=light]{background:#b6a077;color:#3b2f1f}'
        'html[data-booting] body{background:transparent}'
        'html[data-booting] body>:not(#am-load-err){opacity:0!important;pointer-events:none!important;transition:none!important}'
        'html[data-booting]::after{content:"Loading";position:fixed;inset:0;display:grid;place-items:center;'
        'font:15px/1 system-ui,sans-serif;letter-spacing:.08em;pointer-events:none}'
        '@media (prefers-reduced-motion:no-preference){html[data-booting]::after{animation:am-boot-in .3s .4s both}}'
        '@keyframes am-boot-in{from{opacity:0}}</style>')
rep('</script><title>Ars Machina — Scribe and Cast</title>', '</script>' + BOOT + '<title>Ars Machina — Scribe and Cast</title>')

CL = '''window.CHANGELOG&&window.CHANGELOG[0]&&window.CHANGELOG[0].items.unshift(["4.9.5.1","Clean start-up",["Opening the site no longer flashes the Build workspace, then the main menu, before the first-visit style chooser (or before the menu on later visits). The page waits on its own background colour until it has finished loading, then shows the right screen at once."]]);'''
h = h.rstrip('\n') + '\n<script id="v4.9.5.1">' + CL + '</script>\n'
P.write_text(h, encoding='utf-8', newline='\n')
print('patched to', V)
