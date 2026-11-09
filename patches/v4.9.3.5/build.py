"""Build Ars Machina v4.9.3.5 from the v4.9.3.4 package.

python3 -I build.py <scratch>
Outputs:
  <scratch>/out/cf/       Cloudflare Pages site root
  <scratch>/out/offline/  single self-contained HTML
"""
import base64, hashlib, json, os, re, shutil, subprocess, sys
import zopfli.zlib

S = sys.argv[1]
SRC = os.path.join(S, 'build')
OUT = os.path.join(S, 'out')
WORK = os.path.join(S, 'work')
TOOLS = os.path.dirname(os.path.abspath(__file__))
VER, BUILD = '4.9.3.5', '2026-10-26'
OLD_NONCE = ' nonce="T6P6WhVZ8UufbhpYOKYSIA1Q"'

shutil.rmtree(OUT, ignore_errors=True); shutil.rmtree(WORK, ignore_errors=True)
os.makedirs(WORK)

h = open(os.path.join(SRC, 'index.html'), encoding='utf-8').read()

def must_replace(s, old, new, count=1):
    n = s.count(old)
    if n != count:
        raise SystemExit(f'expected {count} of {old[:80]!r}, found {n}')
    return s.replace(old, new)

def b64sha(txt):
    return 'sha256-' + base64.b64encode(hashlib.sha256(txt.encode('utf-8')).digest()).decode()

def zb64(txt, it=15):
    return base64.b64encode(zopfli.zlib.compress(txt.encode('utf-8'), numiterations=it)).decode()

def inflate(b):
    import zlib
    return zlib.decompress(base64.b64decode(b.strip())).decode('utf-8')

# ---------------------------------------------------------------- source edits
# 1. Lazy loader: replace the 4.9.3.4 synchronous loader + click replay.
old_loader_start = h.index('window.amLoadLazy=function(e){document.querySelectorAll(')
old_loader_end = h.index('window.CHANGELOG&&window.CHANGELOG[0]&&window.CHANGELOG[0].items.unshift(["4.8.5.0"')
NEW_LOADER = open(os.path.join(TOOLS, 'loader.js'), encoding='utf-8').read().strip().rstrip(';') + ','
h = h[:old_loader_start] + NEW_LOADER + h[old_loader_end:]

# 2. PDF export waits for the (possibly fetched) libraries.
h = must_replace(h, 'window.PDFLib&&window.fontkit||!window.amLoadLazy||amLoadLazy("pdf"),window.PDFLib',
                 'window.PDFLib&&window.fontkit||!window.amLoadLazy||await amLoadLazy("pdf").catch((t=>console.error(t))),window.PDFLib')

# 3. Version metadata.
h = must_replace(h, 'const APP_VERSION="4.9.3.4",APP_BUILD="2026-10-25"', f'const APP_VERSION="{VER}",APP_BUILD="{BUILD}"')
h = must_replace(h, '<span class="ver" title="Build 2026-10-25">v4.9.3.4</span>', f'<span class="ver" title="Build {BUILD}">v{VER}</span>')

# 4. Unused fixed nonces (the CSP authorises by hash only).
h = h.replace(OLD_NONCE, '')
h = h.replace('const t=document.createElement("script"),a=document.querySelector("script[nonce]");a&&a.nonce&&(t.nonce=a.nonce),', 'const t=document.createElement("script");')

# 5. Append the 4.9.3.5 script at the very end (after every drawMenu wrapper).
TAIL = open(os.path.join(TOOLS, 'v49350.js'), encoding='utf-8').read().strip()
h = h.rstrip('\n') + '\n<script id="v4.9.3.5">' + TAIL + '</script>\n'

# ---------------------------------------------------------------- tokenise
TOK = re.compile(r'(<script\b[^>]*>)(.*?)(</script>)|(<style\b[^>]*>)(.*?)(</style>)', re.S)
parts = []  # list of dicts
pos = 0
for m in TOK.finditer(h):
    if m.start() > pos:
        parts.append({'t': 'html', 'v': h[pos:m.start()]})
    if m.group(1):
        parts.append({'t': 'script', 'open': m.group(1), 'v': m.group(2)})
    else:
        parts.append({'t': 'style', 'open': m.group(4), 'v': m.group(5)})
    pos = m.end()
parts.append({'t': 'html', 'v': h[pos:]})

