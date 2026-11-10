"""S1/S2 of the 2026-11-09 audit: snap font sizes and corner radii in every <style> block to one scale.
Font sizes: 12 / 13 / 14 / 15 / 16 / 18 / 21 / 27 px (nothing in running text below 12).
Radii: 4 / 8 / 12 px, pills (999px) and circles (50%) untouched. Only single-value declarations are changed."""
import re
FONT = {'10': '12', '10.5': '12', '11': '12', '11.5': '12', '12.5': '13', '13.5': '14', '17': '18', '19': '18', '20': '21', '22': '21', '25': '27', '26': '27', '28': '27'}
RAD = {'2': '4', '3': '4', '5': '4', '6': '8', '7': '8', '9': '8', '10': '12', '11': '12', '14': '12', '16': '12'}
def apply(h):
    nf = nr = 0
    def block(m):
        nonlocal nf, nr
        css = m.group(2)
        def fs(mm):
            nonlocal nf
            v = mm.group(2)
            if v in FONT: nf += 1; return mm.group(1) + FONT[v] + 'px'
            return mm.group(0)
        css = re.sub(r'(font-size:)(\d+(?:\.\d+)?)px', fs, css)
        # the font shorthand: "font:600 11.5px/1.2 var(--caps)"
        css = re.sub(r'(font:(?:[a-z0-9-]+ ){0,3})(\d+(?:\.\d+)?)px', fs, css)
        def rd(mm):
            nonlocal nr
            v = mm.group(2)
            if v in RAD: nr += 1; return mm.group(1) + RAD[v] + 'px' + mm.group(3)
            return mm.group(0)
        css = re.sub(r'(border-radius:)(\d+)px([;}!])', rd, css)
        return m.group(1) + css + m.group(3)
    h = re.sub(r'(<style[^>]*>)(.*?)(</style>)', block, h, flags=re.S)
    return h, f'type scale: {nf} sizes snapped; radii: {nr} snapped'
