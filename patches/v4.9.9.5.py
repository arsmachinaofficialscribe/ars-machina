"""v4.9.9.5: Play › Realms in realm sub-tabs, tools gated by the sheet, descriptions behind an info button, overflow fixed.
See patches/v4.9.9.5/docs/CHANGES-v4.9.9.5.txt.
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

if 'id="v4.9.9.5"' in h: raise SystemExit('v4.9.9.5 already applied')
if 'id="v4.9.9.0"' not in h: raise SystemExit('apply v4.9.9.0 first')
OLD_V, B_OLD, V, B = '4.9.9.0', '2026-10-28', '4.9.9.5', '2026-10-28'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')
# the realm panels no longer sit in wrapper divs: the sub-tabs split the tab by section
# hand the sheet tests the gating needs out of the 4.9.4.0 and 4.9.7.0 modules
A4 = '{const T=tabRealms;tabRealms=function(){\n let base=T.apply(this,arguments);\n try{\n  let add="";(tfScore()>0'
rep(A4, 'window.AMRLM=Object.assign(window.AMRLM||{},{tfScore,tfPts,dominionLore,CLERGY});\n' + A4)
A7 = '{const T=tabRealms;tabRealms=function(){\n let base=T.apply(this,arguments);\n try{\n  let add="";const I=bookOn("RoP:I"),D=bookOn("RoP:D");'
rep(A7, 'window.AMRLM=Object.assign(window.AMRLM||{},{holyPowerAbil,isInfernalist,sinTraits});\n' + A7)
rep('return base+`<div class="f975-realms">${add}</div>`;', 'return base+add;')
rep('return base+`<div class="f990-realms">${add}</div>`;', 'return base+add;')

mod = ROOT / 'patches' / 'v4.9.9.5'
js = '!function(){\n"use strict";\n' + (mod / 'realmtabs.js').read_text(encoding='utf-8') + '\n' + (mod / 'changelog.js').read_text(encoding='utf-8') + '\n}();'
css = (mod / 'realmtabs.css').read_text(encoding='utf-8')
if '</script' in js.lower() or '</style' in css.lower(): raise SystemExit('module contains a closing tag')
h = h.rstrip('\n') + '\n<style id="v4.9.9.5-css">' + css + '</style>\n<script id="v4.9.9.5">' + js + '</script>\n'
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
