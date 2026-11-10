"""v4.9.11.0: the Build sheet's 4.9.10.0 speed work, source chips and button wording carried to Play and the
Storyguide. No rule change; save formats unchanged. See patches/v4.9.11.0/docs/CHANGES-v4.9.11.0.txt.
"""
import pathlib, shutil, re, zlib, base64
ROOT = pathlib.Path(__file__).resolve().parents[1]
P = ROOT / 'src' / 'index.html'
h = P.read_text(encoding='utf-8')

def rep(old, new, count=1, where=None):
    global h
    src = h if where is None else where
    n = src.count(old)
    if n != count:
        raise SystemExit(f'expected {count} of {old[:70]!r}, found {n}')
    if where is None: h = h.replace(old, new)
    return src.replace(old, new)

if 'id="v4.9.11.0"' in h: raise SystemExit('v4.9.11.0 already applied')
if 'id="v4.9.10.0"' not in h: raise SystemExit('apply v4.9.10.0 first')
OLD_V, B_OLD, V, B = '4.9.10.0', '2026-11-09', '4.9.11.0', '2026-11-09'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# --- Play speed -------------------------------------------------------------------------------------------------
# the mode and type switches are written only when they change, so the switch's slide animation (a MutationObserver
# that measures the buttons) no longer forces a layout after every Play redraw
rep('document.body.classList.add("play"),document.querySelectorAll(".seg.mode [data-mode]").forEach((e=>e.setAttribute("aria-pressed",String(e.dataset.mode===MODE)))),document.querySelectorAll(".seg button[data-type]").forEach((e=>e.setAttribute("aria-pressed",String(e.dataset.type===st.type))));',
    'document.body.classList.add("play"),document.querySelectorAll(".seg.mode [data-mode]").forEach((e=>{const v=String(e.dataset.mode===MODE);e.getAttribute("aria-pressed")!==v&&e.setAttribute("aria-pressed",v)})),document.querySelectorAll(".seg button[data-type]").forEach((e=>{const v=String(e.dataset.type===st.type);e.getAttribute("aria-pressed")!==v&&e.setAttribute("aria-pressed",v)}));')
# keyed redraw of the Play page and console (play.js amPlaySet)
rep('$("#work").innerHTML=playSheet(),$("#ledger").innerHTML=playConsole();',
    'window.amPlaySet?amPlaySet(playSheet(),playConsole()):($("#work").innerHTML=playSheet(),$("#ledger").innerHTML=playConsole());')
# the section strip's sticky offsets are measured in the next frame, not mid-redraw
rep('if(o&&(o.scrollTop=s),psecAfter(),"function"==typeof applyListView',
    'if(o&&o!==window.__amCb&&s&&(o.scrollTop=s),window.amPsecSoon?amPsecSoon():psecAfter(),"function"==typeof applyListView')
# the console's scroll position is remembered from its scroll events (play.js), not read back mid-redraw; a console
# the keyed redraw kept needs no restore, so neither step forces a layout before the redraw's own
rep('s=($(".cbody")||{}).scrollTop||0,', 's=(window.__amCb=$(".cbody"))?window.__amCb.__amScroll||0:0,')
# root custom properties are written only when they change (writing one restyles the whole page)
RV = '((k,v)=>{const r=document.documentElement.style;r.getPropertyValue(k)!==v&&r.setProperty(k,v)})'
rep('document.documentElement.style.setProperty("--hdr-h",(t?e.offsetHeight:0)+"px")', RV + '("--hdr-h",(t?e.offsetHeight:0)+"px")')
rep('document.documentElement.style.setProperty("--psec-nav-h",(s?s.offsetHeight:0)+"px")', RV + '("--psec-nav-h",(s?s.offsetHeight:0)+"px")')
rep('document.documentElement.style.setProperty("--f975-top",topOffset()+"px")', RV + '("--f975-top",topOffset()+"px")')
rep('document.documentElement.style.setProperty("--f975-sb",Math.max(0,Math.round(r.bottom))+"px")', RV + '("--f975-sb",Math.max(0,Math.round(r.bottom))+"px")')

# --- Buttons in sentence case (project convention since 4.9.5.2/4.9.7.6; 3.2.0.1 had set Title Case) ------------
rep('mnItem("new","new","New Character",', 'mnItem("new","new","New character",')
rep('mnItem("preview","preview","Preview Character",', 'mnItem("preview","preview","Preview character",')

