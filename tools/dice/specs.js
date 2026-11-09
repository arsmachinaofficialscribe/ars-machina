/* Die specs for the realm dice (4.9.6.0). Emblems are 24-unit SVG paths drawn in the app's own style. */
const mirror = d => d.replace(/(-?\d*\.?\d+)\s*,?\s*(-?\d*\.?\d+)/g, (m, x, y) => `${+(24 - +x).toFixed(2)} ${y}`);
/* seraph: a small head with six feathered wings (upper, middle, lower pairs); each wing is a filled
   shape with a smooth leading edge and a scalloped trailing edge of three feathers */
function wing(bx, by, ang, len, wid, curl) {
  const a = ang * Math.PI / 180, d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]], lead = [], trail = [];
  for (let i = 0; i <= 24; i++) { const t = i / 24, c = [bx + d[0] * len * t + n[0] * curl * len * t * t, by + d[1] * len * t + n[1] * curl * len * t * t];
    const w = wid * Math.sin(Math.PI * Math.pow(t, .75)) + .05, sc = 1 + .45 * Math.abs(Math.sin(3 * Math.PI * t));
    lead.push([c[0] + n[0] * w * .55, c[1] + n[1] * w * .55]); trail.push([c[0] - n[0] * w * sc * .75, c[1] - n[1] * w * sc * .75]); }
  return 'M' + lead.concat(trail.reverse()).map(p => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L') + 'Z';
}
const W6 = [[10.5, 10.6, -128, 8.4, 2.1, -.18], [10.1, 12.2, -176, 8.6, 1.9, -.12], [10.5, 13.8, 128, 7.6, 1.8, .16]];
const flipX = d => d.replace(/(-?\d*\.?\d+) (-?\d*\.?\d+)/g, (m, x, y) => `${(24 - +x).toFixed(2)} ${y}`);
const seraph = [{ d: 'M12 10.25a1.75 1.75 0 1 0 .01 0z', fill: 1 }]
  .concat(W6.map(w => ({ d: wing(...w), fill: 1 })), W6.map(w => ({ d: flipX(wing(...w)), fill: 1 })));
/* heraldic dragon's head in profile, facing right: open jaws with fangs, a swept horn, a spined neck;
   eye and nostril cut dark */
const dragon = (() => {
  const P = [[5.4, 21], [7.9, 17.4], [11.4, 15.6], [15.4, 15], [18.3, 14.6], [21.2, 13.3], [19.3, 13.4], [18.6, 12.6], [17.6, 13.3], [14.2, 12.9],
    [17.8, 11.8], [18.7, 12.5], [19.6, 11.6], [21.4, 11.4], [21, 10.1], [19.4, 9.6], [16.6, 9.4], [14.4, 8.4], [13, 7.6], [11.4, 5.2], [8.6, 2.6],
    [9.6, 5.4], [10.6, 7.6], [9.7, 8.8], [7.6, 8.3], [8.1, 10.1], [5.9, 10.5], [6.8, 12.1], [4.6, 13], [5.7, 14.5], [3.6, 15.8], [4.6, 17.4], [3.2, 19.2]];
  const head = 'M' + P.map(p => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L') + 'Z';
  return [{ d: head, fill: 1 }, { d: 'M13.9 10.4Q15.4 9.5 16.9 10.1Q15.4 10.9 13.9 10.4Z', fill: 1, cut: 1 }, { d: 'M19.9 10.3a.45 .45 0 1 0 .01 0z', fill: 1, cut: 1 }];
})();
/* gossamer wings: a slender body and four veined wings */
const wl = ['M11.3 9.2C8.6 6.3 4.3 5 2.6 6.6 1.6 8.4 6.1 10.3 11.2 10.4', 'M11.3 11.6C8.2 11.7 4.1 13.6 4.3 15.6 5 17.3 8.7 15.5 11.2 12.7', 'M10.6 9.6L4.4 7.3M10.4 12L6 14.7'];
const wingsAll = wl.map(d => ({ d })).concat(wl.map(d => ({ d: d.replace(/(-?\d*\.?\d+) (-?\d*\.?\d+)/g, (m, x, y) => `${(24 - +x).toFixed(2)} ${y}`) })));
const gossamer = [{ d: 'M12 6.4V20.2' }, { d: 'M12 3.9a1.25 1.25 0 1 0 .01 0z', fill: 1 }].concat(wingsAll);

module.exports = {
  div: { name: 'alabaster (Divine)', kind: 'alabaster', seed: 11, palette: ['#e9dfcc', '#cfc0a4', '#fff6e2', '#c09030'],
    rough: .36, metal: 0, clearcoat: .55, clearcoatRough: .25, emissive: '#ffcf86', emissiveIntensity: .55, bump: 1.6,
    rule: '#b8902e', ruleMetal: .95, ruleRough: .28, inlay: '#c39532', inlayMetal: 1, inlayRough: .28,
    ink: '#6e4c0e', sideInk: '#6e4c0e', emblem: seraph, embW: .5, embS: .22, embT: .31,
    retro: { ink: '#24160a', sideInk: '#24160a', inlayMetal: 0, inlayRough: .9 } },
  inf: { name: 'charred iron (Infernal)', kind: 'char', seed: 23, palette: ['#3a322e', '#120f0d', '#5a4c44'], crackDark: '#3a0e05',
    rough: .72, metal: .7, emissive: '#ff5a14', emissiveIntensity: 1.6, bump: 2.4,
    rule: '#7a2418', ruleMetal: .35, ruleRough: .55, ruleGlow: '#2a0803', inlay: '#c8662c', inlayMetal: .35, inlayRough: .45, inlayGlow: '#6a2208', embEdge: '#050302',
    ink: '#e0702a', sideInk: '#e0702a', emblem: dragon, embW: .3, embS: .23, embT: .33,
    retro: { ink: '#ffe2b0', sideInk: '#ffe2b0', inlay: '#5e120c', inlayGlow: '#160302', inlayMetal: 0, inlayRough: .9, emissiveIntensity: .35 } },
  fae: { name: 'dragonfly glass (Faerie)', kind: 'wing', seed: 37, palette: ['#8fd8c8', '#a993ea', '#eef8ff', '#f0b8d4'], vein: 'rgba(36,84,98,.9)',
    rough: .14, metal: 0, clearcoat: 1, clearcoatRough: .08, iridescence: 1, iridescenceIOR: 1.35, iridescenceRange: [250, 700], bump: 1.4,
    rule: '#f4efe6', ruleMetal: .45, ruleRough: .22, inlay: '#5c4aa6', inlayMetal: .55, inlayRough: .25,
    ink: '#3b2f6e', sideInk: '#3b2f6e', emblem: gossamer, embW: 1.4, embS: .21, embT: .31,
    retro: { ink: '#140e3a', sideInk: '#140e3a', inlayMetal: 0, inlayRough: .9 } },
  /* a plain gold die, only to check the silhouette against the shipped Hermetic die */
  gold: { name: 'test gold', kind: 'char', seed: 5, palette: ['#d9b24f', '#8a6420', '#e8c870'], crackDark: '#8a6420', rough: .3, metal: 1, bump: 1,
    rule: '#5a4010', ruleMetal: 1, ruleRough: .3, inlay: '#1c2a58', inlayMetal: 0, inlayRough: .6, ink: '#1c2a58', emblem: seraph },
};
