"""v4.9.10.0: Build sheet redesign (boxes for lists, lines for fields; rows instead of forms; short source chips),
speed (typing, adding rows, switches), reorganized Condition, Calculator and ledger rings.
See patches/v4.9.10.0/docs/CHANGES-v4.9.10.0.txt.
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

if 'id="v4.9.10.0"' in h: raise SystemExit('v4.9.10.0 already applied')
if 'id="v4.9.9.9"' not in h: raise SystemExit('apply v4.9.9.9 first')
OLD_V, B_OLD, V, B = '4.9.9.9', '2026-10-29', '4.9.10.0', '2026-11-09'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# speed: a keystroke no longer recalculates the whole sheet on the spot (perf.js schedules it)
rep('st.example&&!a.dataset.k.startsWith("calc.")&&(st.example=!1,renderBanner()),refresh())}))',
    'st.example&&!a.dataset.k.startsWith("calc.")&&(st.example=!1,renderBanner()),window.amRefreshSoon?amRefreshSoon(a):refresh())}))')
# speed: the sound-button placement waits for its debounced check instead of forcing a layout inside every redraw
rep('try{s99();s99later()}catch(z){}', 'try{s99later()}catch(z){}')
# ...and decides header or File menu from the 640 px breakpoint that hides the header tools, not from layout
rep('const host=slot&&slot.offsetParent?slot:fm||null;', 'const host=slot&&!matchMedia("(width<=640px)").matches?slot:fm||null;')

# speed: a whole-sheet redraw keeps every section whose markup has not changed (perf.js amWorkSet), so adding a
# trait rebuilds and lays out one section, not fourteen
rep('$("#work").innerHTML=sConcept()+sHouse()+sVF()+sChars()+sAbil()+sArts()+sSpells()+sLab()+sFamiliar()+sCombat()+sInventory()+sPersona()+sBio()+sCalc()',
    '(window.amWorkSet?amWorkSet([sConcept(),sHouse(),sVF(),sChars(),sAbil(),sArts(),sSpells(),sLab(),sFamiliar(),sCombat(),sInventory(),sPersona(),sBio(),sCalc()]):$("#work").innerHTML=sConcept()+sHouse()+sVF()+sChars()+sAbil()+sArts()+sSpells()+sLab()+sFamiliar()+sCombat()+sInventory()+sPersona()+sBio()+sCalc())')
# 4.9.7.6 grouping moves sections only when their order or groups changed
rep(' w.querySelectorAll(":scope > .f976-gdiv").forEach(e=>e.remove());\n', '\n')
rep('by.forEach((L,gi)=>L.sort((a,b)=>{const x=G976[gi][1].indexOf(a.id),y=G976[gi][1].indexOf(b.id);return(x<0?99:x)-(y<0?99:y)}));',
    'by.forEach((L,gi)=>L.sort((a,b)=>{const x=G976[gi][1].indexOf(a.id),y=G976[gi][1].indexOf(b.id);return(x<0?99:x)-(y<0?99:y)}));'
    '{const seq=[];by.forEach((L,gi)=>{if(L.length){seq.push("g"+gi);L.forEach(s=>seq.push(s))}});const cur=[...w.children].filter(e=>e.matches("section.folio,p.f976-gdiv")).map(e=>"P"===e.tagName?"g"+e.dataset.f976g:e);'
    'if(seq.length===cur.length&&seq.every((x,i)=>x===cur[i])){let n=0;SEALS={};seq.forEach(s=>{if("string"==typeof s||s.hidden)return;const r=toRoman(++n);SEALS[s.id]=r;const z=s.querySelector(":scope > header .seal");z&&z.textContent!==r&&(z.textContent=r)});fixRail();return}'
    'w.querySelectorAll(":scope > .f976-gdiv").forEach(e=>e.remove())}')

mod = ROOT / 'patches' / 'v4.9.10.0'
parts = ['perf.js', 'sheet.js', 'changelog.js']
js = '!function(){\n"use strict";\n' + '\n'.join((mod / f).read_text(encoding='utf-8') for f in parts if (mod / f).exists()) + '\n}();'
css = (mod / 'sheet.css').read_text(encoding='utf-8')
if '</script' in js.lower() or '</style' in css.lower(): raise SystemExit('module contains a closing tag')
h = h.rstrip('\n') + '\n<style id="v4.9.10.0-css">' + css + '</style>\n<script id="v4.9.10.0">' + js + '</script>\n'
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
