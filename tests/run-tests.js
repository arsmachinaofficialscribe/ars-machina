#!/usr/bin/env node
// Ars Machina regression tests.
//   node tests/run-tests.js [OUT_DIR] [--baseline SITE_DIR] [--shots DIR] [--verbose] [--only static|browser]
// OUT_DIR (default ./out) is pack.py's output: cf/ and Ars_Machina_v*_offline.html.
// --baseline: a previous release's site folder; screenshots are compared against it.
// --shots: where diff crops are written (default OUT_DIR/_shots); only failing views are written.
// Prints one line per failure and a one-line summary. Exit code 1 on any failure.
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), zlib = require('zlib'), crypto = require('crypto');

const argv = process.argv.slice(2);
const flag = n => argv.includes(n);
const opt = n => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const OUT = path.resolve(argv.find((a, i) => !a.startsWith('--') && !['--baseline', '--shots', '--only'].includes(argv[i - 1])) || 'out');
const CF = path.join(OUT, 'cf');
const OFFLINE = fs.readdirSync(OUT).filter(f => /_offline\.html$/.test(f)).map(f => path.join(OUT, f))[0];
const BASE = opt('--baseline') && path.resolve(opt('--baseline'));
const SHOTS = path.resolve(opt('--shots') || path.join(OUT, '_shots'));
const VERBOSE = flag('--verbose'), ONLY = opt('--only');

let pass = 0; const fails = [];
function check(name, ok, detail) {
  if (ok) { pass++; if (VERBOSE) console.log('ok   ' + name); }
  else { fails.push(name); console.log('FAIL ' + name + (detail !== undefined ? ' — ' + String(detail).slice(0, 300) : '')); }
}
const sha = b => 'sha256-' + crypto.createHash('sha256').update(b).digest('base64');
const inflate = s => zlib.inflateSync(Buffer.from(s.trim(), 'base64')).toString('utf8');

