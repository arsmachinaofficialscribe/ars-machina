"""v4.9.9.7: Play screen tidy. Realms tool picker in place of Show all tools; the Situation bar as one strip;
section descriptions behind the info button on every Play tab; the fight kept with the sheet across a reload.
Numbered as a patch at Haik's request. See patches/v4.9.9.7/docs/CHANGES-v4.9.9.7.txt.
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

if 'id="v4.9.9.7"' in h: raise SystemExit('v4.9.9.7 already applied')
if 'id="v4.9.9.6"' not in h: raise SystemExit('apply v4.9.9.6 first')
OLD_V, B_OLD, V, B = '4.9.9.6', '2026-10-28', '4.9.9.7', '2026-10-28'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# Realms: each tool can be shown or hidden; the sheet's suggestion is the default
rep('const x=XP(),all=!!x.rlmAll,{pre,chunks}=rlmSplit(base),vis=chunks.filter(k=>all||k.on),hid=chunks.length-chunks.filter(k=>k.on).length;',
    'const x=XP(),all=!!x.rlmAll,{pre,chunks}=rlmSplit(base),ov=x.rlmOn&&"object"==typeof x.rlmOn?x.rlmOn:{},shown=k=>Object.prototype.hasOwnProperty.call(ov,k.t)?!!ov[k.t]:all||k.on,vis=chunks.filter(shown),hid=chunks.length-vis.length;')
rep('<label class="chk rlm-all"><input type="checkbox" data-rlm-all${all?" checked":""}>Show all tools${hid&&!all?` (${hid} hidden)`:""}</label></div>`;',
    '${chunks.length?`<details class="rlm-pick"${window.AMR97&&AMR97.pickOpen()?" open":""}><summary>Tools shown: ${vis.length} of ${chunks.length}</summary><div class="rlm-pick-b">${RLM_G.map(([g,l])=>{const c=chunks.filter(k=>k.g===g);return c.length?`<fieldset><legend>${l}</legend>${c.map(k=>`<label class="chk"><input type="checkbox" data-rlm-on="${esc(k.t)}"${shown(k)?" checked":""}>${esc(k.t)}${k.on?"":` <small class="note">not on the sheet</small>`}</label>`).join("")}</fieldset>`:""}).join("")}<div class="rlm-pick-a"><button type="button" class="btn small" data-rlm-set="all">Show all</button><button type="button" class="btn small" data-rlm-set="sheet">Only what the sheet uses</button></div></div></details>`:""}</div>`;')
rep('or a realm’s aura set under Modifiers. Show all tools lists every one.</p>`;', 'or a realm’s aura set under Situation. Tools shown lets you pick any of them.</p>`;')

# Situation: one strip; its note becomes the label's tooltip
rep('<span class="sx-l">Situation</span>', '<span class="sx-l" title="Fatigue and wounds apply on their own">Situation</span>')
rep('\\n      <span class="sx-note">Fatigue and wounds apply on their own</span></div>', '</div>')

# the fight stays with the sheet: restored on load and on switching sheets, saved on each change
rep('const l=renderPlay;renderPlay=function(){r&&r!==st&&(e.on=!1,e.round=1)',
    'const l=renderPlay;renderPlay=function(){r!==st&&(()=>{const f=P().fight||{};e.on=!0===f.on,e.round=Math.max(1,Math.min(999,Math.floor(+f.round)||1))})()')
rep('"prev"===t&&(e.round=Math.max(1,e.round-1)),renderPlay()', '"prev"===t&&(e.round=Math.max(1,e.round-1)),P().fight={on:e.on,round:e.round},persist(),renderPlay()')

# Legend checked against the Definitive Edition, Grogs and Lords of Men: page and wording fixes
L = [
 ('"7 points. +1 costs 1, +2 costs 3, +3 costs 6; –1, –2, –3 give back 1, 3, 6","p. 47"]', '"7 points. +1 costs 1, +2 costs 3, +3 costs 6; –1, –2, –3 give back 1, 3, 6","p. 48"]'),
 ('2 = 15, 3 = 30, 4 = 50, 5 = 75","p. 48"]', '2 = 15, 3 = 30, 4 = 50, 5 = 75","p. 49"]'),
 ('5 = 15, 10 = 55, 15 = 120","p. 48"]', '5 = 15, 10 = 55, 15 = 120","p. 49"]'),
 ('Academic, Arcane, Martial and Supernatural need a Virtue","p. 48"]', 'Academic, Arcane, Martial and Supernatural need a Virtue","p. 49"]'),
 ('"240 XP for Arts or Abilities, plus 120 levels of spells","p. 50"]', '"240 XP for Arts or Abilities, plus 120 levels of spells","p. 49"]'),
 ('["Affinity","XP put into that Ability or Art at creation × 1½ (Art rounded up); Study Totals likewise","p. 72"]', '["Affinity","XP put into that Ability or Art at creation × 1½, rounded up; Advancement Totals likewise","p. 69"]'),
 ('["Confidence","+3 per point spent, up to your Confidence Score, after the roll","p. 28"]', '["Confidence","+3 per point spent, up to your Confidence Score, after the roll","p. 29"]'),
 ('(asterisked Abilities not at all); 1 XP removes this","p. 157"]', '(asterisked Abilities not at all)","p. 157"]'),
 ('"(Casting Score + stress die) ÷ 2","p. 213"]', '"(Casting Score + stress die) ÷ 2","p. 214"]'),
 ('"Casting Score ÷ 5, no die","p. 213"]', '"Casting Score ÷ 5, no die","p. 214"]'),
 ('"Add Artes Liberales + Philosophiae to the Casting Score","p. 215"]', '"Add Artes Liberales + Philosophiae to the Casting Score","pp. 217–218"]'),
 ('+2 Casting Score and +1 botch die per pawn","p. 215"]', '+2 Casting Score and +1 botch die per pawn","p. 216"]'),
 ('"Speed: Quickness + Finesse + stress die; –10 to Casting Score; +2 botch dice","p. 217"]', '"Spontaneous spells only. Speed: Quickness + Finesse + stress die; –10 to Casting Score; +2 botch dice","p. 217"]'),
 ('"Mastery score adds to the Casting Score and subtracts from botch dice","p. 223"]', '"Mastery score adds to the Casting Score and subtracts from botch dice","p. 225"]'),
 ('["Targeting","–1 for every separate target, including the first","p. 227"]', '["Multiple Casting (mastery)","Aiming –1 for every separate target, including the first","p. 226"]'),
 ('["Lab Total","Technique + Form + Intelligence + Magic Theory + aura modifier","p. 250"]', '["Lab Total","Technique + Form + Intelligence + Magic Theory + aura modifier","p. 249"]'),
 ('"Risk +1 per 5 Magic Theory (max +3),', '"Risk +1 per 5 points or fraction of Magic Theory (max +3),'),
 ('"Each Art under 5 gives the apprentice a Deficiency;', '"Each of the master’s Arts under 5 gives the apprentice a Deficiency;'),
 ('written at Communication + Language points a season","p. 379"]', 'written at Communication + Language points a season","pp. 379–380"]'),
 ('["Damage","Strength + weapon Damage + Attack Advantage","p. 393"],["Soak","Stamina + armor Protection","p. 393"]', '["Damage","Strength + weapon Damage + Attack Advantage","p. 394"],["Soak","Stamina + armor Protection (+ Form Bonus, for magi)","p. 394"]'),
 ('["Magic Resistance (creature)","Might Score","p. 552"]', '["Magic Resistance (creature)","Might Score + aura modifier","p. 412"]'),
 ('Personality and Reputation (p. 28)', 'Personality and Reputation (pp. 28–29)'),
 ('roll no botch dice when relaxed (pp. 213, 223). Each zero on the botch dice gives a Warping Point (p. 227).', 'roll no botch dice when relaxed (pp. 213–214, 225). Each zero on the botch dice gives a Warping Point (p. 228).'),
 ('roll one extra botch die per point of the aura’s rating (p. 411).', 'roll one extra botch die per point of the aura’s rating; Divine powers take no penalty and no extra botch dice in other realms’ auras (p. 411).'),
 ('${CONC_TABLE.concat(CONC_CONT).map((e=>`<tr><td>${e[0]}</td><td>${e[1]}</td></tr>`)).join("")}', '${CONC_TABLE.concat(CONC_CONT).map((e=>`<tr><td>${e[0]}</td><td>${e[1]}${"Maintaining another spell"===e[0]?", +3 for each spell beyond the second":""}</td></tr>`)).join("")}'),
 ('<tr><td>Injured</td><td>3 × wound penalty</td></tr>', '<tr><td>Injured</td><td>3 × wound penalty, instead of the normal penalty</td></tr>'),
 ('Grogs: aging the easy way (p. 65)', 'Grogs: aging the easy way (Grogs p. 65)'),
 ('crisis${EASY_AGING[e][t][1]>1?"es":""}', '${EASY_AGING[e][t][1]>1?"crises":"crisis"}'),
 ('["Disarm","Any","Defense or Evasion",9]', '["Disarm","Any","Defense",9]'),
 ('Against a spell I have mastered with Magic Resistance: doubled (p. 227)', 'Against a spell I have mastered with Magic Resistance: doubled (p. 225)'),
]
for a, b in L: rep(a, b)

mod = ROOT / 'patches' / 'v4.9.9.7'
js = '!function(){\n"use strict";\n' + (mod / 'play997.js').read_text(encoding='utf-8') + '\n' + (mod / 'changelog.js').read_text(encoding='utf-8') + '\n}();'
css = (mod / 'play997.css').read_text(encoding='utf-8')
if '</script' in js.lower() or '</style' in css.lower(): raise SystemExit('module contains a closing tag')
h = h.rstrip('\n') + '\n<style id="v4.9.9.7-css">' + css + '</style>\n<script id="v4.9.9.7">' + js + '</script>\n'
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
