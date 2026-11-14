/* ---- Custom Virtue wizard: "Abilities it grants" (Haik, 2026-11-13). Stored as fx.grants [{ab, score}] and applied
   by the same grant mechanism as the books' Virtues (free experience points, an Ability row added). ---- */
var GC0 = window.amGrantClean;
{ const WF = wizFrom; wizFrom = function (e) {
  const t = WF.apply(this, arguments);
  t.grants = (e && e.fx && Array.isArray(e.fx.grants) ? e.fx.grants : []).map(function (g) { return { ab: GC0.ab(g && g.ab), score: GC0.sc(g && g.score) || 1 }; });
  return t;
}; }
{ const WP = wizPreview; wizPreview = function (e) {
  let h = WP.apply(this, arguments);
  try {
    const g = (e.grants || []).filter(function (x) { return GC0.ab(x.ab) && GC0.sc(x.score); });
    if (g.length && e.kind === "V") h = h.replace('<br><span class="tag">No mechanical change yet.</span>', "") + "<br>" + esc("Grants " + g.map(function (x) { return GC0.ab(x.ab) + " " + GC0.sc(x.score); }).join(", "));
  } catch (z) { console.error(z); }
  return h;
}; }
function wzGrantsHtml(t) {
  if (t.kind !== "V") return "";
  const rows = (t.grants || []).map(function (g, i) {
    return '<div class="row" style="grid-template-columns:1fr 7em auto">' +
      '<label class="f"><span>Ability</span><input type="text" data-wzg="ab" data-k2="' + i + '" list="dl-wz-abil" value="' + esc(g.ab || "") + '" placeholder="e.g. Second Sight"></label>' +
      '<label class="f"><span>Score</span><input type="number" min="1" max="10" step="1" data-wzg="sc" data-k2="' + i + '" value="' + esc(g.score || 1) + '"></label>' +
      '<button class="xbtn" type="button" data-wzg="rm" data-k2="' + i + '" aria-label="Remove this Ability">×</button></div>';
  }).join("");
  return '<div class="wiz-grant"><h3 style="font:700 12px var(--caps);letter-spacing:.1em;color:var(--muted);margin:18px 0 6px">Abilities it grants</h3>' +
    '<p class="wiz-note" style="margin-top:0">The character starts with this Ability at this score without spending experience, as Second Sight gives Second Sight 1. A Supernatural Ability granted here may also be raised with experience.</p>' +
    '<datalist id="dl-wz-abil">' + ABILITIES.map(function (a) { return '<option value="' + esc(a[0]) + '">'; }).join("") + '</datalist>' +
    (rows || '<p class="wiz-note" style="margin:0">No Abilities yet.</p>') +
    '<button class="btn small ghost" type="button" data-wzg="add" style="margin-top:8px">Add an Ability</button></div>';
}
{ const DW = drawWizard; drawWizard = function () {
  const r = DW.apply(this, arguments);
  try {
    const w = document.getElementById("wizard"), t = WIZ && WIZ.draft;
    if (w && t) { const at = w.querySelector('[data-wz="add"]'); at && at.insertAdjacentHTML("afterend", wzGrantsHtml(t)); }
  } catch (z) { console.error(z); }
  return r;
}; }
{ const WS = wizSave; wizSave = function () {
  const i = WIZ && WIZ.i, g = WIZ && WIZ.draft && WIZ.draft.kind === "V" ? (WIZ.draft.grants || []) : [];
  const r = WS.apply(this, arguments);
  try {
    const v = st.vf[i];
    if (v && v.fx) {
      const clean = g.map(function (x) { return { ab: GC0.ab(x.ab), score: GC0.sc(x.score) }; }).filter(function (x) { return x.ab && x.score; });
      clean.length ? v.fx.grants = clean : delete v.fx.grants;
      renderAll();
    }
  } catch (z) { console.error(z); }
  return r;
}; }
var wzPrev = function () {
  const p = document.querySelector("#wizard .wiz-prev"); p && WIZ && (p.innerHTML = wizPreview(WIZ.draft));
};
document.addEventListener("click", function (e) {
  const b = e.target.closest && e.target.closest("#wizard [data-wzg]"); if (!b || !WIZ) return;
  const k = b.dataset.wzg, g = WIZ.draft.grants = WIZ.draft.grants || [];
  if (k === "add") { g.push({ ab: "", score: 1 }); drawWizard(); }
  else if (k === "rm") { g.splice(+b.dataset.k2, 1); drawWizard(); }
});
document.addEventListener("input", function (e) {
  const b = e.target.closest && e.target.closest("#wizard [data-wzg]"); if (!b || !WIZ) return;
  const g = (WIZ.draft.grants || [])[+b.dataset.k2]; if (!g) return;
  b.dataset.wzg === "ab" ? g.ab = b.value : g.score = GC0.sc(b.value) || 1;
  wzPrev();
});