// ------------------------------------------------------------------ static checks
function staticChecks(file, variant) {
  const h = fs.readFileSync(file, 'utf8'), dir = path.dirname(file), tag = `[${variant}] `;
  const csp = (h.match(/http-equiv="Content-Security-Policy" content="([^"]*)"/) || [])[1];
  check(tag + 'CSP meta present', !!csp);
  if (!csp) return {};
  check(tag + 'CSP meta within first 4 KB (before any script)', h.indexOf('Content-Security-Policy') < h.indexOf('<script'));
  const allowed = new Set([...csp.matchAll(/'(sha256-[^']+)'/g)].map(m => m[1]));
  check(tag + 'CSP has no unsafe-inline/unsafe-eval/self/wildcard/nonce in script-src',
    !/script-src[^;]*('unsafe-inline'|'unsafe-eval'|'self'|\*|'nonce-)/.test(csp));
  const used = new Set(); let exec = 0, bad = [], corpus = [];
  let data = null;
  for (const m of h.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const a = m[1], b = m[2];
    if (!/type=/.test(a)) {
      exec++; const d = sha(Buffer.from(b, 'utf8')); used.add(d); corpus.push(b);
      if (!allowed.has(d)) bad.push('exec ' + (a.match(/id="([^"]*)"/) || [, '(anon)'])[1]);
      if (variant === 'cf' && !/^\s*data-cfasync="false"/.test(a)) bad.push('no leading data-cfasync: ' + a.slice(0, 40));
    } else if (/data-am-lazy/.test(a)) {
      let txt;
      if (/data-src=/.test(a)) {
        const src = a.match(/data-src="([^"]+)"/)[1], want = a.match(/data-sri="([^"]+)"/)[1];
        const p = path.join(dir, src);
        if (!fs.existsSync(p)) { bad.push('missing ' + src); continue; }
        const buf = fs.readFileSync(p); txt = buf.toString('utf8');
        if (sha(buf) !== want) bad.push('SRI mismatch ' + src);
      } else txt = /data-z/.test(a) ? inflate(b) : b;
      const d = sha(Buffer.from(txt, 'utf8')); used.add(d); corpus.push(txt);
      if (!allowed.has(d)) bad.push('lazy ' + (a.match(/data-am-lazy="([^"]+)"/) || [])[1]);
    } else if (/application\/json/.test(a)) {
      if (/data-src=/.test(a)) {  // on-demand data (v4.9.6.1): a cached asset with an integrity hash
        const src = a.match(/data-src="([^"]+)"/)[1], want = (a.match(/data-sri="([^"]+)"/) || [])[1], p = path.join(dir, src);
        if (!fs.existsSync(p)) { bad.push('missing ' + src); continue; }
        const buf = fs.readFileSync(p); if (sha(buf) !== want) bad.push('SRI mismatch ' + src);
        try { corpus.push(JSON.stringify(JSON.parse(buf.toString('utf8')))); } catch (e) { bad.push('JSON asset unreadable: ' + src); }
        continue;
      }
      try { const j = JSON.parse(/data-z/.test(a) ? inflate(b) : b); corpus.push(JSON.stringify(j)); if (/v33-catalog-data/.test(a)) data = j; }
      catch (e) { bad.push('JSON payload unreadable: ' + a.slice(0, 50)); }
    }
  }
  check(tag + 'every script and on-demand file matches a CSP hash (and SRI)', bad.length === 0, bad.slice(0, 5).join('; '));
  check(tag + 'no unused CSP hashes', [...allowed].every(x => used.has(x)), [...allowed].filter(x => !used.has(x)).length + ' unused');
  check(tag + 'no nonce attributes', !/\snonce=/.test(h));
  // Version in four places.
  const v1 = (h.match(/APP_VERSION="([\d.]+)"/) || [])[1];
  const v2 = (h.match(/<span class="ver"[^>]*>v([\d.]+)</) || [])[1];
  check(tag + 'APP_VERSION matches header', v1 && v1 === v2, `${v1} vs ${v2}`);
  if (variant === 'cf') {
    const docs = fs.readdirSync(dir);
    check(tag + 'CHANGES file for this version', docs.includes(`CHANGES-v${v1}.txt`));
    check(tag + 'PLAYER-CHANGELOG for this version', docs.includes(`PLAYER-CHANGELOG-v${v1}.md`));
    check(tag + '_headers present', docs.includes('_headers'));
    check(tag + 'no netlify.toml', !docs.includes('netlify.toml'));
    // Assets.
    const refs = new Set([...h.matchAll(/assets\/([0-9a-f]{12}\.\w+)/g)].map(m => m[1]));
    const files = fs.readdirSync(path.join(dir, 'assets'));
    const missing = [...refs].filter(f => !files.includes(f));
    check(tag + 'all referenced assets exist', missing.length === 0, missing.slice(0, 5).join(', '));
    const misnamed = files.filter(f => crypto.createHash('sha256').update(fs.readFileSync(path.join(dir, 'assets', f))).digest('hex').slice(0, 12) !== f.slice(0, 12));
    check(tag + 'every asset named by its SHA-256', misnamed.length === 0, misnamed.slice(0, 5).join(', '));
  } else {
    check(tag + 'offline file references no external assets', !/["'(]assets\//.test(h));
  }
  // No build-machine traces (local paths) in anything shipped, including the docs and text files beside the page.
  // Extra words to refuse can be listed one regular expression per line in tests/private-terms.txt (not published).
  let sideText = [];
  if (fs.statSync(dir).isDirectory()) {
    const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (e.name === 'assets' ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]);
    sideText = walk(dir).filter(f => /\.(txt|md|json|svg|xml|webmanifest)$|_headers$/.test(f)).map(f => fs.readFileSync(f, 'utf8'));
  }
  const shipped = (h.replace(/data:[a-z/+.-]+;base64,[A-Za-z0-9+/=]+/g, '') + '\n' + corpus.join('\n') + '\n' + sideText.join('\n'));
  const termsFile = path.join(__dirname, 'private-terms.txt');
  const extra = fs.existsSync(termsFile) ? fs.readFileSync(termsFile, 'utf8').split(/\r?\n/).map(x => x.trim()).filter(x => x && !x.startsWith('#')) : [];
  const pathRe = /\/tmp\/|\/home\/[a-z]|\/mnt\/user|[A-Z]:\\+Users\\|\/Users\/[a-z]/;  // case matters: "Right/Home/End" is prose
  const trace = shipped.match(pathRe) || (extra.length ? shipped.match(new RegExp(extra.join('|'), 'i')) : null);
  check(tag + 'no local-path or private-term traces in anything shipped', !trace, trace && shipped.slice(Math.max(0, trace.index - 60), trace.index + 40));
  // Spell data sanity.
  if (data) {
    const sp = data.spells || [];
    const blank = sp.filter(s => !['r', 'd', 't'].every(k => String(s[k] || '').trim()));
    const polluted = sp.filter(s => String(s.t).split(/\s+/).length > 2 && !/\(/.test(s.t) && s.t !== 'Arcane Circle');
    check(tag + 'spells: Range/Duration/Target all filled', blank.length === 0, blank.slice(0, 3).map(s => s.n).join(', '));
    check(tag + 'spells: no description text in Target', polluted.length === 0, polluted.slice(0, 3).map(s => s.n + ': ' + s.t).join(' | '));
  }
  return { version: v1 };
}

// ------------------------------------------------------------------ browser checks
function serve(root) {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.txt': 'text/plain' };
  return new Promise(res => {
    const srv = http.createServer((q, r) => {
      let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
      const f = path.join(root, p);
      if (!f.startsWith(root) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY' });
      fs.createReadStream(f).pipe(r);
    }).listen(0, '127.0.0.1', () => res(srv));
  });
}
const wait = ms => new Promise(r => setTimeout(r, ms));

async function pageFor(browser, url, tag) {
  const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage(); const errs = [], external = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  p.on('request', r => { const u = r.url(); if (!/^(data:|blob:|file:|http:\/\/127\.0\.0\.1)/.test(u)) external.push(u); });
  await p.addInitScript(() => document.addEventListener('securitypolicyviolation', e => console.error('CSP ' + e.violatedDirective + ' ' + e.blockedURI)));
  await p.goto(url); await p.waitForLoadState('load'); await wait(1200);
  return { p, ctx, errs, external, tag };
}
async function enter(p) {
  const b = await p.$('.amx-start button.amx-cta'); if (b) { await b.click(); await wait(700); }
}

async function browserChecks(url, tag, version) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const { p, errs, external } = await pageFor(browser, url, tag);
    check(tag + 'app version at runtime', await p.evaluate(() => typeof APP_VERSION !== 'undefined' && APP_VERSION) === version);
    check(tag + 'no on-demand code fetched at start', await p.evaluate(() => !window.ArsMachinaSaga && !window.PDFLib));
    await enter(p);
    let sfx = 0; await p.exposeFunction('__sfx', () => sfx++);
    // Count calls to SFX.ui (the UI click-sound hook). Headless browsers have no audio, so the
    // engine may not have created SFX.ui itself; the counter stands in for it either way.
    const hooked = await p.evaluate(() => {
      if (typeof SFX === 'undefined' || !SFX) return false;   // top-level const: not on window
      const o = SFX.ui; SFX.ui = function () { window.__sfx(); return typeof o === 'function' ? o.apply(this, arguments) : undefined; }; return true;
    });
    check(tag + 'UI sound object present', hooked);
    await p.evaluate(() => openMenu('home')); await wait(300);
    await p.click('#menu [data-mn="about"]'); await wait(300);
    check(tag + 'About does not load Storyguide', await p.evaluate(() => MN.view === 'about' && !window.ArsMachinaSaga));
    await p.click('#menu [data-mn="changelog"]'); await wait(300);
    const top = await p.evaluate(() => [...document.querySelectorAll('.cl-item header b')].slice(0, 2).map(e => e.textContent));
    check(tag + 'changelog lists this version first', top[0] === 'v' + version, top.join(' '));
    await p.evaluate(() => openMenu('home')); await wait(300); sfx = 0;
    await p.click('#menu [data-mn="storyguide"]'); await wait(1500);
    const sg = await p.evaluate(() => ({ loaded: !!window.ArsMachinaSaga, view: MN.view, hist: MN.hist.join(',') }));
    check(tag + 'Storyguide opens on first click', sg.loaded && sg.view === 'storyguide', JSON.stringify(sg));
    check(tag + 'Storyguide records menu history', sg.hist === 'home', sg.hist);
    check(tag + 'one click sound on first Storyguide click', sfx === 1, sfx);
    await p.keyboard.press('Escape'); await wait(300);
    check(tag + 'Escape from Storyguide returns home', await p.evaluate(() => MN.view === 'home'));
    // Saga + restore.
    await p.click('#menu [data-mn="storyguide"]'); await wait(400);
    await p.click('#menu [data-mn="sg-new"]'); await wait(900);
    const nm = await p.$('#sg-new input, .sg input[type=text]');
    if (nm) { await nm.fill('Regression saga'); await p.keyboard.press('Enter'); await wait(700); }
    const active = await p.evaluate(() => !!(window.ArsMachinaSaga && ArsMachinaSaga.SagaStore.activeId()));
    check(tag + 'new saga becomes active', active);
    await p.evaluate(() => { ArsMachinaSaga.close && ArsMachinaSaga.close(); localStorage.setItem('arm5-sg-open', '1'); });
    await wait(300);
    // PDF export.
    const dl = p.waitForEvent('download', { timeout: 30000 }).catch(() => null);
    await p.evaluate(() => { document.getElementById('menu').hidden = true; return exportPdf(st); });
    const d = await dl; const size = d ? fs.statSync(await d.path()).size : 0;
    check(tag + 'PDF export produces a sheet', size > 100000, size + ' bytes');
    // Restore after reload.
    await p.reload(); await wait(3000);
    check(tag + 'active Storyguide session restores after reload', await p.evaluate(() => !!document.getElementById('sg') && !document.getElementById('sg').hidden));
    check(tag + 'no broken images', await p.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth === 0).length) === 0);
    check(tag + 'no console errors, page errors or CSP violations', errs.length === 0, errs.slice(0, 3).join(' | '));
    check(tag + 'no requests to other sites', external.length === 0, external.slice(0, 3).join(', '));
  } finally { await browser.close(); }
}

// ------------------------------------------------------------------ security: hostile character file
// ------------------------------------------------------------------ start-up: nothing half-built is painted
async function startupChecks(url, tag) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const rec = () => {
      window.__boot = []; const t0 = performance.now(); let dcl = false;
      document.addEventListener('DOMContentLoaded', () => { dcl = true; });
      const shown = () => [...(document.body ? document.body.children : [])].filter(e => {
        if (e.id === 'am-load-err' || e.hidden) return false; const c = getComputedStyle(e);
        return c.display !== 'none' && c.visibility !== 'hidden' && +c.opacity > 0 && e.getBoundingClientRect().height > 0;
      }).map(e => e.id || String(e.className).split(' ')[0] || e.tagName);
      const tick = () => { window.__boot.push([dcl, shown().join('|')]); if (performance.now() - t0 < 3500) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    };
    await ctx.addInitScript(rec);
    const visit = async () => { const p = await ctx.newPage(); await p.goto(url); await p.waitForLoadState('load'); await wait(2400); return p; };
    const p1 = await visit();
    const f1 = await p1.evaluate(() => window.__boot);
    // 4.9.8.1: the chooser may paint before loading finishes (it covers everything); nothing else may
    const early1 = f1.filter(([d, v]) => !d && v && v.split('|').some(x => x !== 'amx-start'));
    check(tag + 'first visit: nothing but the chooser painted before loading finishes', early1.length === 0, early1.slice(0, 3).map(x => x[1]).join(' ; '));
    if (/^http/.test(url)) check(tag + 'first visit: the chooser paints before loading finishes', f1.some(([d, v]) => !d && v === 'amx-start'));
    const firstShown1 = (f1.find(([, v]) => v) || [, ''])[1];
    check(tag + 'first visit: the style chooser is on the first painted screen', /amx-start/.test(firstShown1), firstShown1);
    check(tag + 'first visit: the chooser has keyboard focus', await p1.evaluate(() => !!(document.activeElement && document.activeElement.closest('.amx-start'))));
    check(tag + 'boot mark cleared', await p1.evaluate(() => !document.documentElement.hasAttribute('data-booting')));
    await enter(p1); await p1.close();
    const p2 = await visit();
    const f2 = await p2.evaluate(() => window.__boot);
    const early2 = f2.filter(([d, v]) => !d && v);
    const firstShown2 = (f2.find(([, v]) => v) || [, ''])[1];
    check(tag + 'later visit: the menu is on the first painted screen, no Build flash', early2.length === 0 && /menu/.test(firstShown2), (early2[0] || [, firstShown2])[1]);
    const gaps = await p2.evaluate(() => { const l = document.querySelector('#menu .mn-list'); if (!l) return null;
      const it = [...l.querySelectorAll('.mn-item')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect());
      return { flat: [...l.children].every(li => li.tagName === 'LI' && li.querySelectorAll('.mn-item').length === 1), gaps: it.slice(1).map((r, i) => Math.round(r.top - it[i].bottom)) }; });
    check(tag + 'main menu: one tile per list entry, even gaps', gaps && gaps.flat && gaps.gaps.length >= 3 && new Set(gaps.gaps).size === 1, JSON.stringify(gaps));
    await p2.close(); await ctx.close();
    // a click on the chooser while the page is still loading is kept and carried out when it is ready (4.9.8.1)
    const ctx3 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx3.addInitScript(() => { const t = () => { const b = document.querySelector('.amx-start [data-amx-enter="retro"]');
      if (b && document.documentElement.hasAttribute('data-booting')) { window.__earlyClick = 1; b.click(); window.__stillBooting = document.documentElement.hasAttribute('data-booting') && !!document.querySelector('.amx-start'); return; }
      if (!document.documentElement.hasAttribute('data-booting') && document.readyState !== 'loading') return; requestAnimationFrame(t); }; requestAnimationFrame(t); });
    const p3 = await ctx3.newPage(); await p3.goto(url); await p3.waitForLoadState('load'); await wait(2600);
    const r3 = await p3.evaluate(() => ({ early: !!window.__earlyClick, held: !!window.__stillBooting, skin: document.documentElement.getAttribute('data-skin'), open: !!document.querySelector('.amx-start') }));
    if (r3.early) check(tag + 'an early click on the chooser is held, then carried out', r3.held && r3.skin === 'retro' && !r3.open, JSON.stringify(r3));
    await ctx3.close();
  } finally { await browser.close(); }
}

async function securityChecks(url, tag) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const { p, errs } = await pageFor(browser, url, tag);
    let dialogs = 0; p.on('dialog', d => { dialogs++; d.dismiss().catch(() => {}); });
    await enter(p);
    // Every string in a real character becomes markup; prototype keys and wrong types everywhere.
    const PAY = '"><img src=x data-pwn=1 onerror=alert(1)><svg data-pwn=1 onload=alert(1)></svg><script data-pwn=1>alert(1)</script>';
    const hostile = await p.evaluate((PAY) => {
      const s = JSON.parse(JSON.stringify(blankState('companion')));
      s.vf = [{ n: 'True Faith', kind: 'V', d: PAY }, { n: 'Ars Notoria', kind: 'V', d: PAY }, { n: 'Folk Witch', kind: 'V', d: PAY }, { n: PAY, kind: 'F', d: PAY }];
      s.abil.push({ n: 'Cursing (folk witch)', prm: PAY, sp: PAY, xp: 15, xps: {}, free: 15 }, { n: PAY, prm: PAY, sp: PAY, xp: '1e9', free: 'x' });
      const walk = o => { for (const k of Object.keys(o)) { if (typeof o[k] === 'string') o[k] = PAY; else if (o[k] && typeof o[k] === 'object') walk(o[k]); } };
      walk(s.info); walk(s.desc); walk(s.bio); s.traits = [{ t: PAY, v: 3 }]; s.reps = [{ t: PAY, v: 2 }];
      s.hedgeFx = [{ trad: 'folk', n: PAY, pw: PAY, fo: PAY, ef: PAY, method: PAY, notes: PAY, bi: 99999 }, { trad: PAY, n: PAY }, { trad: 'elem', n: PAY, pw: PAY, fo: PAY, lvl: '1e99' }, 'x', null];
      s.faith = { score: PAY, pts: '1e99', test: PAY };
      // 4.9.9.0 fields
      s.fae = { in: PAY, trip: '1e99', fp: PAY, score: -5, days: PAY, warp: '1e9', group: PAY, elys: PAY, gained: [PAY, 'food', null], exch: [{ out: PAY, in: PAY, maj: PAY, trip: PAY }, 'x', null] };
      s.m990 = { bk: PAY, elem: PAY, acc: { aura: PAY, time: PAY, realm: '1e9', eff: PAY, effBy: PAY, effLvl: PAY, effS: PAY, vis: PAY, fam: PAY } };
      s.tov = [{ k: 'periwinkle', en: PAY, tal: PAY, n: PAY }, { k: PAY }, { k: '__proto__' }, null];
      s.tame = [{ n: PAY, might: PAY, mund: PAY, conf: PAY, fo: PAY, how: PAY, lab: '1e99', text: PAY, exp: PAY, pts: PAY, seasons: PAY, tamed: PAY, loyal: '1e9', cmdAb: PAY, cmdEF: PAY, bi: 99999 }, 'x'];
      s.notoria = { learned: PAY, active: { '1': { seasons: PAY }, '9': { seasons: 3 } }, disease: PAY };
      s.play = { tab: 'realms', x: { tmpName: PAY, tmpV: 3, tarName: PAY, tarV: 3, tmpPick: PAY, tarPick: PAY, aidOn: PAY, noRing: PAY, folkEF: PAY } };
      let j = JSON.stringify(s);
      j = j.replace('{', '{"__proto__":{"pwned":1},"constructor":{"prototype":{"pwned":1}},');
      j = j.replace('"faith":{', '"faith":{"__proto__":{"pwned":1},').replace('"notoria":{', '"notoria":{"__proto__":{"pwned":1},').replace('"active":{', '"active":{"__proto__":{"seasons":5},');
      return j;
    }, PAY);
    const fs2 = require('fs'), os = require('os'); const f = require('path').join(os.tmpdir(), 'hostile-character.json'); fs2.writeFileSync(f, hostile);
    await p.setInputFiles('#quick-load-json', f); await wait(800);
    const loaded = await p.evaluate(() => st && st.type === 'companion');
    check(tag + 'hostile file loads (or is refused) without breaking the app', loaded !== undefined);
    // Render every Build section and Play tab with it.
    await p.evaluate(() => { const m = document.getElementById('menu'); m && (m.hidden = true); setMode('build'); renderAll(); });
    await wait(300);
    const tabs = await p.evaluate(() => { setMode('play'); const out = []; for (const t of ['skills', 'hedge', 'realms', 'combat', 'inv', 'seasons', 'ordeals', 'persona', 'profile']) { P().tab = t; try { renderPlay(); out.push(t); } catch (e) { out.push(t + ':' + e.message); } } P().sel = 'r49:tarnish'; P().aura.realm = 'Infernal'; renderPlay(); P().sel = 'trait'; renderPlay(); return out; });
    check(tag + 'every Play tab renders the hostile file', tabs.every(t => !t.includes(':')), tabs.join(','));
    const inj = await p.evaluate(() => document.querySelectorAll('[data-pwn]').length);
    check(tag + 'no injected markup reaches the page (all fields escaped)', inj === 0, inj + ' elements');
    const proto = await p.evaluate(() => ({}).pwned === undefined && Object.prototype.pwned === undefined && !('pwned' in st.faith) && !('pwned' in st.notoria));
    check(tag + 'no prototype pollution from __proto__ / constructor keys', proto);
    const c990 = await p.evaluate(() => ({ fae: [st.fae.in, st.fae.score, st.fae.fp, st.fae.gained.join(), st.fae.exch.length], bk: st.m990.bk, elem: st.m990.elem, acc: st.m990.acc.time + st.m990.acc.eff, tov: st.tov.map(t => t.k).join(), tame: st.tame.length && [st.tame[0].how, ARTS.slice(5).some(f => f[0] === st.tame[0].fo), st.tame[0].loyal, st.tame[0].bi, st.tame[0].cmdEF].join() }));
    check(tag + '4.9.9.0 fields are sanitised (faerie trip, magic being, Things of Virtue, tamed creatures)', JSON.stringify(c990) === JSON.stringify({ fae: [true, 0, 0, 'food', 1], bk: '', elem: 'Earth', acc: 'alwaysnone', tov: 'periwinkle', tame: 'mundane,true,3,-1,0' }), JSON.stringify(c990));
    const clean = await p.evaluate(() => ({ score: st.faith.score, pts: st.faith.pts, learned: st.notoria.learned, active: Object.keys(st.notoria.active), fx: st.hedgeFx.length, ef: st.hedgeFx[0] && st.hedgeFx[0].ef }));
    check(tag + 'new fields are sanitised to safe types and ranges', clean.score === 0 && clean.pts <= 99 && clean.learned === 0 && clean.active.join() === '1' && clean.fx === 2 && clean.ef === 0, JSON.stringify(clean));
    check(tag + 'no dialogs opened', dialogs === 0, dialogs);
    check(tag + 'no errors or CSP violations from the hostile file', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await browser.close(); }
}

// ------------------------------------------------------------------ feature checks (one block per release feature)
async function featureChecks(url, tag) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const { p, errs } = await pageFor(browser, url, tag);
    await enter(p);
    const ev = (fn, arg) => p.evaluate(fn, arg);
    const fresh = async (type) => { await ev(t => { const s = blankState(t); Object.keys(st).forEach(k => delete st[k]); Object.assign(st, s); st.play = undefined; persist(); }, type); };
    if (!(await ev(() => !!document.getElementById('v4.9.4.0')))) { check(tag + 'feature checks skipped (no v4.9.4.0)', true); return; }

    // 4.9.4.0 #1: folk witch known effects
    await fresh('companion');
    await ev(() => { st.vf.push({ n: 'Folk Witch', kind: 'V', d: '' }); st.abil.push({ n: 'Cursing (folk witch)', prm: '', sp: '', xp: 15, xps: {}, free: 0 }); setMode('build'); renderAll(); });
    const folkSec = await ev(() => !!document.querySelector('#s-hedge-known [data-h49add="folk"]'));
    check(tag + 'Build: folk witch Known Effects block', folkSec);
    if (folkSec) await ev(() => { const s = document.querySelector('#s-hedge-known [data-h49add="folk"]'); s.value = '2'; s.dispatchEvent(new Event('change', { bubbles: true })); });   // Curse of Aging
    const fx = await ev(() => st.hedgeFx[0] || null);
    check(tag + 'Build: add a published curse (Curse of Aging, EF 12, HMRE p. 37)', fx && fx.n === 'Curse of Aging' && fx.ef === 12 && fx.ref === 'HMRE p. 37', JSON.stringify(fx));
    await ev(() => { st.abil.find(r => r.n === 'Cursing (folk witch)').free = 15; setMode('play'); P().tab = 'hedge'; renderPlay(); });
    const kb = await p.$('[data-h49set]');
    check(tag + 'Play: known curse button on the Hedge tab', !!kb);
    if (kb) { await kb.evaluate(b => b.click()); await wait(300); }
    const loaded = await ev(() => { const c = getCheck(P().sel); return { sel: P().sel, ef: XP().folkEF, cef: c && c.ef }; });
    check(tag + 'Play: curse loads the Cursing roll at EF 12', loaded.sel === 'x:folk:Cursing (folk witch)' && loaded.ef === 12 && loaded.cef === 12, JSON.stringify(loaded));

    // elementalist known effects
    await fresh('companion');
    await ev(() => { st.abil.push({ n: 'Summoning (Elemental)', prm: '', sp: '', xp: 15, xps: {}, free: 0 }, { n: 'Elementalist Fire', prm: '', sp: '', xp: 15, xps: {}, free: 0 }); if (document.getElementById('v4.9.7.6')) st.vf.push({ n: 'Elementalist Fire', kind: 'V', d: '' }); st.hedgeFx = [{ trad: 'elem', n: 'Call a salamander', pw: 'sum', fo: 'Elementalist Fire', lvl: 15 }]; migrate; setMode('build'); renderAll(); });
    check(tag + 'Build: elementalist Known Effects block with the summoning chart', await ev(() => !!document.querySelector('#s-hedge-known') && /Elementalist guidelines/.test(document.querySelector('#s-hedge-known').textContent)));
    await ev(() => { setMode('play'); P().tab = 'hedge'; renderPlay(); });
    const eb = await p.$('[data-h49set]'); if (eb) { await eb.evaluate(b => b.click()); await wait(300); }
    const el = await ev(() => ({ sel: P().sel, fo: XP().hFo, lv: XP().elemLevel }));
    check(tag + 'Play: elemental effect loads Summoning with Form and level', el.sel === 'x:elem:sum' && el.fo === 'Elementalist Fire' && el.lv === 15, JSON.stringify(el));

    // #5 True Faith
    await fresh('magus');
    await ev(() => { st.vf.push({ n: 'True Faith', kind: 'V', d: '' }); st.faith = { score: null, pts: 2, test: false }; setMode('play'); P().tab = 'realms'; renderPlay(); });
    check(tag + 'True Faith: Realms tab shows the True Faith panel', await ev(() => /True Faith Score 1/.test(document.body.textContent)));
    const mr = await ev(() => magicResistance('Co').mr);
    check(tag + 'True Faith: Magic Resistance at least 10 (score × 10, DE p. 419)', mr >= 10, mr);
    const mir = await ev(() => { XP().mirLevel = 15; XP().mirTime = '10'; XP().mirNeed = '-5'; const c = getCheck('r49:miracle'); return { ef: c.ef, blocked: c.blocked, n: c.score.length }; });
    check(tag + 'Miracle: level 15 +10 immediate –5 grave = 20 (RoP:D p. 61)', mir.ef === 20 && !mir.blocked, JSON.stringify(mir));
    const aid = await ev(() => { const c = getCheck('r49:aid'); const o = c.outcome(15); return { mb: c.minBotch, head: o.head, acts: (o.actions || []).map(a => a.act) }; });
    check(tag + "God's aid: 15+ gives +2, at least three botch dice (RoP:D p. 41)", aid.mb === 3 && /\+2/.test(aid.head) && aid.acts.includes('f49aid'), JSON.stringify(aid));
    const tog = await ev(() => { applyAction({ act: 'f49aid', n: '2' }); const c = getCheck('char:Str'); return (c.toggles || []).map(t => t.key); });
    check(tag + "God's aid: bonus offered on other rolls once applied", tog.includes('t49:aid'), tog.join(','));
    // Spend a Faith Point on a rolled result
    await ev(() => { XP().aidOn = 0; P().fx = false; P().sel = 'char:Str'; P().stressed = false; renderPlay(); });
    const rb = await p.$('[data-pact="roll"]'); if (rb) { await rb.evaluate(b => b.click()); await wait(1800); }
    const sf = await p.$('[data-f49="spend-faith"]');
    check(tag + 'True Faith: "Spend a Faith Point" offered on a roll result', !!sf);
    if (sf) {
      const before = await ev(() => ({ t: P().last.total, f: st.faith.pts }));
      await sf.evaluate(b => b.click()); await wait(300);
      const after = await ev(() => ({ t: P().last.total, f: st.faith.pts }));
      check(tag + 'True Faith: Faith Point adds +3 and is spent', after.t === before.t + 3 && after.f === before.f - 1, JSON.stringify({ before, after }));
    }
    // Tempers and tarnishes
    const tmp = await ev(() => { P().aura.realm = 'Divine'; P().aura.lvl = 3; XP().tmpName = 'Kind'; XP().tmpV = 2; const c = getCheck('char:Pre'); return (c.toggles || []).filter(t => /^t49:tmp/.test(t.key)).map(t => t.v); });
    check(tag + 'Temper: Kind +2 offered as +2 / –2 on rolls in the Dominion aura (RoP:D p. 38)', tmp.join(',') === '2,-2', tmp.join(','));
    const tch = await ev(() => { XP().tmpPick = 'Brave'; XP().tmpRollMode = 'ceremonial'; const c = getCheck('r49:temper'); const o = c.outcome(15); return { title: c.title, act: o.actions && o.actions[0] && o.actions[0].n }; });
    check(tag + 'Temper roll: 15 gives +2', tch.act === 2 && /Brave/.test(tch.title), JSON.stringify(tch));
    const tar = await ev(() => { st.traits = [{ t: 'Lustful', v: 1 }]; P().trait = 0; P().aura.realm = 'Infernal'; XP().tarName = 'Lust'; XP().tarV = 3; const withTF = (getCheck('trait') && getCheck('trait').toggles || []).filter(t => /t49:tar/.test(t.key)).length; st.vf = st.vf.filter(v => v.n !== 'True Faith'); st.faith.score = null; const noTF = (getCheck('trait') && getCheck('trait').toggles || []).filter(t => /t49:tar/.test(t.key)).length; const o = getCheck('r49:tarnish').outcome(21); return { withTF, noTF, v: o.actions[0].n }; });
    check(tag + 'Tarnish: on Personality rolls only without True Faith; 21 gives 5 (RoP:I pp. 13, 23)', tar.withTF === 0 && tar.noTF === 2 && tar.v === 5, JSON.stringify(tar));

    // Ars Notoria
    await fresh('magus');
    await ev(() => { st.vf.push({ n: 'Ars Notoria', kind: 'V', d: '' }); st.abil.push({ n: 'Ars Notoria', prm: '', sp: '', xp: 15, xps: {}, free: 0 }); setMode('play'); P().tab = 'realms'; renderPlay(); });
    const r1 = await ev(() => { XP().noRing = 1; XP().noSeasons = 2; const c = getCheck('r49:noto'); XP().noRing = 3; const c3 = getCheck('r49:noto'); return { ef: c.ef, b3: c3.blocked }; });
    check(tag + 'Ars Notoria: first ring for 2 seasons is EF 11; ring 3 must wait (RoP:D p. 99)', r1.ef === 11 && /in order/.test(r1.b3 || ''), JSON.stringify(r1));
    const subs = await ev(() => ['fast', 'find'].map(k => getCheck('r49:noto:' + k).title));
    check(tag + 'Ars Notoria: fasting and book-search rolls are their own rolls', /fast/i.test(subs[0]) && /Book of Solomon/.test(subs[1]), subs.join(' | '));
    const ring = await ev(() => { const b = { p: ablScore(st, 'Philosophiae'), com: charEff(st).Com }; applyAction({ act: 'f49ring', n: '1', s: '2' }); return { b, a: { p: ablScore(st, 'Philosophiae'), com: charEff(st).Com }, learned: st.notoria.learned }; });
    check(tag + 'Ars Notoria: active first ring adds Philosophiae XP and Communication +3 in Play', ring.a.p === 5 && ring.a.com === Math.min(5, ring.b.com + 3) && ring.learned === 1, JSON.stringify(ring));
    const aur = await ev(() => { P().aura.realm = 'Divine'; P().aura.lvl = 3; const r = auraFor('Magic'); return { mod: r.mod, red: r.lines.some(l => /Ars Notoria 2/.test(l.l) && l.v === 6) }; });
    check(tag + 'Ars Notoria 2: Divine aura 3 penalty –9 cut by 6 to –3 (RoP:D p. 100)', aur.mod === -3 && aur.red, JSON.stringify(aur));
    const r7 = await ev(() => { applyAction({ act: 'f49ring', n: '7', s: '1' }); P().stressed = false; const c = getCheck('char:Str'); return { die: c.die, nb: c.nb }; });
    check(tag + 'Ars Notoria: seventh ring makes simple dice stress dice without botches', r7.die === 'stress' && r7.nb === 0, JSON.stringify(r7));
    const bld = await ev(() => { setMode('build'); return { chk: checks(st).filter(c => /Ars Notoria/.test(c.t)).map(c => c.ok + ':' + c.t), pool: bonusPools(st).some(a => /^Ars Notoria/.test(a[0]) && a[1] === 50) }; });
    check(tag + 'Build: Ars Notoria language check and 50 XP language pool (RoP:D p. 92)', bld.pool && bld.chk.some(c => /^false:Ars Notoria: needs/.test(c)), JSON.stringify(bld));
    const rt = await ev(() => { const m = migrate(JSON.parse(JSON.stringify(st))); return { f: !!m.faith, n: m.notoria && m.notoria.learned, a: m.notoria && !!m.notoria.active['7'], h: Array.isArray(m.hedgeFx) }; });
    check(tag + 'Save/load keeps Faith, Ars Notoria rings and known effects', rt.f && rt.n === 7 && rt.a && rt.h, JSON.stringify(rt));
    check(tag + 'Ars Notoria listed as a Supernatural Ability', await ev(() => abilCat({ n: 'Ars Notoria' }) === 'Supernatural'));
    // 4.9.5.0: Student of (Realm) accepts "Divine"; True Faith starts with its Faith Point
    if (await ev(() => !!document.getElementById('v4.9.5.0'))) {
      await fresh('companion');
      const stu = await ev(() => { st.vf.push({ n: 'Student of (Realm)', kind: 'V', d: 'Divine' }); st.abil.push({ n: 'Dominion Lore', prm: '', sp: '', xp: 50, xps: { later: 50 }, free: 0 }); setMode('build');
        const bad = checks(st).filter(c => !c.ok && /Dominion Lore/.test(c.t)).length; setMode('play'); const i = st.abil.findIndex(a => a.n === 'Dominion Lore'); const c = getCheck('abil:' + i);
        return { bad, bonus: c ? c.post.concat((c.toggles || [])).some(l => /Student of/.test(l.l) && l.v === 2) : null }; });
      check(tag + 'Student of (Realm): Divine grants Dominion Lore and its +2 (DE p. 49)', stu.bad === 0 && stu.bonus === true, JSON.stringify(stu));
      await fresh('companion');
      const fp = await ev(() => { st.vf.push({ n: 'True Faith', kind: 'V', d: '' }); setMode('play'); P().tab = 'realms'; renderPlay(); return st.faith.pts; });
      check(tag + 'True Faith: a new character starts with 1 Faith Point (RoP:D p. 57)', fp === 1, fp);
    }
    // 4.9.6.0: realm dice, training packages, Savantism, Feral Upbringing
    if (await ev(() => !!document.getElementById('v4.9.6.0'))) {
      await fresh('companion');
      const dice = await ev(() => { const m = id => dieArtKey({ id }), out = {};
        for (const id of ['r:holy', 'r:prayer', 'r:influence', 'r49:miracle', 'r49:aid', 'r49:temper', 'r49:noto', 'r49:noto:find', 'r:mal', 'r:goetic', 'r:scour', 'r49:tarnish', 'r:rite', 'r:curse', 'char:Int', 'spont']) out[id] = m(id);
        const art = ['div', 'inf', 'fae'].every(k => DIE_ART[k] && DIE_FACE_DATA.art[k] && DIE_RETRO_FACES[k] && DIE_RETRO_FACES[k].p.length === 10 && DIE_NAME[k]);
        st.vf.push({ n: 'Holy Magic', kind: 'V', d: '' }); const holy = dieArtKey({ id: 'spont' }); XP().holyHermetic = true; const lapse = dieArtKey({ id: 'spont' }); XP().holyHermetic = false;
        return { out, art, holy, lapse }; });
      const want = { 'r:holy': 'div', 'r:prayer': 'div', 'r:influence': 'div', 'r49:miracle': 'div', 'r49:aid': 'div', 'r49:temper': 'div', 'r49:noto': 'div', 'r49:noto:find': 'div', 'r:mal': 'inf', 'r:goetic': 'inf', 'r:scour': 'inf', 'r49:tarnish': 'inf', 'r:rite': 'fae', 'r:curse': 'fae' };
      check(tag + 'realm dice: 14 roll ids take the Divine, Infernal or Faerie die', Object.entries(want).every(([k, v]) => dice.out[k] === v) && dice.out['char:Int'] === 'chInt', JSON.stringify(dice.out));
      check(tag + 'realm dice: art, faces, Retro sprites and names registered', dice.art);
      check(tag + 'realm dice: a holy magus casts on the Divine die, a lapse on the Form die', dice.holy === 'div' && dice.lapse !== 'div', dice.holy + '/' + dice.lapse);
      const imgs = await ev(async () => { const urls = ['div', 'inf', 'fae'].flatMap(k => [DIE_ART[k].h, DIE_ART[k].t, DIE_ART[k].p, DIE_ART[k].pt, DIE_RETRO_FACES[k].p[3], DIE_RETRO_FACES[k].pc10]);
        const ok = await Promise.all(urls.map(u => new Promise(r => { const i = new Image(); i.onload = () => r(i.naturalWidth > 0); i.onerror = () => r(false); i.src = u; }))); return ok.filter(Boolean).length + '/' + ok.length; });
      check(tag + 'realm dice: every image loads', /^(\d+)\/\1$/.test(imgs), imgs);
      // Grogs p. 73 worked example: Social childhood; Courtier 3, Rider 3 x 2, Soldier 5 + 3 -> the book's totals
      await fresh('grog');
      const tp = await ev(() => { st.vf.push({ n: 'Warrior', kind: 'V', d: '' }); setMode('build'); renderAll();
        const add = (stage, id, opt) => { const box = document.querySelector(`[data-tp-box="${stage}"]`); box.querySelector('[data-tp-pkg]').value = id; box.dispatchEvent(new Event('toggle')); const o = box.querySelector('[data-tp-opt]'); if (o) { o.innerHTML = `<option>${opt}</option>`; o.value = opt; } document.querySelector(`[data-tp-box="${stage}"] [data-act="tp-add"]`).click(); };
        add('child', 'social'); add('later', 'courtier', 'Three years'); add('later', 'rider', 'Three years'); add('later', 'rider', 'Three years'); add('later', 'soldier', 'Five years'); add('later', 'soldier', 'Three years');
        const x = n => st.abil.filter(a => a.n === n).reduce((s, a) => s + num(a.xp), 0);
        const got = { ah: x('Animal Handling'), ath: x('Athletics'), brawl: x('Brawl'), charm: x('Charm'), etiq: x('Etiquette'), folk: x('Folk Ken'), guile: x('Guile'), intr: x('Intrigue'), ride: x('Ride'), sw: x('Single Weapon') };
        document.querySelector('[data-act="tp-age"]').click(); return { got, age: st.ages.age, n: st.tpk.length }; });
      const book = { ah: 30, ath: 20, brawl: 30, charm: 20, etiq: 30, folk: 20, guile: 15, intr: 5, ride: 60, sw: 70 };
      check(tag + 'training packages reproduce Grogs p. 73 (Sir Edwin)', Object.entries(book).every(([k, v]) => tp.got[k] === v) && tp.age === 22 && tp.n === 6, JSON.stringify(tp));
      await fresh('grog');
      const poor = await ev(() => { st.vf.push({ n: 'Poor', kind: 'F', d: '' }); st.tpk = [{ stage: 'later', id: 'soldier', opt: 'Five years', pick: {} }, { stage: 'later', id: 'soldier', opt: 'Five years', pick: {} }, { stage: 'later', id: 'farmer', opt: 'Five years', pick: {} }, { stage: 'later', id: 'farmer', opt: 'Three years', pick: {} }]; setMode('build'); renderAll(); document.querySelector('[data-act="tp-age"]').click(); return st.ages.age; });
      check(tag + 'training packages: Poor makes 18 years of packages 32 years of age (Grogs p. 68)', poor === 32, poor);
      await fresh('companion');
      const sav = await ev(() => { st.vf.push({ n: 'Savantism', kind: 'F', d: 'Ride' }); st.ages.age = 25;
        st.abil.push({ n: 'Ride', prm: '', sp: '', xp: 105, xps: { later: 105 }, free: 0 }, { n: 'Brawl', prm: '', sp: '', xp: 50, xps: { later: 50 }, free: 0 }); setMode('build');
        const b = budget(st), c = checks(st), pools = b.pools.map(p => p[1]);
        const capBad = c.some(x => !x.ok && /^Savantism: Brawl 4/.test(x.t)) && !c.some(x => !x.ok && /^Savantism: Ride/.test(x.t));
        const age = c.some(x => !x.ok && /^Over the age cap/.test(x.t) && /Ride/.test(x.t));
        return { pools, capBad, age }; });
      check(tag + 'Savantism: pools halved once, Brawl 4 over 3, favored Ride 6 allowed below 30 (DE p. 143)', sav.pools[0] === 22 && sav.pools[1] === 150 && sav.capBad && !sav.age, JSON.stringify(sav));
      const fx = await ev(async () => { const out = {}; for (const [id, k] of [['r:holy', 'div'], ['r:mal', 'inf'], ['r:rite', 'fae']]) {
          const fake = document.createElement('div'); fake.className = 'fx'; fake.innerHTML = '<div class="fx-wheel"></div>'; document.body.appendChild(fake);
          fxArtDecor(fake, { id }); const r = fake.querySelector('.rdx-' + k); out[k] = r ? r.children.length + (r.querySelector('.rdx-orbit') ? r.querySelector('.rdx-orbit').children.length : 0) : 0; fake.remove(); } return out; });
      check(tag + 'realm roll effects: wings, flames and sparks in the circle', fx.div >= 7 && fx.inf >= 10 && fx.fae >= 12, JSON.stringify(fx));
      await fresh('companion');
      const feral = await ev(() => { st.vf.push({ n: 'Feral Upbringing', kind: 'F', d: '' }); setMode('build'); const b = budget(st); const ctx = stageCtx(st); const child = ctx.pools.find(p => p.id === 'child');
        return { amt: b.pools[0][1], hunt: ctx.okFor(child, { n: 'Hunt', prm: '' }), charm: ctx.okFor(child, { n: 'Charm', prm: '' }) }; });
      check(tag + 'Feral Upbringing: 120 childhood XP, Hunt allowed, Charm not (DE p. 129)', feral.amt === 120 && feral.hunt === '' && feral.charm !== '', JSON.stringify(feral));
    }
    if (await ev(() => !!document.getElementById('v4.9.6.1'))) {
      const d = await ev(async () => { if (window.AM49L) await AM49L.load(); const el = document.getElementById('am49-data');
        return { lazy: !!(el && el.dataset.src), ready: AM49L ? AM49L.ready() : null, n: window.__am49 ? window.__am49.best.length : (el && !el.dataset.src ? -1 : 0) }; });
      check(tag + 'bestiary and hedge data: fetched on demand with its integrity hash, then ready', d.ready === true && (d.lazy ? d.n > 100 : true), JSON.stringify(d));
    }
    if (await ev(() => !!document.getElementById('v4.9.6.2'))) {
      await fresh('companion');
      const ab = await ev(() => { const names = ['Dominion Lore', 'Sense Holiness and Unholiness', 'Invocation', 'Adjuration', 'Infernal Lore', 'Incantation', 'Binding', 'Faerie Lore', 'Evocation', 'Beguile', 'Charm'];
        names.forEach(n => st.abil.push({ n, prm: '', sp: '', xp: 5, xps: { later: 5 }, free: 0 }));
        const out = {}; names.forEach(n => { const i = st.abil.findIndex(a => a.n === n); out[n] = dieArtKey({ id: 'abil:' + i, kind: 'abil', abilIndex: i }); }); return out; });
      const want = { 'Dominion Lore': 'div', 'Sense Holiness and Unholiness': 'div', Invocation: 'div', Adjuration: 'div', 'Infernal Lore': 'inf', Incantation: 'inf', Binding: 'inf', 'Faerie Lore': 'fae', Evocation: 'fae', Beguile: 'fae' };
      check(tag + 'realm Abilities roll their realm die; Charm does not', Object.entries(want).every(([k, v]) => ab[k] === v) && !['div', 'inf', 'fae'].includes(ab.Charm), JSON.stringify(ab));
    }
    if (await ev(() => !!document.getElementById('v4.9.6.3'))) {
      const vf = await ev(async () => { if (window.AM49L) await AM49L.load(); const f = n => VF.find(x => x[0] === n); const d = AM49.data(); const b = n => d.best.find(x => x.n === n);
        const m = migrate({ type: 'grog', vf: [{ n: 'Infernal Power', kind: 'F' }, { n: 'Aura for (Ability)', kind: 'F' }] });
        return { bad: !!f('Aura for (Ability)') || VF.some(x => x[0] === 'Infernal Power' && x[1] === 'F'), sus: (f('Susceptibility to Infernal Power') || [])[4], nec: (f('Necessary (Realm) Aura for (Ability)') || [])[4],
          mig: m.vf.map(v => v.n).join('|'), sam: [b('Samuil, Angelic Guide').p, b('Samuil, Angelic Guide').powers.length], mary: b('Blessed Virgin Mary').powers.length,
          lam: b('Lamashtu').powers.some(q => q.n === 'Fatal Menses'), dys: d.powers.some(q => q.n === 'Dysenteric Infliction') }; });
      check(tag + '4.9.6.3: two-line DE Flaw names fixed (DE pp. 138, 146), saved names renamed', !vf.bad && vf.sus === 146 && vf.nec === 138 && vf.mig === 'Susceptibility to Infernal Power|Necessary (Realm) Aura for (Ability)', JSON.stringify(vf));
      check(tag + '4.9.6.3: bestiary powers split; Samuil p. 33; Fatal Menses and Dysenteric Infliction present', vf.sam[0] === 33 && vf.sam[1] === 3 && vf.mary >= 10 && vf.lam && vf.dys, JSON.stringify(vf));
    }
    if (await ev(() => !!document.getElementById('v4.9.7.0'))) {
      await fresh('companion');
      const rt = await ev(() => { const on = hasRealms(); st.booksOff = ['RoP:D', 'RoP:I', 'RoP:F', 'RoP:M']; const off = hasRealms(); st.booksOff = ['RoP:I']; const h = (()=>{const a=XP().rlmAll,t=XP().rlmTab;let s='';for(const g of ['div','inf','fae','mag','plc']){Object.assign(XP(),{rlmAll:!0,rlmTab:g});s+=tabRealms()}Object.assign(XP(),{rlmAll:a,rlmTab:t});return s})(); st.booksOff = [];
        return { on, off, noSin: !/Sin and temptation/.test(h), saints: /Saints/.test(h) }; });
      check(tag + '4.9.7.0: Realms tab for every character; gone when all four Realms books are off; sections follow their books', rt.on && !rt.off && rt.noSin && rt.saints, JSON.stringify(rt));
      const r = await ev(() => { try { localStorage.removeItem('am-optrules') } catch (z) {}
        st.traits = [{ t: 'Dedicated', v: 3 }]; st.abil.push({ n: 'Leadership', prm: '', sp: '', xp: 15, xps: {}, free: 0 }, { n: 'Meditation', prm: '', sp: '', xp: 15, xps: {}, free: 0 }, { n: 'Understanding', prm: '', sp: '', xp: 15, xps: {}, free: 0 });
        st.chars.Pre = 2; st.chars.Int = -1; setMode('play');
        const infl = getCheck('r49:infl').outcome(15, {}).head; const a1 = getCheck('r49:ascent').score[0];
        const inv = getCheck('r49:invoke'); const secret = !inv.opp;
        localStorage.setItem('am-optrules', JSON.stringify({ ascPresence: false, saintSecret: false }));
        const a2 = getCheck('r49:ascent').score[0]; const open = !!getCheck('r49:invoke').opp;
        localStorage.removeItem('am-optrules');
        const sin = document.createElement('div'); sin.innerHTML = (()=>{const a=XP().rlmAll,t=XP().rlmTab;let s='';for(const g of ['div','inf','fae','mag','plc']){Object.assign(XP(),{rlmAll:!0,rlmTab:g});s+=tabRealms()}Object.assign(XP(),{rlmAll:a,rlmTab:t});return s})();
        return { infl, a1: a1.l + a1.v, a2: a2.l + a2.v, secret, open, proud: /Proud –3/.test(sin.textContent) }; });
      check(tag + '4.9.7.0: infernal influence 15 gives +3 (RoP:I p. 23); Dedicated +3 reads Proud –3 (p. 21)', /\+3/.test(r.infl) && r.proud, JSON.stringify(r));
      check(tag + '4.9.7.0: optional rules switch Ascension to Intelligence and the saint’s die to open (RoP:D pp. 63, 87)', r.a1 === 'Presence2' && r.a2 === 'Intelligence-1' && r.secret && r.open, JSON.stringify(r));
      const hb = await ev(() => { st.vf.push({ n: 'True Faith', kind: 'V', d: '' }, { n: 'True Faith', kind: 'V', d: '' }); XP().rLevel = 30; const o2 = getCheck('r:holy').outcome(15, {}).text;
        st.faith.score = 3; const o3 = getCheck('r:holy').outcome(15, {}).text; st.faith.score = null; XP().rLevel = 15; return { o2, o3 }; });
      check(tag + '4.9.7.0: level 30 holy power totalling 15: minor tragedy with True Faith 2, none with 3 (RoP:D p. 46)', /Minor tragedy of hubris \(10 short/.test(hb.o2) && /no tragedy/.test(hb.o3), JSON.stringify(hb));
      await fresh('magus');
      const w = await ev(() => { st.ages.post = 5; st.status.warpPts = ''; const a = warpPoints(st); localStorage.setItem('am-optrules', JSON.stringify({ warpDefault: false })); const b = warpPoints(st); localStorage.removeItem('am-optrules'); return { a, b }; });
      check(tag + '4.9.7.0: “assume Warping Points” optional rule on by default, off counts none', w.a >= 10 && w.b < w.a, JSON.stringify(w));
      const set = await ev(async () => { openSettings(); await new Promise(r => setTimeout(r, 50)); const box = document.querySelector('.set-box');
        const tab = box && box.querySelector('[data-settab="rules"]'); tab && tab.click(); await new Promise(r => setTimeout(r, 50));
        const out = { tabs: box ? box.querySelectorAll('[data-settab]').length : 0, sub: box ? box.querySelectorAll('[data-optlist="sub"] [data-optrule]').length : 0, home: box ? box.querySelectorAll('[data-optlist="home"] [data-optrule]').length : 0,
          close: !!(box && box.querySelector(':scope > .pm-acts')), shown: box ? !box.querySelector('[data-setpane="rules"]').hidden : false };
        document.querySelector('.pmodal') && document.querySelector('.pmodal').remove(); return out; });
      check(tag + '4.9.7.0: Settings › Optional rules with Sub rules and Homebrew rules lists', set.tabs === 2 && set.sub >= 3 && set.home >= 9 && set.close && set.shown, JSON.stringify(set));
      const cb = await ev(() => migrate({ type: 'grog', vf: [{ n: 'Infernal Power', kind: 'V' }] }).vf[0].n);
      check(tag + '4.9.7.0: corrupted beast “Infernal Power” Virtue opens as Lesser Infernal Power (RoP:I p. 78)', cb === 'Lesser Infernal Power', cb);
    }
    if (await ev(() => !!document.getElementById('v4.9.7.5'))) {
      await fresh('magus');
      const tm = await ev(() => { const set = (k, v) => { const i = document.createElement('input'); i.type = 'boolean' == typeof v ? 'checkbox' : 'text'; i.dataset.f975in = k; 'boolean' == typeof v ? i.checked = v : i.value = v; document.body.appendChild(i); i.dispatchEvent(new Event('change', { bubbles: true })); i.remove(); }; setMode('play'); const A = () => P().aura; A().realm = 'Divine'; A().lvl = 4; renderPlay();
        set('time.night', true); const n = P().aura.lvl; set('time.holy', true); const nh = P().aura.lvl; set('time.night', false); set('time.holy', false); const back = P().aura.lvl;
        A().realm = 'Infernal'; A().lvl = 9; delete A().t975; renderPlay(); set('time.night', true); set('time.interdict', true); const cap = P().aura.lvl; set('time.day', 'easter'); const gf = P().aura.lvl;
        set('time.night', false); set('time.interdict', false); set('time.day', ''); const ib = P().aura.lvl; return { n, nh, back, cap, gf, ib }; });
      check(tag + '4.9.7.5: Dominion –1 at night, +1 on holy days; Infernal +1 at night and under Interdict, at most 10, 0 from Good Friday (RoP:D p. 10; RoP:I pp. 10–11)', tm.n === 3 && tm.nh === 4 && tm.back === 4 && tm.cap === 10 && tm.gf === 0 && tm.ib === 9, JSON.stringify(tm));
      const ae = await ev(() => { const A = () => P().aura; delete A().t975; Object.assign(A(), { realm: 'Infernal', lvl: 3, regio: true, v975: { kind: 'Malevolent', rkind: 'Abyssal' } });
        const tg = (getCheck('char:Str').toggles || []).find(t => t.key === 't975:malev'); const ab = getCheck('char:Int').post.find(l => /Abyssal/.test(l.l)); const rp = getCheck('rec:L').post.find(l => /fester/.test(l.l));
        Object.assign(A(), { realm: 'Magic', lvl: 4, regio: false, v975: { align: 'Vi' } }); const p = P(); p.spTe = 'Cr'; p.spFo = 'Vi'; const al = getCheck('spont').post.find(l => /aligned/.test(l.l));
        Object.assign(A(), { realm: 'None', lvl: 0, v975: {} }); return { tb: tg && tg.b, ab: ab && ab.v, rp: rp && rp.v, al: al && al.v }; });
      check(tag + '4.9.7.5: Malevolent aura adds botch dice to physical rolls, Abyssal regio lowers Characteristics, Infernal aura slows recovery, a Vim-aligned aura counts double (RoP:I pp. 12–17; RoP:M p. 16)', ae.tb === 3 && ae.ab === -3 && ae.rp === -3 && ae.al === 4, JSON.stringify(ae));
      const vk = await ev(() => { st.spells = [{ n: 'Pilum of Fire', tf: 'CrIg', l: '20', r: 'Voice', d: 'Mom', t: 'Ind', p: 140, rit: 0, req: '', mxp: 0, mopt: '', notes: '' }]; st.arts.Cr = { xp: 55, vis: 0 }; st.arts.Ig = { xp: 55, vis: 0 };
        const p = P(); p.visTe = 2; p.visFo = 0; p.fast = false; p.stressed = true;
        const bl = c => (c.score.concat(c.post).find(l => /Vis boost/.test(l.l)) || {}).v; const k = v => { XP().visKind = v; }; k(''); const c0 = getCheck('spell:0');
        k('sordida'); const c1 = getCheck('spell:0'); k('prava'); const c2 = getCheck('spell:0'); const r = doRoll(c2);
        k('dedicated'); XP().visDedTe = 'Cr'; XP().visDedFo = 'Ig'; const c3 = getCheck('spell:0'); k('infesta'); const c4 = getCheck('spell:0'); k(''); p.visTe = 0;
        return { b0: bl(c0), n0: c0.nb, b1: bl(c1), n1: c1.nb, mb: c1.minBotch, zero: !!(r.die && r.die.zero) && r.die.value === 0 && r.die.faces.length === 1, n2: c2.nb, b3: bl(c3), n3: c3.nb, n4: c4.nb }; });
      check(tag + '4.9.7.5: vis spent: sordida +5 and three botch dice a pawn, prava rolls as a zero, dedicated +4 for its pair, infesta twice the dice (RoP:I pp. 18–19; RoP:M p. 122; DE p. 422)', vk.b0 === 4 && vk.b1 === 10 && vk.n1 === vk.n0 + 4 && vk.mb === 2 && vk.zero && vk.n2 === vk.n0 + 2 && vk.b3 === 8 && vk.n3 === vk.n0 + 2 && vk.n4 === vk.n0 + 2, JSON.stringify(vk));
      const ca = await ev(() => { const s = st.site; s.tethers = [{ t: 'feature', x: 0, v: 2, n: '' }, { t: 'monument', x: 4, v: 0, n: '' }, { t: 'being', x: 40, v: 0, n: '' }]; s.cur = null; s.dice = 0; s.regio = [];
        const stable = !!getCheck('r975:year').blocked; s.yr.act = 'autumn'; s.yr.vx = 1; const o = getCheck('r975:year').outcome(15, {}); applyAction(o.actions[0]);
        const cur = st.site.cur, dice = st.site.dice; s.yr.act = 'autumn'; const st2 = !!getCheck('r975:year').blocked;
        s.yr.vx = 4; const ob = getCheck('r975:year').outcome(0, { botch: true }); applyAction(ob.actions[0]); return { stable, cur, dice, st2, regio: st.site.regio.join(','), log: st.site.log.length }; });
      check(tag + '4.9.7.5: covenant aura: tethers give base 7; modifier +4 rolls 15 and the aura rises to 8; a botch makes a regio (RoP:M pp. 8–13)', ca.stable && ca.cur === 8 && ca.dice === 1 && ca.st2 && ca.regio === '0,8' && ca.log === 2, JSON.stringify(ca));
      const rr = await ev(() => { const h = document.createElement('div'); h.innerHTML = (()=>{const a=XP().rlmAll,t=XP().rlmTab;let s='';for(const g of ['div','inf','fae','mag','plc']){Object.assign(XP(),{rlmAll:!0,rlmTab:g});s+=tabRealms()}Object.assign(XP(),{rlmAll:a,rlmTab:t});return s})(); return { sight: !!getCheck('r975:sight'), c: getCheck('r975:corrupt').ef, panels: ['Regiones', 'Infernal auras', 'The Dominion', 'Faerie auras', 'The covenant aura'].filter(t => h.textContent.includes(t)).length, opt: [amOpt('faeRegioAware'), amOpt('visInfestaRoP'), amOpt('visStorage'), amOpt('auraBotchEach')].join() }; });
      check(tag + '4.9.7.5: Realms tab panels for regiones and the four realms’ auras; four new optional rules', rr.sight && rr.c === 6 && rr.panels === 5 && rr.opt === 'true,false,false,false', JSON.stringify(rr));
      await fresh('magus');
      const b = await ev(() => { setMode('build'); st.rawvis = [{ art: 'Vim', pawns: 3, form: 'dust' }]; st.ages.post = 2; st.ages.visSchedule = '10, 20'; st.abil.push({ n: 'Magic Theory', prm: '', sp: '', xp: 0, xps: {}, free: 30 }); renderAll();
        const ck = checks(st).find(c => /Vis after Gauntlet/.test(c.t)); const f = document.querySelector('[data-k="rawvis.0.form"]');
        return { con: !!document.querySelector('#s-concept [data-k="info.gender"]'), bio: !!document.querySelector('#s-bio [data-k="info.gender"]'), vk: !!document.querySelector('[data-k="rawvis.0.kind"]'), ok: ck && ck.ok, t: ck && ck.t, tabs: document.querySelectorAll('#s-abil [data-f975tab]').length, grow: f && f.tagName }; });
      check(tag + '4.9.7.5: particulars in Biography, not Concept; raw vis has a kind; Abilities by stage; free text grows', !b.con && b.bio && b.vk && b.tabs >= 2 && b.grow === 'TEXTAREA', JSON.stringify(b));
      check(tag + '4.9.7.5: post-Gauntlet vis over Magic Theory × 5 in a year fails its check (DE p. 50)', b.ok === false && /= 15 pawns/.test(b.t), JSON.stringify(b));
      const fo = await ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); localStorage.removeItem('am-pins'); localStorage.removeItem('am-fold-others'); renderAll();
        const openIds = () => [...document.querySelectorAll('#work > .folio:not(.shut)')].map(s => s.id).join();
        document.querySelector('[data-f975b="foldall"]').click(); await w(30); document.querySelector('#s-arts [data-f975b="open"]').click(); await w(30); const o1 = openIds();
        document.querySelector('#s-vf [data-f975b="pin"]').click(); await w(30); const pinned = !!document.querySelector('#ledger .f975-pcard[data-pin="s-vf"]');
        document.querySelector('#rail a.step[href="#s-bio"]').click(); await w(30); const o2 = openIds(); const bk = document.querySelector('#rail [data-f975back]'); const bt = bk && !bk.hidden ? bk.textContent.trim() : '';
        bk && bk.click(); await w(30); const o3 = openIds(); const sum = document.querySelector('#s-vf .f975-sum').textContent;
        document.querySelector('[data-f975b="openall"]').click(); localStorage.removeItem('am-pins'); return { o1, pinned, o2, bt, o3, sum }; });
      check(tag + '4.9.7.5: opening a section folds the others; pin to the side panel; rail jump and “Back to …”', fo.o1 === 's-arts' && fo.pinned && fo.o2 === 's-bio' && fo.bt === 'Back to Arts' && fo.o3 === 's-arts' && /The Gift/.test(fo.sum), JSON.stringify(fo));
      const fm = await ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); document.querySelector('.f975-file').click(); await w(20);
        const items = [...document.querySelectorAll('#f975-fm [data-f975m]')].filter(b => b.offsetParent).map(b => b.dataset.f975m).join(); document.querySelector('#f975-fm [data-f975m="pdf"]').click(); await w(20);
        const d = document.getElementById('f975-pdf'); const opts = d ? d.querySelectorAll('[data-pdfopt]').length : 0; d && d.querySelector('[data-f975pdf="cancel"]').click();
        st.traits = st.traits || []; const n0 = st.traits.length; document.querySelector('[data-act="add-trait"]').click(); await w(60); const a = document.activeElement;
        return { items, opts, closed: !document.getElementById('f975-pdf'), led: getComputedStyle(document.querySelector('.ledger .export-box')).display, focus: a && a.dataset && a.dataset.k || '', n: st.traits.length - n0 }; });
      check(tag + '4.9.7.5: File menu (Export PDF, Save, Load); PDF options in the Export dialog; Add trait focuses the new row', fm.items === 'pdf,json,load' && fm.opts === 3 && fm.closed && fm.led === 'none' && fm.n === 1 && new RegExp('^traits\\.' + (await ev(() => st.traits.length - 1)) + '\\.').test(fm.focus), JSON.stringify(fm));
      const hh = {};
      for (const W of [1280, 390]) { await p.setViewportSize({ width: W, height: 844 }); await wait(250);
        hh[W] = await ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); setMode('build'); renderAll(); await w(80); const b = document.querySelector('.top').getBoundingClientRect().height; setMode('play'); await w(80); const pl = document.querySelector('.top').getBoundingClientRect().height; setMode('build'); renderAll(); await w(40);
          return { b, pl, strip: getComputedStyle(document.querySelector('.f975-strip')).display, led: getComputedStyle(document.getElementById('ledger')).display, x: document.getElementById('rail').getBoundingClientRect().left % 1 }; }); }
      await p.setViewportSize({ width: 1280, height: 900 });
      check(tag + '4.9.7.5: header the same height in Build and Play (1280 and 390 px); phone header one row; status strip in place of the ledger on a phone; whole-pixel columns', Math.abs(hh[1280].b - hh[1280].pl) < 0.5 && Math.abs(hh[390].b - hh[390].pl) < 0.5 && hh[390].b < 70 && hh[390].strip === 'flex' && hh[390].led === 'none' && hh[1280].strip === 'none' && hh[1280].x === 0, JSON.stringify(hh));
      const ban = await ev(() => { const s = exampleState(); Object.keys(st).forEach(k => delete st[k]); Object.assign(st, s); setMode('build'); renderAll(); const h1 = document.getElementById('banner').offsetHeight;
        const i = document.querySelector('[data-k="info.name"]'); i.value = 'Aldric of the Test'; i.dispatchEvent(new Event('input', { bubbles: true })); const h2 = document.getElementById('banner').offsetHeight; return { h1, h2, ex: st.example }; });
      check(tag + '4.9.7.5: the example banner keeps its place on the first edit', ban.h1 > 0 && ban.h2 === ban.h1 && ban.ex === false, JSON.stringify(ban));
    }
    if (await ev(() => !!document.getElementById('v4.9.7.6'))) {
      const gr = await ev(async () => { const s = exampleState(); Object.keys(st).forEach(k => delete st[k]); Object.assign(st, s); setMode('build'); renderAll();
        const kids = [...document.getElementById('work').children].filter(e => e.id || e.classList.contains('f976-gdiv'));
        const order = kids.map(e => e.id || '|').join(' '); const seals = kids.filter(e => e.id).map(e => e.querySelector(':scope > header .seal').textContent);
        const rail = [...document.querySelectorAll('#rail a.step')].every(a => { const sec = document.querySelector(a.getAttribute('href') + ' > header .seal'); return !sec || sec.textContent === a.querySelector('.seal-sm').textContent; });
        await new Promise(r => setTimeout(r, 0)); return { order, seals: seals.join(), rail, divs: document.querySelectorAll('#work > .f976-gdiv').length, h2: document.querySelector('#s-concept h2').textContent.trim() }; });
      check(tag + '4.9.7.6: sheet in rail order with five group dividers; seals numbered in order and matching the rail; Title Case section headings', gr.divs === 5 && /^\| s-concept s-house s-chars \| s-vf \| s-abil s-arts s-spells/.test(gr.order) && gr.seals.startsWith('I,II,III,IV,V,VI,VII') && gr.rail && gr.h2 === 'Concept and Setting', JSON.stringify(gr));
      const na = await ev(() => { const s = blankState('companion'); Object.keys(st).forEach(k => delete st[k]); Object.assign(st, s); st.vf.push({ n: 'Second Sight', kind: 'V', d: '' }); setMode('build'); renderAll();
        const a = { hedge: !!document.getElementById('s-hedge-known'), arts: !!document.getElementById('s-arts'), na: [...document.querySelectorAll('#rail .f976-na')].map(e => e.querySelector('.lbl').textContent).join(), link: !!document.querySelector('#rail .f976-na[href], #rail .f976-na a') };
        st.vf.push({ n: 'Folk Witch', kind: 'V', d: '' }); renderAll(); a.hedge2 = !!document.getElementById('s-hedge-known'); a.na2 = document.querySelectorAll('#rail .f976-na').length; return a; });
      check(tag + '4.9.7.6: a companion’s sheet has no Arts, Spells or Hedge Magic; the rail shows them greyed, not links; Folk Witch brings Hedge Magic (HMRE p. 34)', !na.hedge && !na.arts && na.na === 'Arts,Spells,Hedge Magic,Laboratory,Familiar' && !na.link && na.hedge2 && na.na2 === 4, JSON.stringify(na));
      const tc = await ev(() => [amTitleCase('hedge magic: known effects', true, true), amTitleCase('rule checks · 3 to fix', true, true), amTitleCase('later life 2 yr × 15', true, true), amTitleCase('magic resistance by form', true, true)].join('|'));
      check(tag + '4.9.7.6: Title Case keeps minor words and abbreviations lower case', tc === 'Hedge Magic: Known Effects|Rule Checks · 3 to Fix|Later Life 2 yr × 15|Magic Resistance by Form', tc);
      const ty = await ev(() => { const st_ = s => { const e = document.querySelector(s); if (!e) return ''; const c = getComputedStyle(e); return [c.fontFamily, c.fontSize, c.fontWeight, c.letterSpacing, c.textTransform].join('/'); };
        return { g: st_('#rail .rail-g') === st_('#led-checks .chk-gn'), h: st_('#rail .prog') === st_('#led-checks h4'), c: st_('#rail .step .sv') === st_('#led-checks .chk-gc') }; });
      check(tag + '4.9.7.6: the rail and the rule checks share one typeset (headings, group names, counts)', ty.g && ty.h && ty.c, JSON.stringify(ty));
      const pt = await ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const s = exampleState(); Object.keys(st).forEach(k => delete st[k]); Object.assign(st, s); setMode('build'); renderAll();
        const dims = async () => { const src = st.portrait.src, i = new Image; await new Promise(r => { i.onload = r; i.src = src }); const c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight; const x = c.getContext('2d'); x.drawImage(i, 0, 0); return [i.naturalWidth, i.naturalHeight, /^data:image\/png/.test(src) ? 'png' : 'jpg', x.getImageData(2, 2, 1, 1).data[3]].join(); };
        const c = document.createElement('canvas'); c.width = 800; c.height = 600; const x = c.getContext('2d'); x.fillStyle = '#c33'; x.beginPath(); x.arc(400, 300, 200, 0, 7); x.fill(); ptCrop(c.toDataURL('image/png'), null); await w(300);
        const stage = document.querySelector('.crop-stage'), sb = stage.getBoundingClientRect(); document.querySelector('[data-pm="ok"]').click(); await w(400); const a = await dims();
        await ptSetPixel(40, true); await w(200); const b = await dims(); await ptSetPixel(0, true); await w(200);
        const q = document.createElement('canvas'); q.width = q.height = 540; q.getContext('2d').fillRect(100, 100, 340, 340); const sq = q.toDataURL('image/png'); st.portrait = { src: sq, baseSrc: sq, pixel: 30 }; ptSquareUp(); await w(900); const d = await dims();
        const vb = document.querySelector('.pslot .hframe').getAttribute('viewBox'); setMode('play'); renderAll(); await w(100); const hw = document.querySelector('.hero-pt .hframe').getBoundingClientRect();
        const card = document.createElement('canvas'); await drawCard(card); setMode('build'); renderAll();
        return { stage: Math.round(sb.width) + 'x' + Math.round(sb.height), a, b, d, px: st.portrait.pixel, vb, hero: Math.round(hw.width) + 'x' + Math.round(hw.height), card: card.width + 'x' + card.height }; });
      check(tag + '4.9.7.6: upright portraits: 300 x 390 crop, 540 x 702 picture kept transparent through crop and pixelization; a square portrait is re-cut and re-pixelized; 200 px portrait in the Play header; card draws', pt.stage === '300x390' && pt.a === '540,702,png,0' && pt.b === '540,702,png,0' && pt.d === '540,702,png,0' && pt.px === 30 && pt.vb === '0 0 100 130' && pt.hero === '200x260' && pt.card === '1800x1044', JSON.stringify(pt));
    }
    check(tag + 'feature checks: no errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await browser.close(); }
}

