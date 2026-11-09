"""v4.9.9.6: saints and relics. The book's further saints (RoP:D p. 91), your own saints and patron (RoP:D pp. 87-89;
DE p. 501), relic powers and the sample relics (RoP:D pp. 44-45; DE p. 419); page and data fixes.
Numbered as a patch at Haik's request. See patches/v4.9.9.6/docs/CHANGES-v4.9.9.6.txt.
"""
import pathlib, shutil, json, zlib, base64, re
ROOT = pathlib.Path(__file__).resolve().parents[1]
P = ROOT / 'src' / 'index.html'
h = P.read_text(encoding='utf-8')

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if n != count:
        raise SystemExit(f'expected {count} of {old[:70]!r}, found {n}')
    h = h.replace(old, new)

if 'id="v4.9.9.6"' in h: raise SystemExit('v4.9.9.6 already applied')
if 'id="v4.9.9.5"' not in h: raise SystemExit('apply v4.9.9.5 first')
OLD_V, B_OLD, V, B = '4.9.9.5', '2026-10-28', '4.9.9.6', '2026-10-28'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# saints: the list grows with the book's further saints and your own; your patron counts as the patron
rep('function saintList(){try{', 'function saintList(){const l=saintList0();try{return window.AMSAINT?AMSAINT.extend(l):l}catch(z){return l}}\nfunction saintList0(){try{')
rep('(Might ${s[1]}; ${H(s[2])} p. ${s[3]})', '(Might ${s[1]}; ${H(s[2])}${s[3]?` p. ${s[3]}`:""})')
rep('m(!x.stPatron,"Not your patron saint",-15);', 'm(!(x.stPatron||window.AMSAINT&&AMSAINT.isPatron(x.stName)),"Not your patron saint",-15);')
rep('a saint’s powers usually cost in all no more than a fifth of its Might (RoP:D p. 89).</p></details>`:""}</div>`;',
    'a saint’s powers usually cost in all no more than a fifth of its Might (RoP:D p. 89).</p></details>`:""}${window.AMSAINT?AMSAINT.panel(S,dm):""}</div>`;')
# relics: Divine Might from the highest Faith; powers; the DE's rules
rep('<td class="n">${10*f}</td>', '<td class="n">${10*Math.max(f,N(r.hf))}</td>')
rep('${btn("rfp-dawn","Sunrise: relics refresh")}', '${window.AMSAINT?AMSAINT.relics(R):""}${btn("rfp-dawn","Sunrise: relics refresh")}')
rep('fail while the bearer acts impiously (RoP:D p. 45).</p>',
    'fail while the bearer acts impiously. A person benefits from one relic at a time; relying on more than one is a sin and loses the benefit of all of them (DE p. 419; RoP:D p. 45).</p>')
# page: tarnishing an aura is RoP:I p. 24 (the influence chart it uses is p. 23)
rep("head:`The aura is tarnished: ${sin} ${v}`,text:`Total ${fmtN(t)} (RoP:I p. 23)", "head:`The aura is tarnished: ${sin} ${v}`,text:`Total ${fmtN(t)} (RoP:I p. 24)")
# Realms gating: a patron or a saint of your own keeps the Saints section
rep('"Saints":["div",()=>gDiv()||rlmSafe(()=>!!XP().stName)]', '"Saints":["div",()=>gDiv()||rlmSafe(()=>!!XP().stName)||rlmSafe(()=>!!(st.sn996.patron||st.sn996.own.length))]')

# bestiary data: Saint Martin's seventh power; a garbled spell name in Grant of Serenity
m = re.search(r'(<script type="application/json" id="am49-data" data-z="1">)(.*?)(</script>)', h, re.S)
if not m: raise SystemExit('am49-data block not found')
d = json.loads(zlib.decompress(base64.b64decode(m.group(2).strip())).decode('utf-8'))
mt = [b for b in d['best'] if b['n'] == 'Saint Martin of Tours']
if len(mt) != 1: raise SystemExit('Saint Martin not found')
if any(p['n'] == 'The Laborer’s Boon' for p in mt[0]['powers']): raise SystemExit('Laborer’s Boon already present')
lb = [p for b in d['best'] if b['n'] == 'Saint Peter, Apostle' for p in b['powers'] if p['n'] == 'The Laborer’s Boon']
if len(lb) != 1: raise SystemExit('Laborer’s Boon source not found')
pw = mt[0]['powers']; k = next((i for i, p in enumerate(pw) if p['n'] == 'Notes'), len(pw)); pw.insert(k, dict(lb[0]))
raw = json.dumps(d, ensure_ascii=False)
bad = 'similar to Enchantment of the Hermetic spell Detachment'
n = raw.count(bad)
if n < 1: raise SystemExit('Grant of Serenity text not found')
d = json.loads(raw.replace(bad, 'similar to the Hermetic spell Enchantment of Detachment'))
print('Grant of Serenity texts fixed:', n)
enc = base64.b64encode(zlib.compress(json.dumps(d, ensure_ascii=False, separators=(',', ':')).encode('utf-8'), 9)).decode()
h = h[:m.start(2)] + enc + h[m.end(2):]

mod = ROOT / 'patches' / 'v4.9.9.6'
js = '!function(){\n"use strict";\n' + (mod / 'saints996.js').read_text(encoding='utf-8') + '\n' + (mod / 'changelog.js').read_text(encoding='utf-8') + '\n}();'
css = (mod / 'saints996.css').read_text(encoding='utf-8')
if '</script' in js.lower() or '</style' in css.lower(): raise SystemExit('module contains a closing tag')
h = h.rstrip('\n') + '\n<style id="v4.9.9.6-css">' + css + '</style>\n<script id="v4.9.9.6">' + js + '</script>\n'
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
