/* ---- Faerie Blood varieties (DE p. 79; Realms of Power: Faerie pp. 106-110) and Faerie Legacy (RoP:F p. 112:
   the legacy benefit replaces the normal one). Read from the printed pages. ---- */
var FBV = [
  { k: "bee king", n: "Bee King", src: "ArM5", p: 79, note: "Give simple instructions to bees you touch and understand the thoughts of hives (Penetration 25)." },
  { k: "bloodcap", n: "Bloodcap", src: "RoP:F", p: 106, ch: "Str" },
  { k: "brownie", n: "Brownie", src: "RoP:F", p: 107, tot: "Profession" },
  { k: "dwarf", n: "Dwarf", src: "ArM5", p: 79, also: "RoP:F p. 107", tot: "Craft" },
  { k: "ettin", n: "Ettin", src: "RoP:F", p: 107, ch: "Sta" },
  { k: "god", n: "Faerie God", src: "RoP:F", p: 108, note: "1 point to spend on appropriate Sympathy Traits.", leg: "2 points to spend on appropriate Sympathy Traits." },
  { k: "ghul", n: "Ghul", src: "RoP:F", p: 108, note: "Retractable claws: Init −1, Atk +2, Dfn +3, Dam +2.", leg: "Extra large claws: Init −1, Atk +2, Dfn +3, Dam +4." },
  { k: "goblin", n: "Goblin", src: "ArM5", p: 79, also: "RoP:F p. 108", stealth: 1 },
  { k: "huldra", n: "Huldra", src: "RoP:F", p: 108, note: "Unseen while she stays perfectly still: Stamina + Concentration against 9 every fifteen minutes; not while anyone knows where she is, nor in a Divine aura.", leg: "As the benefit, and she can disappear even while watched." },
  { k: "nymph", n: "Nymph", src: "RoP:F", p: 108, ch: "Com" },
  { k: "padfoot", n: "Padfoot", src: "RoP:F", p: 109, ch: "Per" },
  { k: "satyr", n: "Satyr", src: "ArM5", p: 79, also: "RoP:F p. 109", satyr: 1 },
  { k: "selkie", n: "Selkie", src: "RoP:F", p: 109, depr: 3, leg: "+3 to avoid Deprivation; deprived of air, roll every minute instead of every 30 seconds." },
  { k: "sidhe", n: "Sidhe", src: "ArM5", p: 79, also: "RoP:F p. 109", ch: "Pre" },
  { k: "spinnen", n: "Spinnen", src: "ArM5", p: 79, note: "Turn your own body weight of fiber into cloth a day by touch, or unweave cloth (counts toward the same weight)." },
  { k: "undine", n: "Undine", src: "ArM5", p: 79, also: "RoP:F p. 110", water: 1 }
];
VF_SUGGEST.faerieblood = FBV.map(function (v) { return v.n; });
var FB_NAMES = ["Faerie Blood", "Strong Faerie Blood"];
var refOf = function (v) { return (v.src === "ArM5" ? "DE" : v.src) + " p. " + v.p; };
/* the character's Faerie Blood row, its variety, and whether Faerie Legacy applies */
function fbOf(e) {
  const r = (e && Array.isArray(e.vf) ? e.vf : []).find(function (x) { return x && FB_NAMES.indexOf(x.n) >= 0; });
  if (!r) return null;
  const d = lc(r.d), v = FBV.find(function (x) { return d.indexOf(x.k) >= 0; }) || null;
  const L = (e.vf || []).find(function (x) { return x && x.n === "Faerie Legacy"; });
  return { r: r, v: v, leg: !!L, fav: L ? String(L.d || "").trim() : "" };
}
window.amFaerieBlood = fbOf;
function favRow(e, f, base) {
  if (!f.fav) return null;
  const want = lc(f.fav).replace(/^(craft|profession)\s*[:(]?\s*/, "").replace(/\)$/, "").trim();
  return want ? (e.abil || []).find(function (a) { return a && a.n === base && (lc(a.prm) === want || lc(abilLabel(a)) === lc(f.fav)); }) || null : null;
}
function capped(raw, cap) { return Math.max(raw, Math.min(cap, raw + 1)); }
/* Characteristic varieties: +1, not above +3 (Faerie Legacy: up to +4). Sidhe was already in charEff (to +3). */
{ const CE = charEff; charEff = function (e) {
  const t = CE.apply(this, arguments);
  try {
    const f = fbOf(e); if (!f || !f.v || !f.v.ch) return t;
    const c = f.v.ch, raw = num(e.chars && e.chars[c]) + num(charMods(e)[c]);
    const was = c === "Pre" && norm(f.r.d).startsWith("sidhe") ? capped(raw, 3) : raw;
    t[c] += capped(raw, f.leg ? 4 : 3) - was;
  } catch (z) { console.error(z); }
  return t;
}; }
/* roll effects: the variety's own lines replace the DE table's heritage lines */
var HER = /heritage only/;
{ const ME = myEffects; myEffects = function () {
  let a = ME.apply(this, arguments);
  try {
    const f = fbOf(st); if (!f || !f.v) return a;
    a = a.filter(function (x) { return !(x && FB_NAMES.indexOf(x.n) >= 0 && x.e && HER.test(String(x.e.cond || ""))); });
    const v = f.v, src = v.src, page = v.p, add = function (eff) {
      eff = Object.assign({ botch: 0, quote: "" }, eff);
      a.push({ r: f.r, d: { n: f.r.n, effects: [eff] }, e: eff, n: f.r.n, src: src, page: page });
    };
    const tag = "Faerie Blood (" + v.n + (f.leg ? ", Faerie Legacy" : "") + ")";
    if (v.tot) {
      add({ on: "ability:" + v.tot, mod: 1, auto: true, cond: tag + ": any total including a " + v.tot + " Ability" });
      const fr = f.leg ? favRow(st, f, v.tot) : null;
      fr && add({ on: "ability:" + abilLabel(fr), mod: 1, auto: true, cond: tag + ": the favoured " + v.tot + " Ability gets +2 in all" });
    }
    v.stealth && add({ on: "ability:Stealth", mod: f.leg ? 2 : 1, auto: true, cond: tag + ": all totals involving stealth" });
    if (v.satyr) ["Com", "Pre"].forEach(function (c) {
      add({ on: "char:" + c, mod: f.leg ? 2 : 1, auto: false, cond: tag + ": " + (c === "Com" ? "Communication" : "Presence") + " totals when dealing with sexually compatible characters" });
    });
    v.water && add({ on: "all", mod: 2, auto: false, cond: tag + ": any action taken underwater" + (f.leg ? "; the +2 replaces any penalty applied (enter the penalty as 0)" : ", which partially offsets any penalty") });
  } catch (z) { console.error(z); }
  return a;
}; }
/* Selkie: +3 to all rolls to avoid Deprivation (RoP:F p. 109) */
{ const GC = getCheck; getCheck = function (id) {
  const c = GC.apply(this, arguments);
  try {
    if (c && c.id === "depr") { const f = fbOf(st);
      f && f.v && f.v.depr && (c.post = c.post.concat([{ l: "Faerie Blood (Selkie)", v: f.v.depr, ref: refOf(f.v) }])); }
  } catch (z) { console.error(z); }
  return c;
}; }
/* Rule checks: what the variety gives, and what Faerie Legacy needs */
{ const CK = checks; checks = function (e) {
  const a = CK.apply(this, arguments);
  try {
    const f = fbOf(e), L = (e.vf || []).some(function (x) { return x && x.n === "Faerie Legacy"; });
    L && !f && a.push({ ok: false, t: "Faerie Legacy needs Faerie Blood or Strong Faerie Blood (RoP:F p. 112)", g: "vf" });
    if (f && !f.v && String(f.r.d || "").trim()) a.push({ ok: true, t: f.r.n + " (" + String(f.r.d).trim() + "): a variety of your own; set its benefit with the Play tick boxes or a custom Virtue", g: "vf" });
    if (f && f.v) {
      const v = f.v, ch = { Str: "Strength", Sta: "Stamina", Com: "Communication", Per: "Perception", Pre: "Presence" }[v.ch];
      const what = v.ch ? "+1 " + ch + ", not above +" + (f.leg ? 4 : 3)
        : v.tot ? "+1 to totals with a " + v.tot + " Ability" + (f.leg ? ", +2 with the favoured one" : "")
        : v.stealth ? "+" + (f.leg ? 2 : 1) + " to totals involving stealth"
        : v.satyr ? "+" + (f.leg ? 2 : 1) + " to Communication and Presence with sexually compatible characters (tick box in Play)"
        : v.water ? "+2 to any action underwater (tick box in Play)" + (f.leg ? "; replaces any penalty" : "")
        : v.depr ? (f.leg ? v.leg : "+3 to all rolls to avoid Deprivation")
        : (f.leg && v.leg) || v.note;
      a.push({ ok: true, t: f.r.n + " (" + v.n + (f.leg ? ", Faerie Legacy" : "") + "): " + what.replace(/\.$/, "") + " (" + refOf(v) + (v.also ? "; " + v.also : "") + (f.leg ? "; RoP:F p. 112" : "") + ")", g: "vf" });
      if (f.leg && v.tot && !favRow(e, f, v.tot)) a.push({ ok: false, t: "Faerie Legacy (" + v.n + "): name the favoured " + v.tot + " Ability in the Virtue’s detail, as it appears on the sheet (RoP:F p. " + v.p + ")", g: "vf" });
      f.leg && !v.leg && !v.ch && !v.tot && !v.stealth && !v.satyr && !v.water && !v.depr && a.push({ ok: true, t: "Faerie Legacy: the book gives " + v.n + " Blood no legacy benefit", g: "vf" });
    }
  } catch (z) { console.error(z); }
  return a;
}; }