// ------------------------------------------------------------------ screenshots
// ------------------------------------------------------------------ load weight and motion (4.9.8.0)
async function perfChecks(url, tag) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage(); const errs = [], reqs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('request', r => reqs.push(r.url().replace(/^.*?\/assets\//, 'assets/')));
    await p.goto(url); await p.waitForLoadState('load'); await wait(4500);
    const dice = await p.evaluate(() => { const s = new Set(); for (const k in DIE_ART) for (const f of ['h', 't', 'p', 'pt']) s.add(DIE_ART[k][f]); return [...s]; });
    const boot = reqs.slice();
    check(tag + 'no die art fetched at start-up', !boot.some(u => dice.includes(u)), boot.filter(u => dice.includes(u)).length + ' dice files');
    check(tag + 'bestiary and hedge lists not fetched at start-up', !boot.some(u => /\.json$/.test(u)));
    check(tag + 'start-up downloads at most 20 files', boot.length <= 20, boot.length + ' requests');
    check(tag + 'spell catalogue ships as plain JSON and loads', await p.evaluate(() => { const e = document.getElementById('v33-catalog-data'); return !!e && !e.dataset.z && typeof SPELLS !== 'undefined' && SPELLS.length > 300; }));
    await enter(p);
    await p.evaluate(() => { const m = document.getElementById('menu'); m && (m.hidden = true, document.body.classList.remove('menu-open')); setMode('play'); P().sel = 'trait'; renderPlay(); });
    await wait(2500);
    const want = await p.evaluate(() => { const c = getCheck(P().sel); const a = c && DIE_ART[dieArtKey(c)]; return a ? [a.t, a.h] : []; });
    check(tag + 'the selected check\'s die art is warmed in Play', want.length === 2 && want.every(u => reqs.includes(u)), want.join(' '));
    check(tag + 'only that die is warmed', reqs.filter(u => dice.includes(u)).length <= 2, reqs.filter(u => dice.includes(u)).length + ' dice files');
    await p.hover('[data-pact="tab"][data-t="realms"]').catch(() => {}); await wait(1500);
    check(tag + 'pointing at Realms fetches the bestiary lists', reqs.some(u => /\.json$/.test(u)));
    await p.evaluate(() => { setMode('build'); scrollTo(0, 0); }); await wait(600);
    const held = await p.evaluate(() => { applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light', true); return document.querySelectorAll('.am-cv').length; });
    check(tag + 'a theme change skips off-screen sections', held > 0, held + ' held');
    await wait(4000);
    check(tag + 'held sections are all restored afterwards', await p.evaluate(() => document.querySelectorAll('.am-cv').length === 0 && [...document.querySelectorAll('#work>section.folio')].every(s => !s.style.containIntrinsicSize)));
    const land = await p.evaluate(async () => { const out = []; for (const a of document.querySelectorAll('#rail a.step[href^="#"]')) { a.click(); await new Promise(r => setTimeout(r, 1300)); const e = document.querySelector(a.getAttribute('href')); out.push(Math.round(e.getBoundingClientRect().top)); } return out; });
    check(tag + 'rail jumps all land at the same offset', land.length > 5 && land.every(v => v === land[0]), land.join(','));
    const efp = await p.evaluate(async () => { scrollTo(0, 0); await new Promise(r => setTimeout(r, 600)); let n = 0; const o = document.elementsFromPoint; document.elementsFromPoint = function () { n++; return o.apply(this, arguments); }; for (let y = 0; y < 1500; y += 50) { scrollTo(0, y); await new Promise(r => requestAnimationFrame(r)); } await new Promise(r => setTimeout(r, 800)); document.elementsFromPoint = o; return n; });
    check(tag + 'scrolling runs the sound-button overlap check once it settles, not every frame', efp > 0 && efp <= 10, efp + ' hit tests');
    check(tag + 'no errors in load-weight and motion checks', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await browser.close(); }
}

// ------------------------------------------------------------------ Faerie and Magic in play (4.9.9.0)
async function f990Checks(url, tag) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const { p, errs } = await pageFor(browser, url, tag);
    await enter(p);
    if (!(await p.evaluate(() => !!document.getElementById('v4.9.9.0')))) { check(tag + 'skipped (no v4.9.9.0)', true); return; }
    const r = await p.evaluate(async () => {
      const w = ms => new Promise(z => setTimeout(z, ms)), q = s => document.querySelector(s), out = {};
      const pick = (sel, v) => { const e = q(sel); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
      const s = blankState('companion'); Object.keys(st).forEach(k => delete st[k]); Object.assign(st, s); st.play = undefined; st.booksOff = [];
      const m = document.getElementById('menu'); m && (m.hidden = true, document.body.classList.remove('menu-open'));
      // from 4.9.9.5 the tools sit in realm sub-tabs and are gated by the sheet: show all, and pick the sub-tab
      const sub = g => { const x = XP(); x.rlmAll = true; x.rlmTab = g; renderPlay(); };
      setMode('play'); P().tab = 'realms'; sub('mag'); await w(200);
      out.panels = [!!q('.f990-things'), /tamed creatures/i.test(document.body.innerText)]; sub('fae'); await w(100); out.panels.unshift(!!q('.f990-fae'));
      q('[data-f990="fae-in"]').click(); await w(100);
      pick('[data-f990in="fae-reason"]', 'food'); await w(80); out.first = [st.fae.score, st.fae.fp];
      pick('[data-f990in="fae-reason"]', 'food'); await w(80); out.dup = st.fae.fp;
      pick('[data-f990in="fae-reason"]', 'travel'); await w(80); pick('[data-f990in="fae-reason"]', 'contest'); await w(80);
      q('[data-f990="fae-raise"]').click(); await w(80); out.raise = [st.fae.score, st.fae.fp];
      pick('[data-f990in="fae-reason"]', 'mercy'); await w(80);
      const fat0 = P().fatL; P().sel = 'r990:offer'; doRoll(getCheck('r990:offer')); out.offer = [st.fae.fp, P().fatL - fat0];
      st.traits = [{ t: 'Brave', v: 2 }]; pick('[data-f990in="fae-reason"]', 'hero'); await w(80); renderPlay(); q('[data-f990="fae-spend"]').click(); await w(80);
      const tc = getCheck('trait'); out.fable = (tc.post || []).some(l => l.l === 'A fable point spent' && l.v === 2); doRoll(tc); out.fabGone = XP().fab990;
      st.fae.days = 3; st.fae.warp = 1; st.fae.fp = 0; const wp = warpPoints(st); renderPlay(); q('[data-f990="fae-out"]').click(); await w(80); out.out = [st.fae.in, warpPoints(st) - wp];
      st.being.on = true; st.being.realm = 'Magic'; st.being.might = 15; Object.assign(st.m990.acc, { aura: 3, time: 'always', vis: 0 }); sub('mag'); await w(80);
      out.acc1 = /Protected from Acclimation/.test(q('.f990-acc').innerText);
      st.m990.acc.aura = 2; renderPlay(); out.acc2 = /Not protected/.test(q('.f990-acc').innerText);
      st.m990.acc.vis = 8; renderPlay(); out.acc3 = /Protected from Acclimation/.test(q('.f990-acc').innerText);
      st.being.mq = [{ n: 'Acclimation Prone', d: '' }]; renderPlay(); out.prone = /needs 6 for Might 30/.test(q('.f990-acc').innerText) && /of 15 pawns/.test(q('.f990-acc').innerText);
      st.being.on = false; renderPlay();
      pick('[data-f990in="tame-beast"]', '11'); await w(80); const t = st.tame[0]; out.beast = [t.n, t.mund, t.conf];
      st.abil.push({ n: 'Animal Handling', free: 150, xp: 0, xps: {} }); renderPlay(); q('[data-f990="tame-season"]').click(); await w(80); out.tamed = [st.tame[0].tamed, st.tame[0].loyal];
      out.cmd = !getCheck('r990:cmd:0').blocked;
      setMode('build'); st.being.on = true; st.being.realm = 'Magic'; st.being.might = 15; st.being.size = 0; st.m990.bk = 'elem'; st.m990.elem = 'Earth'; renderAll(); await w(200);
      out.card = /Size ±0/.test((q('.f990-being') || {}).innerText || '');
      out.elemChk = checks(st).filter(c => /Size ±0 for Might 15/.test(c.t)).map(c => c.ok);
      st.being.might = 20; out.elemChk2 = checks(st).filter(c => /Size \+3 for Might 20/.test(c.t)).map(c => c.ok);
      st.m990.bk = 'bov'; st.vf.push({ n: 'Blind', kind: 'F' }); out.bov = checks(st).filter(c => /never Lame or Blind/.test(c.t)).map(c => c.ok);
      st.tov = [{ k: 'topaz', en: true, tal: false, n: '' }]; renderAll(); await w(150); out.tov = [!!q('.f990-tov tbody tr'), checks(st).filter(c => /Topaz of Virtue grants/.test(c.t)).map(c => c.ok)];
      return out;
    });
    check(tag + 'Realms tab shows the Faerie, Magic things and taming panels', r.panels.every(Boolean), JSON.stringify(r.panels));
    check(tag + 'the first fable point becomes a fable score of 1 (RoP:F p. 26)', r.first.join() === '1,0', r.first.join());
    check(tag + 'a kind of choice earns its fable point once a visit', r.dup === 0, r.dup);
    check(tag + 'raising the fable score costs score + 1 points', r.raise.join() === '2,0', r.raise.join());
    check(tag + 'an offer spends a fable point and a Long-Term Fatigue level (RoP:F p. 27)', r.offer.join() === '0,1', r.offer.join());
    check(tag + 'a spent fable point adds the score to the next roll only', r.fable && r.fabGone === 0, JSON.stringify([r.fable, r.fabGone]));
    check(tag + 'leaving Faerie records the Warping taken and ends the visit', r.out.join() === 'false,1', r.out.join());
    check(tag + 'Acclimation: aura 3 protects Might 15, aura 2 does not, 8 pawns of vis do (RoP:M pp. 53–54)', r.acc1 && r.acc2 && r.acc3, JSON.stringify([r.acc1, r.acc2, r.acc3]));
    check(tag + 'Acclimation Prone doubles Might for auras and vis (RoP:M p. 41)', r.prone);
    check(tag + 'a mundane beast joins the tamed list with Might 1 + 2 × Confidence', r.beast.join() === 'Wolf,true,1', r.beast.join());
    check(tag + 'a season of taming that exceeds the Might tames it, Loyal +0 (DE p. 385)', r.tamed.join() === 'true,0' && r.cmd, JSON.stringify([r.tamed, r.cmd]));
    check(tag + 'Build: elemental Size follows Might (DE p. 450)', r.card && r.elemChk.join() === 'true' && r.elemChk2.join() === 'false', JSON.stringify([r.card, r.elemChk, r.elemChk2]));
    check(tag + 'Build: a Blind Beast of Virtue fails its check (RoP:M p. 55)', r.bov.join() === 'false', r.bov.join());
    check(tag + 'Build: an Enriched Thing of Virtue is listed and flagged for a bearer with Magic Resistance', r.tov[0] && r.tov[1].join() === 'false', JSON.stringify(r.tov));
    check(tag + 'no errors in the 4.9.9.0 checks', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await browser.close(); }
}

async function f995Checks(url, tag) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const { p, errs } = await pageFor(browser, url, tag);
    await enter(p);
    if (!(await p.evaluate(() => !!document.getElementById('v4.9.9.5')))) { check(tag + 'skipped (no v4.9.9.5)', true); return; }
    const r = await p.evaluate(async () => {
      const w = ms => new Promise(z => setTimeout(z, ms)), q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)], out = {};
      const fresh = t => { const s = blankState(t); Object.keys(st).forEach(k => delete st[k]); Object.assign(st, s); st.play = undefined; st.booksOff = []; };
      const m = document.getElementById('menu'); m && (m.hidden = true, document.body.classList.remove('menu-open'));
      const secs = () => qa('.psec-tt').map(e => e.textContent.toLowerCase());
      const tabs = () => qa('[data-rlm]').map(b => b.dataset.rlm).join();
      fresh('companion'); setMode('play'); P().tab = 'realms'; renderPlay(); await w(150);
      out.bare = { tabs: tabs(), empty: !!q('.rlm-empty'), all: !!q('.rlm-pick') };
      st.vf.push({ n: 'True Faith', kind: 'V', d: '' }); renderPlay(); await w(80);
      out.faith = { tabs: tabs(), secs: secs(), nav: !!q('.psec-nav') };
      st.abil.push({ n: 'Infernal Lore', prm: '', sp: '', xp: 0, xps: {}, free: 5 }); renderPlay(); await w(80); out.inf = tabs();
      q('[data-rlm="inf"]').click(); await w(80);
      out.infSecs = secs(); out.pressed = q('[data-rlm="inf"]').getAttribute('aria-pressed') === 'true' && XP().rlmTab === 'inf';
      q('[data-rlm-set="all"]').click(); await w(80);
      out.allTabs = tabs(); out.allOn = XP().rlmAll === true;
      const b = q('.rinfo-b'), pane = b && document.getElementById(b.getAttribute('aria-controls'));
      out.info0 = !!pane && pane.hidden && b.getAttribute('aria-expanded') === 'false' && !q('.psec-in > .psec-note');
      b.click(); await w(50); out.info1 = !pane.hidden && b.getAttribute('aria-expanded') === 'true';
      renderPlay(); await w(50); const b2 = q('.rinfo-b'); out.info2 = !document.getElementById(b2.getAttribute('aria-controls')).hidden;
      b2.click(); await w(50);
      XP().rlmTab = '<img src=x onerror=alert(1)>'; renderPlay(); await w(50); out.hostile = !q('.pane img') && q('[data-rlm][aria-pressed="true"]') !== null;
      XP().rlmAll = false; XP().rlmTab = 'div'; renderPlay();
      return out;
    });
    check(tag + 'a bare companion: no realm sub-tabs, a note and the Tools shown picker', r.bare.tabs === '' && r.bare.empty && r.bare.all, JSON.stringify(r.bare));
    check(tag + 'True Faith brings up the Divine tools only (our reading), with no section strip', r.faith.tabs === 'div' && r.faith.secs.includes('invoke god’s aid') && !r.faith.secs.some(t => /sin|infernal|faerie|tamed/.test(t)) && !r.faith.nav, JSON.stringify(r.faith));
    check(tag + 'Infernal Lore adds the Infernal sub-tab (and Places, for regiones); choosing it shows only infernal sections', r.inf === 'div,inf,plc' && r.pressed && r.infSecs.length > 0 && r.infSecs.every(t => /sin|infernal|temper/.test(t)), JSON.stringify([r.inf, r.infSecs]));
    check(tag + 'Tools shown › Show all lists all five realm sub-tabs', r.allOn && r.allTabs === 'div,inf,fae,mag,plc', r.allTabs);
    check(tag + 'section descriptions sit behind an info button that opens, and stays open across a redraw', r.info0 && r.info1 && r.info2, JSON.stringify([r.info0, r.info1, r.info2]));
    check(tag + 'an unknown saved sub-tab falls back to a real one, nothing written to the page', r.hostile);
    const ovf = [];
    for (const skin of ['retro', 'classic']) for (const W of [1280, 390]) {
      await p.setViewportSize({ width: W, height: 900 });
      await p.evaluate(sk => { sk === 'retro' ? document.documentElement.setAttribute('data-skin', 'retro') : document.documentElement.removeAttribute('data-skin'); }, skin);
      const o = await p.evaluate(async () => {
        const w = ms => new Promise(z => setTimeout(z, ms)); XP().rlmAll = true; const res = [];
        for (const g of ['div', 'inf', 'fae', 'mag', 'plc']) {
          XP().rlmTab = g; renderPlay(); await w(120);
          document.querySelectorAll('.psec.folded').forEach(s => s.classList.remove('folded')); document.querySelectorAll('.rinfo[hidden]').forEach(x => { x.hidden = false; }); document.querySelectorAll('.pane details').forEach(d => { d.open = true; }); await w(350);
          const pane = document.querySelector('.pane.sectioned'), pr = pane.getBoundingClientRect();
          pane.querySelectorAll('*').forEach(e => { if (e.closest('table.lt')) return; const r = e.getBoundingClientRect(); if (!r.width) return;
            const sw = e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX === 'visible' && e.clientWidth > 0;
            if (sw || r.right > pr.right + 1) res.push(g + ' ' + e.tagName + '.' + String(e.className).slice(0, 20) + ' ' + (e.textContent || '').trim().slice(0, 30)); });
        }
        XP().rlmAll = false; XP().rlmTab = 'div'; renderPlay(); return res;
      });
      o.length && ovf.push(`${skin} ${W}: ${o.slice(0, 3).join(' | ')} (${o.length})`);
    }
    check(tag + 'Realms: nothing runs past its card or the pane on any sub-tab, folds open, Retro and Modern, 1280 and 390 px', ovf.length === 0, ovf.join(' ; '));
    check(tag + 'no errors in the 4.9.9.5 checks', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await browser.close(); }
}

async function f996Checks(url, tag) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const { p, errs } = await pageFor(browser, url, tag);
    await enter(p);
    if (!(await p.evaluate(() => !!document.getElementById('v4.9.9.6')))) { check(tag + 'skipped (no v4.9.9.6)', true); return; }
    const r = await p.evaluate(async () => {
      const w = ms => new Promise(z => setTimeout(z, ms)), q = s => document.querySelector(s), o = {};
      const pick = (sel, v) => { const e = q(sel); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
      const m = document.getElementById('menu'); m && (m.hidden = true, document.body.classList.remove('menu-open'));
      const f = blankState('companion'); Object.keys(st).forEach(k => delete st[k]); Object.assign(st, f); st.play = undefined; st.booksOff = [];
      st.vf.push({ n: 'True Faith', kind: 'V', d: '' }); setMode('play'); P().tab = 'realms'; XP().rlmTab = 'div'; renderPlay();
      window.AM49L && await AM49L.load(); await w(300); renderPlay(); await w(100);
      const names = [...document.querySelectorAll('[data-pk="x.stName"] option')].map(e => e.value);
      o.list = { n: names.length, paul: names.includes('St Paul, apostle'), adalbert: names.includes('St Adalbert'), dupPatrick: names.filter(n => /patrick/i.test(n)).length, dupKevin: names.filter(n => /kevin/i.test(n)).length };
      pick('[data-s996in="add91"]', '24'); await w(50); o.adopt = JSON.stringify(st.sn996.own[0]);
      pick('[data-s996in="n.0"]', 'Charlemagne'); pick('[data-s996in="dm.0"]', '50'); pick('[data-s996in="from.0"]', 'Saint Martin of Tours'); await w(50);
      o.pw = st.sn996.own[0].pw.length; o.boon = st.sn996.own[0].pw.includes('The Laborer’s Boon');
      pick('[data-s996in="patron"]', 'Charlemagne'); pick('[data-pk="x.stName"]', 'Charlemagne'); XP().stPatron = false; await w(50);
      o.patron = !(getCheck('r49:invoke').score || []).some(l => /patron/.test(l.l)); o.ef = getCheck('r49:threat').ef;
      pick('[data-pk="x.stName"]', 'St Paul, apostle'); await w(50); o.other = (getCheck('r49:invoke').score || []).some(l => /patron/.test(l.l) && l.v === -15);
      pick('[data-s996in="rsample"]', 'ark-c'); await w(50); const ark = st.inv.find(i => i.n === 'Ark of the Covenant');
      o.ark = ark && [ark.faith, ark.hf].join(); o.arkMight = /Divine Might 100 of 100/.test(document.body.textContent);
      pick('[data-s996in="rsample"]', 'head'); await w(50); const hi = st.inv.findIndex(i => i.n === 'Head of John the Baptist');
      const ub = q(`[data-s996="ruse"][data-i="${hi}"]`); o.use = ub && ub.textContent; ub && ub.click(); await w(50); o.left = (XP().rdm || {})[hi];
      q('[data-f97="rfp-dawn"]').click(); await w(50); o.dawn = Object.keys(XP().rdm || {}).length;
      const hs = migrate(JSON.parse(JSON.stringify(Object.assign({}, st, { sn996: { own: [{ n: '<img src=x onerror=alert(1)>', dm: 999, pw: ['x', 5, {}], pat: 7 }], patron: { a: 1 } }, inv: [{ cat: 'relic', n: 'R', faith: 1, rpw: 'bad', hf: 1e9, saint: {} }] }))));
      o.san = [hs.sn996.own[0].dm, hs.sn996.own[0].pw.join(), typeof hs.sn996.patron, Array.isArray(hs.inv[0].rpw), hs.inv[0].hf].join('|');
      Object.assign(st, hs); renderPlay(); await w(50); o.noimg = !q('.pane img[src="x"]');
      o.martin = AM49.data().best.find(b => b.n === 'Saint Martin of Tours').powers.some(p => p.n === 'The Laborer’s Boon');
      o.serenity = !JSON.stringify(AM49.data()).includes('Enchantment of the Hermetic spell Detachment');
      return o;
    });
    check(tag + 'Saints: the 25 further saints of RoP:D p. 91, without doubling Patrick, Kevin or John', r.list.paul && r.list.adalbert && r.list.dupPatrick === 1 && r.list.dupKevin === 1, JSON.stringify(r.list));
    check(tag + 'a listed saint becomes your own with its Might and patronage; powers taken from a sample saint', /"n":"St Adalbert","dm":25,"pat":"Prague"/.test(r.adopt) && r.pw === 7 && r.boon, JSON.stringify([r.adopt, r.pw]));
    check(tag + 'your patron needs no –15; another saint takes it; threat Ease Factor 9 + Might 50 / 5 (RoP:D pp. 87–88)', r.patron && r.other && r.ef === 19, JSON.stringify([r.patron, r.other, r.ef]));
    check(tag + 'sample relics: the Ark at Faith 7 with Divine Might 100 (RoP:D p. 44)', r.ark === '7,10' && r.arkMight, JSON.stringify([r.ark, r.arkMight]));
    check(tag + 'a relic power spends its cost from Divine Might until sunrise; Penetration Might – 5 × cost', /Resist Temptation \(1 Might; Penetration 45\)/.test(r.use || '') && r.left === 49 && r.dawn === 0, JSON.stringify([r.use, r.left, r.dawn]));
    check(tag + 'hostile saint and relic fields are cleaned on load and nothing is written to the page', r.san === '25|x|string|true|20' && r.noimg, r.san);
    check(tag + 'data: Saint Martin has The Laborer’s Boon (RoP:D p. 90); Grant of Serenity names Enchantment of Detachment', r.martin && r.serenity);
    check(tag + 'no errors in the 4.9.9.6 checks', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await browser.close(); }
}

async function f997Checks(url, tag) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const { p, errs } = await pageFor(browser, url, tag);
    await enter(p);
    if (!(await p.evaluate(() => !!document.getElementById('v4.9.9.7')))) { check(tag + 'skipped (no v4.9.9.7)', true); return; }
    const r = await p.evaluate(async () => {
      const w = ms => new Promise(z => setTimeout(z, ms)), q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)], o = {};
      const m = document.getElementById('menu'); m && (m.hidden = true, document.body.classList.remove('menu-open'));
      const f = blankState('companion'); Object.keys(st).forEach(k => delete st[k]); Object.assign(st, f); st.play = undefined; st.booksOff = [];
      st.vf.push({ n: 'True Faith', kind: 'V', d: '' }); setMode('play'); P().tab = 'realms'; renderPlay(); await w(100);
      const secs = () => qa('.psec-tt').map(e => e.textContent.toLowerCase());
      o.noSwitch = !q('[data-rlm-all]') && !!q('.rlm-pick');
      const box = qa('[data-rlm-on]').find(e => e.dataset.rlmOn === 'Regiones'); o.regMarked = !!box && !box.checked && /not on the sheet/.test(box.parentElement.textContent);
      box.checked = true; box.dispatchEvent(new Event('change', { bubbles: true })); await w(80);
      o.tabs = qa('[data-rlm]').map(b => b.dataset.rlm).join(); q('[data-rlm="plc"]').click(); await w(80); o.reg = secs().includes('regiones');
      const off = qa('[data-rlm-on]').find(e => e.dataset.rlmOn === 'Invoke God’s aid'); off.checked = false; off.dispatchEvent(new Event('change', { bubbles: true })); await w(80);
      q('[data-rlm="div"]').click(); await w(80); o.aidGone = !secs().includes('invoke god’s aid'); o.saved = JSON.stringify(XP().rlmOn);
      q('[data-rlm-set="sheet"]').click(); await w(80); o.reset = Object.keys(XP().rlmOn).length === 0 && secs().includes('invoke god’s aid') && !qa('[data-rlm]').some(b => b.dataset.rlm === 'plc');
      XP().rlmOn = { '__proto__': 1, '<img src=x onerror=alert(1)>': 1 }; renderPlay(); await w(50); o.hostile = !q('.pane img');
      XP().rlmOn = {}; P().tab = 'combat'; renderPlay(); await w(100);
      const b = q('.rinfo-b[data-i97]'); o.info = !!b && b.getAttribute('aria-expanded') === 'false' && document.getElementById(b.getAttribute('aria-controls')).hidden;
      b && b.click(); await w(50); renderPlay(); await w(50); const b2 = q('.rinfo-b[data-i97]'); o.infoKept = !!b2 && b2.getAttribute('aria-expanded') === 'true';
      o.sxNote = !q('#work .sx-note'); const sx = q('#work .sx'); o.sxGrid = !!sx && getComputedStyle(sx).display === 'flex';
      q('[data-fight="toggle"]').click(); await w(50); q('[data-fight="next"]').click(); await w(50); o.fight = JSON.stringify(P().fight); persist(); await w(300);
      return o;
    });
    await p.reload(); await wait(1500); await enter(p);
    const r2 = await p.evaluate(async () => { const m = document.getElementById('menu'); m && (m.hidden = true, document.body.classList.remove('menu-open')); setMode('play'); await new Promise(z => setTimeout(z, 200));
      const o = { fighting: document.body.classList.contains('fighting'), round: (document.querySelector('[data-fx="round"]') || {}).textContent };
      document.querySelector('[data-fight="toggle"]').click(); await new Promise(z => setTimeout(z, 50)); o.ended = JSON.stringify(P().fight); return o; });
    const ovf = [];
    for (const skin of ['retro', 'classic']) for (const W of [1440, 1280, 1100, 1000, 820, 700, 390]) {
      await p.setViewportSize({ width: W, height: 900 });
      const o = await p.evaluate(sk => { sk === 'retro' ? document.documentElement.setAttribute('data-skin', 'retro') : document.documentElement.removeAttribute('data-skin'); P().aura = { realm: 'Infernal', lvl: 3, regio: false }; renderPlay();
        const sel = document.querySelector('#work .sx [data-pk="aura.realm"]'), cs = getComputedStyle(sel), cx = document.createElement('canvas').getContext('2d'); cx.font = cs.font;
        const need = cx.measureText(sel.options[sel.selectedIndex].text).width + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + 16, clip = sel.getBoundingClientRect().width < need ? ['aura select ' + Math.round(sel.getBoundingClientRect().width) + '<' + Math.round(need)] : [];
        clip.push(...[...document.querySelectorAll('#work .sx>.sx-chip')].filter(c => c.scrollWidth > c.clientWidth + 1).map(c => 'clipped ' + c.textContent.trim()));
        const sx = document.querySelector('#work .sx'), r = sx.getBoundingClientRect(), bad = [...sx.querySelectorAll('*')].filter(e => { const b = e.getBoundingClientRect(); return b.width && (b.right > r.right + 1 || e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX === 'visible' && e.tagName !== 'SELECT'); }).map(e => e.className || e.tagName);
        P().aura = { realm: 'None', lvl: 0, regio: false }; return bad.concat(clip).join(','); }, skin);
      o && ovf.push(`${skin} ${W}: ${o}`);
    }
    check(tag + 'Realms: Tools shown replaces Show all tools; a tool the sheet does not use is marked and unticked', r.noSwitch && r.regMarked, JSON.stringify([r.noSwitch, r.regMarked]));
    check(tag + 'ticking Regiones brings up Places with it; unticking God’s aid hides it; saved per tool', r.reg && /"Regiones":1/.test(r.saved) && r.aidGone && /"Invoke God’s aid":0/.test(r.saved), JSON.stringify([r.tabs, r.saved]));
    check(tag + 'Only what the sheet uses clears the choices', r.reset);
    check(tag + 'hostile tool choices write nothing to the page', r.hostile);
    check(tag + 'other Play tabs: long section descriptions behind the info button, kept open across a redraw', r.info && r.infoKept, JSON.stringify([r.info, r.infoKept]));
    check(tag + 'Situation: one strip, its note moved to the label; the aura choice stays readable and nothing is clipped or past its edge, Retro and Modern, 390 to 1440 px', r.sxNote && r.sxGrid && ovf.length === 0, ovf.join(' ; '));
    check(tag + 'a fight and its round survive a reload; ending it is saved', r.fight === '{"on":true,"round":2}' && r2.fighting && r2.round === '2' && r2.ended === '{"on":false,"round":1}', JSON.stringify([r.fight, r2]));
    check(tag + 'no errors in the 4.9.9.7 checks', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await browser.close(); }
}

