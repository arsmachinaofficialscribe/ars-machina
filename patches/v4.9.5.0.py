"""v4.9.5.0: Student of (Realm) accepts "Divine"; True Faith starts with its Faith Point;
lighter v4.9.4.0 wrappers; header hardening (frame-ancestors, no wildcard CORS)."""
import pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
P = ROOT / 'src' / 'index.html'
H = ROOT / 'src' / '_headers'
h = P.read_text(encoding='utf-8')

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if n != count:
        raise SystemExit(f'expected {count} of {old[:70]!r}, found {n}')
    h = h.replace(old, new)

if 'id="v4.9.5.0"' in h:
    raise SystemExit('v4.9.5.0 already applied')
OLD_V, B_OLD, V, B = '4.9.4.0', '2026-10-26', '4.9.5.0', '2026-10-26'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# 1. Student of (Realm): "Divine" names the Dominion (DE p. 49; the Divine realm's Lore is Dominion Lore).
rep('e.realm)){const e=norm(i.d);for(const a of["Dominion Lore","Faerie Lore","Infernal Lore","Magic Lore"])',
    'e.realm)){const e=norm(i.d).replace(/^(divine|holy)\\b/,"dominion");for(const a of["Dominion Lore","Faerie Lore","Infernal Lore","Magic Lore"])')
rep('(u=/Lore$/.test(t.abil.n)&&matchParam(r,[t.abil.n.replace(/ Lore$/,"")]))',
    '(u=/Lore$/.test(t.abil.n)&&matchParam(r,[t.abil.n.replace(/ Lore$/,"")].concat("Dominion Lore"===t.abil.n?["Divine","Holy"]:[])))')

# 2. True Faith grants a single Faith Point (RoP:D p. 57; DE p. 419).
rep('s.faith={score:null==f.score||""===f.score?null:clamp(N(f.score),0,10),pts:clamp(N(f.pts),0,99),test:!!f.test};',
    's.faith={score:null==f.score||""===f.score?null:clamp(N(f.score),0,10),pts:clamp(N(f.pts),0,99),test:!!f.test,init:!!f.init};')
rep('const faith=()=>st.faith||fxSan(st).faith;',
    'const faith=()=>{const f=st.faith||fxSan(st).faith;if(!f.init&&has(st,"True Faith")){f.pts=Math.max(f.pts,1);f.init=!0}return f};')

# 3. Performance: skip the 4.9.4.0 work when nothing it handles is active.
rep('const ringOn=k=>{const a=st.notoria&&st.notoria.active;return!!(a&&a[k])};',
    'const ringOn=k=>{const a=st.notoria&&st.notoria.active;return!!(a&&a[k])};\nconst anyRing=()=>{const a=st.notoria&&st.notoria.active;if(a)for(const k in a)return!0;return!1};')
rep('const ringXP=n=>{if(!inPlay())return 0;', 'const ringXP=n=>{if(!inPlay()||!anyRing())return 0;')
rep('try{if(e===st&&!e.abil.some(a=>a.n===n)){const x=ringXP(n);',
    'try{if(e===st&&inPlay()&&anyRing()&&!e.abil.some(a=>a.n===n)){const x=ringXP(n);')
rep('try{if(e===st&&inPlay()){ringOn("1")', 'try{if(e===st&&inPlay()&&anyRing()){ringOn("1")')
rep(''' try{
  const x=XP(),a=P().aura,tg=c.toggles=(c.toggles||[]).slice();''',
    ''' try{
  const raw=P().x||{};
  if(!(N(raw.aidOn)>0||raw.tmpName||raw.tarName||(inPlay()&&anyRing()&&ringOn("7"))))return c;
  const x=XP(),a=P().aura,tg=c.toggles=(c.toggles||[]).slice();''')

rep('''const a=P().aura,s=hasNotoria()?ablScore(st,"Ars Notoria"):0;
  if(s>0&&a&&"Divine"===a.realm&&"Divine"!==realm&&r.mod<0){''',
    '''const a=P().aura,s=a&&"Divine"===a.realm&&"Divine"!==realm&&r.mod<0&&hasNotoria()?ablScore(st,"Ars Notoria"):0;
  if(s>0){''')

# 4. Changelog, added last so it stays on top.
CL = '''window.CHANGELOG&&window.CHANGELOG[0]&&window.CHANGELOG[0].items.unshift(["4.9.5.0","Faith Points, Student of the Dominion, security",["A character who takes True Faith starts with its single Faith Point (RoP:D p. 57); it was 0 until a dawn passed.","Student of (Realm) accepts “Divine” as well as “Dominion” for the Dominion: it grants Dominion Lore and its +2 bonus either way (p. 49).","Security review: every field of a character file is escaped and range-checked, including the new True Faith, Ars Notoria and known-effect records, and a deliberately hostile file is now part of the release tests. The hosted site no longer lets other websites read its files, and refuses to be framed by any page.","Faster rolls: the True Faith, temper and Ars Notoria additions now do no work on a roll unless one of them is active."]]);'''
h = h.rstrip('\n') + '\n<script id="v4.9.5.0">' + CL + '</script>\n'
P.write_text(h, encoding='utf-8', newline='\n')

# 5. Headers: a header CSP for what <meta> cannot carry, and no wildcard CORS from the platform.
hd = H.read_text(encoding='utf-8')
if "frame-ancestors" not in hd:
    hd = hd.replace('# The Content-Security-Policy is the early <meta> in index.html (Pages caps each header value at 2,000 characters).',
                    '# The full Content-Security-Policy is the early <meta> in index.html (Pages caps each header value at 2,000 characters).\n'
                    '# The short header policy adds what a <meta> policy cannot express (frame-ancestors); both policies apply.')
    hd = hd.replace('Cloudflare Pages headers for Ars Machina — Scribe and Cast v4.9.3.5.', 'Cloudflare Pages headers for Ars Machina — Scribe and Cast.')
    hd = hd.replace("/*\n  X-Content-Type-Options: nosniff",
                    "/*\n  ! Access-Control-Allow-Origin\n  Content-Security-Policy: frame-ancestors 'none'; base-uri 'none'; object-src 'none'; form-action 'none'\n  X-Content-Type-Options: nosniff", 1)
    H.write_text(hd, encoding='utf-8', newline='\n')
print('patched to', V)
