"""Ars Machina release packer.

    python pack.py [SRC_DIR] [OUT_DIR] [--no-minify]

SRC_DIR (default ./src) holds the canonical source of the current release:
  index.html   source form: images as assets/<hash> references, fonts and payloads inline
               (JSON and on-demand code as <script type="..." data-z="1"> zlib+base64)
  assets/      images, named by the first 12 hex digits of their SHA-256
  favicon.svg, robots.txt, _headers, .well-known/security.txt
  docs/        files copied to the site root (README, CHANGES, PLAYER-CHANGELOG, SOURCE-VERIFICATION)

OUT_DIR (default ./out) receives:
  cf/                                  Cloudflare Pages site root
  Ars_Machina_Cloudflare_Pages_vX.zip  that folder zipped, site root at the top level
  Ars_Machina_vX_offline.html          single self-contained file

The Content-Security-Policy script-src is rebuilt from exact SHA-256 hashes every time.
"""
import base64, hashlib, json, os, re, shutil, subprocess, sys, zipfile, zlib

try:
    import zopfli.zlib as _zop
except ImportError:
    _zop = None

HERE = os.path.dirname(os.path.abspath(__file__))
args = [a for a in sys.argv[1:] if not a.startswith('--')]
MINIFY = '--no-minify' not in sys.argv
SRC = os.path.abspath(args[0] if args else os.path.join(HERE, 'src'))
OUT = os.path.abspath(args[1] if len(args) > 1 else os.path.join(HERE, 'out'))
WORK = os.path.join(OUT, '_work')

def die(msg):
    raise SystemExit('pack: ' + msg)

def sri(txt):
    return 'sha256-' + base64.b64encode(hashlib.sha256(txt.encode('utf-8')).digest()).decode()

def zb64(txt):
    raw = txt.encode('utf-8')
    comp = _zop.compress(raw, numiterations=15) if _zop else zlib.compress(raw, 9)
    return base64.b64encode(comp).decode()

def inflate(b):
    return zlib.decompress(base64.b64decode(b.strip())).decode('utf-8')

h = open(os.path.join(SRC, 'index.html'), encoding='utf-8').read()

# ------------------------------------------------------------ version consistency
m1 = re.search(r'const APP_VERSION="([\d.]+)",APP_BUILD="([\d-]+)"', h)
m2 = re.search(r'<span class="ver" title="Build ([\d-]+)">v([\d.]+)</span>', h)
if not (m1 and m2):
    die('APP_VERSION or header .ver not found')
VER, BUILD = m1.group(1), m1.group(2)
if (m2.group(2), m2.group(1)) != (VER, BUILD):
    die(f'header says v{m2.group(2)} {m2.group(1)}, APP_VERSION says {VER} {BUILD}')

# ------------------------------------------------------------ tokenise
TOK = re.compile(r'(<script\b[^>]*>)(.*?)</script>|(<style\b[^>]*>)(.*?)</style>', re.S)
parts, pos = [], 0
for m in TOK.finditer(h):
    if m.start() > pos:
        parts.append({'t': 'html', 'v': h[pos:m.start()]})
    if m.group(1):
        parts.append({'t': 'script', 'open': m.group(1), 'v': m.group(2)})
    else:
        parts.append({'t': 'style', 'open': m.group(3), 'v': m.group(4)})
    pos = m.end()
parts.append({'t': 'html', 'v': h[pos:]})

def attr(o, name):
    m = re.search(name + r'="([^"]*)"', o)
    return m.group(1) if m else None

shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(WORK)
jobs = []
for i, p in enumerate(parts):
    if p['t'] == 'script':
        o = p['open']; typ = attr(o, 'type')
        body = inflate(p['v']) if 'data-z=' in o else p['v']
        if typ == 'application/json':
            p['kind'] = 'json'; p['json'] = json.dumps(json.loads(body), ensure_ascii=False, separators=(',', ':'))
            continue
        if typ == 'text/plain' and attr(o, 'data-am-lazy'):
            p['kind'] = 'lazy'; p['key'] = attr(o, 'data-am-lazy'); p['js'] = body
            if p['key'] == 'pdf':      # vendor libraries and font data: leave as shipped
                continue
        elif typ in (None, 'text/javascript'):
            p['kind'] = 'exec'; p['js'] = body
        else:
            die('unexpected script type ' + o)
        if MINIFY:
            fi = os.path.join(WORK, f'{i}.js')
            open(fi, 'w', encoding='utf-8').write(p['js'])
            jobs.append({'kind': 'js', 'in': fi, 'out': fi + '.min'}); p['minf'] = fi + '.min'
    elif p['t'] == 'style' and MINIFY:
        fi = os.path.join(WORK, f'{i}.css')
        open(fi, 'w', encoding='utf-8').write(p['v'])
        jobs.append({'kind': 'css', 'in': fi, 'out': fi + '.min'}); p['minf'] = fi + '.min'

if jobs:
    jf = os.path.join(WORK, 'jobs.json'); json.dump(jobs, open(jf, 'w'))
    r = subprocess.run(['node', os.path.join(HERE, 'minify.js'), jf], capture_output=True, text=True)
    if r.returncode:
        die('minify failed: ' + r.stderr[-2000:])
    print('minify', r.stdout.strip())
    for p in parts:
        if 'minf' in p:
            v = open(p['minf'], encoding='utf-8').read()
            if p['t'] == 'style': p['v'] = v
            else: p['js'] = v

for p in parts:
    if p.get('js') and re.search(r'</script', p['js'], re.I):
        die('"</script" inside a script block')
    if p['t'] == 'html':
        segs = re.split(r'(<!--.*?-->)', p['v'], flags=re.S)
        for k in range(0, len(segs), 2):
            segs[k] = re.sub(r'[ \t]*\n[ \t\n]*', '\n', segs[k])
        p['v'] = ''.join(segs)

# ------------------------------------------------------------ assemble
FONT_RE = re.compile(r'url\(data:font/woff2;base64,([A-Za-z0-9+/=]+)\)')
ASSET_RE = re.compile(r'assets/([0-9a-f]{12}\.(?:png|webp))')
MIME = {'png': 'image/png', 'webp': 'image/webp'}
_cache = {}

def inline_asset(m):
    f = m.group(1)
    if f not in _cache:
        data = open(os.path.join(SRC, 'assets', f), 'rb').read()
        _cache[f] = f'data:{MIME[f.rsplit(".", 1)[1]]};base64,' + base64.b64encode(data).decode()
    return _cache[f]

LAZY_JSON = {'am49-data'}  # read through window.AM49L (v4.9.6.1)
PLAIN_JSON = {'v33-catalog-data'}  # hosted build: plain JSON, compressed by the server; skips the start-up inflate (v4.9.8.0)