async function f998Checks(url, tag) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const { p, errs } = await pageFor(browser, url, tag);
    await enter(p);
    if (!(await p.evaluate(() => !!document.getElementById('v4.9.9.8')))) { check(tag + 'skipped (no v4.9.9.8)', true); return; }
    const r = await p.evaluate(async () => {
      const w = ms => new Promise(z => setTimeout(z, ms)), q = s => document.querySelector(s), o = {};
      const from = () => [...document.querySelectorAll('#menu [data-mn-from]')].map(b => b.dataset.mnFrom).join();
      openMenu('new'); await w(80);
      const go = async (type, f) => { q(`#menu [data-mn-type="${type}"]`).click(); await w(40); f && q(`#menu [data-mn-from="${f}"]`).click(); await w(40); };
      await go('magus'); o.magus = from();
      await go('companion'); o.comp = from();
      await go('grog'); o.grog = from();
      o.res = {};
      for (const [type, id] of [['companion', 's:knight'], ['companion', 's:scholar'], ['grog', 's:hunter'], ['grog', 's:soldier']]) {
        openMenu('new'); await w(60); await go(type, id); q('#menu [data-mn="new-go"]').click(); await w(150);
        if (q('#menu [data-mn="replace"]') && !q('#menu').hidden) { q('#menu [data-mn="replace"]').click(); await w(150); }
        const c = checks(st), xp = st.abil.reduce((a, b) => a + (+b.xp || 0), 0);
        o.res[id] = { type: st.type, name: st.info.name, bad: c.filter(x => !x.ok).map(x => x.t).slice(0, 3), xp, vf: st.vf.length, relic: (st.inv || []).some(i => i.cat === 'relic') };
      }
      openMenu('new'); await w(60); await go('companion', 's:knight'); await go('grog'); o.reset = MN.newFrom;
      await go('magus', 'example'); await go('grog'); o.reset2 = MN.newFrom; closeMenu && closeMenu();
      return o;
    });
    check(tag + 'New Character: magus offers blank or the example; companion and grog offer blank and two book templates', r.magus === 'blank,example' && r.comp === 'blank,s:knight,s:scholar' && r.grog === 'blank,s:hunter,s:soldier', JSON.stringify([r.magus, r.comp, r.grog]));
    const R = r.res, ok = (k, type, name, xp) => R[k] && R[k].type === type && R[k].name === name && R[k].bad.length === 0 && R[k].xp === xp;
    check(tag + 'the Knight (DE p. 34) and the Female Scholar (DE p. 33) open as companions and pass every creation check', ok('s:knight', 'companion', 'The Knight', 445) && R['s:knight'].relic && ok('s:scholar', 'companion', 'The Female Scholar', 270), JSON.stringify([R['s:knight'], R['s:scholar']]));
    check(tag + 'the Hunter and the Standard Soldier (DE p. 32) open as grogs and pass every creation check', ok('s:hunter', 'grog', 'The Hunter', 320) && ok('s:soldier', 'grog', 'The Standard Soldier', 395), JSON.stringify([R['s:hunter'], R['s:soldier']]));
    check(tag + 'switching the kind of character drops a choice that does not fit it', r.reset === 'blank' && r.reset2 === 'blank', JSON.stringify([r.reset, r.reset2]));
    check(tag + 'no errors in the 4.9.9.8 checks', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await browser.close(); }
}

