# Ars Machina tools

Packer and regression tests for Ars Machina — Scribe and Cast. `src/` always holds the current release.

## Layout
```
pack.py              src/ → out/cf/ (Cloudflare site), out/*_offline.html, out/*.zip
minify.js            Terser + Lightning CSS, called by pack.py
tests/run-tests.js   static + browser + offline + screenshot regression tests
patches/             one patch script per release (vX.py), kept as the record of what changed
src/index.html       source form: images as assets/<hash>, fonts and payloads inline (zlib+base64)
src/assets/          images named by the first 12 hex digits of their SHA-256
src/_headers, favicon.svg, robots.txt
src/docs/            README.txt, CHANGES-*, PLAYER-CHANGELOG-*, SOURCE-VERIFICATION-* (copied to the site root)
```

## One-time setup (Windows, macOS or Linux)
```
python -m pip install zopfli          # optional; without it pack.py uses zlib -9
npm install                           # terser, lightningcss, playwright, pngjs
npx playwright install chromium
```

## Release in four commands
```
python patches/v4.9.3.6.py            # edits src/ (version, code, data, docs)
python pack.py                        # builds out/
node tests/run-tests.js out --baseline <previous release's cf folder>
# upload out/Ars_Machina_Cloudflare_Pages_vX.zip to Cloudflare Pages
```
`run-tests.js` prints only failures and one summary line, e.g. `PASSED v4.9.3.5: 58 passed, 0 failed (80 s)`.
Options: `--only static` (seconds, no browser), `--only browser`, `--verbose` (list every check),
`--baseline DIR` (compare 16 screenshots, Modern/Retro × dark/light × start/Build/menu/Play; failing views are saved to out/_shots).

## Patch scripts
A patch script reads `src/index.html`, makes exact replacements and fails loudly if a target string is missing or ambiguous:
```python
import pathlib, re
P = pathlib.Path(__file__).resolve().parents[1] / 'src' / 'index.html'
h = P.read_text(encoding='utf-8')
def rep(old, new, count=1):
    global h
    n = h.count(old)
    if n != count: raise SystemExit(f'expected {count} of {old[:70]!r}, found {n}')
    h = h.replace(old, new)
rep('const APP_VERSION="4.9.3.5",APP_BUILD="2026-10-26"', 'const APP_VERSION="4.9.3.6",APP_BUILD="2026-11-01"')
rep('<span class="ver" title="Build 2026-10-26">v4.9.3.5</span>', '<span class="ver" title="Build 2026-11-01">v4.9.3.6</span>')
# … code and data changes; append new behaviour as a new <script id="vX"> at the end of the file …
P.write_text(h, encoding='utf-8', newline='\n')
```
Compressed blocks (`data-z="1"`) are zlib + base64: decode, edit, re-encode with `zlib.compress(..., 9)`; pack.py recompresses with Zopfli.

### Optional rules
`window.amOpt(id)` reads Settings › Optional rules (stored in localStorage `am-optrules`; registry `OPT_RULES` in
`patches/v4.9.7.0/options.js`). A new reading where the books are silent goes into that registry as a Homebrew rule
with its recommended default, and the code asks `amOpt` instead of hard-coding the reading.
Later releases add rules with `window.amOptAdd([{id, grp, def, by, l, x, ref}])` from their own script
(4.9.7.5 does this in `patches/v4.9.7.5/realms.js`); the Settings lists pick them up.

### Build layout layer (4.9.7.5)
`patches/v4.9.7.5/build.js` decorates the Build sheet after each `renderAll`, `refresh` and `renderLedger`
(`decorAll`/`decorLight`): section summaries, pins, the four-step rail (`renderRail` is replaced), Abilities tabs,
help buttons, inline failing checks, folded notes, growing text fields, the ledger's pinned cards and the phone
status strip. Per-browser state: `am-pins`, `am-fold-others`, `am-opened`, `am-abil-tab`. Styles in `build.css`.

