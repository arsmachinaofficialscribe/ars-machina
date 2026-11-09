"""v4.9.6.3: Realms data fixes (patch; no rule change). STAGED, not yet released.

1. Two Flaws misread from the Definitive Edition's two-line headings (a v2.0.0 scan fault):
   - "Infernal Power" (Minor Hermetic Flaw, DE p. 146, "also RoP:I p. 78") is the DE's Susceptibility to Infernal
     Power. The false entry is removed; Susceptibility to Infernal Power takes its DE page (146, was 117, an old
     corebook page). Its promotion had also hidden RoP:I's corrupted-beast Virtue of the same name (4.9.7.0
     replaces that Virtue with the book's Greater and Lesser Infernal Power).
   - "Aura for (Ability)" (DE p. 138) is the second line of Necessary (Realm) Aura for (Ability). The false entry is
     removed; Necessary (Realm) Aura for (Ability) is promoted to the core list at DE p. 138 (also Grogs p. 82). Its
     -3 toggle was already wired under the full name; the duplicate effect under the short name is removed.
   Saved characters carrying either false name are renamed on load.
2. Bestiary pages: Nasir, the Helper and Samuil, Angelic Guide are RoP:D p. 33 (were p. 5).
3. Bestiary powers: paragraphs that held several powers (or a list of power names) are split into one power each,
   and powers that had swallowed the next power's line are split. Power names given as a list are filled in from the
   power catalogue when the catalogue holds that power. Text that is not a power line is kept as a "Notes" entry.
4. The power catalogue: Dysenteric Infliction (RoP:D p. 89) and Dozens of Eyes / Venomous Bite were inside other
   powers' text; split out. Fatal Menses (RoP:F p. 67) added to Lamashtu.
"""
import base64, json, pathlib, re, sys, zlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
P = ROOT / 'src' / 'index.html'
sys.path.insert(0, str(ROOT / 'patches' / 'v4.9.6.3'))
from split_powers import split, split_colon, split_loose, split_names, name_key  # noqa: E402

h = P.read_text(encoding='utf-8')

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if n != count:
        raise SystemExit(f'expected {count} of {old[:70]!r}, found {n}')
    h = h.replace(old, new)

if 'id="v4.9.6.3"' in h:
    raise SystemExit('v4.9.6.3 already applied')
OLD_V, B_OLD, V, B = '4.9.6.2', '2026-10-27', '4.9.6.3', '2026-10-27'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# ---------------------------------------------------------------- 1. Virtue and Flaw lists
rep('["Infernal Power","F","Mi","Hermetic",146,"RoP:I p. 78"],', '["Necessary (Realm) Aura for (Ability)","F","Mi","Supernatural",138,"Grogs p. 82"],')
rep('["Aura for (Ability)","F","Mi","Supernatural",138]', '["Susceptibility to Infernal Power","F","Mi","Hermetic",146]')
rep('{n:"Infernal Power",kind:"F",src:"ArM5",page:146,effects:[{on:"all",mod:-1,botch:0,auto:!1,cond:"made ill by an Infernal aura (Stamina roll against the aura failed)",quote:"Whenever you enter an area of Infernal influence, you must make a Stamina roll equal to or greater than the aura rating or become ill (–1 on all rolls)."}]},', '')
rep('{n:"Aura for (Ability)",kind:"F",src:"ArM5",page:138,effects:[{on:"ability:(chosen)",mod:-3,botch:0,auto:!1,cond:"outside the aura the Ability depends on",quote:"The character has a –3 penalty to any totals he generates with a particular Ability when not in the right aura."}]},', '')
rep('{n:"Susceptibility to Infernal Power",kind:"F",page:59,', '{n:"Susceptibility to Infernal Power",kind:"F",page:146,')

# the Legend's aura note: half an aura rounds down where no rounding is stated (DE p. 6), as the code has since 4.8.5.0
rep('The book does not say how to round ½ aura, so it is shown unrounded.', 'Half an aura rounds down where the book gives no rounding (DE p. 6).')