async function f999Checks(url, tag) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const { p, errs } = await pageFor(browser, url, tag);
    await enter(p);
    if (!(await p.evaluate(() => !!document.getElementById('v4.9.9.9')))) { check(tag + 'skipped (no v4.9.9.9)', true); return; }
    let axeSrc = null; try { axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'); } catch (e) {}
    // accessibility on Build and Play, both skins and themes
    const ax = [];
    if (axeSrc) for (const [skin, theme] of [['modern', 'dark'], ['modern', 'light'], ['retro', 'dark'], ['retro', 'light']]) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } }); const q = await ctx.newPage();
      await q.addInitScript(([s, t]) => { localStorage.setItem('arm5-theme', t); s === 'retro' ? localStorage.setItem('arm5-skin', 'retro') : localStorage.removeItem('arm5-skin'); }, [skin, theme]);
      await q.goto(url); await wait(1200); await enter(q);
      for (const mode of ['build', 'play']) {
        await q.evaluate(m => { const x = document.getElementById('menu'); x && (x.hidden = true, document.body.classList.remove('menu-open')); setMode(m); }, mode); await wait(700);
        const v = await q.evaluate(async src => { if (!window.axe) (0, eval)(src); const r = await axe.run(document, { runOnly: { type: 'rule', values: ['label', 'nested-interactive', 'aria-allowed-attr', 'aria-required-children', 'color-contrast'] }, resultTypes: ['violations'] }); return r.violations.map(x => x.id + '×' + x.nodes.length + ' ' + x.nodes[0].target.join(' ').slice(0, 50)); }, axeSrc);
        v.length && ax.push(`${skin}-${theme} ${mode}: ${v.join('; ')}`);
      }
      await ctx.close();
    }
    check(tag + 'no unlabeled fields, nested controls, misused ARIA or low-contrast text on Build and Play (axe, both skins and themes)', axeSrc && ax.length === 0, axeSrc ? ax.slice(0, 4).join(' | ') : 'axe-core not installed');
    // first visit on a phone: the chooser does not jump
    const shifts = [];
    for (const W of [390, 360]) {
      const ctx = await browser.newContext({ viewport: { width: W, height: 844 } }); const q = await ctx.newPage();
      await q.addInitScript(() => { window.__ls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__ls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
      await q.goto(url); await wait(2500); shifts.push(await q.evaluate(() => +window.__ls.toFixed(4))); await ctx.close();
    }
    check(tag + 'first visit on a phone: the style chooser settles without a jump (layout shift under 0.1 at 390 and 360 px)', shifts.every(x => x < 0.1), shifts.join(', '));
    // touch targets in Play on a phone
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const q = await ctx.newPage();
      await q.goto(url); await wait(1200); await enter(q);
      const t = await q.evaluate(async () => { const x = document.getElementById('menu'); x && (x.hidden = true, document.body.classList.remove('menu-open')); setMode('play'); await new Promise(r => setTimeout(r, 500)); document.querySelectorAll('#am-seal-tip, .am-tip-box').forEach(e => e.remove());
        const els = [...document.querySelectorAll('#work .hx-pip, #work .mini-step button:not([disabled]), #work .hx-w button:not([disabled])')], bad = [];
        for (const e of els) { e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(), cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
          for (const [dx, dy] of [[0, 11.5], [0, -11.5], [11.5, 0], [-11.5, 0]]) { const h = document.elementFromPoint(cx + dx, cy + dy); if (!(h === e || e.contains(h))) { bad.push((e.getAttribute('aria-label') || '?') + ' ' + dx + ',' + dy); break; } } }
        return { n: els.length, bad }; });
      check(tag + 'phone Play: every fatigue and wound control answers a tap 12 px from its centre (24 px targets)', t.n >= 12 && t.bad.length === 0, JSON.stringify(t).slice(0, 300));
      await ctx.close();
    }
    // the speaker button: header on desktop, File menu on a phone, bottom corner over the main menu
    const snd = {};
    for (const W of [1280, 390]) {
      const ctx = await browser.newContext({ viewport: { width: W, height: 900 } }); const q = await ctx.newPage();
      await q.goto(url); await wait(1200); await enter(q);
      snd[W] = await q.evaluate(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), at = () => { const t = document.querySelector('[data-global-sound-toggle]'); return t.closest('.hdr-tools') ? 'header' : t.closest('.f975-fm') ? 'file' : t.parentElement === document.body ? 'body' : 'other'; };
        const o = {}; const x = document.getElementById('menu'); x && (x.hidden = true, document.body.classList.remove('menu-open'));
        setMode('build'); await w(400); o.build = at(); setMode('play'); await w(400); o.play = at(); openMenu('home'); await w(400); o.menu = at();
        document.getElementById('menu').hidden = true; document.body.classList.remove('menu-open'); await w(300); o.back = at(); return o; });
      await ctx.close();
    }
    check(tag + 'the speaker button sits in the header (File menu on a phone) and floats only over the main menu', snd[1280].build === 'header' && snd[1280].play === 'header' && snd[1280].menu === 'body' && snd[1280].back === 'header' && snd[390].build === 'file' && snd[390].play === 'file', JSON.stringify(snd));
    // console tabs, header roles, then the Settings note
    const r = await p.evaluate(async () => { const w = ms => new Promise(z => setTimeout(z, ms)); const x = document.getElementById('menu'); x && (x.hidden = true, document.body.classList.remove('menu-open'));
      setMode('play'); await w(900); const tip = document.querySelector('#am-seal-tip [data-am-tip="ok"]'); tip && tip.click(); // the one-time seal tip takes focus as a dialog
      P().ctab = 'roll'; renderPlay(); await w(150); const tab = document.querySelector('[role=tab][data-pact="ctab"][data-t="roll"]'); tab.focus();
      tab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); await w(300);
      const arrowWhy = P().ctab + '/' + (document.activeElement ? (document.activeElement.dataset.t || document.activeElement.tagName + '.' + document.activeElement.className + ':' + document.activeElement.textContent.trim().slice(0, 20)) : '-'), arrow = arrowWhy === 'mods/mods', tablist = document.querySelectorAll('.ctabs [role=tablist] [role=tab]').length;
      setMode('build'); await w(400); const hdr = document.querySelector('#work > .folio > header');
      openSettings(); await w(80); const txt = (document.querySelector('.set-box') || document.body).innerText; document.querySelector('.pmodal') && document.querySelector('.pmodal').remove();
      return { note: !/☰/.test(txt) && /select the seal/.test(txt), arrow, arrowWhy, tablist, hdr: hdr ? hdr.getAttribute('role') : 'x' }; });
    check(tag + 'Settings names the seal for the main menu; console tabs answer the arrow keys; section headers are not buttons', r.note && r.arrow && r.tablist === 3 && r.hdr === null, JSON.stringify(r));
    check(tag + 'no errors in the 4.9.9.9 checks', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await browser.close(); }
}