v33_fixed = open(os.path.join(S, 'v33_fixed.json'), encoding='utf-8').read()

jobs = []
lazy = []   # (part, key)
for i, p in enumerate(parts):
    if p['t'] == 'script':
        o = p['open']
        if 'type="application/json"' in o:
            p['kind'] = 'json'
            if 'id="v33-catalog-data"' in o:
                p['json'] = v33_fixed
            else:
                raw = inflate(p['v']) if 'data-z' in o else p['v']
                p['json'] = json.dumps(json.loads(raw), ensure_ascii=False, separators=(',', ':'))
            continue
        if 'data-am-lazy="pdf"' in o:
            p['kind'] = 'lazy'; p['key'] = 'pdf'
            p['js'] = inflate(p['v']); p['vendor'] = True
            continue
        if 'data-am-lazy="storyguide"' in o:
            p['kind'] = 'lazy'; p['key'] = 'storyguide'; p['js'] = p['v']; p['vendor'] = False
        elif p['v'].startswith('window.S2_FONTS_Z=1,window.S2_FONTS='):
            # PDF-only fonts and icons become the third PDF payload.
            p['kind'] = 'lazy'; p['key'] = 'pdf'; p['js'] = p['v']; p['vendor'] = False
        elif 'type=' in o:
            raise SystemExit('unexpected script type ' + o)
        else:
            p['kind'] = 'exec'; p['js'] = p['v']
        if not p.get('vendor'):
            fi = os.path.join(WORK, f'{i}.js'); fo = fi + '.min'
            open(fi, 'w', encoding='utf-8').write(p['js'])
            jobs.append({'kind': 'js', 'in': fi, 'out': fo}); p['minf'] = fo
    elif p['t'] == 'style':
        fi = os.path.join(WORK, f'{i}.css'); fo = fi + '.min'
        open(fi, 'w', encoding='utf-8').write(p['v'])
        jobs.append({'kind': 'css', 'in': fi, 'out': fo}); p['minf'] = fo

json.dump(jobs, open(os.path.join(WORK, 'jobs.json'), 'w'))
r = subprocess.run(['node', os.path.join(TOOLS, 'minify.js'), os.path.join(WORK, 'jobs.json')], capture_output=True, text=True)
print(r.stdout.strip()); print(r.stderr.strip()[:3000])
if r.returncode:
    raise SystemExit('minify failed')
for p in parts:
    if 'minf' in p:
        mv = open(p['minf'], encoding='utf-8').read()
        if p['t'] == 'style': p['v'] = mv
        else: p['js'] = mv

# Safety: terser must not have produced "</script" inside a block.
for p in parts:
    if p.get('js') and re.search(r'</script', p['js'], re.I):
        raise SystemExit('</script inside script')

# ---------------------------------------------------------------- html whitespace
for p in parts:
    if p['t'] == 'html':
        v = p['v']
        # Keep the licence/credits comment intact; collapse indentation elsewhere.
        segs = re.split(r'(<!--.*?-->)', v, flags=re.S)
        for k in range(0, len(segs), 2):
            segs[k] = re.sub(r'[ \t]*\n[ \t\n]*', '\n', segs[k])
        p['v'] = ''.join(segs)

# ---------------------------------------------------------------- assemble
FONT_RE = re.compile(r'url\(data:font/woff2;base64,([A-Za-z0-9+/=]+)\)')
ASSET_RE = re.compile(r'assets/([0-9a-f]{12}\.(?:png|webp))')

MIME = {'png': 'image/png', 'webp': 'image/webp'}
_cache = {}
def _inl(m):
    f = m.group(1)
    if f not in _cache:
        data = open(os.path.join(SRC, 'assets', f), 'rb').read()
        _cache[f] = f'data:{MIME[f.rsplit(".",1)[1]]};base64,' + base64.b64encode(data).decode()
    return _cache[f]

