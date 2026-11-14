/* 4.9.11.5 creation grants: Virtues that give experience pools, and Virtues that give an Ability at a score.
   Definitive Edition pages unless a book is named. */
var lc = function (s) { return String(s == null ? "" : s).toLowerCase(); };
var prm = function (a) { return lc(a.prm); };
var lang = function (a) { return a.n === "Living Language" || a.n === "Dead Language"; };

/* ---- experience pools the 4.9 pool list did not carry (label must start with the BONUS_OK key) ---- */
var POOLS = [
  ["Vernacular Education", 50, "Academic, Bargain, the company's Organization Lore, Profession: Merchant, a trade language; p. 77 · C&G p. 109",
    function (a) { return abilCat(a) === "Academic" || a.n === "Bargain" || a.n === "Organization Lore" || (a.n === "Profession" && /merchant/.test(prm(a))) || lang(a); }],
  ["Baccalaureus", 90, "Latin, Artes Liberales; p. 71",
    function (a) { return isLatinA(a) || a.n === "Artes Liberales"; }],
  ["Cathedral School Master", 240, "Academic Abilities, Teaching; p. 73",
    function (a) { return abilCat(a) === "Academic" || a.n === "Teaching"; }],
  ["Clan Ilfetu", 50, "House Bjornaer Lore, Magic Lore, Gothic; p. 73",
    function (a) { return a.n === "Magic Lore" || /bjornaer/.test(lc(a.n) + " " + prm(a)) || (a.n === "Dead Language" && /goth/.test(prm(a))); }],
  ["Falconer", 50, "Animal Handling, Area Lore, Etiquette, Hunt, Latin, Profession: Falconer, Ride; p. 80",
    function (a) { return ["Animal Handling", "Area Lore", "Etiquette", "Hunt", "Ride"].indexOf(a.n) >= 0 || isLatinA(a) || (a.n === "Profession" && /falcon|austring|hawk/.test(prm(a))); }],
  ["Forge-Companion", 50, "the Crafts her master practices; p. 82",
    function (a) { return a.n === "Craft"; }],
  ["Marshal", 50, "Animal Handling, Etiquette, Hunt, Latin, Profession: Marshal, Ride; p. 95",
    function (a) { return ["Animal Handling", "Etiquette", "Hunt", "Ride"].indexOf(a.n) >= 0 || isLatinA(a) || (a.n === "Profession" && /marshal/.test(prm(a))); }],
  ["Physician of Salerno", 50, "Medicine, Philosophiae; p. 103",
    function (a) { return a.n === "Medicine" || a.n === "Philosophiae"; }],
  ["Trained Assassin", 50, "Martial Abilities, Athletics, Guile, Stealth; p. 113",
    function (a) { return abilCat(a) === "Martial" || ["Athletics", "Guile", "Stealth"].indexOf(a.n) >= 0; }],
  ["Venditor", 50, "Bargain, Charm, Folk Ken, Guile, Intrigue, a Living Language; p. 114",
    function (a) { return ["Bargain", "Charm", "Folk Ken", "Guile", "Intrigue", "Living Language"].indexOf(a.n) >= 0; }]
];
POOLS.forEach(function (p) { BONUS_OK[p[0]] = p[3]; });
{ const BP = bonusPools; bonusPools = function (e) {
  let a = BP.apply(this, arguments);
  try {
    a = a.slice();
    POOLS.forEach(function (p) { has(e, p[0]) && !a.some(function (x) { return String(x[0]).indexOf(p[0]) === 0; }) && a.push([p[0] + " (" + p[2] + ")", p[1]]); });
    /* Mentored by Demons may be taken more than once, 50 each time (p. 98) */
    const md = vfCount(e, "Mentored by Demons");
    if (md > 1) a = a.map(function (x) { return String(x[0]).indexOf("Mentored by Demons") === 0 ? [x[0].replace(/\)$/, "; taken " + md + " times)"), 50 * md] : x; });
  } catch (z) { console.error(z); }
  return a;
}; }

