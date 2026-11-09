"""v4.9.4.0: hedge known effects for folk witches and elementalists (HMRE);
True Faith, miracles, God's aid, tempers/tarnishes and Ars Notoria (RoP:D, RoP:I)."""
import pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
P = ROOT / 'src' / 'index.html'
h = P.read_text(encoding='utf-8')

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if n != count:
        raise SystemExit(f'expected {count} of {old[:70]!r}, found {n}')
    h = h.replace(old, new)

OLD_V, OLD_B, V, B = '4.9.3.5', '2026-10-26', '4.9.4.0', '2026-10-26'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{OLD_B}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {OLD_B}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# Ars Notoria is a Supernatural Ability (RoP:D p. 92), not Academic.
rep('["Ars Notoria","Academic","RoP:D",93]', '["Ars Notoria","Supernatural","RoP:D",92]')

if 'id="v4.9.4.0"' in h:
    raise SystemExit('v4.9.4.0 already applied')
js = (ROOT / 'patches' / 'v4.9.4.0' / 'v49400.js').read_text(encoding='utf-8').strip()
if '</script' in js.lower():
    raise SystemExit('module contains </script')
h = h.rstrip('\n') + '\n<script id="v4.9.4.0">' + js + '</script>\n'
P.write_text(h, encoding='utf-8', newline='\n')
print('patched to', V)
