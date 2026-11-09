"""v4.9.7.5: Build layout redesign; auras, regiones and vis. Applies on top of v4.9.7.0.

Build (layout only, no rule changes)
- Folded sections show a one-line summary; any section can be pinned to the side panel; "Back to ..." after a jump.
- The rail in four steps (Who, Gifts and flaws, Skills and magic, Gear and story); optional sections not yet
  started are dimmed and folded, with "Start"; Open all / Fold all; "Fold the other sections when I open one".
- Physical particulars move from Concept to Biography.
- A quieter ledger (wards 3 x 2, PDF options in the Export PDF dialog); on phones a status strip.
- One File menu; a one-row phone header, the same height in Build and Play.
- Abilities by life stage, as tabs, plus All scores.
- Help behind an (i) with its page references; a failing rule check opens inline in its section; long notes fold.
- Field fixes: free text grows; one label baseline in inventory rows; whole-pixel columns.
- Flicker: the example banner keeps its place; Add buttons keep the page still and focus the new row;
  the seal tip no longer blocks the page.

Rules: auras, regiones and vis (DE pp. 50, 410-422; RoP:M pp. 7-16, 119-123; RoP:I pp. 10-19;
RoP:D pp. 7-16; RoP:F pp. 14-19). See RULES-SOURCES.md.
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

if 'id="v4.9.7.5"' in h:
    raise SystemExit('v4.9.7.5 already applied')
if 'id="v4.9.7.0"' not in h:
    raise SystemExit('apply v4.9.7.0 first')
OLD_V, B_OLD, V, B = '4.9.7.0', '2026-10-27', '4.9.7.5', '2026-10-27'
rep(f'const APP_VERSION="{OLD_V}",APP_BUILD="{B_OLD}"', f'const APP_VERSION="{V}",APP_BUILD="{B}"')
rep(f'<span class="ver" title="Build {B_OLD}">v{OLD_V}</span>', f'<span class="ver" title="Build {B}">v{V}</span>')

# later releases may add optional rules to Settings › Optional rules
rep('const OPT_BY={};OPT_RULES.forEach(o=>OPT_BY[o.id]=o);',
    'const OPT_BY={};OPT_RULES.forEach(o=>OPT_BY[o.id]=o);\nwindow.amOptAdd=L=>L.forEach(o=>{o&&o.id&&!OPT_BY[o.id]&&(OPT_RULES.push(o),OPT_BY[o.id]=o)});')

mod = ROOT / 'patches' / 'v4.9.7.5'
CL = r'''
const CLG=window.CHANGELOG&&window.CHANGELOG[0];
CLG&&CLG.items.unshift(["4.9.7.5","Build layout; auras, regiones and vis",[
 "Build: a folded section shows a one-line summary of what is in it, and any section can be pinned to the side panel to keep it in view. After jumping from the rail, “Back to …” returns you to where you were.",
 "Build: the rail is in four steps (Who, Gifts and flaws, Skills and magic, Gear and story). Laboratory, Familiar and Hedge Magic start folded and dimmed until you start them. Open all, Fold all, and a switch to fold the other sections when you open one (on by default).",
 "Build: gender, nationality, religion, origin, title, height, weight, hair, eyes and handedness move from Concept to the top of Biography.",
 "Build: Abilities are shown one life stage at a time, as tabs with their budgets, plus All scores.",
 "Build: each section’s help sits behind an ⓘ with its page references; a rule check that fails shows in its own section; long rules notes fold to one line.",
 "Header: Export PDF, Save and Load are in one File menu, and the PDF sheet options are in the Export PDF dialog. On a phone the header is one row and the side panel becomes a status strip (Flaws, Virtues, experience left, checks) that opens it.",
 "Fixes: free-text fields grow to fit; inventory rows line up; columns sit on whole pixels; the example banner no longer jumps away; Add buttons keep the page still and put the cursor in the new row; the seal tip no longer blocks the page.",
 "Auras (Modifiers): Dominion and Infernal auras by time of day and holy days (RoP:D p. 10; RoP:I pp. 10–11); aligned Magic auras (RoP:M pp. 15–16); Debauched, Malevolent and Perfidious auras and Tartaran and Abyssal regiones, with their effects on rolls (RoP:I pp. 12–17).",
 "Realms tab: the regio sight roll (DE p. 421), the faerie regio guess (RoP:F p. 16), celestial disorientation (RoP:D pp. 14–15), the corruption roll (RoP:I pp. 11–12), the Dominion rite (RoP:D p. 11), and Faerie and Empyreal aura strengths (RoP:F p. 14; RoP:D p. 12).",
 "Realms tab: the covenant aura, from its tethers, with the yearly aura modifier and the Strengthening and Weakening tables, botch dice and regio levels (RoP:M pp. 8–14).",
 "Vis: each pawn of raw vis can be ordinary, Faerie, Divine or Infernal (DE p. 422), vis infesta, sordida or prava (RoP:I pp. 18–19), dedicated or extraordinary (RoP:M pp. 119–123), or one of the faerie kinds (RoP:F pp. 18–19). The kind spent in a casting changes its bonus and botch dice. After Gauntlet, vis for lab work is checked against Magic Theory × 5 a year (DE p. 50).",
 "Settings › Optional rules: four more (faerie regio sight, vis infesta’s botch dice, stored vis, counting each magical botch)."]]);
'''
js = ('!function(){\n"use strict";\n' + (mod / 'realms.js').read_text(encoding='utf-8') + '\n' + (mod / 'build.js').read_text(encoding='utf-8') + CL + '\n}();')
css = (mod / 'build.css').read_text(encoding='utf-8')
if '</script' in js.lower() or '</style' in css.lower():
    raise SystemExit('module contains a closing tag')
h = h.rstrip('\n') + '\n<style id="v4.9.7.5-css">' + css + '</style>\n<script id="v4.9.7.5">' + js + '</script>\n'
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
