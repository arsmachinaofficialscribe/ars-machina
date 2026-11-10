/* 4.9.11.1 art: the roll circle and the Play crest redrawn to match the new seal.
   The roll circle keeps its class names (fx-draw, fx-ticks, fx-glyph, fx-ringtext, fx-r1…fx-r4) so every die,
   realm and Art variant still tints it; fx-r5 is new. Ten Form medallions ride the tick ring and five Technique
   medallions the pentagon; each holds the Art's own icon (Modern) or shows as a stud (Retro pixels).
   The medallions of the Arts being rolled light up (art.css, from data-fx / data-fxt). */
(function () {
  var TE = ["Cr", "In", "Mu", "Pe", "Re"], FO = ["An", "Aq", "Au", "Co", "He", "Ig", "Im", "Me", "Te", "Vi"];
  function P(r, d) { var a = d * Math.PI / 180; return [200 + r * Math.cos(a), 200 + r * Math.sin(a)]; }
  function F(n) { return n.toFixed(1); }
  function poly(r, n, s, k) { var o = []; for (var i = 0; i < n; i++) o.push(P(r, s + 360 * (k || 1) * i / n).map(F).join(",")); return o.join(" "); }
  function ic(k) { try { return (typeof ICONS === "object" && ICONS[k]) || ""; } catch (e) { return ""; } }
  function med(k, r, d, R, sc) {
    var p = P(r, d), x = p[0], y = p[1];
    return '<g class="fx-med fx-m-' + k + '" transform="rotate(' + F(d + 90) + " " + F(x) + " " + F(y) + ')">' +
      '<circle class="fx-draw thin fx-mc" pathLength="1300" cx="' + F(x) + '" cy="' + F(y) + '" r="' + R + '"/>' +
      '<g class="fx-ico" transform="translate(' + F(x - 12 * sc) + " " + F(y - 12 * sc) + ") scale(" + sc + ')">' + ic(k) + "</g></g>";
  }
  function circle() {
    var ticks = "", rays = "", i, a, b, forms = "", techs = "", nodes = "";
    for (i = 0; i < 60; i++) { a = P(157, 6 * i - 90); b = P(i % 6 ? 162 : 167, 6 * i - 90); ticks += '<line x1="' + F(a[0]) + '" y1="' + F(a[1]) + '" x2="' + F(b[0]) + '" y2="' + F(b[1]) + '"/>'; }
    for (i = 0; i < 30; i++) { a = P(i % 3 ? 70 : 67.5, 12 * i - 90); b = P(74, 12 * i - 90); rays += '<line x1="' + F(a[0]) + '" y1="' + F(a[1]) + '" x2="' + F(b[0]) + '" y2="' + F(b[1]) + '"/>'; }
    for (i = 0; i < 10; i++) forms += med(FO[i], 138, 36 * i - 90, 13, 0.8);
    for (i = 0; i < 5; i++) techs += med(TE[i], 101, 72 * i - 90, 12, 0.74);
    for (i = 0; i < 5; i++) { a = P(194, 72 * i - 54); nodes += '<path class="fx-node" transform="rotate(' + F(72 * i + 36) + " " + F(a[0]) + " " + F(a[1]) + ')" d="M' + F(a[0]) + " " + F(a[1] - 6) + 'l3.6 6l-3.6 6l-3.6-6z"/>'; }
    return '<svg class="fx-circle fx-c9111" viewBox="0 0 400 400" aria-hidden="true">\n' +
      '<defs><path id="fx-ring" d="M200,200 m-180,0 a180,180 0 1,1 360,0 a180,180 0 1,1 -360,0"/>' +
      '<radialGradient id="fx-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#e1be63" stop-opacity=".22"/><stop offset=".55" stop-color="#e1be63" stop-opacity=".05"/><stop offset="1" stop-color="#e1be63" stop-opacity="0"/></radialGradient></defs>\n' +
      '<circle cx="200" cy="200" r="198" fill="url(#fx-glow)"/>\n' +
      '<g class="fx-r1"><circle class="fx-draw thin fx-rim2" pathLength="1300" cx="200" cy="200" r="198.5"/><circle class="fx-draw" pathLength="1300" cx="200" cy="200" r="194"/><circle class="fx-draw thin" pathLength="1300" cx="200" cy="200" r="171"/>' + nodes +
      '<text class="fx-ringtext"><textPath href="#fx-ring" startOffset="0" textLength="1128" lengthAdjust="spacing">' + ARTS_RING + "</textPath></text></g>\n" +
      '<g class="fx-r2"><g class="fx-ticks">' + ticks + '</g><circle class="fx-draw thin" pathLength="1300" cx="200" cy="200" r="153"/>' + forms + "</g>\n" +
      '<g class="fx-r3"><polygon class="fx-draw thin" pathLength="1300" points="' + poly(125, 10, -90, 3) + '"/></g>\n' +
      '<g class="fx-r4"><polygon class="fx-draw" pathLength="1300" points="' + poly(101, 5, -90) + '"/>' + techs + "</g>\n" +
      '<g class="fx-r5"><g class="fx-ticks">' + rays + '</g><circle class="fx-draw thin" pathLength="1300" cx="200" cy="200" r="77.5"/></g>\n</svg>';
  }
  try { fxCircleSvg0 = circle; FX_SVG = ""; } catch (e) {}

  /* Play crest: the same rim of fifteen marks and the two pentagons, around the House mark */
  function cp(r, d) { var a = d * Math.PI / 180; return [60 + r * Math.cos(a), 60 + r * Math.sin(a)]; }
  function f2(n) { return (Math.round(n * 100) / 100).toString(); }
  function cpoly(r, s) { var o = []; for (var i = 0; i < 5; i++) o.push(cp(r, s + 72 * i).map(f2).join(",")); return o.join(" "); }
  var RING = (function () {
    var o = '<g class="turn" fill="none" stroke="#e1be63"><circle cx="60" cy="60" r="55.5" stroke-width="1.1"/><circle class="c-f" cx="60" cy="60" r="49.5" stroke-width=".6" opacity=".7"/>', i, p, d;
    for (i = 0; i < 15; i++) { d = -90 + 24 * i; p = cp(52.5, d);
      o += i % 3 ? '<circle cx="' + f2(p[0]) + '" cy="' + f2(p[1]) + '" r=".9" class="c-f" fill="#e1be63" stroke="none"/>' :
        '<path class="c-b" fill="#e1be63" stroke="none" transform="rotate(' + f2(d + 90) + " " + f2(p[0]) + " " + f2(p[1]) + ')" d="M' + f2(p[0]) + " " + f2(p[1] - 2.2) + 'l1.5 2.2l-1.5 2.2l-1.5-2.2z"/>'; }
    o += '</g><g class="turn-mid" fill="none" stroke="#e1be63" stroke-width="1" stroke-linejoin="round" opacity=".75"><polygon points="' + cpoly(46.5, -90) + '"/><polygon class="c-p2" points="' + cpoly(46.5, 90) + '"/></g>';
    o += '<g class="turn-in" fill="none" stroke="#e1be63" stroke-width="1.1" stroke-linecap="round">';
    for (i = 0; i < 10; i++) { d = -90 + 36 * i; var a = cp(33.5, d), b = cp(i % 2 ? 35.5 : 37.5, d); o += '<line x1="' + f2(a[0]) + '" y1="' + f2(a[1]) + '" x2="' + f2(b[0]) + '" y2="' + f2(b[1]) + '"/>'; }
    return o + "</g>";
  })();
  try {
    var C0 = crest;
    crest = function () {
      var s = C0.apply(this, arguments);
      try { return s.replace(/<g class="turn"[\s\S]*?<\/g>\s*<g class="turn-in"[\s\S]*?<\/g>/, RING); } catch (e) { return s; }
    };
  } catch (e) {}
})();
