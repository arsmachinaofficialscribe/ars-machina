/* 4.9.11.0 Play: the same redraw and layout savings the Build sheet got in 4.9.10.0, and its short source chips */
(function () {
  "use strict";
  /* keyed redraw: renderPlay hands its two strings here. A block whose markup is unchanged keeps its element
     (layout, open folds, focus, the hero's crest); a block whose own tag is unchanged is compared child by child, so
     loading a roll rebuilds the console and the one section whose row changed, not the whole page. Nodes that later
     wrappers insert (the Situation strip and others) are not in the markup, so they are removed and re-inserted by
     those wrappers as before. Anything unexpected falls back to innerHTML. */
  var TPL = document.createElement("template"), DEPTH = 3;
  var mask = function (h) { return h.replace(/\bcbx-\d+-/g, "cbx-#-").replace(/\bptc\d+\b/g, "ptc#"); };
  function shell(el) { var c = el.cloneNode(false); return mask(c.outerHTML); }
  function same(a, b) { return a.nodeType === b.nodeType && (a.nodeType !== 1 || a.tagName === b.tagName); }
  /* make `host`'s children match `fresh` (a parsed fragment's children); depth limits how far it compares */
  function morph(host, fresh, depth) {
    /* text between elements is taken from the new markup */
    var olds = [].filter.call(host.children, function (n) { return n.__amSrc != null; });
    [].forEach.call([].slice.call(host.childNodes), function (n) { (n.nodeType !== 1 || n.__amSrc == null) && n.remove(); });
    /* old elements are matched by tag, id and class, in order, so a block a wrapper removed shifts nothing */
    var pool = Object.create(null);
    olds.forEach(function (e) { var k = key(e); (pool[k] = pool[k] || []).push(e); });
    var news = [].slice.call(fresh.childNodes), i, o, n, src, keep = [];
    for (i = 0; i < news.length; i++) {
      n = news[i];
      if (n.nodeType !== 1) { keep.push(n); continue; }
      o = (pool[key(n)] || []).shift();
      src = mask(n.outerHTML);
      if (o && o.__amSrc === src) { keep.push(o); continue; }
      if (o && depth > 0 && same(o, n) && o.__amShell === shell(n) && o.children.length && n.children.length && !hasText(n) && !hasText(o)) {
        morph(o, n, depth - 1); o.__amSrc = src; keep.push(o); continue;
      }
      tag(n, src, depth); keep.push(n);
    }
    /* put the chosen nodes in order, reusing the ones already in place */
    var cur = host.firstChild;
    for (i = 0; i < keep.length; i++) {
      if (keep[i] === cur) { cur = cur.nextSibling; continue; }
      host.insertBefore(keep[i], cur);
    }
    while (cur) { var nx = cur.nextSibling; cur.remove(); cur = nx; }
  }
  function key(e) { return e.tagName + "#" + (e.id || "") + "." + (e.getAttribute("class") || ""); }
  /* a block that mixes words with elements is replaced whole, never compared piece by piece */
  function hasText(el) { for (var c = el.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && c.nodeValue.trim()) return true; return false; }
  /* remember each node's markup (and its own tag) as parsed, before any later wrapper decorates it */
  function tag(el, src, d) {
    if (el.nodeType !== 1) return;
    el.__amSrc = src != null ? src : mask(el.outerHTML); el.__amShell = shell(el);
    if (d > 0) for (var k = el.firstElementChild; k; k = k.nextElementSibling) tag(k, null, d - 1);
  }
  function set(id, html) {
    var host = document.getElementById(id); if (!host) return;
    var fresh = !host.firstElementChild || host.__amMode !== MODE || window.amPlayFull;
    host.__amMode = MODE;
    if (fresh) { host.innerHTML = html; [].forEach.call(host.children, function (c) { tag(c, null, DEPTH); }); return; }
    try { TPL.innerHTML = html; morph(host, TPL.content, DEPTH); }
    catch (e) { host.innerHTML = html; [].forEach.call(host.children, function (c) { tag(c, null, DEPTH); }); setTimeout(function () { throw e; }); }
  }
  window.amPlaySet = function (work, ledger) { set("work", work); set("ledger", ledger); };
  /* Build draws into the same #work: switching modes starts from a fresh tree */
  var SM = window.setMode;
  if (typeof SM === "function") window.setMode = function () {
    var w = document.getElementById("work"), l = document.getElementById("ledger");
    w && (w.__amMode = ""); l && (l.__amMode = "");
    return SM.apply(this, arguments);
  };

  /* the section strip's sticky offsets are measured after the frame is laid out, not in the middle of a redraw */
  var psecQ = 0;
  window.amPsecSoon = function () {
    if (psecQ) return; psecQ = requestAnimationFrame(function () { psecQ = 0; try { "play" === MODE && psecAfter(); } catch (e) {} });
  };

  /* short source chips, as on the Build sheet: "Ars Magica Definitive Edition p. 367" becomes "DE p. 367" */
  var RX = null;
  function codes() {
    if (RX) return RX;
    var map = Object.create(null), all = typeof BOOKS !== "undefined" ? BOOKS : {};
    Object.keys(all).forEach(function (k) { var v = all[k]; if (!v) return; var c = k === "ArM5" || k === "ArM5 DE" ? "DE" : k; if (!(v in map) || c === "DE") map[v] = c; });
    map["Ars Magica DE"] = "DE"; map["ArM5 DE"] = "DE"; map["ArM5"] = "DE";
    var t = Object.keys(map).sort(function (a, b) { return b.length - a.length; });
    if (!t.length) return null;
    RX = { map: map, re: new RegExp("(?<![\\w-])(" + t.map(function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")(?= pp?\\. \\d)", "g") };
    return RX;
  }
  function shorten(root) {
    var c = codes(); if (!c || !root) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n, todo = [];
    while ((n = w.nextNode())) { c.re.lastIndex = 0; if (c.re.test(n.nodeValue)) todo.push(n); }
    todo.forEach(function (t) {
      var full = [];
      t.nodeValue = t.nodeValue.replace(c.re, function (m) { full.push(m); return c.map[m]; });
      var p = t.parentElement; p && !p.title && full.length && (p.title = full.join(" · "));
    });
  }
  window.amShortSrc = shorten;
  /* the roll console's scroll position, kept as it scrolls so a redraw need not read it back */
  document.addEventListener("scroll", function (e) { var t = e.target; t && t.classList && t.classList.contains("cbody") && (t.__amScroll = t.scrollTop); }, true);
  var RP = window.renderPlay;
  if (typeof RP === "function") window.renderPlay = function () {
    var r = RP.apply(this, arguments);
    try { shorten(document.getElementById("work")); shorten(document.getElementById("ledger")); } catch (e) {}
    return r;
  };
})();