# --- Storyguide payload ------------------------------------------------------------------------------------------
m = re.search(r'(<script[^>]*data-am-lazy="storyguide"[^>]*>)(.*?)(</script>)', h, re.S)
sg = zlib.decompress(base64.b64decode(m.group(2).strip())).decode('utf-8')
SG = [
 ('W("rename-ok","Save Name"', 'W("rename-ok","Save name"', 1),
 ('W("new-saga","Create Saga"', 'W("new-saga","Create saga"', 1),
 ('W("save-build-json","Save Its .json First"', 'W("save-build-json","Save its .json first"', 1),
 ('W("asset-add","+ Web Address"', 'W("asset-add","+ Web address"', 1),
 ('W("asset-rm","Remove Image"', 'W("asset-rm","Remove image"', 1),
 ('W("imp-clear","Choose Another File"', 'W("imp-clear","Choose another file"', 1),
 ('W("pin-place","+ New Place for This Pin"', 'W("pin-place","+ New place for this pin"', 1),
 ('W("pin-rm","Remove Pin"', 'W("pin-rm","Remove pin"', 1),
 ('W("add","+ New Map"', 'W("add","+ New map"', 2),
 ('W("enc-step","Next Turn ▶"', 'W("enc-step","Next turn ▶"', 1),
 ('W("enc-end","End Encounter"', 'W("enc-end","End encounter"', 1),
 ('W("enc-rollall","Roll Initiative for All"', 'W("enc-rollall","Roll initiative for all"', 1),
 ('W("enc-to-session","Add to the Session Log"', 'W("enc-to-session","Add to the session log"', 1),
 ('W("add","+ New Encounter"', 'W("add","+ New encounter"', 2),
 ('W("go","Manage Templates"', 'W("go","Manage templates"', 1),
 ('W("tpl-pick","From Template…"', 'W("tpl-pick","From template…"', 1),
 ('W("tpl-save","Save as Template"', 'W("tpl-save","Save as template"', 1),
 ('W("tpl-export","Export Templates"', 'W("tpl-export","Export templates"', 1),
 ('W("clear-q","Clear Search"', 'W("clear-q","Clear search"', 1),
 ('W("play-scene-new","+ New Scene"', 'W("play-scene-new","+ New scene"', None),
 ('W("play-scene-edit","Edit Scene"', 'W("play-scene-edit","Edit scene"', None),
 ('W("play-scene-new","+ Create First Scene"', 'W("play-scene-new","+ Create first scene"', 1),
 ('W("arr-add","+ Another Degree"', 'W("arr-add","+ Another degree"', 1),
 ('W("add","+ New Story"', 'W("add","+ New story"', 2),
 ('W("season-step","◀ Previous Season"', 'W("season-step","◀ Previous season"', 1),
 ('W("season-step","Next Season ▶"', 'W("season-step","Next season ▶"', 1),
 ('W("add","+ New Place"', 'W("add","+ New place"', 2),
 ('W("unlink-char","Remove Link"', 'W("unlink-char","Remove link"', 2),
 ('W("add","+ New Person"', 'W("add","+ New person"', 2),
 ('W("best-person","+ Add to People"', 'W("best-person","+ Add to people"', None),
 ('W("arr-add","+ Follow-Up"', 'W("arr-add","+ Follow-up"', 1),
 ('W("closeout","Close Out Session…"', 'W("closeout","Close out session…"', 1),
 ('W("add","+ New Session Log"', 'W("add","+ New session log"', 1),
 ('W("add","+ New Entry"', 'W("add","+ New entry"', None),
 ('W("sel","Links and Tags"', 'W("sel","Links and tags"', None),
 ('W("add","+ House Rule"', 'W("add","+ House rule"', None),
 ('W("go","Go to the Dashboard"', 'W("go","Go to the dashboard"', None),
 ('W("export","Export Saga JSON"', 'W("export","Export saga JSON"', 1),
 ('W("sample","Download a Sample Empty Saga"', 'W("sample","Download a sample empty saga"', 1),
 ('W("add","+ Session Log"', 'W("add","+ Session log"', 2),
 ('W("add","+ Journal Entry"', 'W("add","+ Journal entry"', 1),
 ('W("add","+ Calendar Entry"', 'W("add","+ Calendar entry"', 1),
 ('W("go","Go to Stories"', 'W("go","Go to stories"', 1),
 ('W("go","Open the Saga Calendar"', 'W("go","Open the saga calendar"', None),
 ('W("present-exit","Back to Storyguide View"', 'W("present-exit","Back to Storyguide view"', None),
 ('W("menu","Main Menu"', 'W("menu","Main menu"', None),
 ('Show to Troupe`', 'Show to troupe`', 2),
 ('se("All Maps")', 'se("All maps")', 2), ('se("All Encounters")', 'se("All encounters")', 2),
 ('se("All Stories")', 'se("All stories")', 2), ('se("Saga Calendar")', 'se("Saga calendar")', None),
 ('se("Covenant Places")', 'se("Covenant places")', 2), ('se("All People")', 'se("All people")', 2),
 ('se("Session Logs")', 'se("Session logs")', 2), ('se("Journal Entries")', 'se("Journal entries")', None),
 ('"Delete Map")', '"Delete map")', 1), ('"Delete Encounter")', '"Delete encounter")', 1),
 ('"Delete Story")', '"Delete story")', 1), ('"Delete Entry")', '"Delete entry")', 2),
 ('"Delete Place")', '"Delete place")', 1), ('"Delete Person")', '"Delete person")', 1),
 ('"Delete Log")', '"Delete log")', 1),
 ('${I}Troupe-Visible</button>', '${I}Troupe-visible</button>', 1),
 ('${A}Storyguide Only</button>', '${A}Storyguide only</button>', 1),
 ('${n?"Change Scene":"Choose a Scene"}', '${n?"Change scene":"Choose a scene"}', 1),
 ('Add one in Scenes → Edit Scene.', 'Add one in Scenes → Edit scene.', 1),
 ('["sheet","Covenant Sheet"]', '["sheet","Covenant sheet"]', 1),
 ('["sessions",`Session Logs (${', '["sessions",`Session logs (${', 1),
 ('"Import as a Copy":"Import as a New Saga"', '"Import as a copy":"Import as a new saga"', 1),
 ('title="Main Menu" aria-label="Main Menu"', 'title="Main menu" aria-label="Main menu"', 1),
 ('return to it from Main Menu → Storyguide.', 'return to it from the main menu → Storyguide.', 1),
 ('Return to the saga from Main Menu → Storyguide.', 'Return to the saga from the main menu → Storyguide.', 1),
 ('mnItem("sg-new","new","New Saga",', 'mnItem("sg-new","new","New saga",', 1),
 ('mnItem("sg-import","load","Import Saga JSON",', 'mnItem("sg-import","load","Import saga JSON",', 1),
 # headings that show a record's own name or title keep it as typed (the Title Case pass skips [data-notc])
 ('Q(e(s.title)', 'Q(`<span data-notc>${e(s.title)}</span>`', 6),
 ('Q(e(s.name)', 'Q(`<span data-notc>${e(s.name)}</span>`', 3),
 ('Q(e(t.name||"Covenant")', 'Q(`<span data-notc>${e(t.name||"Covenant")}</span>`', 1),
 ('<h2 tabindex="-1">${e(s.title)}', '<h2 tabindex="-1"><span data-notc>${e(s.title)}</span>', 1),
 ('<h2 tabindex="-1">${e(t.title)}', '<h2 tabindex="-1"><span data-notc>${e(t.title)}</span>', 1),
 ('<h3>${e(a.label||"Pin")}', '<h3><span data-notc>${e(a.label||"Pin")}</span>', 1),
 ('<h4>${e(s.title)}', '<h4><span data-notc>${e(s.title)}</span>', 1),
 ('<h3>${e(n?n.title:"The scene is yours")}', '<h3>${n?`<span data-notc>${e(n.title)}</span>`:"The scene is yours"}', 1),
 # short source chips, as on the Build sheet: the Definitive Edition is "DE"
 ('`${e.src} p. ${e.p}`', '`${"ArM5"===e.src||"ArM5 DE"===e.src?"DE":e.src} p. ${e.p}`', 1),
 ('${e(a.src)} p. ${a.p}', '${e("ArM5"===a.src||"ArM5 DE"===a.src?"DE":a.src)} p. ${a.p}', 1),
 ('${e(s.src)} p. ${s.p}', '${e("ArM5"===s.src||"ArM5 DE"===s.src?"DE":s.src)} p. ${s.p}', 1),
]
for old, new, cnt in SG:
    n = sg.count(old)
    if (cnt is None and n < 1) or (cnt is not None and n != cnt):
        raise SystemExit(f'storyguide: expected {cnt} of {old!r}, found {n}')
    sg = sg.replace(old, new)
# the menu tile for the saga library (mnItem with a dynamic description)
n = len(re.findall(r'mnItem\("sg-library","guide","Saga Library"', sg))
if n != 1: raise SystemExit(f'storyguide: saga library tile found {n}')
sg = sg.replace('mnItem("sg-library","guide","Saga Library"', 'mnItem("sg-library","guide","Saga library"')
enc = base64.b64encode(zlib.compress(sg.encode('utf-8'), 9)).decode('ascii')
h = h[:m.start(2)] + enc + h[m.end(2):]

# --- module ------------------------------------------------------------------------------------------------------
mod = ROOT / 'patches' / 'v4.9.11.0'
parts = ['play.js', 'changelog.js']
js = '!function(){\n"use strict";\n' + '\n'.join((mod / f).read_text(encoding='utf-8') for f in parts if (mod / f).exists()) + '\n}();'
if '</script' in js.lower(): raise SystemExit('module contains a closing tag')
h = h.rstrip('\n') + '\n<script id="v4.9.11.0">' + js + '</script>\n'
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
print('patched to', V)
