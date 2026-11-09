#!/usr/bin/env node
// Ars Machina UI audit (report only; changes nothing).
//   node tools/ui-audit/audit.js OUT_DIR [--char file.json] [--shots DIR]
// Loads the hosted build (OUT_DIR/cf) over a local server and measures, per skin x theme x width:
//   geometry (overflow, uneven sibling gaps, near-miss alignment, clipped text, tiny painted boxes),
//   flicker (layout shifts at start-up and after actions, node churn, focus loss),
//   speed (long tasks, action-to-paint times, with 4x CPU throttling at phone width).
// Writes JSON (summary + offenders) and full-page screenshots plus element-rect files for the stray-pixel scan
// (tools/ui-audit/stray.py).
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const argv = process.argv.slice(2);
const OUT = path.resolve(argv.find(a => !a.startsWith('--')) || 'out');
const opt = n => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const SHOTS = path.resolve(opt('--shots') || path.join(OUT, '_audit'));
const CHAR = opt('--char') && JSON.parse(fs.readFileSync(opt('--char'), 'utf8'));
fs.mkdirSync(SHOTS, { recursive: true });
const wait = ms => new Promise(r => setTimeout(r, ms));
function serve(root) {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.txt': 'text/plain' };
  return new Promise(res => { const s = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(root, p);
    if (!f.startsWith(root) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(0, '127.0.0.1', () => res(s)); });
}

/* ---------------------------------------------------------------- in-page measurement */
function geometry() {
  const vis = e => { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const sel = e => { let s = e.tagName.toLowerCase(); if (e.id) return s + '#' + e.id; const c = [...e.classList].slice(0, 2).join('.'); if (c) s += '.' + c; const p = e.closest('[id]'); return (p && p !== e ? '#' + p.id + ' ' : '') + s; };
  const all = [...document.querySelectorAll('body *')].filter(e => !e.closest('svg') || e.tagName === 'svg').filter(vis);
  const W = innerWidth, out = { hscroll: document.scrollingElement.scrollWidth - W, overflow: [], gaps: [], nearMiss: [], clipped: [], tiny: [], offscreen: [], fracBorders: 0 };
  for (const e of all) {
    const r = e.getBoundingClientRect(), s = getComputedStyle(e);
    if ((r.right > W + 0.5 || r.left < -0.5) && s.position !== 'fixed' && !e.closest('[class*="scroll"],.tw,.table-wrap') ) {
      let a = e.parentElement, clipped = false; while (a && a !== document.body) { const o = getComputedStyle(a).overflowX; if (o !== 'visible') { const ar = a.getBoundingClientRect(); if (ar.right <= W + 0.5 && ar.left >= -0.5) clipped = true; break; } a = a.parentElement; }
      clipped || out.offscreen.push([sel(e), Math.round(r.left), Math.round(r.right)]);
    }
    const p = e.parentElement;
    if (p && p !== document.body) { const ps = getComputedStyle(p); if (ps.overflowX === 'visible' && ps.display !== 'contents') { const pr = p.getBoundingClientRect(); const over = Math.max(r.right - (pr.right - parseFloat(ps.paddingRight) + 0.5), (pr.left + parseFloat(ps.paddingLeft) - 0.5) - r.left);
      if (over >= 1 && !['absolute', 'fixed'].includes(s.position) && r.width > 8) out.overflow.push([sel(e), Math.round(over)]); } }
    if (/^(BUTTON|LABEL|SPAN|TD|TH|A|LEGEND|H[1-6]|SUMMARY|OUTPUT)$/.test(e.tagName) && s.overflow !== 'visible' && e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0) out.clipped.push([sel(e), (e.textContent || '').trim().slice(0, 30), e.scrollWidth - e.clientWidth]);
    if (/^(INPUT)$/.test(e.tagName) && /text|number|search/.test(e.type) && e.scrollWidth > e.clientWidth + 2) out.clipped.push([sel(e), String(e.value).slice(0, 30), e.scrollWidth - e.clientWidth]);
    const painted = s.backgroundColor !== 'rgba(0, 0, 0, 0)' || s.backgroundImage !== 'none' || parseFloat(s.borderTopWidth) > 0 || s.boxShadow !== 'none';
    if (painted && ((r.width > 0 && r.width <= 3 && r.height <= 40) || (r.height > 0 && r.height <= 3 && r.width <= 40)) && !/^(HR|INPUT)$/.test(e.tagName)) out.tiny.push([sel(e), +r.width.toFixed(1), +r.height.toFixed(1)]);
    if (parseFloat(s.borderTopWidth) === 1 && (r.top % 1 > 0.05 && r.top % 1 < 0.95)) out.fracBorders++;
  }
  // siblings laid out in one row (same top) or one column (same left): uneven gaps and near-miss alignment
  const parents = new Set(all.map(e => e.parentElement).filter(Boolean));
  for (const p of parents) {
    const ps = getComputedStyle(p); if (!/flex|grid/.test(ps.display)) continue;
    const kids = [...p.children].filter(vis).filter(k => !['absolute', 'fixed'].includes(getComputedStyle(k).position)); if (kids.length < 3) continue;
    const R = kids.map(k => k.getBoundingClientRect());
    const rows = {}; R.forEach((r, i) => { const k = Math.round(r.top / 4); (rows[k] = rows[k] || []).push(i); });
    for (const k in rows) { const ix = rows[k].sort((a, b) => R[a].left - R[b].left); if (ix.length < 3) continue;
      const g = ix.slice(1).map((i, j) => R[i].left - R[ix[j]].right); const spread = Math.max(...g) - Math.min(...g);
      if (spread > 2.5 && Math.min(...g) >= 0 && !/space-between|space-around|space-evenly/.test(ps.justifyContent)) out.gaps.push([sel(p), 'row', g.map(x => Math.round(x)).join('/')]);
      const tops = ix.map(i => R[i].top), hs = ix.map(i => R[i].height); const d = Math.max(...tops) - Math.min(...tops);
      if (d > 0.9 && d <= 4 && Math.max(...hs) - Math.min(...hs) <= 4) out.nearMiss.push([sel(p), 'tops differ ' + d.toFixed(1) + ' px']); }
    if (/column/.test(ps.flexDirection) || ps.display === 'grid' && R.every(r => Math.abs(r.left - R[0].left) < 1)) {
      const ix = R.map((r, i) => i).sort((a, b) => R[a].top - R[b].top); const g = ix.slice(1).map((i, j) => R[i].top - R[ix[j]].bottom);
      const spread = Math.max(...g) - Math.min(...g); if (spread > 2.5 && Math.min(...g) >= 0 && kids.length <= 30) out.gaps.push([sel(p), 'column', g.map(x => Math.round(x)).join('/')]);
    }
  }
  const cut = a => a.slice(0, 25);
  return { hscroll: out.hscroll, fracBorders: out.fracBorders, counts: { overflow: out.overflow.length, gaps: out.gaps.length, nearMiss: out.nearMiss.length, clipped: out.clipped.length, tiny: out.tiny.length, offscreen: out.offscreen.length },
    overflow: cut(out.overflow), gaps: cut(out.gaps), nearMiss: cut(out.nearMiss), clipped: cut(out.clipped), tiny: cut(out.tiny), offscreen: cut(out.offscreen) };
}
function rectsForStray() {
  // every box that legitimately paints small marks: text runs, icons, images, form controls, borders of painted boxes
  const out = []; const W = document.scrollingElement.scrollWidth;
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (tw.nextNode()) { const n = tw.currentNode; if (!n.textContent.trim()) continue; const rg = document.createRange(); rg.selectNodeContents(n); for (const r of rg.getClientRects()) out.push([r.left + scrollX, r.top + scrollY, r.width, r.height, 't']); }
  for (const e of document.querySelectorAll('svg,svg *,img,canvas,video,input,select,textarea,button,[class*="icon"],[class*="die"],[class*="chip"],[class*="sigil"],hr,.tag,.pill')) {
    const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden') continue; const r = e.getBoundingClientRect(); if (r.width && r.height) out.push([r.left + scrollX, r.top + scrollY, r.width, r.height, 'e']); }
  for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden') continue;
    if (parseFloat(s.borderTopWidth) || parseFloat(s.borderLeftWidth) || parseFloat(s.borderRightWidth) || parseFloat(s.borderBottomWidth) || s.boxShadow !== 'none' || s.backgroundImage !== 'none' || s.outlineStyle !== 'none' || s.textDecorationLine !== 'none' || s.backgroundColor !== 'rgba(0, 0, 0, 0)') { const r = e.getBoundingClientRect(); if (r.width && r.height) out.push([r.left + scrollX, r.top + scrollY, r.width, r.height, 'b']); } }
  // pseudo-elements paint too: mark their hosts
  for (const e of document.querySelectorAll('body *')) { for (const pe of ['::before', '::after']) { const s = getComputedStyle(e, pe); if (s.content && s.content !== 'none' && s.content !== 'normal') { const r = e.getBoundingClientRect(); if (r.width && r.height) out.push([r.left + scrollX - 24, r.top + scrollY - 24, r.width + 48, r.height + 48, 'p']); } } }
  return { W, H: document.scrollingElement.scrollHeight, rects: out };
}

/* ---------------------------------------------------------------- actions with flicker / speed probes */
async function action(p, name, fn, arg) {
  await p.evaluate(() => { window.__aud = { ls: [], lt: [], mut: 0, rm: 0 };
    window.__audPO1 = new PerformanceObserver(l => l.getEntries().forEach(e => !e.hadRecentInput && __aud.ls.push(+e.value.toFixed(4)))); __audPO1.observe({ type: 'layout-shift' });
    window.__audPO2 = new PerformanceObserver(l => l.getEntries().forEach(e => __aud.lt.push(Math.round(e.duration)))); __audPO2.observe({ type: 'longtask' });
    window.__audMO = new MutationObserver(m => m.forEach(r => { __aud.mut++; __aud.rm += r.removedNodes.length })); __audMO.observe(document.body, { childList: true, subtree: true });
    window.__audFocus = document.activeElement; });
  const t = await p.evaluate(async ([src, a]) => { const f = eval('(' + src + ')'); const t0 = performance.now(); await f(a); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return performance.now() - t0; }, [fn.toString(), arg]);
  await wait(500);
  const r = await p.evaluate(() => { __audPO1.disconnect(); __audPO2.disconnect(); __audMO.disconnect(); return Object.assign({}, __aud, { focusKept: document.activeElement === __audFocus }); });
  return { name, ms: Math.round(t), cls: +r.ls.reduce((a, b) => a + b, 0).toFixed(4), shifts: r.ls.length, longTasks: r.lt, mutations: r.mut, removed: r.rm, focusKept: r.focusKept };
}

(async () => {
  const { chromium } = require('playwright');
  const srv = await serve(path.join(OUT, 'cf')); const url = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch(); const report = {};
  for (const skin of ['modern', 'retro']) for (const theme of ['dark', 'light']) for (const width of [1280, 390]) {
    const key = `${skin}-${theme}-${width}`; const throttle = width === 390;
    const ctx = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, deviceScaleFactor: 1, hasTouch: width === 390 });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(([s, t]) => { localStorage.setItem('arm5-skin', s); localStorage.setItem('arm5-theme', t);
      window.__boot = { ls: [], lt: [] }; try { new PerformanceObserver(l => l.getEntries().forEach(e => __boot.ls.push([+e.value.toFixed(4), Math.round(e.startTime)]))).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver(l => l.getEntries().forEach(e => __boot.lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: true }); } catch (z) {} }, [skin, theme]);
    let cdp = null; if (throttle) { cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); }
    await p.goto(url); await p.waitForLoadState('load'); await wait(1500);
    const nav = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd) }; });
    const b = await p.$(`.amx-start [data-amx-enter="${skin === 'retro' ? 'retro' : 'classic'}"]`); if (b) { await b.click(); await wait(700); }
    const boot = await p.evaluate(() => __boot);
    await p.evaluate(c => { const m = document.getElementById('menu'); m && (m.hidden = true); st = c ? migrate(c) : exampleState(); persist(); setMode('build'); renderAll(); scrollTo(0, 0); }, CHAR);
    await wait(1200); { const t = await p.$('#am-seal-tip button'); if (t) { await t.click(); await wait(400); } } await p.evaluate(() => document.fonts.ready);
    const R = { nav, bootCLS: +boot.ls.reduce((a, x) => a + x[0], 0).toFixed(4), bootShifts: boot.ls.slice(0, 10), bootLongTasks: boot.lt.slice(0, 12) };
    R.buildGeo = await p.evaluate(geometry);
    const rs = await p.evaluate(rectsForStray); fs.writeFileSync(path.join(SHOTS, key + '-build.json'), JSON.stringify(rs));
    await p.screenshot({ path: path.join(SHOTS, key + '-build.png'), fullPage: true });
    // actions on Build
    const acts = [];
    acts.push(await action(p, 'type a letter in Name', async () => { const i = document.querySelector('[data-k="info.name"]'); i.focus(); i.value += 'x'; i.dispatchEvent(new Event('input', { bubbles: true })); }));
    acts.push(await action(p, 'change a Characteristic', async () => { const s = document.querySelector('[data-k="chars.Int"]'); if (!s) return; s.focus(); s.value = String((+s.value || 0) === 3 ? 2 : 3); s.dispatchEvent(new Event('change', { bubbles: true })); }));
    acts.push(await action(p, 'fold and unfold a section', async () => { const h = document.querySelector('#s-vf .sec-h, #s-vf h2, #s-vf [data-fold]'); h && h.click(); await new Promise(r => setTimeout(r, 350)); h && h.click(); }));
    acts.push(await action(p, 'add a Personality Trait', async () => { const b = document.querySelector('[data-act="add-trait"]'); b && b.click(); }));
    acts.push(await action(p, 'open Settings', async () => { openSettings(); }));
    await p.evaluate(() => document.querySelector('.pmodal') && document.querySelector('.pmodal').remove());
    acts.push(await action(p, 'switch to Play', async () => { setMode('play'); }));
    await wait(600);
    R.playGeo = await p.evaluate(geometry);
    const rp = await p.evaluate(rectsForStray); fs.writeFileSync(path.join(SHOTS, key + '-play.json'), JSON.stringify(rp));
    await p.screenshot({ path: path.join(SHOTS, key + '-play.png'), fullPage: true });
    acts.push(await action(p, 'open the Realms tab', async () => { P().tab = 'realms'; renderPlay(); }));
    acts.push(await action(p, 'load a roll', async () => { const b = document.querySelector('[data-pact="tab"][data-t="skills"]'); b && b.click(); await new Promise(r => setTimeout(r, 200)); const r = document.querySelector('.pane [data-lv-item], .pane .row, .pane [data-pick]'); r && r.click(); }));
    acts.push(await action(p, 'roll the die', async () => { const b = document.querySelector('[data-pact="roll"], .rollbtn, button.roll'); b && b.click(); await new Promise(r => setTimeout(r, 1800)); }));
    acts.push(await action(p, 'switch to Build', async () => { setMode('build'); }));
    acts.push(await action(p, 'open the main menu', async () => { openMenu('home'); }));
    R.actions = acts; R.errors = errs.slice(0, 5);
    report[key] = R; if (cdp) await cdp.detach(); await ctx.close();
    process.stdout.write(key + ' ');
  }
  await browser.close(); srv.close();
  fs.writeFileSync(path.join(SHOTS, 'report.json'), JSON.stringify(report, null, 1));
  console.log('\nwrote', path.join(SHOTS, 'report.json'));
})();
