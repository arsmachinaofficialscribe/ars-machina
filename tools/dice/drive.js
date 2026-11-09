/* node drive.js <out dir> <keys,comma> [what]  — renders dice with render.html in headless Chromium.
   what: hero | tumble | faces | all (default all). Writes PNGs to <out dir>/<key>/. */
const { chromium } = require('playwright'); const fs = require('fs'); const http = require('http'); const path = require('path');
const OUT = process.argv[2], KEYS = (process.argv[3] || 'div,inf,fae').split(','), WHAT = process.argv[4] || 'all';
const LABELS = { 0: [0, 8, 4, 6, 2, 3, 7, 9, 1, 5], 1: [1, 9, 7, 3, 5, 6, 4, 8, 0, 2], 2: [2, 0, 8, 4, 6, 5, 3, 7, 9, 1], 3: [3, 5, 1, 9, 7, 0, 2, 6, 4, 8], 4: [4, 6, 2, 0, 8, 9, 1, 5, 3, 7], 5: [5, 1, 9, 7, 3, 2, 6, 4, 8, 0], 6: [6, 2, 0, 8, 4, 1, 5, 3, 7, 9], 7: [7, 3, 5, 1, 9, 8, 0, 2, 6, 4], 8: [8, 4, 6, 2, 0, 7, 9, 1, 5, 3], 9: [9, 7, 3, 5, 1, 4, 8, 0, 2, 6] };
/* tumble: 12 frames turning from rest through two loose revolutions back towards rest (deterministic) */
const TUMBLE = Array.from({ length: 12 }, (_, i) => { const t = i / 12, e = 1 - Math.pow(1 - t, 1.6);
  return [Math.sin(t * 9.1) * 1.9 * (1 - t), e * Math.PI * 4 + Math.sin(t * 5) * .4, Math.cos(t * 7.3) * 1.2 * (1 - t)]; });
const srv = http.createServer((q, r) => { const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; }
    r.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.html') ? 'text/html' : f.endsWith('.woff2') ? 'font/woff2' : 'application/octet-stream' }); r.end(d); }); });
(async () => {
  await new Promise(ok => srv.listen(0, ok)); const port = srv.address().port;
  const specs = require('./specs.js');
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => m.type() === 'error' && console.log('CONSOLE', m.text()));
  await p.goto(`http://127.0.0.1:${port}/render.html`); await p.waitForFunction(() => window.ready, null, { timeout: 60000 });
  const save = async (file, spec, o) => { const url = await p.evaluate(([s, o]) => window.renderDie(s, o), [spec, o]);
    fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64')); };
  for (const k of KEYS) {
    const spec = specs[k], dir = path.join(OUT, k); fs.mkdirSync(dir, { recursive: true }); const t0 = Date.now();
    if (WHAT === 'all' || WHAT === 'hero') await save(path.join(dir, 'hero.png'), spec, { px: 600, emblem: true });
    if (WHAT === 'all' || WHAT === 'faces') {
      for (let v = 0; v < 10; v++) await save(path.join(dir, `face${v}.png`), spec, { px: 300, emblem: true, labels: LABELS[v] });
      const ten = LABELS[0].slice(); ten[0] = '10'; await save(path.join(dir, 'face10.png'), spec, { px: 300, emblem: true, labels: ten, numS: .22 });
    }
    if (WHAT === 'all' || WHAT === 'retro') {
      for (let v = 0; v < 10; v++) await save(path.join(dir, `rface${v}.png`), spec, { px: 300, emblem: true, labels: LABELS[v], retro: 1, numS: .31 });
      const ten = LABELS[0].slice(); ten[0] = '10'; await save(path.join(dir, 'rface10.png'), spec, { px: 300, emblem: true, labels: ten, numS: .25, retro: 1 });
      for (let i = 0; i < 12; i++) await save(path.join(dir, `rtumble${String(i).padStart(2, '0')}.png`), spec, { px: 300, emblem: true, labels: LABELS[(i * 3) % 10], rot: TUMBLE[i], retro: 1, numS: .31 });
    }
    if (WHAT === 'all' || WHAT === 'tumble') for (let i = 0; i < 12; i++) await save(path.join(dir, `tumble${String(i).padStart(2, '0')}.png`), spec, { px: 352, emblem: true, labels: LABELS[(i * 3) % 10], rot: TUMBLE[i] });
    console.log(k, ((Date.now() - t0) / 1000).toFixed(1) + ' s');
  }
  await b.close(); srv.close();
})().catch(e => { console.log('FAIL', e.stack); process.exit(1); });
