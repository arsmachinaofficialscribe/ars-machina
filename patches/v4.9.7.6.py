"""v4.9.7.6: Build sheet grouping, sections that need a Virtue, Title Case headings, upright portraits.

- Build: the sections stand in the rail's order (Who; Gifts and Flaws; Skills and Magic; Gear and Story; Tools), with a
  divider and the step's name between groups; seals are numbered in that order.
- Hedge Magic: Known Effects appears only with a hedge tradition's Virtue (HMRE pp. 18-20, 34, 56-57, 80, 122).
  Sections a character cannot use (Arts, Spells, Laboratory, Familiar for non-magi; Hedge Magic without its Virtue)
  are left off the sheet and shown greyed and unselectable in the rail.
- Headings in Title Case; the rail and the rule checks share one typeset.
- Portraits are upright (100 x 130): frame, crop dialog, stored picture (540 x 702), pixelization, card, PDF sheet,
  and a large portrait in the Play header. Older square portraits are re-cut on load.
"""
import pathlib, shutil
ROOT = pathlib.Path(__file__).resolve().parents[1]
P = ROOT / 'src' / 'index.html'
h = P.read_text(encoding='utf-8')

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if n != count:
        raise SystemExit(f'expected {count} of {old[:70]!r}, found {n}')
    h = h.replace(old, new)

def rep_in(a, b, pairs):
    """counted replacements inside the slice from the unique anchor a to the first b after it"""
    global h
    if h.count(a) != 1:
        raise SystemExit(f'anchor {a[:60]!r} found {h.count(a)} times')
    i = h.index(a); j = h.index(b, i) + len(b); seg = h[i:j]
    for old, new, c in pairs:
        if seg.count(old) != c:
            raise SystemExit(f'expected {c} of {old[:70]!r} in slice, found {seg.count(old)}')
        seg = seg.replace(old, new)
    h = h[:i] + seg + h[j:]

if 'id="v4.9.7.6"' in h:
    raise SystemExit('v4.9.7.6 already applied')
if 'id="v4.9.7.5"' not in h:
    raise SystemExit('apply v4.9.7.5 first')
OLD_V, B_OLD, V, B = '4.9.7.5', '2026-10-27', '4.9.7.6', '2026-10-27'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# card: an upright niche 158 x 205 above the seal plate
rep_in('const _=192,E=192,C=660,L=50,', 'v(G,260,4,6,o.line);', [
    ('const _=192,E=192,C=660,L=50,', 'const _=158,E=205.4,C=677,L=44,', 1),
    ('F=1.92,H=1.92,', 'F=1.58,H=1.58,', 1),
    ('t.width=Math.round(384),t.height=Math.round(384);', 't.width=Math.round(2*_),t.height=Math.round(2*E);', 1),
    ('n.drawImage(t,706.08,96.08,99.84,99.84)', 'n.drawImage(t,C+24*F,L+41*H,52*F,52*H)', 1),
    ('d(`600 70px ${l}`),n.textAlign="center",n.fillText(w,756,172.88)', 'd(`600 ${Math.round(34*F)}px ${l}`),n.textAlign="center",n.fillText(w,C+50*F,L+77*H)', 1),
    ('n.strokeRect(672.48,L+12.48,87*F,87*H)', 'n.strokeRect(C+6.5*F,L+6.5*H,87*F,117*H)', 1),
    ('[[50,4],[50,96],[4,50],[96,50]]', '[[50,4],[50,126],[4,65],[96,65]]', 1),
    ('[[4,4],[96,4],[4,96],[96,96]]', '[[4,4],[96,4],[4,126],[96,126]]', 1),
])
# PDF sheet: the portrait 146 pt tall and 112 pt wide, centred in its column; the picture is the frame's window
rep_in('{const e=122,o=146;await async function(e,o,n){const r=n/100;', '}(44,e,o);', [
    ('const r=n/100;', 'const r=n/130;', 1),
    ('y:l-o-96*r,width:92*r,height:92*r', 'y:l-o-126*r,width:92*r,height:122*r', 1),
    ('const i=t.portrait&&t.portrait.src;', 'const i=t.portrait&&t.portrait.src&&await window.ptWindow(t.portrait.src);', 1),
    ('y:l-o-91*r,width:82*r,height:82*r', 'y:l-o-121*r,width:82*r,height:112*r', 3),
    ('e+22*r,o+20*r,56*r', 'e+22*r,o+37*r,56*r', 1),
    ('y:l-o-93.6*r,width:87.2*r,height:87.2*r', 'y:l-o-123.6*r,width:87.2*r,height:117.2*r', 1),
    ('[[4,4],[96,4],[4,96],[96,96]]', '[[4,4],[96,4],[4,126],[96,126]]', 1),
    ('[[50,4],[50,96],[4,50],[96,50]]', '[[50,4],[50,126],[4,65],[96,65]]', 1),
    ('}(44,e,o);', '}(44+(o-o/1.3)/2,e,o);', 1),
])

