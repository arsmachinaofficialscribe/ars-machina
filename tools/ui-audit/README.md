# UI audit (report only)
    node tools/ui-audit/audit.js out --shots <dir>     # geometry, layout shifts, long tasks, action timings; 4 skins x 2 widths
    python3 tools/ui-audit/stray.py <dir>               # unexplained small marks in the full-page screenshots
The phone width (390 px) runs with 4x CPU throttling. Programmatic actions (setMode, openMenu) report layout shifts that
real clicks do not (a click marks "recent input"); use real clicks when judging flicker. stray.py flags decorations drawn
by pseudo-elements and backgrounds as well, so read its crops before calling anything a stray pixel.
