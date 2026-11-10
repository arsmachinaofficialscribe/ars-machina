/* 4.9.11.1: the 2026-11-09 UI audit. Decorators are idempotent: Build and Play keep unchanged blocks. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  /* N1, N7: rows laid out with CSS grid keep their table semantics */
  function roles(t) {
    if (!t || t.getAttribute("role")) return;
    t.setAttribute("role", "table");
    t.querySelectorAll("thead,tbody").forEach(function (e) { e.setAttribute("role", "rowgroup"); });
    t.querySelectorAll("tr").forEach(function (e) { e.setAttribute("role", "row"); });
    t.querySelectorAll("thead th").forEach(function (e) { e.setAttribute("role", "columnheader"); });
    t.querySelectorAll("tbody th").forEach(function (e) { e.setAttribute("role", "rowheader"); });
    t.querySelectorAll("td").forEach(function (e) { e.setAttribute("role", "cell"); });
  }
  function rowRoles(t) {
    t.querySelectorAll("tr:not([role])").forEach(function (e) {
      e.setAttribute("role", "row");
      e.querySelectorAll("td").forEach(function (c) { c.setAttribute("role", "cell"); });
      e.querySelectorAll("th").forEach(function (c) { c.setAttribute("role", "rowheader"); });
    });
  }
  function decorBuild() {
    var b = $('#s-abil tbody[data-lv-list="abil"]');
    if (b && b.parentElement) { roles(b.parentElement); rowRoles(b.parentElement); }
  }
  /* N5: the odds badges' yardstick, with a control. P().ef and P().oppTotal already drive every badge. */
  function step(label, val, dec, inc, kind) {
    return '<span><i>' + label + '</i><span class="f9111-step" role="group" aria-label="' + kind + '">' +
      '<button type="button" ' + dec + ' aria-label="Lower the ' + kind + '">−</button><output>' + val + "</output>" +
      '<button type="button" ' + inc + ' aria-label="Raise the ' + kind + '">+</button></span></span>';
  }
  function odds() {
    var w = document.getElementById("work"); if (!w) return;
    var old = w.querySelector(".f9111-odds"), tiles = w.querySelector(":scope > .tiles");
    if (!tiles || !w.querySelector(".odds")) { old && old.remove(); return; }
    var p = P(), ef = Math.round(+p.ef || 0), opp = Math.round(+p.oppTotal || 0);
    var hasOpp = !![].find.call(w.querySelectorAll(".pane .odds[title]"), function (e) { return /Opponent|opposing/i.test(e.title); });
    var html = step("Odds against <b>Ease Factor</b>", ef,
      'data-pact="ef" data-v="' + Math.max(0, ef - 3) + '"' + (ef <= 0 ? " disabled" : ""), 'data-pact="ef" data-v="' + (ef + 3) + '"', "Ease Factor");
    if (hasOpp) html += step("Combat odds against <b>opposing total</b>", opp,
      'data-pact="efk" data-k="oppTotal" data-v="' + (opp - 1) + '"', 'data-pact="efk" data-k="oppTotal" data-v="' + (opp + 1) + '"', "opposing total");
    if (old && old.__src === html) { if (old.previousElementSibling !== tiles) tiles.after(old); return; }
    old && old.remove();
    var d = document.createElement("div"); d.className = "f9111-odds"; d.setAttribute("role", "group"); d.setAttribute("aria-label", "What the odds badges are measured against");
    d.innerHTML = html; d.__src = html; tiles.after(d);
  }
  /* the console's Reset shows only when a manual modifier differs from its basic value */
  var KEEP = ["tab", "ctab", "sel", "fat", "fatL", "fatOver", "w", "conf", "confInit", "log", "last", "stable", "agingPool", "pendingFx"];
  var NAV = ["fight", "x", "lv", "sec", "fold", "ef", "oppTotal"];
  function canon(o) {
    if (o === null || typeof o !== "object") return o === undefined || o === "" || o === false || o === 0 || o === "0" ? 0 : o;
    if (Array.isArray(o)) return o.map(canon);
    var r = {}; Object.keys(o).sort().forEach(function (k) { var v = canon(o[k]); if (v !== 0 && !(typeof v === "object" && v && !Array.isArray(v) && !Object.keys(v).length) && !(Array.isArray(v) && !v.length)) r[k] = v; });
    return r;
  }
  function dirty() {
    try {
      if (typeof playDefaults !== "function") return true;
      var a = Object.assign({}, P()), d = playDefaults();
      KEEP.concat(NAV).forEach(function (k) { delete a[k]; delete d[k]; });
      return JSON.stringify(canon(a)) !== JSON.stringify(canon(d));
    } catch (e) { return true; }
  }
  function reset() {
    var b = $('#ledger [data-pact="reset-mods"]'); if (!b) return;
    var h = !dirty(); if (b.hidden !== h) b.hidden = h;
  }
  function decorPlay() {
    if (typeof MODE === "undefined" || MODE !== "play") return;
    try { odds(); } catch (e) {}
    try { reset(); } catch (e) {}
    try { document.querySelectorAll("#work table.wtab").forEach(function (t) { roles(t); }); } catch (e) {}
  }
  var RA = window.renderAll, RP = window.renderPlay;
  if (typeof RA === "function") window.renderAll = function () { var r = RA.apply(this, arguments); try { decorBuild(); } catch (e) {} return r; };
  if (typeof RP === "function") window.renderPlay = function () { var r = RP.apply(this, arguments); decorPlay(); return r; };
  try { decorBuild(); decorPlay(); } catch (e) {}
})();
