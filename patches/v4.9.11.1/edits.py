# 4.9.11.1 counted source edits; run by the patch script (uses rep, h, re, zlib, base64).

# N2: notes named sections by numerals that 4.9.7.6 made dynamic (and two were wrong)
rep('are in Inventory (section IX), and', 'are in the Inventory section, and')
rep('or set them in Combat (section VIII).', 'or set them in the Combat section.')
rep('No familiar (Build, section IX).', 'No familiar (Build › Familiar).')
rep('Write up the creature first (Build, section IX: Familiar).', 'Write up the creature first (Build › Familiar).')
rep('Write up the creature first in Build, section IX (Familiar): Might, Size and its Form.', 'Write up the creature first in Build › Familiar: Might, Size and its Form.')

# N4: the roll ceremony's hints on touch screens
rep('<p class="fx-hint">Click to skip to the result · double-click to close</p>',
    '<p class="fx-hint">${window.matchMedia&&matchMedia("(pointer:coarse)").matches?"Tap to skip to the result":"Click to skip to the result · double-click to close"}</p>')
rep('b.textContent="Click or press any key to continue"',
    'b.textContent=window.matchMedia&&matchMedia("(pointer:coarse)").matches?"Tap to continue":"Click or press any key to continue"')

# N8: a rail jump stops below the sticky summary strip (phones and narrow windows)
rep('scrollY-topOffset()-12+(off||0)',
    'scrollY-topOffset()-(e=>e&&"sticky"===getComputedStyle(e).position?e.getBoundingClientRect().height+6:0)(document.querySelector(".f975-strip"))-12+(off||0)')

# N11: sentence case, and one description for the Storyguide tile
rep('${e?"Sound On":"Sound Off"}', '${e?"Sound on":"Sound off"}')
rep('[["menu","Main Menu"],["build","Build"]]', '[["menu","Main menu"],["build","Build"]]')
rep('mnItem("storyguide","guide","Storyguide","Storyguide tools and saga references.")',
    'mnItem("storyguide","guide","Storyguide","Prepare stories, run sessions, and keep saga continuity.")')

# S6: the Play header says which Confidence number is which, and shows Burden only when there is one
rep('<i>Confidence ${n.score}</i><span class="gems">',
    '<i>Confidence</i><span class="hx-cs" title="Confidence Score"><small>Score</small><b>${n.score}</b></span><span class="gems">')
rep('</span><span class="mini-step"><button type="button" data-pact="conf-dec"',
    '</span><small class="hx-cp">Points</small><span class="mini-step"><button type="button" data-pact="conf-dec"')
rep('i("Enc",a.enc,"Burden "+a.burden,"","Encumbrance")', 'i("Enc",a.enc,a.burden?"Burden "+a.burden:"","","Encumbrance (Burden "+a.burden+")")')

# P8: Range, Duration and Target on a Play spell card
rep('<b>${esc(t.n)}</b><small>${esc(s.sub||"")}</small></span>\\n      <span class="sc-n">',
    '<b>${esc(t.n)}</b><small>${esc(s.sub||"")}</small>${t.r||t.d||t.t?`<small class="sc-rdt">${[["R",t.r],["D",t.d],["T",t.t]].filter((e=>e[1])).map((e=>`<abbr>${e[0]}</abbr> ${esc(e[1])}`)).join(" · ")}</small>`:""}</span>\\n      <span class="sc-n">')
rep('Set the current year in section I to place birth', 'Set the current year in Concept and Setting to place birth')
