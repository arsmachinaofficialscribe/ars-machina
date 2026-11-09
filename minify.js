// Batch minifier: node minify.js manifest.json
// manifest: [{kind:"js"|"css", in:"path", out:"path"}]
const fs = require('fs');
const path = require('path');
const NM = path.join(__dirname, 'node_modules');
const { minify } = require(path.join(NM, 'terser'));
const css = require(path.join(NM, 'lightningcss'));

const KEEP = /MIT|License|license|©|\(c\)|@preserve|@license/;

(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  let before = 0, after = 0, fails = 0;
  for (const j of jobs) {
    const src = fs.readFileSync(j.in, 'utf8');
    let out = src;
    try {
      if (j.kind === 'js') {
        const r = await minify(src, {
          ecma: 2020,
          module: false,
          toplevel: false,
          compress: { passes: 2, keep_fargs: true, keep_infinity: true },
          mangle: true,
          format: { comments: (n, c) => KEEP.test(c.value), ascii_only: false },
        });
        out = r.code;
      } else {
        const r = css.transform({
          filename: 'x.css',
          code: Buffer.from(src),
          minify: true,
          errorRecovery: true,
        });
        out = r.code.toString();
        if (r.warnings && r.warnings.length) {
          console.error('CSS warnings', j.in, r.warnings.slice(0, 3).map(w => w.message));
        }
      }
      // Never let minification grow a block.
      if (out.length > src.length) out = src;
    } catch (e) {
      fails++;
      console.error('FAIL', j.kind, j.in, e.message);
      out = src;
    }
    before += src.length; after += out.length;
    fs.writeFileSync(j.out, out);
  }
  console.log(JSON.stringify({ jobs: jobs.length, before, after, fails }));
})();