### Grouping, Title Case and upright portraits (4.9.7.6)
`patches/v4.9.7.6/ui.js` orders the Build sections by rail group with dividers (`decorGroups`, after `renderAll`),
renumbers the seals, greys sections a character cannot use in the rail (`fixRail`, after `renderRail`; Hedge Magic
needs a tradition Virtue, `window.amHedgeOK`), and Title-cases headings through a MutationObserver
(`window.amTitleCase`; mark a heading that shows entered text with `data-notc`). `portrait.js` makes the portrait
frame 100 x 130 and the stored picture 540 x 702 (frame, crop, render, pixelize, re-cut, `window.ptWindow` for the
PDF); the patch script adjusts the card niche and the PDF portrait by counted replacement.

### Load weight and motion (4.9.8.0)
Nothing large is fetched at start-up: dice pictures are warmed one die at a time (`window.amWarmDie(key)`, after
each Play draw for the selected check), the bestiary lists load when a panel asks or on intent (Realms, Magic, Hedge
tabs, Storyguide item). `pack.py` writes `PLAIN_JSON` blocks (the spell catalogue) as plain JSON in the hosted build.
`applyTheme`, `applySkin` and `applyFonts` call `window.amCvHold()`, which skips off-screen sections (class `am-cv`,
content-visibility at their measured size) and releases them one per idle callback. Do not put content-visibility on
sections permanently: `renderAll` recreates every section, so remembered sizes are lost and rail jumps miss.
`perfChecks` in the runner guards all of this.

### Faerie and Magic in play (4.9.9.0)
`patches/v4.9.9.0/realms990.js` (with `realms990.css`, `de-beasts.json` inlined at patch time) adds Play › Realms
panels (Faerie Realm fable and offers, a magic character's Acclimation and transformation, Things of Virtue and
warped animals, tamed creatures with the Definitive Edition's mundane beasts), the Build being card (Beast of Virtue,
elemental) and Things of Virtue in Inventory. State: `st.fae`, `st.m990`, `st.tov`, `st.tame`; rolls `r990:*`.
Rows built from user text must escape the title (`row()` does not).

### Play redraw (4.9.11.0)
`patches/v4.9.11.0/play.js`: `renderPlay` hands its page and console strings to `window.amPlaySet`, which keeps every
element whose markup is unchanged and compares changed ones child by child (matched by tag, id and class, three
levels deep). Elements a later wrapper inserts carry no `__amSrc` and are removed before the wrappers run again, so
those wrappers must insert idempotently. `window.amPlayFull = true` forces the old full redraw (the tests compare the
two). The console's scroll position comes from its scroll events and the section strip offsets are measured in the
next frame: a Play redraw reads no layout. Root custom properties are written only when they change.

### Sizes, seal and circles (4.9.11.1)
`patches/v4.9.11.1/scale.py` snaps every `font-size`, `font:` size and single-value `border-radius` in the `<style>`
blocks to one scale at patch time (12/13/14/15/16/18/21/27 px; 4/8/12 px). New rules use the tokens `--fs-1..8`,
`--r-1..3` and `--bh-s/m/l` (button heights 28/34/42). Give repeated rows a whole-pixel `line-height`: the page's 1.45
puts 1 px rules on half pixels.
`seal.py` generates the seal (viewBox 120; layers `.turn`, `.turn-mid`, `.turn-in`; `s-a` bold lines, `s-f` fine work).
Its rules (`seal.css`) sit in a `<style>` before the header, because the Retro pixel renderer draws the seal once, as
soon as it exists, and copies only computed `display`, stroke, fill and font properties (not `r`, `scale` or
transforms set in CSS). `art.js` replaces `fxCircleSvg0` (class names kept; `fx-r5` and `.fx-med.fx-m-<Art>` are new)
and wraps `crest()`. (Its odds caption under the Characteristic tiles was removed in 4.9.11.4.)

