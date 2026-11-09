"""v4.9.7.0: Sin and sanctity (minor-level rules block inside 4.9; feature number). STAGED, not yet released.
Applies on top of v4.9.6.3.

Realms of Power: The Infernal
- Sinful Personality Traits: each trait tied to a sin or its opposing virtue (p. 21); Personality Flaws as +3/+6 (p. 22).
- Venial and mortal sins since absolution; redemption (pp. 20-22).
- Confidence through sin: a season of indulgence, or a ritual that also gives an infernal Warping Point (pp. 18, 24).
- Infernal influence: simple die + Presence + Leadership, chart 9-24 -> +1..+6 (p. 23).
- Infernal Warping: effects by Warping Score and their sources (pp. 17-18).
- Infernalists: Hierarchy Score from Infernal Reputation, Vituperation and its aging roll, Sacrifice, Profaning (pp. 94-96).
- Goetic magic: Rego and Vim in place of a Goetic Art and Lore; Goetic Mastery noted; the False Gift (p. 124).
- Corrupted beasts: Greater and Lesser Infernal Power and Horrifying Appearance replace "Infernal Power" (p. 78).
Realms of Power: The Divine
- Tragedy of hubris on a failed holy power, with True Faith x 10 standing in (p. 46).
- Divine Warping notes and the Divine Ascent: Ascension roll, Ascent time, Divine Gloom, Form, Unity (pp. 62-65).
- Saints: invoking and threatening, the miracles and curses list with Penetration (pp. 87-89).
- Relics: Faith Points, Divine Might, scourging, Magic Resistance (pp. 43-46).
- Schism: a rival temper in a Dominion aura (p. 41).
- Golems: awakening, empowering, madness (pp. 142-143).
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

if 'id="v4.9.7.0"' in h:
    raise SystemExit('v4.9.7.0 already applied')
if 'id="v4.9.6.3"' not in h:
    raise SystemExit('apply v4.9.6.3 first')
OLD_V, B_OLD, V, B = '4.9.6.3', '2026-10-27', '4.9.7.0', '2026-10-27'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# Corrupted beasts (RoP:I p. 78): the book's two power Virtues and the Major Flaw
rep('["Infernal Power","V","Mi","Supernatural (corrupted beasts only)",78]',
    '["Greater Infernal Power","V","Ma","Supernatural (corrupted beasts only)",78],["Lesser Infernal Power","V","Mi","Supernatural (corrupted beasts only)",78],["Horrifying Appearance","F","Ma","Supernatural (corrupted beasts only)",78]')
# Faith Points may not be spent on threatening a saint (RoP:D p. 88)
rep('"r49:miracle"!==e.id', '"r49:miracle"!==e.id&&!(window.AM497&&AM497.noFaith(e.id))')
# realm dice for the new rolls
rep('/^r49:(miracle|aid|temper|noto)/', '/^r49:(miracle|aid|temper|noto|ascent|invoke|threat|golem|gempower|gmad)/')
rep('"r49:tarnish"]', '"r49:tarnish","r49:infl","r49:vit"]')


# Optional rules wired into earlier code (Settings › Optional rules; options.js defines window.amOpt)
O = lambda k: f'(window.amOpt?amOpt("{k}"):!0)'
rep('let d=c?s:0,p=`Foreign ${a.realm} aura ${s}${i?" (Faerie Magic: the book is silent on botch dice, so the normal rule is kept)":""}`;',
    'let d=c&&!(i&&!' + O('faeMagicBotch') + ')?s:0,p=`Foreign ${a.realm} aura ${s}${i?d?" (Faerie Magic: the book is silent on botch dice; the normal rule is kept, Settings › Optional rules)":" (Faerie Magic: no botch dice, optional rule)":""}`;')
rep('const o="Faerie"===e.realm||"Infernal"===e.realm,s=o?a:0;', 'const o="Faerie"===e.realm||"Infernal"===e.realm,s=o&&' + O('holyForeignBotch') + '?a:0;')
rep('spent (+3 each)`,v:3*extra,', 'spent (+${window.amOpt&&amOpt("mirHope")&&tfScore()>=3?6:3} each)`,v:(window.amOpt&&amOpt("mirHope")&&tfScore()>=3?6:3)*extra,')
rep('BONUS_OK["Ars Notoria"]=a=>langIsA(a,["latin","greek","hebrew","chaldean","aramaic"]);',
    'BONUS_OK["Ars Notoria"]=a=>langIsA(a,["latin","greek","hebrew","chaldean","aramaic"])||!!(window.amOpt&&amOpt("notoAL")&&"Artes Liberales"===a.n);')
rep('warpingStart(e)+("magus"===e.type?2*num(e.ages.post):0)', 'warpingStart(e)+("magus"===e.type&&' + O('warpDefault') + '?2*num(e.ages.post):0)')
rep('has(e,"Savantism")&&e.savFull){', 'has(e,"Savantism")&&e.savFull&&' + O('savFull') + '){')
rep('<label class="chk"><input type="checkbox" data-sav-full${st.savFull?" checked":""}><span>Optional rule: the favored Ability is bought at full rate (its XP count half against the halved pools)</span></label>',
    '${' + O('savFull') + '?`<label class="chk"><input type="checkbox" data-sav-full${st.savFull?" checked":""}><span>Optional rule: the favored Ability is bought at full rate (its XP count half against the halved pools)</span></label>`:""}')
rep('const rdHolyCast=id=>/^spell:|^spont$|^fastcast$/.test(id)&&holyMagus(st)&&', 'const rdHolyCast=id=>/^spell:|^spont$|^fastcast$/.test(id)&&holyMagus(st)&&' + O('holyDie') + '&&')

mod = ROOT / 'patches' / 'v4.9.7.0'
CL = r'''
/* saved characters: the false "Infernal Power" Virtue is the book's Lesser Infernal Power (same size) */
{const M=migrate;migrate=function(){const e=M.apply(this,arguments);try{(e.vf||[]).forEach(v=>{v&&"V"===v.kind&&"Infernal Power"===v.n&&(v.n="Lesser Infernal Power")})}catch(z){console.error(z)}return e}}
const CLG=window.CHANGELOG&&window.CHANGELOG[0];
CLG&&CLG.items.unshift(["4.9.7.0","Sin and sanctity",[
 "Realms tab, for every character: Personality Traits can each be tied to one of the seven sins or its opposing virtue (Realms of Power: The Infernal p. 21); a count of venial and mortal sins since absolution; Confidence through sin, by a season of indulgence or a ritual that also gives an infernal Warping Point (p. 24); infernal influence (p. 23); Warping effects by realm (The Infernal pp. 17–18, The Divine p. 62); invoking and threatening saints, with the saints’ miracles and curses and their Penetration (The Divine pp. 87–89); relics with Faith Points, Divine Might and Magic Resistance (pp. 43–45).",
 "Infernalists: Hierarchy Score from Infernal Reputation, Vituperation and its aging roll, sacrifice for maleficia, profaning holy things into vis, Goetic magic for magi, and the False Gift (The Infernal pp. 94–96, 124).",
 "Holy characters: the Divine Ascent, with the Ascension roll, its length, and the Divine Gloom, Form and Unity (The Divine pp. 63–65); a failed holy power now says which tragedy of hubris it risks, with True Faith × 10 standing in for the total (p. 46); a rival temper in a Dominion aura gives schism (p. 41); kabbalists can awaken, empower and keep a golem (pp. 142–143).",
 "Settings › Optional rules, in two lists: Sub rules (the books’ optional rules and the author’s rulings) and Homebrew rules (readings where the books are silent). Each starts on the Definitive Edition, then the author’s ruling, then the recommended reading, and can be switched in this browser: the saint’s secret die, Savantism’s full-rate option, holy magi’s Divine die, Faerie Magic and holy magic botch dice in foreign auras, assumed Warping Points, Hope on miracles, the Ars Notoria pool, Ascension’s Characteristic, relic Magic Resistance, Goetic magic and sacrifice.",
 "The Realms tab now shows for every character while any Realms of Power book is switched on in Build’s sources, and its sections follow their books.",
 "Corrupted beasts take the book’s Greater and Lesser Infernal Power and Horrifying Appearance (The Infernal p. 78); a saved “Infernal Power” Virtue becomes Lesser Infernal Power. The new rolls use the realm dice."]]);
'''
js = ('!function(){\n"use strict";\n' + (mod / 'options.js').read_text(encoding='utf-8') + '\n' + (mod / 'sanctity.js').read_text(encoding='utf-8') + CL + '\n}();')
if '</script' in js.lower():
    raise SystemExit('module contains </script')
h = h.rstrip('\n') + '\n<script id="v4.9.7.0">' + js + '</script>\n'
P.write_text(h, encoding='utf-8', newline='\n')

# release docs
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