/* ---- Abilities the Definitive Edition prints that the Ability list lacked ---- */
[["Corpse Magic", "Supernatural", 162], ["Crafter’s Healing", "Supernatural", 162], ["Embitterment", "Supernatural", 164],
 ["Faerie Magic", "Arcane", 165], ["Font of Knowledge", "Supernatural", 165], ["Induction", "Supernatural", 166],
 ["Persona", "Supernatural", 169], ["Whistle Up The Wind", "Supernatural", 172]].forEach(function (r) {
  if (ABIL_INFO[r[0]]) return;
  ABILITIES.push([r[0], r[1], "", "ArM5", r[2]]);
  ABIL_INFO[r[0]] = { cat: r[1], param: "", src: "ArM5", p: r[2] };
});

/* ---- Virtues that confer an Ability at a score (5 experience points = score 1) ---- */
var GR = Object.create(null);
[["Animal Ken", "Animal Ken"], ["Corpse Magic", "Corpse Magic"], ["Crafter’s Healing", "Crafter’s Healing"],
 ["Curse-Throwing", "Curse-Throwing"], ["Dowsing", "Dowsing"], ["Embitterment", "Embitterment"],
 ["Enchanting Music", "Enchanting Music"], ["Entrancement", "Entrancement"], ["Faerie Magic", "Faerie Magic"],
 ["Font of Knowledge", "Font of Knowledge"], ["Induction", "Induction"], ["Magic Sensitivity", "Magic Sensitivity"],
 ["Persona", "Persona"], ["Premonitions", "Premonitions"], ["Second Sight", "Second Sight"],
 ["Sense Holiness and Unholiness", "Sense Holiness and Unholiness"], ["Shapeshifter", "Shapeshifter"],
 ["Summon Animals", "Summon Animals"], ["Whistle Up The Wind", "Whistle Up The Wind"], ["Wilderness Sense", "Wilderness Sense"],
 ["The Enigma", "Enigmatic Wisdom"], ["Heartbeast", "Heartbeast"],
 /* Strong Faerie Blood gives the Virtue Second Sight at no cost (p. 110) */
 ["Strong Faerie Blood", "Second Sight"]
].forEach(function (r) { GR[r[0]] = { ab: r[1], xp: 5 }; });
/* Realms of Power: Faerie power Virtues: "Choosing this Virtue gives the character X with an initial score of 1" (pp. 111-114) */
["Beguile", "Conjure", "Dream", "Empathy", "Enchantment", "Evocation", "Grant", "Portage", "Ware", "Weal", "Woe"].forEach(function (n) {
  GR[n] = { ab: n, xp: 5, book: "RoP:F" };
});
function cleanAb(x) { return typeof x === "string" ? x.replace(/[<>]/g, "").trim().slice(0, 60) : ""; }
function cleanSc(x) { const n = Math.round(Number(x)); return n >= 1 && n <= 10 ? n : 0; }
window.amGrantClean = { ab: cleanAb, sc: cleanSc };
function grantsOf(e) {
  const out = [], seen = Object.create(null);
  (e.vf || []).forEach(function (v) {
    if (!v || v.kind !== "V" || typeof v.n !== "string") return;
    const g = GR[v.n]; if (!g || seen[g.ab]) return;
    if (g.book && typeof srcOn === "function" && !srcOn(e, g.book)) return;
    seen[g.ab] = 1; out.push({ ab: g.ab, xp: g.xp, by: v.n });
  });
  /* your own Virtues: "Abilities it grants" in the custom Virtue wizard (fx.grants: [{ab, score}]) */
  (e.vf || []).forEach(function (v) {
    if (!v || !v.custom || v.kind !== "V" || !v.fx || !Array.isArray(v.fx.grants)) return;
    v.fx.grants.forEach(function (g) {
      const ab = cleanAb(g && g.ab), sc = cleanSc(g && g.score);
      if (!ab || !sc || seen[ab]) return;
      seen[ab] = 1; out.push({ ab: ab, xp: 5 * sc * (sc + 1) / 2, by: String(v.n || "") });
    });
  });
  return out;
}
window.amGrants = grantsOf;
/* write the grant into the character: the first row of the Ability gets at least 5 free experience points; a
   missing row is added. A row keeps vfg (granting Virtue) and vfgOld (its own free points) so the grant can be
   taken back when the Virtue goes. Rows are never removed (Play state is keyed by row index). */
