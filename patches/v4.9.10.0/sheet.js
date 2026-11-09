/* 4.9.10.0 Build sheet decorations: short source chips, expandable rows */
(function () {
  "use strict";
  var OPEN = new Set(), SHORT = { ArM5: "DE", "ArM5 DE": "DE" }, RX = null;
  function codes() {
    if (RX) return RX;
    var map = {}, all = typeof BOOKS !== "undefined" ? BOOKS : {};
    Object.keys(all).forEach(function (k) { if (!(all[k] in map) || SHORT[k]) map[all[k]] = SHORT[k] || k; });
    var t = Object.keys(map).sort(function (a, b) { return b.length - a.length; });
    if (!t.length) return null;
    RX = { map: map, re: new RegExp("^(" + t.map(function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")(,? p+\\. .*)?$") };
    return RX;
  }
  function chips(root) {
    var c = codes(); if (!c) return;
    root.querySelectorAll(".vf-row .meta>span[title], .sp-row span[title], .inv-row span[title]").forEach(function (e) {
      if (e.classList.contains("f910-src") || e.children.length) return;
      var m = c.re.exec(e.textContent.trim()); if (!m) return;
      e.textContent = c.map[m[1]] + (m[2] || "").replace(/^,/, "");
      e.title = e.title || m[1]; e.classList.add("f910-src");
      var row = e.closest(".vf-row"); if (row && e.parentNode !== row) { var c2 = row.querySelector(":scope>.cost, :scope>.xbtn"); row.insertBefore(e, c2 || null); }
    });
  }
  var ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  function rows(root) {
    root.querySelectorAll(".sp-row, .inv-row").forEach(function (r) {
      var main = r.querySelector(":scope>.sp-main"); if (!main || main.querySelector(".f910-more")) return;
      var hasMore = [].some.call(r.children, function (k) { return k !== main && k.textContent.trim() + k.querySelectorAll("input,select,textarea").length; });
      if (!hasMore) return;
      var key = (r.querySelector("[data-k]") || {}).getAttribute ? r.querySelector("[data-k]").getAttribute("data-k").replace(/\.[^.]*$/, "") : "";
      var nm = (r.getAttribute("data-lv-name") || "this entry");
      var b = document.createElement("button");
      b.type = "button"; b.className = "f910-more"; b.innerHTML = ARROW;
      b.setAttribute("aria-label", "Details for " + nm);
      var on = OPEN.has(key); r.classList.toggle("f910-open", on); b.setAttribute("aria-expanded", on ? "true" : "false");
      b.addEventListener("click", function () {
        var o = !r.classList.contains("f910-open"); r.classList.toggle("f910-open", o); b.setAttribute("aria-expanded", o ? "true" : "false");
        o ? OPEN.add(key) : OPEN.delete(key);
      });
      var x = main.querySelector(".xbtn"); main.insertBefore(b, x || null);
    });
  }
  /* sub-groups headed by an h3 directly in a section become boxes (Personality's Condition groups, Biography) */
  function boxes(root) {
    root.querySelectorAll(":scope>section.folio:is(#s-persona,#s-bio,#s-combat)").forEach(function (sec) {
      [].slice.call(sec.querySelectorAll(":scope>h3")).forEach(function (h) {
        var box = document.createElement("div"); box.className = "f910-box"; sec.insertBefore(box, h);
        var n = h; while (n && !(n !== h && n.nodeType === 1 && (n.tagName === "H3" || n.tagName === "DATALIST"))) { var nx = n.nextSibling; box.appendChild(n); n = nx; }
      });
    });
  }
  /* the ledger's rings show budgets only: Experience as spent of total, Best Art as a line */
  function wards() {
    var L = document.getElementById("ledger"); if (!L) return;
    L.querySelectorAll(".ward[aria-label]").forEach(function (w) {
      var m = /^(Experience|Best Art): (\d+) of (\d+)/.exec(w.getAttribute("aria-label")); if (!m) return;
      if (m[1] === "Experience") { var d = w.querySelector("text.d"); d && (d.textContent = "/ " + m[3]); return; }
      var host = w.parentElement, line = host.parentElement.querySelector(".f910-best");
      if (!line) { line = document.createElement("p"); line.className = "f910-best"; host.parentElement.insertBefore(line, host.nextSibling); }
      line.innerHTML = "Best Art <b>" + m[2] + "</b> <span>of " + m[3] + "</span>"; w.remove();
    });
  }
  function decor() { var w = document.getElementById("work"); if (!w) return; try { chips(w); rows(w); boxes(w); } catch (e) { } }
  window.amSheet910 = decor;
  ["renderAll", "refresh"].forEach(function (n) {
    var f = window[n]; if (typeof f !== "function") return;
    window[n] = function () { var r = f.apply(this, arguments); decor(); return r; };
  });
  var RL = window.renderLedger;
  if (typeof RL === "function") window.renderLedger = function () { var r = RL.apply(this, arguments); try { wards(); } catch (e) { } return r; };
  decor(); try { wards(); } catch (e) { }
})();