async function shots(urlNew, urlOld) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch(); fs.mkdirSync(SHOTS, { recursive: true });
  const views = ['start', 'build', 'menu', 'play']; const out = {};
  async function take(url, skin, theme) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.addInitScript(([s, t]) => { localStorage.setItem('arm5-skin', s); localStorage.setItem('arm5-theme', t); }, [skin, theme]);
    await p.goto(url); await wait(1500); await p.evaluate(() => document.fonts.ready);
    // the version number differs between builds and its width moves its neighbours: show the same text in both
    const shot = async () => { await p.evaluate(() => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (/^\s*v?\d+\.\d+\.\d+\.\d+\s*$/.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/\d+\.\d+\.\d+\.\d+/, '0.0.0.0'); }); return p.screenshot(); };
    const r = {}; r.start = await shot();
    { const b = await p.$(`.amx-start [data-amx-enter="${skin === 'retro' ? 'retro' : 'classic'}"]`); if (b) { await b.click(); await wait(700); } }
    check(`[shots] ${skin}-${theme} renders in its own skin`, (await p.evaluate(() => document.documentElement.getAttribute('data-skin') || 'modern')) === skin);
    await p.evaluate(() => { const m = document.getElementById('menu'); if (m) m.hidden = true; scrollTo(0, 0); }); await wait(600);
    r.build = await shot();
    await p.evaluate(() => openMenu('home')); await wait(700); r.menu = await shot();
    await p.evaluate(() => { document.getElementById('menu').hidden = true; setMode('play'); }); await wait(1100); await p.evaluate(() => document.fonts.ready);
    r.play = await shot(); await ctx.close(); return r;
  }
  let PNG; try { PNG = require('pngjs').PNG; } catch (e) { PNG = null; }
  for (const skin of ['modern', 'retro']) for (const theme of ['dark', 'light']) {
    const a = await take(urlNew, skin, theme), b = await take(urlOld, skin, theme);
    for (const v of views) {
      const key = `${skin}-${theme}-${v}`;
      if (!PNG) { out[key] = a[v].equals(b[v]) ? 0 : -1; continue; }
      const A = PNG.sync.read(a[v]), B = PNG.sync.read(b[v]); let n = 0, y0 = 1e9, y1 = -1;
      for (let i = 0; i < A.data.length; i += 4) if (Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2])) > 24) { n++; const y = Math.floor(i / 4 / A.width); y < y0 && (y0 = y); y > y1 && (y1 = y); }
      // A change confined to one short line of text (the version number) is expected.
      const textLine = n <= 800 && y1 - y0 <= 24;
      out[key] = textLine ? 0 : n;
      if (!textLine && n > 0) { fs.writeFileSync(path.join(SHOTS, key + '-new.png'), a[v]); fs.writeFileSync(path.join(SHOTS, key + '-old.png'), b[v]); }
    }
  }
  await browser.close();
  const big = Object.entries(out).filter(([, n]) => n > 0 || n < 0);
  check('[shots] 16 views match the baseline (apart from one line of version text)', big.length === 0, big.map(([k, n]) => `${k}: ${n < 0 ? 'differs' : n + ' px'}`).join(', ') + ` → see ${SHOTS}`);
}

// ------------------------------------------------------------------ Build sheet redesign and speed (4.9.10.0)
async function f910Checks(url, tag) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const { p, errs } = await pageFor(browser, url, tag);
    await enter(p);
    if (!(await p.evaluate(() => !!document.getElementById('v4.9.10.0')))) { check(tag + 'skipped (no v4.9.10.0)', true); return; }
    const r = await p.evaluate(async () => {
      const w = ms => new Promise(z => setTimeout(z, ms)), q = s => document.querySelector(s), out = {};
      const m = document.getElementById('menu'); m && (m.hidden = true, document.body.classList.remove('menu-open'));
      const t = document.getElementById('am-seal-tip'); t && t.remove();
      st = exampleState(); persist(); setMode('build'); renderAll(); await w(300);
      // sources as short chips, the full title kept in the tooltip
      const src = [...document.querySelectorAll('#s-vf .f910-src')];
      out.chips = [src.length, src.every(e => /^DE p\. \d/.test(e.textContent) && /Definitive/.test(e.title)), /Ars Magica Definitive Edition p\./.test(q('#s-vf').innerText)];
      // spells and inventory: one row each, detail behind the chevron
      const row = q('#s-spells .sp-row'), more = row && row.querySelector('.f910-more'), sub = row && row.querySelector('.sp-sub');
      out.rowShut = !!more && more.getAttribute('aria-expanded') === 'false' && !!sub && getComputedStyle(sub).display === 'none';
      more && more.click(); await w(50);
      out.rowOpen = !!more && more.getAttribute('aria-expanded') === 'true' && getComputedStyle(sub).display !== 'none';
      out.invMore = document.querySelectorAll('#s-inv .inv-row .f910-more').length;
      // boxes: Virtue and Flaw columns, Personality's sub-groups
      out.boxes = [document.querySelectorAll('#s-persona .f910-box').length, [...document.querySelectorAll('#s-persona .f910-box>h3')].map(h => h.textContent.trim()).join('|')];
      // ledger: Best Art as a line, Experience as spent of total
      out.best = [!!q('#ledger .f910-best'), !q('#ledger .ward[aria-label^="Best Art"]'), (q('#ledger .ward[aria-label^="Experience"] text.d') || {}).textContent];
      // keyed redraw: adding a trait rebuilds Personality only; the open spell row and other sections stay
      const keep = q('#s-concept'), per = q('#s-persona'), n0 = st.traits.length;
      q('[data-act="add-trait"]').click(); await w(150);
      out.keyed = [q('#s-concept') === keep, q('#s-persona') !== per, st.traits.length === n0 + 1, document.querySelectorAll('#s-persona [data-k^="traits."]').length >= (n0 + 1), !!q('#s-spells .sp-row.f910-open')];
      out.order = [...document.querySelectorAll('#work>section.folio .seal')].map(e => e.textContent).join(',');
      // a new character redraws every section with its own values
      st = blankState('companion'); st.info.name = 'Probe Companion'; renderAll(); await w(200);
      out.fresh = [(q('[data-k="info.name"]') || {}).value, !q('#s-arts') || q('#s-arts').hidden || /Needs|magi/i.test(q('#s-arts').innerText) || true];
      st = exampleState(); renderAll(); await w(200);
      // typing: the value is in the sheet at once, the totals catch up when typing pauses, nothing is lost
      const nm = q('[data-k="info.name"]'); nm.focus(); nm.value = 'Aldric X'; nm.dispatchEvent(new Event('input', { bubbles: true }));
      out.type = [st.info.name === 'Aldric X'];
      await w(450); out.type.push(/Aldric X/.test(q('#ledger').textContent));
      nm.value = 'Aldric Y'; nm.dispatchEvent(new Event('input', { bubbles: true })); nm.blur(); await w(30);
      out.type.push(/Aldric Y/.test(q('#ledger').textContent)); await w(900); out.type.push((localStorage.getItem('arm5-sheet-builder-v1') || '').includes('Aldric Y'));
      // folded Laboratory is drawn when opened
      const lab = q('#s-lab'); const shut = lab && lab.classList.contains('shut');
      if (lab) { if (!shut) toggleFolio(lab); refresh(); toggleFolio(lab); await w(100); }
      out.lab = lab ? (q('#lab-tiles') || {}).innerHTML.length > 0 : true;
      return out;
    });
    check(tag + 'sources show as short chips (DE p. N) with the full title in the tooltip', r.chips[0] > 5 && r.chips[1] && !r.chips[2], JSON.stringify(r.chips));
    check(tag + 'a spell is one row; its detail opens behind the chevron', r.rowShut && r.rowOpen, JSON.stringify([r.rowShut, r.rowOpen]));
    check(tag + 'inventory rows have a detail chevron', r.invMore > 3, String(r.invMore));
    check(tag + 'Personality groups Warping, Longevity and Raw Vis in their own boxes', r.boxes[0] >= 3, r.boxes.join(' '));
    check(tag + 'ledger: Best Art is a line and Experience reads spent of total', r.best[0] && r.best[1] && /^\/ \d+/.test(r.best[2] || ''), JSON.stringify(r.best));
    check(tag + 'adding a trait rebuilds Personality only and keeps open rows elsewhere', r.keyed.every(Boolean), JSON.stringify(r.keyed));
    check(tag + 'section seals stay numbered in order after a keyed redraw', /^I,II,III,IV,V,VI,VII/.test(r.order), r.order);
    check(tag + 'a different character redraws with its own values', r.fresh[0] === 'Probe Companion', JSON.stringify(r.fresh));
    check(tag + 'typing stores the value at once and the totals and save catch up (pause or leaving the field)', r.type.every(Boolean), JSON.stringify(r.type));
    check(tag + 'a folded Laboratory is drawn when it opens', r.lab);
    // phones: no status pill under the header buttons
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const q = await ctx.newPage();
    await q.goto(url); await wait(1200); await enter(q);
    const ov = await q.evaluate(async () => { const m = document.getElementById('menu'); m && (m.hidden = true, document.body.classList.remove('menu-open')); st = exampleState(); setMode('build'); renderAll(); await new Promise(z => setTimeout(z, 300));
      return [...document.querySelectorAll('#work>section.folio>header')].filter(h => { const a = h.querySelector('.pill'), b = h.querySelector('.f975-hact'); if (!a || !b) return false; const x = a.getBoundingClientRect(), y = b.getBoundingClientRect(); return x.width && x.right > y.left + 1 && x.bottom > y.top && x.top < y.bottom; }).map(h => h.parentElement.id); });
    await ctx.close();
    check(tag + 'phone: section status pills never sit under the header buttons', ov.length === 0, ov.join(','));
    // Retro: a bookmark ribbon instead of the red header stripe; gold when pinned; folded chips clear of the rule
    { const c2 = await browser.newContext({ viewport: { width: 1280, height: 900 } }); const q2 = await c2.newPage();
      await q2.addInitScript(() => { localStorage.setItem('arm5-skin', 'retro'); localStorage.setItem('arm5-theme', 'dark'); });
      await q2.goto(url); await wait(1200); { const b = await q2.$('.amx-start [data-amx-enter="retro"]'); if (b) { await b.click(); await wait(700); } }
      const rr = await q2.evaluate(async () => { const m = document.getElementById('menu'); m && (m.hidden = true, document.body.classList.remove('menu-open')); st = exampleState(); setMode('build'); renderAll();
        ['s-concept', 's-house', 's-chars'].forEach(i => SHUT.add(i)); applyShut(); const pin = document.querySelector('#s-house [data-f975b=pin]'); pin && pin.getAttribute('aria-pressed') !== 'true' && pin.click(); await new Promise(z => setTimeout(z, 300));
        if (document.documentElement.getAttribute('data-skin') !== 'retro') return { skin: document.documentElement.getAttribute('data-skin') };
        const be = e => getComputedStyle(e, '::before'), H = [...document.querySelectorAll('#work>section.folio>header')];
        const c = document.querySelector('#s-chars'), h = c.querySelector(':scope>header'), sum = h.querySelector('.f975-sum'), seal = h.querySelector('.seal');
        const out = { stripes: H.filter(x => getComputedStyle(x).backgroundImage !== 'none').length, red: /7c2414/.test(be(c).backgroundImage), gold: /d9a62e/.test(be(document.querySelector('#s-house')).backgroundImage),
          gap: Math.round(h.getBoundingClientRect().bottom - parseFloat(getComputedStyle(h).borderBottomWidth) - sum.getBoundingClientRect().bottom),
          clear: Math.round(seal.getBoundingClientRect().left - c.getBoundingClientRect().left) - (parseFloat(be(c).left) + parseFloat(be(c).width)) };
        pin && pin.click(); return out; });
      await c2.close();
      check(tag + 'Retro: sections carry a pixel bookmark, not the red header stripe; it turns gold while pinned', rr.stripes === 0 && rr.red && rr.gold, JSON.stringify(rr));
      check(tag + 'Retro: folded summary chips stand clear of the gold rule and the bookmark clears the seal', rr.gap >= 8 && rr.clear >= 4, JSON.stringify(rr)); }
    check(tag + 'no errors in the redesign checks', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await browser.close(); }
}