def assemble(variant):
    X = (lambda s: ASSET_RE.sub(_inl, s)) if variant == 'offline' else (lambda s: s)
    out_assets = {}
    hashes = []
    html = []
    for p in parts:
        t = p['t']
        if t == 'html':
            html.append(X(p['v'])); continue
        if t == 'style':
            css = X(p['v'])
            if variant == 'cf':
                def ext(m):
                    data = base64.b64decode(m.group(1))
                    name = hashlib.sha256(data).hexdigest()[:12] + '.woff2'
                    out_assets[name] = data
                    return f'url(assets/{name})'
                css = FONT_RE.sub(ext, css)
            html.append(p['open'] + css + '</style>'); continue
        kind = p['kind']
        if kind == 'exec':
            js = X(p['js']); hashes.append(b64sha(js))
            op = '<script data-cfasync="false">' if variant == 'cf' else '<script>'
            idm = re.search(r'id="([^"]*)"', p['open'])
            if idm: op = op[:-1] + f' id="{idm.group(1)}">'
            html.append(op + js + '</script>')
        elif kind == 'json':
            idm = re.search(r'id="([^"]*)"', p['open']).group(1)
            html.append(f'<script type="application/json" id="{idm}" data-z="1">{zb64(p["json"])}</script>')
        elif kind == 'lazy':
            js = X(p['js']); sri = b64sha(js); hashes.append(sri)
            idm = re.search(r'id="([^"]*)"', p['open'])
            ida = f' id="{idm.group(1)}"' if idm else ''
            if variant == 'cf':
                data = js.encode('utf-8')
                name = hashlib.sha256(data).hexdigest()[:12] + '.js'
                out_assets[name] = data
                html.append(f'<script type="text/plain" data-am-lazy="{p["key"]}"{ida} data-src="assets/{name}" data-sri="{sri}"></script>')
            else:
                html.append(f'<script type="text/plain" data-am-lazy="{p["key"]}"{ida} data-z="1">{zb64(js)}</script>')
    doc = ''.join(html)
    # CSP: exact hashes only.
    uniq = list(dict.fromkeys(hashes))
    csp_m = re.search(r'(<meta http-equiv="Content-Security-Policy" content=")([^"]*)(")', doc)
    csp = csp_m.group(2)
    csp = re.sub(r"script-src [^;]*;", 'script-src ' + ' '.join(f"'{x}'" for x in uniq) + ';', csp, count=1)
    doc = doc[:csp_m.start(2)] + csp + doc[csp_m.end(2):]
    return doc, out_assets, uniq

# Cloudflare
cf = os.path.join(OUT, 'cf'); os.makedirs(os.path.join(cf, 'assets'))
doc, extra, hs = assemble('cf')
for f in os.listdir(os.path.join(SRC, 'assets')):
    shutil.copy2(os.path.join(SRC, 'assets', f), os.path.join(cf, 'assets', f))
for name, data in extra.items():
    open(os.path.join(cf, 'assets', name), 'wb').write(data)
open(os.path.join(cf, 'index.html'), 'w', encoding='utf-8').write(doc)
shutil.copy2(os.path.join(TOOLS, '_headers'), os.path.join(cf, '_headers'))
for f in ['favicon.svg', 'robots.txt']:
    shutil.copy2(os.path.join(SRC, f), os.path.join(cf, f))
for f in os.listdir(os.path.join(TOOLS, 'docs')):
    shutil.copy2(os.path.join(TOOLS, 'docs', f), os.path.join(cf, f))
for f in ['CHANGES-v4.9.3.0.txt', 'CHANGES-v4.9.3.1.txt', 'CHANGES-v4.9.3.2.txt', 'CHANGES-v4.9.3.3.txt', 'CHANGES-v4.9.3.4.txt', 'SOURCE-VERIFICATION-v4.9.3.1.txt']:
    shutil.copy2(os.path.join(SRC, f), os.path.join(cf, f))
print('cf index', len(doc.encode()), 'hashes', len(hs), 'new assets', sorted((k, len(v)) for k, v in extra.items()))

# Offline single file: inline every asset as a data URI.
doc, _, hs2 = assemble('offline')
fav = open(os.path.join(SRC, 'favicon.svg'), 'rb').read()
doc = must_replace(doc, '<link rel="icon" href="favicon.svg" type="image/svg+xml">',
                   '<link rel="icon" href="data:image/svg+xml;base64,' + base64.b64encode(fav).decode() + '" type="image/svg+xml">')
off = os.path.join(OUT, 'offline'); os.makedirs(off)
open(os.path.join(off, f'Ars_Machina_v{VER}_offline.html'), 'w', encoding='utf-8').write(doc)
print('offline', len(doc.encode()), 'hashes', len(hs2), 'leftover asset refs', len(ASSET_RE.findall(doc)))