function syncGrants(e) {
  if (!e || !Array.isArray(e.abil) || !Array.isArray(e.vf)) return;
  const g = grantsOf(e), want = Object.create(null);
  g.forEach(function (x) { want[x.ab] = x; });
  e.abil.forEach(function (a) {
    if (!a || !a.vfg) return;
    if (!want[a.n]) { if ("vfgOld" in a) a.free = Math.max(0, num(a.vfgOld)); delete a.vfg; delete a.vfgOld; }
  });
  g.forEach(function (x) {
    const r = e.abil.find(function (a) { return a && a.n === x.ab; });
    if (!r) { e.abil.push({ n: x.ab, prm: "", sp: "", xp: 0, xps: {}, free: x.xp, vfg: x.by, vfgOld: 0 }); return; }
    if (r.house && num(r.free) >= x.xp) return;
    if (r.vfg && "vfgOld" in r) r.free = Math.max(num(r.vfgOld), x.xp);          /* our grant: follow its size */
    else if (num(r.free) < x.xp) { r.vfgOld = Math.max(0, num(r.free)); r.free = x.xp; }
    r.vfg = x.by;
  });
}
window.amSyncGrants = syncGrants;
{ const RA = renderAll; renderAll = function () {
  try { syncGrants(st); } catch (z) { console.error(z); }
  return RA.apply(this, arguments);
}; }
/* a loaded file is brought up to date at once (Play draws from st too) */
{ const MG = migrate; migrate = function () {
  const r = MG.apply(this, arguments);
  try { const s = r && typeof r === "object" ? r : null; s && syncGrants(s); } catch (z) { console.error(z); }
  return r;
}; }


/* ---- Redcap and Lone Redcap (pp. 105, 91): fifteen years as an apprentice, 300 experience points, and the
   Well-Traveled Virtue at no cost. Haik's ruling (2026-11-13): the 300 come on top of later life. Home rule
   "redcapReplace": the apprenticeship takes fifteen of the later-life years instead. ---- */
var RCAP = "Redcap apprenticeship";
BONUS_OK[RCAP] = function (a) { const c = abilCat(a); return c !== "Supernatural" && c !== "House mystery"; };
var isRedcap = function (e) { return e && e.type !== "magus" && (has(e, "Redcap") || has(e, "Lone Redcap")); };
if (window.amOptAdd) amOptAdd([{ id: "redcapReplace", grp: "home", def: !1, by: "ours",
  l: "Redcaps: the apprenticeship replaces fifteen years of later life",
  x: "A mundane Redcap “has spent fifteen years as an apprentice, and gained a total of 300 experience points in those fifteen years”. By default the app adds those 300 to the later-life experience for the character’s age. On: as for a magus, the fifteen apprentice years are taken out of later life, so later life counts fifteen fewer years.",
  ref: "DE pp. 43, 105 (Lone Redcap p. 91)" }]);
{ const BP2 = bonusPools; bonusPools = function (e) {
  let a = BP2.apply(this, arguments);
  try {
    if (isRedcap(e)) {
      a = a.slice();
      a.push([RCAP + " (General, Academic, Arcane and Martial Abilities; 15 yr; " + (has(e, "Redcap") ? "p. 105" : "p. 91") + ")", 300]);
      !has(e, "Well-Traveled") && a.push(["Well-Traveled (free with " + (has(e, "Redcap") ? "Redcap" : "Lone Redcap") + "; living languages, Area Lores, Bargain, Carouse, Charm, Etiquette, Folk Ken, Guile; p. 116)", 50]);
    }
  } catch (z) { console.error(z); }
  return a;
}; }
{ const BU = budget; budget = function (e) {
  const b = BU.apply(this, arguments);
  try {
    if (!isRedcap(e) || !(window.amOpt && amOpt("redcapReplace"))) return b;
    const i = b.pools.findIndex(function (p) { return /^Later life \(/.test(p[0]); }); if (i < 0) return b;
    const m = /\((\d+) yr × (\d+)\)/.exec(b.pools[i][0]); if (!m) return b;
    const y = Math.max(0, +m[1] - 15), per = +m[2], pools = b.pools.slice();
    pools[i] = ["Later life (" + y + " yr × " + per + "; 15 yr as an apprentice Redcap)", y * per];
    const avail = pools.reduce(function (s, p) { return s + p[1]; }, 0);
    return Object.assign({}, b, { pools: pools, xpAvail: avail, left: avail - b.spent });
  } catch (z) { console.error(z); return b; }
}; }
