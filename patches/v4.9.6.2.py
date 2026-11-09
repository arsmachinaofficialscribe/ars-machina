"""v4.9.6.2: realm-flavoured Ability rolls take the realm's die (patch).
Divine: Dominion Lore, Sense Holiness and Unholiness, Holy Magic, Ars Notoria and the holy Methods and Powers
(RoP:D pp. 37, 92). Infernal: Infernal Lore, Chthonic Magic, the unholy Methods and Powers and the Goetic Arts
(RoP:I pp. 102, 114-117). Faerie: Faerie Lore, the faerie Methods and Powers, Bonding, Captivating, Dismissing,
Summoning (faerie) and Curse-Throwing (RoP:F pp. 115, 123-124). An Ability that belongs to a hedge tradition keeps
that tradition's die. Added inside the v4.9.6.0 realm lookup: no new wrapper."""
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

if 'id="v4.9.6.2"' in h:
    raise SystemExit('v4.9.6.2 already applied')
OLD_V, B_OLD, V, B = '4.9.6.1', '2026-10-27', '4.9.6.2', '2026-10-27'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

rep('const rdOf=e=>{const t=e&&e.id||"";',
    '''const RD_ABIL=(()=>{const m={},k=(r,l)=>l.forEach(n=>m[n]=r);
 k("div",["Dominion Lore","Divine Lore","Sense Holiness and Unholiness","Holy Magic","Ars Notoria"].concat(Object.keys(HOLY_METHODS),HOLY_POWERS));
 k("inf",["Infernal Lore","Chthonic Magic"].concat(Object.keys(UNHOLY_METHODS),UNHOLY_POWERS,Object.keys(GOETIC)));
 k("fae",["Faerie Lore","Bonding","Captivating","Dismissing","Summoning (faerie)","Curse-Throwing"].concat(Object.keys(FAERIE_METHODS),FAERIE_POWERS));
 return m})();
const rdAbil=e=>{if(!e||"abil"!==e.kind||null==e.abilIndex)return null;const a=st.abil[e.abilIndex];if(!a||!a.n||"undefined"!=typeof HEDGE&&HEDGE[a.n])return null;return RD_ABIL[a.n]||null};
const rdOf=e=>{const t=e&&e.id||"";{const r=rdAbil(e);if(r)return r}''')

CL = '''window.CHANGELOG&&window.CHANGELOG[0]&&window.CHANGELOG[0].items.unshift(["4.9.6.2","Realm Abilities roll the realm dice",["Ability rolls of the realms now use their realm’s die and roll circle. Divine: Dominion Lore, Sense Holiness and Unholiness, Holy Magic, Ars Notoria and the holy Methods and Powers. Infernal: Infernal Lore, Chthonic Magic, the unholy Methods and Powers and the Goetic Arts. Faerie: Faerie Lore, the faerie Methods and Powers, Bonding, Captivating, Dismissing, Summoning and Curse-Throwing. An Ability that belongs to a hedge tradition keeps that tradition’s die."]]);'''
h = h.rstrip('\n') + '\n<script id="v4.9.6.2">' + CL + '</script>\n'
P.write_text(h, encoding='utf-8', newline='\n')
print('patched to', V)