Since 4.9.11.2 the roll screen has no close timer (it waits for a click, tap or key), Retro uses the earlier roll
circle (`fxCircleSvg0` chooses by skin; `fxCircleSvg` caches one drawing per skin), and the Retro renderer's circle
layers are `fx-r1..fx-r4` again. The Retro renderer copies `fill` but the Art tints set `stroke`: filled shapes in a
circle stay gold there.

Since 4.9.11.3 the seal's SVG holds two drawings: class `sn` (the 4.9.11.1 seal, shown in Modern) and class `so`
(the earlier seal at three times its size, shown in Retro and in the chooser's Retro half). The show/hide rules select
the leaf shapes (`g.sn>*`, `g.so>*`), because the Retro renderer copies each shape's own computed `display`.
`crest()` returns the earlier crest in Retro.

Since 4.9.11.4 the odds yardstick is `P().odds = {on, ef, opp}`, edited under Modifiers › Odds badges (a `consoleMods`
wrapper) and read only by the `oddsChip` wrapper, and only while `on` is true. Nothing that rolls reads it. A control
on the Play page must never write `P().ef` or `P().oppTotal` as a side effect: those are the next roll's numbers.

Since 4.10.0.0 `window.amWorkSet` tracks each top-level `section.folio` of a part by its own id (`__amSrc` is the
part's key, `__amOwn` the section's own markup key; `window.__amFrag` maps parts to ids). Grogs and Companions draw
`#s-being` and `#s-vf` from one `sVF()` part; the earlier one-section-per-part assumption removed `#s-vf`.
Creation grants live in `patches/v4.10.0.0/grants.js`: extra `bonusPools` entries with their `BONUS_OK` limits,
Redcap apprenticeship (Homebrew rule `redcapReplace` wraps `budget`), and Abilities conferred at a score
(`window.amGrants`, `window.amSyncGrants`). A grant writes the Ability row's `free` and records `vfg`/`vfgOld` so it can
follow its size and be withdrawn; rows are never removed (Play state is keyed by row index). Custom Virtues store
grants as `fx.grants [{ab, score}]` (`wizard.js`). Faerie Blood varieties and Faerie Legacy are `faerie.js`
(`window.amFaerieBlood`): Characteristic varieties through `charEff`, totals through `myEffects`, Selkie through
`getCheck("depr")`, descriptions through `checks`.

## What the tests cover
- CSP: every inline script, lazy payload and on-demand file matches an exact SHA-256 in `script-src`; no unused hashes; no unsafe keywords, 'self', wildcards or nonces; SRI equals the file; `data-cfasync="false"` leads every script tag.
- Version consistency (APP_VERSION, header, changelog top, CHANGES and PLAYER-CHANGELOG files), `_headers` present, no `netlify.toml`.
- Assets exist and are named by their hash; the offline file references none.
- No AI-attribution or local-path text in anything shipped, including payloads.
- Spell data: Range/Duration/Target filled; no description text in Target.
- Browser (hosted and offline): no errors, CSP violations or outside requests; About leaves Storyguide unloaded; changelog newest first;
  Storyguide opens on the first click with menu history and one click sound; Escape returns home; a new saga becomes active;
  PDF export produces a sheet; an active Storyguide session restores after reload; no broken images.

## Dice (tools/dice)

The 3D die renderer: `render.html` (three.js 0.169; geometry and camera match the shipped dice), `specs.js` (one entry
per die: material, colours, emblem paths, Retro overrides), `drive.js` (headless Chromium) and `pack_dice.py`.

```
cd tools/dice && npm install            # once: three@0.169.0
node drive.js <render dir> div,inf,fae all          # hero, faces, Retro faces, tumble frames
python3 pack_dice.py <render dir> ../../src/assets manifest.json div,inf,fae
```
`pack_dice.py` writes content-hashed assets and `manifest.json`; the release patch reads the manifest. Rendering takes
about 3 to 4 minutes per die and pass (SwiftShader). Remove assets the manifest no longer lists.
