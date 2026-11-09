/* 4.9.10.0 speed: fewer whole-sheet recalculations while typing; folded Laboratory not redrawn */
(function () {
  "use strict";
  /* typing: a number field recalculates once a frame; a text field once typing pauses (it already saved its
     value in st through setPath). Anything that leaves the field, clicks, or hides the page runs it at once. */
  var due = 0, timer = 0, frame = 0;
  function run() { clearTimeout(timer); cancelAnimationFrame(frame); timer = frame = 0; if (!due) return; due = 0; try { refresh(); } catch (e) { setTimeout(function () { throw e; }); } }
  window.amRefreshSoon = function (el) {
    due = 1;
    var text = el && el.dataset && el.dataset.num === undefined && (el.tagName === "TEXTAREA" || el.type === "text" || el.type === "search" || !el.type);
    if (text) { clearTimeout(timer); timer = setTimeout(run, 280); }
    else if (!frame) frame = requestAnimationFrame(run);
  };
  window.amRefreshNow = run;
  ["focusout", "pointerdown", "keydown"].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (!due) return; if (ev === "keydown" && e.key !== "Enter" && e.key !== "Tab") return; run(); }, true);
  });
  addEventListener("pagehide", run); document.addEventListener("visibilitychange", function () { document.hidden && run(); });
  /* a whole redraw or a mode change first settles any typing still waiting */
  ["renderAll", "setMode"].forEach(function (n) {
    var f = window[n]; if (typeof f !== "function") return;
    window[n] = function () { due && run(); return f.apply(this, arguments); };
  });

  /* whole-sheet redraw, keyed by section: a section whose markup is unchanged keeps its element (and its layout,
     open folds and listeners); only changed sections are rebuilt. Anything unexpected falls back to innerHTML. */
  var TPL = document.createElement("template");
  /* combobox and portrait-clip ids carry a counter that changes on every render: compare without it */
  var key = function (h) { return h.replace(/\bcbx-\d+-/g, "cbx-#-").replace(/\bptc\d+\b/g, "ptc#"); };
  window.amWorkSet = function (parts) {
    var w = document.getElementById("work"); if (!w) return;
    var full = function () {
      var by = Object.create(null);
      parts.forEach(function (p) { var m = /^\s*<section\b[^>]*\bid="([^"]+)"/.exec(String(p || "")); m && (by[m[1]] = key(String(p))); });
      w.innerHTML = parts.join("");
      [].forEach.call(w.querySelectorAll(":scope>section.folio"), function (s) { s.__amSrc = by[s.id] || null; });
    };
    var old = Object.create(null);
    [].forEach.call(w.querySelectorAll(":scope>section.folio"), function (s) { s.id && (old[s.id] = s); });
    if (!Object.keys(old).length) return full();
    var next = [];
    for (var i = 0; i < parts.length; i++) {
      var src = String(parts[i] || ""); if (!src.trim()) continue;
      var m = /^\s*<section\b[^>]*\bid="([^"]+)"/.exec(src); if (!m) return full();
      var o = old[m[1]];
      if (o && o.__amSrc === key(src)) { next.push(o); delete old[m[1]]; continue; }
      TPL.innerHTML = src; var els = TPL.content.children;
      if (els.length !== 1 || els[0].tagName !== "SECTION") return full();
      var n = els[0]; n.__amSrc = key(src);
      if (o) { o.replaceWith(n); delete old[m[1]]; } else w.appendChild(n);
      next.push(n);
    }
    for (var k in old) old[k].remove();
    /* keep render order for anything the grouping step does not place */
    var cur = [].filter.call(w.children, function (e) { return e.matches("section.folio"); });
    if (cur.length !== next.length) return full();
  };

  /* Laboratory: while its section is folded, its tiles and grid wait until it opens */
  var labDirty = false, LR = window.labRefresh;
  if (typeof LR === "function") {
    window.labRefresh = function () {
      var s = document.getElementById("s-lab");
      if (s && s.classList.contains("shut") && MODE !== "play") { labDirty = true; return; }
      labDirty = false; return LR.apply(this, arguments);
    };
    var AS = window.applyShut;
    if (typeof AS === "function") window.applyShut = function () {
      var r = AS.apply(this, arguments);
      if (labDirty) { var s = document.getElementById("s-lab"); s && !s.classList.contains("shut") && window.labRefresh(); }
      return r;
    };
  }
})();
