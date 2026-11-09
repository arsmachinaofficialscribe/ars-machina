"""v4.9.5.3: security.txt (RFC 9116) at /.well-known/security.txt for the hosted site.
Hosting configuration only: the app itself is unchanged apart from its version and changelog."""
import pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
P = ROOT / 'src' / 'index.html'
H = ROOT / 'src' / '_headers'
h = P.read_text(encoding='utf-8')

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if n != count:
        raise SystemExit(f'expected {count} of {old[:70]!r}, found {n}')
    h = h.replace(old, new)

if 'id="v4.9.5.3"' in h:
    raise SystemExit('v4.9.5.3 already applied')
if not (ROOT / 'src' / '.well-known' / 'security.txt').is_file():
    raise SystemExit('src/.well-known/security.txt missing')
OLD_V, B_OLD, V, B = '4.9.5.2', '2026-10-26', '4.9.5.3', '2026-10-27'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')
CL = '''window.CHANGELOG&&window.CHANGELOG[0]&&window.CHANGELOG[0].items.unshift(["4.9.5.3","Security contact",["The site publishes a security.txt (at /.well-known/security.txt) so anyone who finds a security problem knows where to report it: security@arsmachina-scribe-and-cast.win."]]);'''
h = h.rstrip('\n') + '\n<script id="v4.9.5.3">' + CL + '</script>\n'
P.write_text(h, encoding='utf-8', newline='\n')

hd = H.read_text(encoding='utf-8')
if '/.well-known/security.txt' not in hd:
    hd = hd.rstrip('\n') + '\n\n/.well-known/security.txt\n  Content-Type: text/plain; charset=utf-8\n  Cache-Control: public, max-age=86400\n'
    H.write_text(hd, encoding='utf-8', newline='\n')
print('patched to', V)
