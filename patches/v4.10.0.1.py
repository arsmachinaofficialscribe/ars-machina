"""v4.10.0.1: typing in a Play field kept its caret (a number typed as "25" became "52").
See patches/v4.10.0.1/docs/CHANGES-v4.10.0.1.txt."""
import pathlib, shutil
ROOT = pathlib.Path(__file__).resolve().parents[1]
mod = ROOT / 'patches' / 'v4.10.0.1'
P = ROOT / 'src' / 'index.html'
h = P.read_text(encoding='utf-8')

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if n != count: raise SystemExit(f'expected {count} of {old[:70]!r}, found {n}')
    h = h.replace(old, new)

if 'id="v4.10.0.1"' in h: raise SystemExit('v4.10.0.1 already applied')
if 'id="v4.10.0.0"' not in h: raise SystemExit('apply v4.10.0.0 first')
OLD_V, V, B = '4.10.0.0', '4.10.0.1', '2026-11-14'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="2026-11-13"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build 2026-11-13">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# 4.9.11.0 keyed Play redraw: the field being typed in is put back in place of its rebuilt copy, so it keeps its
# caret. (A rebuilt number field was refocused with the caret at the start: number fields have no setSelectionRange.)
rep('    try { TPL.innerHTML = html; morph(host, TPL.content, DEPTH); }\n',
    '    var act = typing(host);\n'
    '    try { TPL.innerHTML = html; morph(host, TPL.content, DEPTH); act && !act.isConnected && putBack(host, act); }\n')
rep('  function set(id, html) {\n',
    '''  /* the text or number field the player is typing in, inside host */
  function typing(host) {
    var a = document.activeElement;
    if (!a || !host.contains(a) || !/^(INPUT|TEXTAREA)$/.test(a.tagName)) return null;
    if (/^(checkbox|radio|button|submit|reset|range|file|color|image|hidden)$/.test(a.type)) return null;
    return a.dataset.pk || a.dataset.lv || a.id ? a : null;
  }
  /* swap the kept field in for its new copy (same field, same kind); take the new markup's attributes */
  function putBack(host, a) {
    var q = a.dataset.pk ? '[data-pk="' + CSS.escape(a.dataset.pk) + '"]'
      : a.dataset.lv ? '[data-lv="' + CSS.escape(a.dataset.lv) + '"][data-lv-k="' + CSS.escape(a.dataset.lvK || "") + '"]'
      : "#" + CSS.escape(a.id);
    var n = host.querySelector(q);
    if (!n || n.tagName !== a.tagName || n.type !== a.type) return;
    [].slice.call(a.attributes).forEach(function (x) { x.name !== "value" && !n.hasAttribute(x.name) && a.removeAttribute(x.name); });
    [].slice.call(n.attributes).forEach(function (x) { x.name !== "value" && a.getAttribute(x.name) !== x.value && a.setAttribute(x.name, x.value); });
    var v = n.tagName === "TEXTAREA" ? n.value : n.getAttribute("value") || "";
    a.__amSrc = n.__amSrc; a.__amShell = n.__amShell;
    n.replaceWith(a);
    if (String(a.value) !== String(v) && !(a.type === "number" && Number(a.value) === Number(v) && v !== "")) a.value = v;
    a.focus({ preventScroll: true });
  }
  function set(id, html) {
''')
# renderPlay's own refocus: leave the kept field's caret alone (it moved a text field's caret to the end)
rep('if(a&&(a.focus({preventScroll:!0}),"number"===a.type||"text"===a.type))',
    'if(a&&a!==e&&(a.focus({preventScroll:!0}),"number"===a.type||"text"===a.type))')

js = (mod / 'keep.js').read_text(encoding='utf-8') + '\n' + (mod / 'changelog.js').read_text(encoding='utf-8')
h = h.rstrip('\n') + '\n<script id="v4.10.0.1">!function(){\n"use strict";\n' + js + '\n}();</script>\n'
P.write_text(h, encoding='utf-8', newline='\n')

D = ROOT / 'src' / 'docs'; M = mod / 'docs'
shutil.copy(M / f'CHANGES-v{V}.txt', D / f'CHANGES-v{V}.txt')
old = D / f'PLAYER-CHANGELOG-v{OLD_V}.md'
pc = old.read_text(encoding='utf-8'); anchor = f'\n## v{OLD_V} — '
if pc.count(f'through v{OLD_V}') != 2 or pc.count(anchor) != 1: raise SystemExit('player changelog layout changed')
pc = pc.replace(f'through v{OLD_V}', f'through v{V}'); i = pc.index(anchor) + 1
pc = pc[:i] + (M / 'player-section.md').read_text(encoding='utf-8') + pc[i:]
(D / f'PLAYER-CHANGELOG-v{V}.md').write_text(pc, encoding='utf-8', newline='\n'); old.unlink()
print('patched to', V)