# ---------------------------------------------------------------- 2-4. bestiary data
TAG = '<script type="application/json" id="am49-data" data-z="1">'
s = h.index(TAG) + len(TAG); e = h.index('</script>', s)
J = json.loads(zlib.decompress(base64.b64decode(h[s:e].strip())).decode('utf-8'))
stats = {'pages': 0, 'blob_split': 0, 'blob_names': 0, 'blob_kept': 0, 'merged': 0, 'catalog': 0, 'added': 0}

for x in J['best']:
    if x.get('src') == 'RoP:D' and x.get('p') == 5 and x['n'] in ('Nasir, the Helper', 'Samuil, Angelic Guide'):
        x['p'] = 33; stats['pages'] += 1

REALM_B = {'RoP:D': 'D', 'RoP:I': 'I', 'RoP:F': 'F', 'RoP:M': 'M'}
B_REALM = {v: k for k, v in REALM_B.items()}
CAT = {}   # name key -> [(book, power)]; the catalogue's powers carry their RoP book, a being's powers its own book
for p in J['powers']:
    CAT.setdefault(name_key(p['n']), []).append((B_REALM.get(p.get('b')), p))
for x in J['best']:
    for p in x.get('powers') or []:
        if isinstance(p, dict) and p.get('n') and p['n'] != 'Powers' and p.get('x'):
            CAT.setdefault(name_key(p['n']), []).append((x.get('src'), p))
known = lambda n: name_key(n) in CAT
BAD_NAME = re.compile(r'\d|\bpoints?\b|^See |\bBase\b| The |^(?:Notes?|Powers)$')

def entry(p):
    return {k: p.get(k, '') for k in ('n', 'c', 'i', 'f', 'x', 's')}

def parse(t):
    for f in (split, split_colon, split_loose):
        r = f(t)
        if r and r[1] and not any(BAD_NAME.search(q['n']) for q in r[1]):
            return r
    return None

def from_cat(name, src):
    """The power as printed in the same book; a same-named power from another book is not borrowed."""
    hit = next((p for b, p in CAT.get(name_key(name), []) if b == src), None)
    # saints in other books name the saints' miracles and curses of RoP:D pp. 88-89, the shared list
    hit = hit or next((p for b, p in CAT.get(name_key(name), []) if b == 'RoP:D' and p.get('p') in (88, 89)), None)
    if hit:
        return entry(dict(hit, n=name))
    return {'n': name, 'c': '', 'i': '', 'f': '', 'x': 'Not described in this stat block; see the book’s list of powers.', 's': ''}

for x in J['best']:
    ps = x.get('powers') or []
    if len(ps) == 1 and isinstance(ps[0], dict) and ps[0].get('n') == 'Powers':
        t = ps[0].get('x') or ''
        r = parse(t)
        if r:
            out = ([{'n': 'Notes', 'c': '', 'i': '', 'f': '', 'x': r[0], 's': ''}] if r[0] else []) + r[1]
            x['powers'] = out; stats['blob_split'] += 1; continue
        n = split_names(t, known)
        if n and n[1]:
            out = [from_cat(name, x.get('src')) for name in n[1]]
            n[0] and out.append({'n': 'Notes', 'c': '', 'i': '', 'f': '', 'x': n[0], 's': ''})
            x['powers'] = out; stats['blob_names'] += 1; continue
        stats['blob_kept'] += 1
        continue
    new = []
    for p in ps:
        if not isinstance(p, dict) or not p.get('x'):
            new.append(p); continue
        r = parse(p['x'])
        if r and r[1]:
            new.append(dict(p, x=r[0])); new.extend(r[1]); stats['merged'] += 1
        else:
            new.append(p)
    x['powers'] = new

cat_new = []
for p in J['powers']:
    r = parse(p.get('x') or '')
    if r and r[1]:
        cat_new.append(dict(p, x=r[0]))
        for q in r[1]:
            cat_new.append(dict(p, n=q['n'], c=q['c'], i=q['i'], f=q['f'], x=q['x'], s='', r='', d='', t=''))
        stats['catalog'] += 1
    else:
        cat_new.append(p)