def assemble(variant):
    X = (lambda s: ASSET_RE.sub(inline_asset, s)) if variant == 'offline' else (lambda s: s)
    extra, hashes, out = {}, [], []
    for p in parts:
        if p['t'] == 'html':
            out.append(X(p['v'])); continue
        if p['t'] == 'style':
            css = X(p['v'])
            if variant == 'cf':
                def ext(m):
                    data = base64.b64decode(m.group(1))
                    name = hashlib.sha256(data).hexdigest()[:12] + '.woff2'
                    extra[name] = data
                    return f'url(assets/{name})'
                css = FONT_RE.sub(ext, css)
            out.append(p['open'] + css + '</style>'); continue
        idv = attr(p['open'], 'id'); ida = f' id="{idv}"' if idv else ''
        if p['kind'] == 'exec':
            js = X(p['js']); hashes.append(sri(js))
            out.append(('<script data-cfasync="false"' if variant == 'cf' else '<script') + ida + '>' + js + '</script>')
        elif p['kind'] == 'json':
            if variant == 'cf' and idv in LAZY_JSON:
                # large data the page reads on demand: a cached asset with an integrity hash (hosted build only)
                data = p['json'].encode('utf-8'); name = hashlib.sha256(data).hexdigest()[:12] + '.json'
                extra[name] = data; s = 'sha256-' + base64.b64encode(hashlib.sha256(data).digest()).decode()
                out.append(f'<script type="application/json"{ida} data-src="assets/{name}" data-sri="{s}"></script>')
            elif variant == 'cf' and idv in PLAIN_JSON:
                out.append(f'<script type="application/json"{ida}>' + p['json'].replace('<', '\\u003c') + '</script>')
            else:
                out.append(f'<script type="application/json"{ida} data-z="1">{zb64(p["json"])}</script>')
        else:
            js = X(p['js']); s = sri(js); hashes.append(s)
            if variant == 'cf':
                data = js.encode('utf-8'); name = hashlib.sha256(data).hexdigest()[:12] + '.js'
                extra[name] = data
                out.append(f'<script type="text/plain" data-am-lazy="{p["key"]}"{ida} data-src="assets/{name}" data-sri="{s}"></script>')
            else:
                out.append(f'<script type="text/plain" data-am-lazy="{p["key"]}"{ida} data-z="1">{zb64(js)}</script>')
    doc = ''.join(out)
    uniq = list(dict.fromkeys(hashes))
    cm = re.search(r'(<meta http-equiv="Content-Security-Policy" content=")([^"]*)(")', doc)
    if not cm:
        die('CSP meta not found')
    csp = re.sub(r"script-src [^;]*;", 'script-src ' + ' '.join(f"'{x}'" for x in uniq) + ';', cm.group(2), count=1)
    return doc[:cm.start(2)] + csp + doc[cm.end(2):], extra, len(uniq)

cf = os.path.join(OUT, 'cf'); os.makedirs(os.path.join(cf, 'assets'))
doc, extra, nh = assemble('cf')
for f in os.listdir(os.path.join(SRC, 'assets')):
    shutil.copy2(os.path.join(SRC, 'assets', f), os.path.join(cf, 'assets', f))
for name, data in extra.items():
    open(os.path.join(cf, 'assets', name), 'wb').write(data)
open(os.path.join(cf, 'index.html'), 'w', encoding='utf-8', newline='\n').write(doc)
for f in ('favicon.svg', 'robots.txt', '_headers'):
    shutil.copy2(os.path.join(SRC, f), os.path.join(cf, f))
wk = os.path.join(SRC, '.well-known')
if os.path.isdir(wk):
    shutil.copytree(wk, os.path.join(cf, '.well-known'), dirs_exist_ok=True)
docs = os.path.join(SRC, 'docs')
if os.path.isdir(docs):
    for f in os.listdir(docs):
        shutil.copy2(os.path.join(docs, f), os.path.join(cf, f))
cf_size = len(doc.encode())

doc, _, nh2 = assemble('offline')
fav = open(os.path.join(SRC, 'favicon.svg'), 'rb').read()
doc = doc.replace('href="favicon.svg"', 'href="data:image/svg+xml;base64,' + base64.b64encode(fav).decode() + '"', 1)
off = os.path.join(OUT, f'Ars_Machina_v{VER}_offline.html')
open(off, 'w', encoding='utf-8', newline='\n').write(doc)
if ASSET_RE.search(doc):
    die('offline file still references assets/')

zp = os.path.join(OUT, f'Ars_Machina_Cloudflare_Pages_v{VER}.zip')
with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for root, _, files in os.walk(cf):
        for f in sorted(files):
            full = os.path.join(root, f)
            z.write(full, os.path.relpath(full, cf).replace(os.sep, '/'))
shutil.rmtree(WORK, ignore_errors=True)
print(f'v{VER} ({BUILD}): cf index {cf_size:,} B, {len(os.listdir(os.path.join(cf, "assets")))} assets, {nh} CSP hashes; '
      f'offline {os.path.getsize(off):,} B; zip {os.path.getsize(zp):,} B'
      + ('' if _zop else ' [zopfli missing: zlib -9 used]'))
