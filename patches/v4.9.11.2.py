"""v4.9.11.2: roll-screen hotfix (no automatic close; Retro back on the earlier roll circle; Modern medallion
fade-in and tints). See patches/v4.9.11.2/docs/CHANGES-v4.9.11.2.txt."""
import pathlib, shutil
ROOT = pathlib.Path(__file__).resolve().parents[1]
mod = ROOT / 'patches' / 'v4.9.11.2'
P = ROOT / 'src' / 'index.html'
h = P.read_text(encoding='utf-8')

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if n != count:
        raise SystemExit(f'expected {count} of {old[:70]!r}, found {n}')
    h = h.replace(old, new)

if 'id="v4.9.11.2"' in h: raise SystemExit('v4.9.11.2 already applied')
if 'id="v4.9.11.1"' not in h: raise SystemExit('apply v4.9.11.1 first')
OLD_V, V, B = '4.9.11.1', '4.9.11.2', '2026-11-09'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# the roll screen waits for the player
rep(',fxAt(v.hold+(FX.skipped?800:0),fxClose)};FX.finish=', '};FX.finish=')
# Retro keeps the earlier circle; the drawing is cached per skin
rep('  try { fxCircleSvg0 = circle; FX_SVG = ""; } catch (e) {}',
    '  try {\n    var old0 = fxCircleSvg0, cache = {}, retro = function () { return document.documentElement.getAttribute("data-skin") === "retro"; };\n'
    '    fxCircleSvg0 = function () { return retro() ? old0() : circle(); };\n'
    '    fxCircleSvg = function () { var k = retro() ? "r" : "m"; return cache[k] || (cache[k] = fxCircleSvg0()); };\n'
    '    FX_SVG = "";\n  } catch (e) {}')
rep('{sel:"svg.fx-circle",layers:[".fx-r1",".fx-r2",".fx-r3",".fx-r4",".fx-r5"],font:"Silkscreen AM",fx:!0}',
    '{sel:"svg.fx-circle",layers:[".fx-r1",".fx-r2",".fx-r3",".fx-r4"],font:"Silkscreen AM",fx:!0}')

css = (mod / 'hotfix.css').read_text(encoding='utf-8')
js = '!function(){\n"use strict";\n' + (mod / 'changelog.js').read_text(encoding='utf-8') + '\n}();'
if '</script' in js.lower() or '</style' in css.lower(): raise SystemExit('module contains a closing tag')
h = h.rstrip('\n') + '\n<style id="v4.9.11.2-css">' + css + '</style>\n<script id="v4.9.11.2">' + js + '</script>\n'
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
