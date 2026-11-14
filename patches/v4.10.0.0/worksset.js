  window.amWorkSet = function (parts) {
    var w = document.getElementById("work"); if (!w) return;
    /* a part may hold several top-level sections (Grogs and Companions: #s-being then #s-vf from sVF).
       Each section is tracked by its own id: __amSrc = the key of the part it came from (fast path for an
       unchanged part), __amOwn = the key of its own markup (reuse it when only a sibling changed). */
    var FRAG = Object.create(null);
    var parse = function (src) { TPL.innerHTML = src; return [].slice.call(TPL.content.children); };
    var ok = function (els) { return els.length && els.every(function (n) { return n.tagName === "SECTION" && n.id; }); };
    var full = function () {
      w.textContent = "";
      parts.forEach(function (p) {
        var src = String(p || ""); if (!src.trim()) return;
        var kp = key(src), els = parse(src), ids = [];
        els.forEach(function (n) { if (n.tagName === "SECTION" && n.id) { n.__amSrc = kp; n.__amOwn = key(n.outerHTML); ids.push(n.id); } });
        ok(els) && (FRAG[kp] = ids);
        w.appendChild(TPL.content);
      });
      window.__amFrag = FRAG;
    };
    var PREV = window.__amFrag || Object.create(null);
    var old = Object.create(null);
    [].forEach.call(w.querySelectorAll(":scope>section.folio"), function (s) { s.id && (old[s.id] = s); });
    if (!Object.keys(old).length) return full();
    var next = [];
    for (var i = 0; i < parts.length; i++) {
      var src = String(parts[i] || ""); if (!src.trim()) continue;
      var kp = key(src), ids = PREV[kp];
      if (ids && ids.every(function (id) { return old[id] && old[id].__amSrc === kp; })) {
        ids.forEach(function (id) { next.push(old[id]); delete old[id]; });
        FRAG[kp] = ids; continue;
      }
      var els = parse(src); if (!ok(els)) return full();
      ids = [];
      for (var j = 0; j < els.length; j++) {
        var n = els[j], own = key(n.outerHTML), o = old[n.id]; ids.push(n.id);
        if (o && o.__amOwn === own) { o.__amSrc = kp; next.push(o); delete old[n.id]; continue; }
        n.__amSrc = kp; n.__amOwn = own;
        if (o) { o.replaceWith(n); delete old[n.id]; } else w.appendChild(n);
        next.push(n);
      }
      FRAG[kp] = ids;
    }
    for (var k in old) old[k].remove();
    window.__amFrag = FRAG;
    /* keep render order for anything the grouping step does not place */
    var cur = [].filter.call(w.children, function (e) { return e.matches("section.folio"); });
    if (cur.length !== next.length) return full();
  };