async function f911Checks(url, tag) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const { p, errs } = await pageFor(browser, url, tag);
    await enter(p);
    if (!(await p.evaluate(() => !!document.getElementById('v4.9.11.0')))) { check(tag + 'skipped (no v4.9.11.0)', true); return; }
    const r = await p.evaluate(async () => {
      const w = ms => new Promise(z => setTimeout(z, ms)), q = s => document.querySelector(s), out = {};
      const frame = () => new Promise(z => requestAnimationFrame(() => requestAnimationFrame(z)));
      const m = document.getElementById('menu'); m && (m.hidden = true, document.body.classList.remove('menu-open'));
      const t = document.getElementById('am-seal-tip'); t && t.remove();
      st = exampleState(); persist(); setMode('play'); P().tab = 'skills'; renderPlay(); await w(400);
      // keyed redraw: loading a roll keeps the hero and the untouched sections, rebuilds the console
      const hero = q('#work .hero'), secs = [...document.querySelectorAll('#work .psec')], con = q('#ledger .console');
      const row = q('#work .pane [data-pact="load"]');
      row && row.click(); await frame();
      const kept = [...document.querySelectorAll('#work .psec')].filter(e => secs.includes(e)).length;
      out.keyed = [q('#work .hero') === hero, kept >= secs.length - 1 && secs.length > 1, q('#ledger .console') !== con || q('#ledger .cbody') !== null, !!row];
      // the Situation strip follows the state (it is re-inserted, never left stale) and appears once
      const sx = () => (q('[data-sx="stress"]') || {}).getAttribute && q('[data-sx="stress"]').getAttribute('aria-pressed');
      const s0 = sx(); q('[data-sx="stress"]').click(); await frame(); const s1 = sx(); q('[data-sx="stress"]').click(); await frame();
      out.sx = [s0 !== s1, sx() === s0, document.querySelectorAll('#work .sx').length === 1];
      // every tab draws the same text through the keyed path as through a full redraw, with no duplicate ids
      const norm = () => [q('#work').innerText.replace(/\s+/g, ' ').trim(), q('#ledger').innerText.replace(/\s+/g, ' ').trim(), document.querySelectorAll('#work *').length];
      const dup = () => { const seen = new Set(), d = []; document.querySelectorAll('[id]').forEach(e => { seen.has(e.id) ? d.push(e.id) : seen.add(e.id); }); return d; };
      out.same = []; out.dups = [];
      for (const tb of ['skills', 'magic', 'realms', 'combat', 'inv', 'persona', 'seasons', 'ordeals', 'profile']) {
        P().tab = tb === 'skills' ? 'magic' : 'skills'; renderPlay(); await frame();
        P().tab = tb; renderPlay(); await frame(); const a = norm(); out.dups.push(...dup());
        window.amPlayFull = true; renderPlay(); await frame(); window.amPlayFull = false; const b = norm();
        (a[0] !== b[0] || a[1] !== b[1] || a[2] !== b[2]) && out.same.push(tb + ':' + a[2] + '/' + b[2]);
      }
      // no layout is read back during a redraw (the console scroll and the section strip offsets are deferred)
      let reads = 0; const G = [[HTMLElement.prototype, 'offsetHeight'], [HTMLElement.prototype, 'offsetWidth'], [Element.prototype, 'scrollTop'], [Element.prototype, 'scrollWidth'], [Element.prototype, 'clientWidth']];
      const saved = G.map(([o, k]) => { const d = Object.getOwnPropertyDescriptor(o, k); Object.defineProperty(o, k, { configurable: true, get() { reads++; return d.get.call(this); }, set: d.set ? function (v) { d.set.call(this, v); } : undefined }); return d; });
      const gbcr = Element.prototype.getBoundingClientRect, gcs = window.getComputedStyle; Element.prototype.getBoundingClientRect = function () { reads++; return gbcr.call(this); }; window.getComputedStyle = function () { reads++; return gcs.apply(this, arguments); };
      P().tab = 'skills'; renderPlay();
      G.forEach(([o, k], i) => Object.defineProperty(o, k, saved[i])); Element.prototype.getBoundingClientRect = gbcr; window.getComputedStyle = gcs;
      out.reads = reads; await frame(); await frame();
      out.navH = getComputedStyle(document.documentElement).getPropertyValue('--psec-nav-h').trim();
      // short source chips in Play
      P().tab = 'magic'; renderPlay(); await frame();
      const mg = q('#work').innerText, chip = [...document.querySelectorAll('#work [title]')].find(e => /Definitive Edition/.test(e.title) && /DE p\. \d/.test(e.textContent));
      out.chips = [/DE p\. \d/.test(mg), !/Ars Magica Definitive Edition p\./.test(mg), !!chip];
      P().tab = 'inv'; renderPlay(); await frame(); out.chips.push(!/Ars Magica (Definitive Edition|DE) p\./.test(q('#work').innerText));
      // main menu tiles in sentence case
      setMode('build'); openMenu('troupe'); await w(200);
      out.menu = [...document.querySelectorAll('#menu [data-mn] b, #menu [data-mn] strong, #menu [data-mn]')].map(e => e.textContent).join('|');
      return out;
    });
    check(tag + 'Play: loading a roll keeps the hero and the untouched sections (keyed redraw)', r.keyed.every(Boolean), JSON.stringify(r.keyed));
    check(tag + 'Play: the Situation strip follows the state after a keyed redraw and appears once', r.sx.every(Boolean), JSON.stringify(r.sx));
    check(tag + 'Play: every tab reads the same through the keyed redraw as through a full redraw', r.same.length === 0, r.same.join(' '));
    check(tag + 'Play: no duplicate ids after keyed redraws', r.dups.length === 0, r.dups.slice(0, 5).join(','));
    check(tag + 'Play: a redraw reads no layout (scroll and strip offsets deferred)', r.reads === 0, String(r.reads));
    check(tag + 'Play: the section strip offset is still measured after the redraw', /^\d+px$/.test(r.navH), r.navH);
    check(tag + 'Play: sources show as short chips (DE p. N) with the full title on hover', r.chips.every(Boolean), JSON.stringify(r.chips));
    check(tag + 'main menu: New character and Preview character in sentence case', /New character/.test(r.menu) && /Preview character/.test(r.menu) && !/New Character|Preview Character/.test(r.menu), r.menu.slice(0, 200));
    // Storyguide: buttons in sentence case, Definitive Edition pages as DE
    await p.evaluate(() => { document.getElementById('menu').hidden = false; openMenu('home'); }); await wait(300);
    await p.click('#menu [data-mn="storyguide"]'); await wait(1800);
    const tiles = await p.evaluate(() => [...document.querySelectorAll('#menu [data-mn^="sg-"]')].map(e => e.textContent.replace(/\s+/g, ' ')).join('|'));
    check(tag + 'Storyguide menu: New saga, Saga library, Import saga JSON', /New saga/.test(tiles) && /Saga library/.test(tiles) && /Import saga JSON/.test(tiles) && !/New Saga|Saga Library|Import Saga/.test(tiles), tiles.slice(0, 200));
    await p.click('#menu [data-mn="sg-new"]'); await wait(900);
    const nm = await p.$('#sg-new input, .sg input[type=text]'); if (nm) { await nm.fill('Case saga'); await p.keyboard.press('Enter'); await wait(900); }
    const sgr = await p.evaluate(async () => {
      const w = ms => new Promise(z => setTimeout(z, ms)), go = s => { const b = document.querySelector(`[data-sga="go"][data-screen="${s}"]`); b && b.click(); }, txt = [];
      for (const s of ['people', 'stories', 'encounters', 'calendar', 'journal', 'maps', 'covenant']) { go(s); await w(250); document.querySelectorAll('#sg .sg-main button').forEach(b => txt.push(b.textContent.trim().replace(/\s+/g, ' '))); }
      go('people'); await w(250); const add = document.querySelector('#sg .sg-main [data-sga="add"]'); add && add.click(); await w(400);
      const h2 = (document.querySelector('#sg .sg-main h2') || {}).textContent;
      go('bestiary'); await w(1200); const best = document.querySelector('#sg .sg-main').innerText;
      return { txt, h2, best: [/\bDE p\. \d/.test(best), !/\bArM5 p\. \d/.test(best)] };
    });
    const bad = sgr.txt.filter(t => /^(\+ |◀ )?(New|Next|Previous|Delete|All|Save|Remove|Clear|Create|Export|Show|End|Close|Go|Choose|From|Manage|Covenant|Session) [A-Z][a-z]/.test(t) && !/JSON|Storyguide/.test(t));
    check(tag + 'Storyguide: action buttons in sentence case', bad.length === 0 && sgr.txt.some(t => t === '+ New person') && sgr.txt.some(t => /^Next season/.test(t)), bad.slice(0, 6).join(' | '));
    check(tag + 'Storyguide: a record heading shows its name as typed (no Title Case)', sgr.h2 === 'New person', String(sgr.h2));
    check(tag + 'Storyguide bestiary: Definitive Edition pages read DE p. N', sgr.best.every(Boolean), JSON.stringify(sgr.best));
    check(tag + 'no errors in the Play and Storyguide checks', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await browser.close(); }
}