mod = ROOT / 'patches' / 'v4.9.7.6'
CL = r'''
const CLG=window.CHANGELOG&&window.CHANGELOG[0];
CLG&&CLG.items.unshift(["4.9.7.6","Grouped Build sheet; upright portraits",[
 "Build: the sections now stand in the side rail’s order, with a divider naming each step (Who; Gifts and Flaws; Skills and Magic; Gear and Story; Tools). The seals are numbered in that order.",
 "Build: Hedge Magic: Known Effects appears once the character has a hedge tradition’s Virtue: Folk Witch (HMRE p. 34), Gruagach or Gruagach Master (pp. 56–57), Mathematicus of Bologna (p. 80), Vitki (p. 122), or an elementalist Virtue (pp. 18–20).",
 "Build: sections a character cannot use are left off the sheet and shown greyed in the rail with the reason (Arts, Spells, Laboratory and Familiar are for magi).",
 "Headings are in Title Case. The side rail and the rule checks share one typeset.",
 "Portraits are upright (10 by 13) instead of square: the frame, the crop dialog, pixelization, the character card and the PDF sheet. The Play header shows the portrait large. Transparent portraits stay transparent. Older square portraits are re-cut from the original picture when the file opens."]]);
'''
js = ('!function(){\n"use strict";\n' + (mod / 'portrait.js').read_text(encoding='utf-8') + '\n' + (mod / 'ui.js').read_text(encoding='utf-8') + CL + '\n}();')
css = (mod / 'ui.css').read_text(encoding='utf-8')
if '</script' in js.lower() or '</style' in css.lower():
    raise SystemExit('module contains a closing tag')
h = h.rstrip('\n') + '\n<style id="v4.9.7.6-css">' + css + '</style>\n<script id="v4.9.7.6">' + js + '</script>\n'
P.write_text(h, encoding='utf-8', newline='\n')

# release docs
D = ROOT / 'src' / 'docs'; M = mod / 'docs'
if (M / f'CHANGES-v{V}.txt').exists():
    shutil.copy(M / f'CHANGES-v{V}.txt', D / f'CHANGES-v{V}.txt')
    old = D / f'PLAYER-CHANGELOG-v{OLD_V}.md'
    pc = old.read_text(encoding='utf-8'); anchor = f'\n## v{OLD_V} — '
    if pc.count(f'through v{OLD_V}') != 2 or pc.count(anchor) != 1:
        raise SystemExit('player changelog layout changed')
    pc = pc.replace(f'through v{OLD_V}', f'through v{V}'); i = pc.index(anchor) + 1
    pc = pc[:i] + (M / 'player-section.md').read_text(encoding='utf-8') + pc[i:]
    (D / f'PLAYER-CHANGELOG-v{V}.md').write_text(pc, encoding='utf-8', newline='\n'); old.unlink()
print('patched to', V)
