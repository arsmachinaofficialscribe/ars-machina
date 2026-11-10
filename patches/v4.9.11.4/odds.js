/* 4.9.11.4: the odds yardstick lives in the console's Modifiers tab and does nothing until ticked.
   Unticked, a badge is measured against the roll's own Ease Factor or opposing total, as before 4.9.11.1.
   Ticked, the badges (only the badges) are measured against P().odds.ef / P().odds.opp; no roll reads them. */
(function () {
  function cfg() {
    var p = P(), o = p.odds;
    if (o == null) return null;
    if (typeof o !== "object" || Array.isArray(o)) { delete p.odds; return null; }
    return o;
  }
  function n(v, d, lo, hi) { v = Math.round(+v); return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; }
  try {
    var OC = oddsChip;
    oddsChip = function (e) {
      try {
        var o = cfg();
        if (o && o.on === true && e && !e.blocked && !e.opp && e.efMode !== "none" && e.ef != null) {
          var p = P(), lab = String(e.efLabel || "");
          /* only checks that take the page's Ease Factor or opposing total; a rule's own Ease Factor stays */
          if (lab === "Ease Factor" && num(e.ef) === num(p.ef)) e = Object.assign({}, e, { ef: n(o.ef, 9, 0, 60) });
          else if (/Opponent|opposing/i.test(lab) && num(e.ef) === num(p.oppTotal)) e = Object.assign({}, e, { ef: n(o.opp, 10, -30, 99) });
        }
      } catch (x) {}
      return OC(e);
    };
    var CM = consoleMods;
    consoleMods = function () {
      var s = CM.apply(this, arguments);
      try {
        var o = cfg(), on = !!(o && o.on === true), p = P();
        if (on) { o.ef = n(o.ef, n(p.ef, 9, 0, 60), 0, 60); o.opp = n(o.opp, n(p.oppTotal, 10, -30, 99), -30, 99); }
        var f = '<fieldset class="f9114"><legend>Odds badges</legend>' +
          '<p class="note">Each % badge on the sheet is the chance that roll succeeds against the Ease Factor chosen in the Roll tab (in combat, against the opposing total). To see your odds against other numbers, tick the box. It changes the badges only, never a roll.</p>' +
          '<label class="chk"><input type="checkbox" data-pk="odds.on"' + (on ? " checked" : "") + ">Measure the badges against my own numbers</label>" +
          (on ? '<label class="f"><span>Ease Factor for the badges</span>' + numIn("odds.ef", ' min="0" max="60" step="3"') + "</label>" +
            '<label class="f"><span>Opposing total for combat badges</span>' + numIn("odds.opp", ' min="-30" max="99"') + "</label>" : "") + "</fieldset>";
        var i = s.indexOf("<fieldset><legend>Condition</legend>"); if (i < 0) i = s.lastIndexOf("</div>");
        if (i >= 0) s = s.slice(0, i) + f + s.slice(i);
      } catch (x) {}
      return s;
    };
  } catch (x) {}
})();