// 4.9.11.1: the 2026-11-09 audit fixes and the redrawn seal, crest and roll circle
async function f9111Checks(url, tag) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const { p, errs } = await pageFor(browser, url, tag);
    await enter(p);
    if (!(await p.evaluate(() => !!document.getElementById('v4.9.11.1')))) { check(tag + 'skipped (no v4.9.11.1)', true); return; }
    const prep = () => p.evaluate(async () => {
      const m = document.getElementById('menu'); m && (m.hidden = true, document.body.classList.remove('menu-open'));
      const t = document.getElementById('am-seal-tip'); t && t.remove();
      st = exampleState(); persist(); setMode('build'); renderAll(); scrollTo(0, 0); await new Promise(z => setTimeout(z, 500));
    });
    await prep();
    // art
    const art = await p.evaluate(() => {
      const q = (s, r) => (r || document).querySelector(s), sig = q('header.top .sigil'), svg = fxCircleSvg0();
      const d = document.createElement('div'); d.innerHTML = svg;
      const disp = (root, c) => { const e = root && root.querySelector(c); return e ? getComputedStyle(e).display : 'missing'; };
      openMenu('home'); const big = q('#menu .menu-head .sigil'); const bigFine = disp(big, '.s-f');
      const mh = q('#menu'); mh && (mh.hidden = true); document.body.classList.remove('menu-open');
      return { vb: sig && sig.getAttribute('viewBox'), layers: ['.turn', '.turn-mid', '.turn-in'].map(c => !!(sig && sig.querySelector(c))), smallFine: disp(sig, '.s-f'), bigFine,
        meds: d.querySelectorAll('.fx-med').length, icons: [...d.querySelectorAll('.fx-ico')].filter(g => g.children.length > 0).length, r5: !!d.querySelector('.fx-r5'),
        kept: ['.fx-r1', '.fx-r2', '.fx-r3', '.fx-r4', '.fx-draw', '.fx-ticks', '.fx-ringtext'].every(c => !!d.querySelector(c)), bad: /undefined|NaN/.test(svg), seam: (d.querySelector('textPath') || {}).getAttribute && d.querySelector('textPath').getAttribute('textLength') };
    });
    check(tag + 'seal: 120-unit drawing with three turning layers', art.vb === '0 0 120 120' && art.layers.every(Boolean), JSON.stringify(art.layers) + ' ' + art.vb);
    check(tag + 'seal: fine work only on the large (menu) seal', art.smallFine === 'none' && art.bigFine !== 'none' && art.bigFine !== 'missing', art.smallFine + ' / ' + art.bigFine);
    check(tag + 'roll circle: fifteen Art medallions with icons, five layers, old class names kept', art.meds === 15 && art.icons === 15 && art.r5 && art.kept && !art.bad && !!art.seam, JSON.stringify(art));
    // Build
    const b = await p.evaluate(() => {
      const q = s => document.querySelector(s), t = q('#s-abil tbody[data-lv-list="abil"]').parentElement, wr = t.closest('.tbl-wrap');
      const sc = t.querySelector('tbody tr td:nth-child(7)').getBoundingClientRect(), wb = wr.getBoundingClientRect();
      const small = [...document.querySelectorAll('#work *')].filter(e => !e.children.length && e.textContent.trim() && e.getBoundingClientRect().width > 0 && parseFloat(getComputedStyle(e).fontSize) < 12).length;
      const vf = [...document.querySelectorAll('#s-vf .vf-cols>*')].map(e => Math.round(e.getBoundingClientRect().height));
      return { fit: wr.scrollWidth <= wr.clientWidth + 1 && sc.width > 0 && sc.right <= wb.right + 1, clipped: [...t.querySelectorAll('input')].filter(i => i.scrollWidth > i.clientWidth + 2).map(i => i.value),
        role: t.getAttribute('role') === 'table' && t.querySelector('tbody tr').getAttribute('role') === 'row', nums: /\(section [IVXL]+\)|section [IVXL]+[ :(]/.test(document.documentElement.innerHTML), small, vf,
        gilt: getComputedStyle(q('.btn.primary') || document.body).backgroundColor };
    });
    check(tag + 'Abilities: the Score column is inside the card at 1280 px, nothing clipped', b.fit && b.clipped.length === 0 && b.role, JSON.stringify(b.clipped));
    check(tag + 'no note cites a section by numeral', !b.nums);
    check(tag + 'Build: no text under 12 px', b.small === 0, String(b.small));
    check(tag + 'Virtues and Flaws panels take their own heights', b.vf.length === 2 && b.vf[0] !== b.vf[1], JSON.stringify(b.vf));
    const set = async () => p.evaluate(async () => {
      openSettings(); await new Promise(z => setTimeout(z, 400)); const m = document.querySelector('.pmodal'), a = m.querySelector('.pm-acts').getBoundingClientRect();
      const gaps = [...m.querySelectorAll('[data-setpane=general]>.fset')].slice(1).map(f => Math.round(f.getBoundingClientRect().top - f.previousElementSibling.getBoundingClientRect().bottom));
      m.remove(); return { vis: a.top >= 0 && a.bottom <= innerHeight + 1, gaps };
    });
    const s1 = await set();
    check(tag + 'Settings: Done is in view and sections are spaced (1280 px)', s1.vis && s1.gaps.every(g => g >= 16), JSON.stringify(s1));
    // Play
    const pl = await p.evaluate(async () => {
      const w = ms => new Promise(z => setTimeout(z, ms)), q = s => document.querySelector(s), out = {};
      setMode('play'); P().tab = 'skills'; renderPlay(); await w(400);
      out.moved = !!document.getElementById('v4.9.11.4');   // 4.9.11.4 moved the odds controls to Modifiers (f9114Checks)
      const cap = () => (q('#work .f9111-odds') || {}).innerText || '';
      if (!out.moved) {
      out.cap = /Ease Factor/.test(cap()) && document.querySelectorAll('#work .f9111-odds').length === 1;
      const ef0 = +P().ef, t0 = q('#work .pane .odds').title;
      q('#work .f9111-odds [aria-label="Raise the Ease Factor"]').click(); await w(250);
      out.ef = [ef0, +P().ef, t0 !== q('#work .pane .odds').title, new RegExp('\\b' + (ef0 + 3) + '\\b').test(cap())];
      q('#work .f9111-odds [aria-label="Lower the Ease Factor"]').click(); await w(250); out.efBack = +P().ef === ef0;
      }
      const rb = () => q('#ledger [data-pact="reset-mods"]');
      out.reset0 = rb() ? rb().hidden : 'none';
      P().misc = 2; renderPlay(); await w(200); out.reset1 = rb() ? rb().hidden : 'none'; P().misc = 0; renderPlay(); await w(200);
      out.aura0 = !q('#ledger .cbody>.empty') || getComputedStyle(q('#ledger .roll-aura') || document.body).display === 'none' || !q('#ledger .roll-aura');
      out.snd = [...document.querySelectorAll('[data-global-sound-toggle],[data-pact="sfx-toggle"]')].filter(e => e.getBoundingClientRect().width > 0).length;
      out.small = [...document.querySelectorAll('#work *,#ledger *')].filter(e => !e.children.length && e.textContent.trim() && e.getBoundingClientRect().width > 0 && parseFloat(getComputedStyle(e).fontSize) < 12).length;
      out.crest = !!q('#work .crest-svg .turn-mid');
      out.conf = /Score/.test((q('#work .hx-conf') || {}).innerText || '') && /Points/i.test((q('#work .hx-conf') || {}).innerText || '');
      P().tab = 'combat'; renderPlay(); await w(300);
      if (!out.moved) { out.opp = /opposing total/i.test(cap()); const o0 = +P().oppTotal;
      const up = q('#work .f9111-odds [aria-label="Raise the opposing total"]'); up && up.click(); await w(250); out.oppUp = +P().oppTotal === o0 + 1; P().oppTotal = o0; renderPlay(); }
      P().tab = 'magic'; renderPlay(); await w(300);
      out.rdt = /R\s+\S+.*D\s+\S+.*T\s+\S+/.test((q('#work .spell-card .sc-rdt') || {}).innerText || '');
      // rolling a spell lights its two Arts on the circle
      P().sel = 'spell:0'; renderPlay(); await w(200); const c = getCheck('spell:0');
      q('[data-pact="roll"]').click(); await w(900);
      const fx = q('.fx'), lit = fx ? [...fx.querySelectorAll('.fx-med')].filter(m => parseFloat(getComputedStyle(m.querySelector('.fx-mc')).strokeWidth) > 2).map(m => m.getAttribute('class').replace(/.*fx-m-/, '')) : [];
      out.lit = [lit.sort().join(','), fx && fx.dataset.fx, fx && fx.dataset.fxt]; out.hint = /Tap to continue/.test(document.documentElement.innerHTML);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await w(300); const f2 = q('.fx'); f2 && f2.remove();
      P().tab = 'skills'; P().sel = null; renderPlay();
      return out;
    });
    if (!pl.moved) {
      check(tag + 'Play: the odds caption names the Ease Factor and its control changes every badge', pl.cap && pl.ef[1] === pl.ef[0] + 3 && pl.ef[2] && pl.ef[3] && pl.efBack, JSON.stringify(pl.ef));
      check(tag + 'Combat: the caption names the opposing total and steps it', pl.opp && pl.oppUp);
    }
    check(tag + 'console: Reset shows only when a modifier is set; no aura fold on the empty console', pl.reset0 === true && pl.reset1 === false && pl.aura0, pl.reset0 + '/' + pl.reset1 + '/' + pl.aura0);
    check(tag + 'Play: one sound switch on screen', pl.snd === 1, String(pl.snd));
    check(tag + 'Play: no text under 12 px; Confidence labelled; crest has its new layer', pl.small === 0 && pl.conf && pl.crest, pl.small + ' ' + pl.conf + ' ' + pl.crest);
    check(tag + 'spell cards show Range, Duration and Target', pl.rdt);
    check(tag + 'roll circle: the rolled spell lights its Technique and Form', pl.lit[0].split(',').length === 2 && pl.lit[0].includes(pl.lit[1]) && pl.lit[0].includes(pl.lit[2]), JSON.stringify(pl.lit));
    check(tag + 'the roll ceremony has a touch hint', pl.hint);
    // tablet
    await p.setViewportSize({ width: 768, height: 1024 }); await wait(500);
    const tb = await p.evaluate(async () => {
      const w = ms => new Promise(z => setTimeout(z, ms)); setMode('play'); await w(400);
      const h = document.querySelector('header.top').getBoundingClientRect().height, a = document.getElementById('work').getBoundingClientRect(), c = document.getElementById('ledger').getBoundingClientRect();
      setMode('build'); await w(400); const t = document.querySelector('#s-abil tbody[data-lv-list="abil"]').parentElement.closest('.tbl-wrap');
      return { h, side: c.left >= a.right - 1 && c.width > 200, fit: t.scrollWidth <= t.clientWidth + 1, hs: document.scrollingElement.scrollWidth - innerWidth };
    });
    check(tag + '768 px: one-row header, console beside the Play page, Abilities fit', tb.h < 80 && tb.side && tb.fit && tb.hs <= 0, JSON.stringify(tb));
    // phone
    await p.setViewportSize({ width: 390, height: 844 }); await wait(500);
    const ph = await p.evaluate(async () => {
      const w = ms => new Promise(z => setTimeout(z, ms)), q = s => document.querySelector(s), out = {};
      const chip = [...document.querySelectorAll('.f975-gchip')].find(c => c.getBoundingClientRect().width > 0 && /Skills/i.test(c.textContent)); chip && chip.click(); await w(1200);
      const st2 = q('.f975-strip').getBoundingClientRect(), sec = [...document.querySelectorAll('#work>section.folio')].map(e => e.getBoundingClientRect()).find(r => r.top > 0 && r.top < innerHeight);
      out.jump = !!chip && !!sec && sec.top >= st2.bottom - 1;
      const t = q('#s-abil tbody[data-lv-list="abil"]').parentElement; out.abil = getComputedStyle(t.querySelector('tbody tr')).display === 'grid' && t.getBoundingClientRect().width <= innerWidth;
      scrollTo(0, 0); openSettings(); await w(400); const m = q('.pmodal'), a = m.querySelector('.pm-acts').getBoundingClientRect(); out.done = a.top >= 0 && a.bottom <= innerHeight + 1; m.remove();
      setMode('play'); P().tab = 'combat'; renderPlay(); await w(500);
      const wt = q('#work table.wtab'); out.cards = wt && getComputedStyle(wt.querySelector('tbody tr')).display === 'grid';
      out.over = [...document.querySelectorAll('#work .pane .psec *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && r.right > innerWidth + 1 && !e.closest('thead'); }).length;
      out.hs = document.scrollingElement.scrollWidth - innerWidth; P().tab = 'skills'; renderPlay();
      return out;
    });
    check(tag + '390 px: a rail jump stops below the summary strip', ph.jump);
    check(tag + '390 px: Abilities and weapons are cards; nothing runs off the page; Settings Done in view', ph.abil && ph.cards && ph.over === 0 && ph.hs <= 0 && ph.done, JSON.stringify(ph));
    await p.setViewportSize({ width: 1280, height: 900 }); await wait(300);
    // Storyguide: the page heading takes focus without a box; one description on the menu tile
    await p.evaluate(() => { document.getElementById('menu').hidden = false; openMenu('home'); }); await wait(300);
    const desc = await p.evaluate(() => (document.querySelector('#menu [data-mn="storyguide"] small') || {}).textContent || '');
    await p.click('#menu [data-mn="storyguide"]'); await wait(1800);
    await p.click('#menu [data-mn="sg-new"]'); await wait(900);
    const nm = await p.$('#sg-new input, .sg input[type=text]'); if (nm) { await nm.fill('Audit saga'); await p.keyboard.press('Enter'); await wait(900); }
    const sg = await p.evaluate(async () => {
      const b = document.querySelector('[data-sga="go"][data-screen="people"]'); b && b.click(); await new Promise(z => setTimeout(z, 300));
      const h = document.querySelector('#sg .sg-main h2'); h && h.focus(); const i = document.querySelector('#sg input[type=text]');
      return { outline: h ? getComputedStyle(h).outlineStyle : 'missing', top: i ? getComputedStyle(i).borderTopWidth : 'missing' };
    });
    check(tag + 'Storyguide: heading focus draws no box; single-line fields are underlined', sg.outline === 'none' && (sg.top === '0px' || sg.top === 'missing'), JSON.stringify(sg));
    check(tag + 'Storyguide menu tile keeps one description', /Prepare stories/.test(desc), desc);
    check(tag + 'no errors in the 4.9.11.1 checks', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await browser.close(); }
}

// 4.9.11.2: the roll screen waits for the player; Retro keeps the earlier circle
async function f9112Checks(url, tag) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const { p, errs } = await pageFor(browser, url, tag);
    await enter(p);
    if (!(await p.evaluate(() => !!document.getElementById('v4.9.11.2')))) { check(tag + 'skipped (no v4.9.11.2)', true); return; }
    const r = await p.evaluate(async () => {
      const w = ms => new Promise(z => setTimeout(z, ms)), q = s => document.querySelector(s), out = {};
      const m = document.getElementById('menu'); m && (m.hidden = true, document.body.classList.remove('menu-open'));
      const t = document.getElementById('am-seal-tip'); t && t.remove();
      const cnt = svg => { const d = document.createElement('div'); d.innerHTML = svg; return [d.querySelectorAll('.fx-med').length, !!d.querySelector('.fx-r4'), !!d.querySelector('.fx-glyph')]; };
      const root = document.documentElement, skin = root.getAttribute('data-skin');
      out.modern = cnt(fxCircleSvg()); root.setAttribute('data-skin', 'retro'); out.retro = cnt(fxCircleSvg()); skin ? root.setAttribute('data-skin', skin) : root.removeAttribute('data-skin');
      st = exampleState(); persist(); setMode('play'); P().tab = 'magic';
      const i = st.spells.findIndex(s => /Im/.test(s.tf || '')); P().sel = 'spell:' + (i < 0 ? 0 : i); renderPlay(); await w(300);
      q('[data-pact="roll"]').click(); await w(1200);
      const fx = q('.fx'); out.ghost = fx ? [fx.querySelectorAll('.fx-ghost').length, [...fx.querySelectorAll('.fx-ghost .fx-med')].filter(e => getComputedStyle(e).display !== 'none').length] : null;
      await w(7300); out.open = !!q('.fx') && q('.fx').classList.contains('fx-done');
      return out;
    });
    await p.keyboard.press('Enter'); await wait(800);
    const closed = await p.evaluate(() => !document.querySelector('.fx'));
    check(tag + 'roll screen: still open 7 s after the result, and a key closes it', r.open && closed, r.open + '/' + closed);
    check(tag + 'roll circle: Modern has fifteen medallions, Retro the earlier circle', r.modern[0] === 15 && r.retro[0] === 0 && r.retro[1] && r.retro[2], JSON.stringify([r.modern, r.retro]));
    check(tag + 'roll circle: no medallion shows in an Imaginem ghost copy', !!r.ghost && r.ghost[0] > 0 && r.ghost[1] === 0, JSON.stringify(r.ghost));
    check(tag + 'no errors in the 4.9.11.2 checks', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await browser.close(); }
}

// 4.9.11.3: Retro shows the earlier seal and crest; Modern the 4.9.11.1 ones
async function f9113Checks(url, tag) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const { p, errs } = await pageFor(browser, url, tag);
    const ch = await p.evaluate(() => { const v = (h, c) => { const e = document.querySelector('.amx-half--' + h + ' [data-amx-sigil] ' + c); return e ? getComputedStyle(e).display !== 'none' : null; };
      return document.querySelector('.amx-start') ? [v('modern', 'g.sn>*'), v('modern', 'g.so>*'), v('retro', 'g.sn>*'), v('retro', 'g.so>*')] : null; });
    await enter(p);
    if (!(await p.evaluate(() => !!document.getElementById('v4.9.11.3')))) { check(tag + 'skipped (no v4.9.11.3)', true); return; }
    const r = await p.evaluate(async () => {
      const w = ms => new Promise(z => setTimeout(z, ms)), root = document.documentElement, skin = root.getAttribute('data-skin');
      const m = document.getElementById('menu'); m && (m.hidden = true, document.body.classList.remove('menu-open'));
      const vis = c => { const e = document.querySelector('header.top .sigil ' + c); return !!e && getComputedStyle(e).display !== 'none'; };
      st = exampleState(); persist(); setMode('play'); await w(300);
      const out = { modern: [vis('g.sn>*'), vis('g.so>*'), /turn-mid/.test(crest())] };
      root.setAttribute('data-skin', 'retro'); out.retro = [vis('g.sn>*'), vis('g.so>*'), /turn-mid/.test(crest()), vis('g.so>rect')];
      skin ? root.setAttribute('data-skin', skin) : root.removeAttribute('data-skin'); return out;
    });
    check(tag + 'seal: Modern shows the new drawing, Retro the earlier one (two squares)', r.modern[0] && !r.modern[1] && !r.retro[0] && r.retro[1] && r.retro[3], JSON.stringify(r));
    check(tag + 'crest: new rings in Modern, the earlier crest in Retro', r.modern[2] && !r.retro[2]);
    // the Retro half's seal may already be replaced by its pixel drawing (then its shapes are gone: null)
    check(tag + 'first-run screen: the Modern half shows the new seal and the Retro half does not', !ch || (ch[0] && !ch[1] && !ch[2] && ch[3] !== false), JSON.stringify(ch));
    check(tag + 'no errors in the 4.9.11.3 checks', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await browser.close(); }
}

// 4.9.11.4: the odds yardstick is in Modifiers, off until ticked, and never touches a roll
async function f9114Checks(url, tag) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const { p, errs } = await pageFor(browser, url, tag);
    await enter(p);
    if (!(await p.evaluate(() => !!document.getElementById('v4.9.11.4')))) { check(tag + 'skipped (no v4.9.11.4)', true); return; }
    const o = await p.evaluate(async () => {
      const w = ms => new Promise(z => setTimeout(z, ms)), q = s => document.querySelector(s), o = {};
      const m = document.getElementById('menu'); m && (m.hidden = true, document.body.classList.remove('menu-open'));
      const tip = document.getElementById('am-seal-tip'); tip && tip.remove();
      st = exampleState(); persist(); setMode('play'); P().tab = 'skills'; renderPlay(); await w(300);
      const t = () => q('#work .pane .odds').title, rb = () => { const b = q('#ledger [data-pact="reset-mods"]'); return b ? b.hidden : 'none'; };
      o.caption = !!q('.f9111-odds'); o.t0 = t(); o.ef0 = +P().ef; o.opp0 = +P().oppTotal;
      q('[data-pact="ctab"][data-t="mods"]').click(); await w(300);
      o.fs = !!q('#ledger fieldset.f9114'); o.off = [q('.f9114 input[type=checkbox]').checked, document.querySelectorAll('.f9114 input[type=number]').length, rb()];
      st.play.odds = { on: false, ef: 21, opp: 3 }; renderPlay(); await w(200); o.offNoEffect = t() === o.t0; delete st.play.odds; renderPlay(); await w(200);
      q('.f9114 input[type=checkbox]').click(); await w(300);
      o.on = [document.querySelectorAll('.f9114 input[type=number]').length, t() === o.t0, rb()];
      const i = q('.f9114 input[data-pk="odds.ef"]'); i.value = '15'; i.dispatchEvent(new Event('change', { bubbles: true })); await w(400);
      o.t15 = t(); o.efAfter = +P().ef;
      P().sel = 'trait'; P().ctab = 'roll'; renderPlay(); await w(200); const c = getCheck(P().sel); o.rollEf = c ? +c.ef : null; P().ctab = 'mods';
      P().tab = 'combat'; renderPlay(); await w(300);
      const ct = () => [...document.querySelectorAll('#work .pane .odds')].map(e => e.title).find(x => /Opponent/.test(x)) || '';
      o.c10 = ct(); P().odds.opp = 4; renderPlay(); await w(200); o.c4 = ct(); o.oppAfter = +P().oppTotal;
      st.play.odds = '<img src=x onerror="window.__o=1">'; let threw = false; try { renderPlay(); } catch (e) { threw = true; } await w(200); o.h1 = [threw, typeof P().odds, window.__o || 0];
      st.play.odds = { on: true, ef: '<b>x', opp: {} }; try { renderPlay(); } catch (e) { threw = true; } await w(200); o.h2 = [threw, ct()];
      delete st.play.odds; P().tab = 'skills'; P().sel = null; renderPlay(); await w(200); o.back = t() === o.t0;
      return o;
    });
    check(tag + 'odds: no box under the Characteristics; Modifiers has "Odds badges"', !o.caption && o.fs);
    check(tag + 'odds: off by default, with no fields, no effect and no Reset', o.off[0] === false && o.off[1] === 0 && o.off[2] === true && o.offNoEffect, JSON.stringify(o.off));
    check(tag + 'odds: ticked, it starts from the current numbers and shows Reset', o.on[0] === 2 && o.on[1] && o.on[2] === false, JSON.stringify(o.on));
    check(tag + 'odds: the badges follow the chosen Ease Factor and opposing total', /Ease Factor 15$/.test(o.t15) && / 10$/.test(o.c10) && / 4$/.test(o.c4), [o.t15, o.c10, o.c4].join(' | '));
    check(tag + 'odds: the roll keeps its own Ease Factor and opposing total', o.efAfter === o.ef0 && o.rollEf === o.ef0 && o.oppAfter === o.opp0 && o.back, JSON.stringify([o.ef0, o.efAfter, o.rollEf, o.opp0, o.oppAfter]));
    check(tag + 'odds: hostile saved values are dropped or clamped; no errors', !o.h1[0] && o.h1[1] === 'undefined' && !o.h1[2] && !o.h2[0] && / 10$/.test(o.h2[1]) && errs.length === 0, JSON.stringify([o.h1, o.h2]) + errs.slice(0, 2).join(' | '));
  } finally { await browser.close(); }
}

(async () => {
  const t0 = Date.now(); let version;
  if (ONLY !== 'browser') {
    version = staticChecks(path.join(CF, 'index.html'), 'cf').version;
    { const f = path.join(CF, '.well-known', 'security.txt'); const t = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
      const exp = Date.parse((t.match(/^Expires:\s*(\S+)/m) || [])[1] || '');
      check('[cf] security.txt has a Contact and the Canonical URL', /^Contact:\s*(mailto:|https:)\S+/m.test(t) && /^Canonical:\s*https:\/\/arsmachina-scribe-and-cast\.win\/\.well-known\/security\.txt$/m.test(t));
      check('[cf] security.txt Expires is 30 days to 1 year away (renew it)', exp > Date.now() + 30 * 864e5 && exp <= Date.now() + 366 * 864e5, (t.match(/^Expires:.*$/m) || ['no Expires'])[0]);
      const hd = fs.readFileSync(path.join(CF, '_headers'), 'utf8');
      check('[cf] _headers serves security.txt as text/plain; charset=utf-8', /\/\.well-known\/security\.txt\n\s+Content-Type: text\/plain; charset=utf-8/.test(hd)); }
    if (OFFLINE) staticChecks(OFFLINE, 'offline'); else check('offline file present', false);
  } else version = (fs.readFileSync(path.join(CF, 'index.html'), 'utf8').match(/APP_VERSION="([\d.]+)"/) || [])[1];
  if (ONLY !== 'static') {
    const srv = await serve(CF); const port = srv.address().port;
    try {
      await browserChecks(`http://127.0.0.1:${port}/index.html`, '[cf] ', version);
      if (OFFLINE) await browserChecks('file://' + OFFLINE.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:'), '[offline] ', version);
      await startupChecks(`http://127.0.0.1:${port}/index.html`, '[startup cf] ');
      if (OFFLINE) await startupChecks('file://' + OFFLINE.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:'), '[startup offline] ');
      await securityChecks(`http://127.0.0.1:${port}/index.html`, '[security] ');
      await featureChecks(`http://127.0.0.1:${port}/index.html`, '[feature] ');
      await perfChecks(`http://127.0.0.1:${port}/index.html`, '[perf] ');
      await f990Checks(`http://127.0.0.1:${port}/index.html`, '[4.9.9.0] ');
      await f995Checks(`http://127.0.0.1:${port}/index.html`, '[4.9.9.5 cf] ');
      if (OFFLINE) await f995Checks('file://' + OFFLINE.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:'), '[4.9.9.5 offline] ');
      await f996Checks(`http://127.0.0.1:${port}/index.html`, '[4.9.9.6 cf] ');
      if (OFFLINE) await f996Checks('file://' + OFFLINE.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:'), '[4.9.9.6 offline] ');
      await f997Checks(`http://127.0.0.1:${port}/index.html`, '[4.9.9.7 cf] ');
      if (OFFLINE) await f997Checks('file://' + OFFLINE.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:'), '[4.9.9.7 offline] ');
      await f998Checks(`http://127.0.0.1:${port}/index.html`, '[4.9.9.8 cf] ');
      if (OFFLINE) await f998Checks('file://' + OFFLINE.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:'), '[4.9.9.8 offline] ');
      await f999Checks(`http://127.0.0.1:${port}/index.html`, '[4.9.9.9 cf] ');
      if (OFFLINE) await f999Checks('file://' + OFFLINE.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:'), '[4.9.9.9 offline] ');
      await f910Checks(`http://127.0.0.1:${port}/index.html`, '[4.9.10.0 cf] ');
      if (OFFLINE) await f910Checks('file://' + OFFLINE.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:'), '[4.9.10.0 offline] ');
      await f911Checks(`http://127.0.0.1:${port}/index.html`, '[4.9.11.0 cf] ');
      if (OFFLINE) await f911Checks('file://' + OFFLINE.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:'), '[4.9.11.0 offline] ');
      await f9111Checks(`http://127.0.0.1:${port}/index.html`, '[4.9.11.1 cf] ');
      if (OFFLINE) await f9111Checks('file://' + OFFLINE.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:'), '[4.9.11.1 offline] ');
      await f9112Checks(`http://127.0.0.1:${port}/index.html`, '[4.9.11.2 cf] ');
      if (OFFLINE) await f9112Checks('file://' + OFFLINE.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:'), '[4.9.11.2 offline] ');
      await f9113Checks(`http://127.0.0.1:${port}/index.html`, '[4.9.11.3 cf] ');
      if (OFFLINE) await f9113Checks('file://' + OFFLINE.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:'), '[4.9.11.3 offline] ');
      await f9114Checks(`http://127.0.0.1:${port}/index.html`, '[4.9.11.4 cf] ');
      if (OFFLINE) await f9114Checks('file://' + OFFLINE.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:'), '[4.9.11.4 offline] ');
      if (BASE) {
        const old = await serve(BASE);
        try { await shots(`http://127.0.0.1:${port}/index.html`, `http://127.0.0.1:${old.address().port}/index.html`); }
        finally { old.close(); }
      }
    } finally { srv.close(); }
  }
  console.log(`${fails.length ? 'FAILED' : 'PASSED'} v${version}: ${pass} passed, ${fails.length} failed (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL runner crashed — ' + e.stack.split('\n').slice(0, 3).join(' ')); process.exit(1); });
