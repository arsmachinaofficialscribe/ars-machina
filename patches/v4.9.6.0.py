"""v4.9.6.0: Divine, Infernal and Faerie dice (holy magi and True Faith on the Divine die); training packages
and Savantism (Grogs pp. 66-73, 84; DE p. 143); Feral and Covenant Upbringing childhoods (DE pp. 124, 129);
start-up optimisations. Needs tools/dice/manifest.json from tools/dice/pack_dice.py."""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
P = ROOT / 'src' / 'index.html'
h = P.read_text(encoding='utf-8')

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if n != count:
        raise SystemExit(f'expected {count} of {old[:70]!r}, found {n}')
    h = h.replace(old, new)

if 'id="v4.9.6.0"' in h:
    raise SystemExit('v4.9.6.0 already applied')
OLD_V, B_OLD, V, B = '4.9.5.3', '2026-10-27', '4.9.6.0', '2026-10-27'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# 2. Landing sounds and roll particles for the new dice.
rep('Object.assign(O,{chInt:{f:200', 'Object.assign(O,{div:{f:205,to:140,r:1.05,rp:1.15,bell:[1318,.03]},inf:{f:118,to:78,r:1.15,rp:1.25,g:.35,d:.08},fae:{f:232,to:160,r:1,rp:1.2,ring:[2349,[1,2.01],.025,.5]}}),Object.assign(O,{chInt:{f:200')
rep('herm:["#f2c443","#fff1b8","spark","radial"]}', 'herm:["#f2c443","#fff1b8","spark","radial"],div:["#f6e6b0","#ffffff","spark","radial"],inf:["#b3121e","#e0283a","spark","shimmer"],fae:["#9fe0d0","#e8d4ff","leaf","swirl"]}')
rep('herm:["#8a2a1e","#c4493a","shard"]}', 'herm:["#8a2a1e","#c4493a","shard"],div:["#8a6a2a","#e8d090","shard"],inf:["#3a1008","#c03a1a","smoke"],fae:["#3a5a6a","#a8d8d0","leaf"]}')

# 3. Start-up: the name key used to reconcile Virtue lists skips Unicode work for plain-ASCII names (identical keys)
#    and caches; the list sorts compute each key once and compare with the same "en" collation.
rep('{const e=e=>String(e).normalize("NFKD").replace(/[\\u0300-\\u036f]/g,"").replace(/[\\u2019\\u2018]/g,"\'").replace(/^(?:the|a|an)\\s+/i,"").replace(/[^a-z0-9]/gi,"").toLowerCase(),a={};',
    '{const K=new Map,e=e=>{e=String(e);let s=K.get(e);if(void 0!==s)return s;s=/[^\\x00-\\x7f]/.test(e)?e.normalize("NFKD").replace(/[\\u0300-\\u036f]/g,"").replace(/[\\u2019\\u2018]/g,"\'"):e;s=s.replace(/^(?:the|a|an)\\s+/i,"").replace(/[^a-z0-9]/gi,"").toLowerCase();K.set(e,s);return s},a={};')
rep('{const e=e=>String(e).replace(/^[^\\p{L}\\p{N}]+/u,"").replace(/^(?:the|a|an)\\s+/i,"").toLocaleLowerCase("en"),a=(a,i)=>e(a[0]).localeCompare(e(i[0]),"en");SVF.sort(a),"undefined"!=typeof SABIL&&SABIL.sort(a),"undefined"!=typeof SSPELLS&&SSPELLS.sort(((a,i)=>e(a.n).localeCompare(e(i.n),"en"))),SPELLS.sort(((a,i)=>e(a.n).localeCompare(e(i.n),"en")))}',
    '{const C=new Intl.Collator("en"),K=new Map,e=e=>{let s=K.get(e);return void 0===s&&(s=String(e).replace(/^[^\\p{L}\\p{N}]+/u,"").replace(/^(?:the|a|an)\\s+/i,"").toLocaleLowerCase("en"),K.set(e,s)),s},a=(a,i)=>C.compare(e(a[0]),e(i[0]));SVF.sort(a),"undefined"!=typeof SABIL&&SABIL.sort(a),"undefined"!=typeof SSPELLS&&SSPELLS.sort(((a,i)=>C.compare(e(a.n),e(i.n)))),SPELLS.sort(((a,i)=>C.compare(e(a.n),e(i.n))))}')
#    The header switches measure themselves on the next frame instead of forcing a layout mid-parse.
rep('t.prepend(e),t.classList.add("seg-slide")}e(t,!0),t._segObs||', 't.prepend(e),t.classList.add("seg-slide")}requestAnimationFrame((()=>e(t,!0))),t._segObs||')

# 4. The readable module: rules (packages, Savantism, childhoods) and the realm dice.
man = json.loads((ROOT / 'tools' / 'dice' / 'manifest.json').read_text())
dice = {k: {x: man[k][x] for x in ('h', 't', 'p', 'pt', 'rp', 'rp10', 'rc', 'rc10', 'c', 'pc', 'ink', 'shade')} for k in ('div', 'inf', 'fae')}
mod = (ROOT / 'patches' / 'v4.9.6.0')
js = ('!function(){\n"use strict";\nconst N=v=>num(v),H=v=>esc(String(v==null?"":v));\n'
      + (mod / 'rules.js').read_text(encoding='utf-8')
      + '\nwindow.AM496={savFav,savTarget:(e,r)=>{if(!r||!r.startsWith("ab:"))return false;const a=e.abil.find(x=>abilLabel(x)===r.slice(3));return!!a&&savFav(e,a)}};\n'
      + (mod / 'dice.js').read_text(encoding='utf-8').replace('__DICE__', json.dumps(dice, separators=(',', ':')))
      + '\n' + (mod / 'fx.js').read_text(encoding='utf-8')
      + '\n' + (mod / 'changelog.js').read_text(encoding='utf-8') + '\n}();')
if '</script' in js.lower():
    raise SystemExit('module contains </script')
h = h.rstrip('\n') + '\n<script id="v4.9.6.0">' + js + '</script>\n'
P.write_text(h, encoding='utf-8', newline='\n')
print('patched to', V)