J['powers'] = cat_new

lam = [x for x in J['best'] if x['n'] == 'Lamashtu' and x.get('src') == 'RoP:F']
if len(lam) != 1:
    raise SystemExit('Lamashtu not found once')
if not any(p.get('n') == 'Fatal Menses' for p in lam[0]['powers']):
    lam[0]['powers'].append({'n': 'Fatal Menses', 'c': '0', 'i': 'constant', 'f': 'Herbam (Animal, Corpus)', 's': 'A poison drips continually from Lamashtu.',
        'x': '(5 intricacy points on cost) A poison, like that of scorpions, drips continually from Lamashtu, making a fine mist as she flies. '
             'She poisons wells as she flies over them, so that all who drink of them for the next week fall terribly ill; her venom can kill the infirm, '
             'or fetuses in utero, and crops and animals die as she flies over them, if she wishes. Treated as a level 50 effect based on Treading the '
             'Ashen Path (PeHe 30, +10 requisites for humans and animals, +10 Sun, +5 constant, –5 no longer a fancy effect); a magical force rather '
             'than a poison (RoP:F p. 67).'})
    stats['added'] += 1
print('bestiary:', stats)
blob = base64.b64encode(zlib.compress(json.dumps(J, ensure_ascii=False, separators=(',', ':')).encode('utf-8'), 9)).decode()
h = h[:s] + blob + h[e:]

# ---------------------------------------------------------------- saved files: renamed Flaws; changelog
JS = r'''!function(){"use strict";
/* Flaws misread from two-line Definitive Edition headings: a saved character keeps its Flaw under the right name */
const REN={"Infernal Power":"Susceptibility to Infernal Power","Aura for (Ability)":"Necessary (Realm) Aura for (Ability)"};
{const M=migrate;migrate=function(){const e=M.apply(this,arguments);try{(e.vf||[]).forEach(v=>{v&&"F"===v.kind&&REN[v.n]&&(v.n=REN[v.n])})}catch(z){console.error(z)}return e}}
const C=window.CHANGELOG&&window.CHANGELOG[0];
C&&C.items.unshift(["4.9.6.3","Realms data fixes",["Two Flaws were listed under half their names because the Definitive Edition prints the headings over two lines: “Infernal Power” is Susceptibility to Infernal Power (now on its Definitive Edition page, 146) and “Aura for (Ability)” is Necessary (Realm) Aura for (Ability) (p. 138; also Grogs p. 82). Saved characters are corrected when opened.","Bestiary: Nasir and Samuil are on RoP: The Divine p. 33. Powers printed in one paragraph, or given only as a list of names, are now listed one by one, and powers that had run into the previous power’s text are separated. Dysenteric Infliction (a saint’s curse, RoP: The Divine p. 89) and Lamashtu’s Fatal Menses (RoP: Faerie p. 67) were missing and are in."]]);
}();'''
h = h.rstrip('\n') + '\n<script id="v4.9.6.3">' + JS + '</script>\n'
P.write_text(h, encoding='utf-8', newline='\n')
# ---------------------------------------------------------------- release docs
import shutil
D = ROOT / 'src' / 'docs'; M = ROOT / 'patches' / 'v4.9.6.3' / 'docs'
shutil.copy(M / f'CHANGES-v{V}.txt', D / f'CHANGES-v{V}.txt')
old = D / f'PLAYER-CHANGELOG-v{OLD_V}.md'
pc = old.read_text(encoding='utf-8')
anchor = f'\n## v{OLD_V} — '   # newer releases go above the previous one
if pc.count(f'through v{OLD_V}') != 2 or pc.count(anchor) != 1:
    raise SystemExit('player changelog layout changed')
pc = pc.replace(f'through v{OLD_V}', f'through v{V}')
i = pc.index(anchor) + 1
pc = pc[:i] + (M / 'player-section.md').read_text(encoding='utf-8') + pc[i:]
(D / f'PLAYER-CHANGELOG-v{V}.md').write_text(pc, encoding='utf-8', newline='\n'); old.unlink()
print('patched to', V)
