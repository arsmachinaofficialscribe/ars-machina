# Ars Machina — Scribe and Cast
## Player-facing changelog: v4.8.9.2 through v4.10.0.0

This is a consolidated guide to the important player-facing changes from v4.8.9.2 through v4.10.0.0. It combines the original v4.9.2.0 summary with later improvements and corrections. Earlier entries are summarized where later work superseded them.

## v4.8.9.2 — Credits, recovery and safer file handling

- Credits now provides the official contact address for questions, bug reports, corrections and rights-holder requests: arsmachina.official.scribe@gmail.com. It also explains the program's unofficial status and that character data stays in the browser.
- Damaged or hand-edited character files are handled more safely. The app repairs unknown Technique/Form codes where possible; if a character still cannot be drawn, it offers recovery choices instead of leaving the screen blank.
- Imported names and other text are escaped and protected against markup injection. A strict Content Security Policy limits which scripts and outside connections the hosted app can use.

## v4.9.0.0–v4.9.0.2 — Hedge magic, Might-based characters and reference tools

- **Hedge Magic:** Known Effects lets you add the published sample spells, charms and rune scripts for gruagachan, learned magicians and vitkir, or make your own. Selecting a known effect in Play fills in its roll details.
- **Might-based beings:** Companions and grogs can be made into spirits, faeries, demons or angels. The builder applies the relevant realm rules, including Quality points, faerie Pretense, demon order caps and angel choir minimums.
- **Might powers:** Choose from 316 powers in the four Realms of Power books or create a custom power. The app calculates its cost, Initiative and Penetration. Play adds a Might tab for the Might Pool, recovery and realm-based Magic Resistance.
- **Creature templates:** Start a Might-based character from a published creature and carry over its relevant characteristics, powers and statistics.
- **Bestiary:** The Storyguide reference grew to 695 entries from 35 books: 590 creatures and characters, plus families, orders, choirs, spirit types, other templates and saints. Filter by realm, book or kind; sort by name, Might, Size or book.
- **Familiars:** Published entries were checked and corrected against their books, with names and page references improved. The list follows the rule that most magi bind magic animals; spirits are available when using the Spirit Familiar mystery. Sort by name, Might, Size, binding level or book.
- Long reference entries show a short summary first, with the complete text available on demand.

## v4.9.1.0–v4.9.1.1 — Faster table setup and clearer navigation

- **Encounter creature picker:** Search the bestiary by name, power, Form or kind; filter by realm or book; sort by name, Might, Size, Initiative or book; and add several creatures at once. Recently used creatures remain easy to select again.
- The Bestiary can also sort by Initiative.
- Build sections and Storyguide pages are grouped by task. Build's completion count focuses on sections required for a finished character.
- Character type is set when creating or loading a character, rather than by a header switch. Loading a companion or grog file keeps its type.
- The seal has a one-time pointer explaining that it returns to the main menu. Book Catalogues are available from the main menu.
- Scrollable ribbons indicate which direction has more content and can be dragged sideways with a mouse.

## v4.9.2.0 — Play screen

- The Play character panel is more compact while retaining the portrait or crest. Fatigue and wounds are quick to read and adjust; key combat and character values sit together.
- **Fight mode** opens Combat, sets other tabs aside and provides a round counter with next, previous and end controls.
- A **Situation** row gives quick access to Calm/Under stress, aura, Mounted and Exertion settings.
- Play tabs are grouped into Act, Character and Between stories.
- Roll results are larger and appear first. The arithmetic is available under “How the total is built.”
- Optional Play effects animate changes to Fatigue, wounds and Confidence and mark new results. Settings can disable them, and reduced-motion settings are respected.
- The app declares its text encoding for more reliable loading from disk, and reports loading errors with details and a Copy action.

## v4.9.2.3–v4.9.3.0 — Spell picker and offline use

- Spell search avoids redundant work while preserving the same spell order and displayed values.
- Spell picker results now show the full spell name and source details without clipping long names or citations; long text wraps consistently.
- A standalone offline HTML build is available. It includes its assets and can be opened directly without a hosted deployment or a separate asset folder.
- Browser-extension script blocks are less likely to appear as site errors in Firefox-family browsers. Identifiable same-origin Content Security Policy violations remain reported.

## v4.9.3.1 — Spell source corrections

- Spell records flagged for missing Range, Duration or Target were checked against the supplied source books. Complete values were recovered for 65 spells.
- 55 records without a complete, matching source line and five entries that were enchanted-item effects rather than spells were removed from the spell picker.
- The picker now shows each record's specific source note instead of the vague “partial source stats” label. Remaining spell entries retain their names, Technique/Form, level, source page and special requirements.

## v4.9.3.2–v4.9.3.3 — Browser diagnostics and PDF export

- Firefox-family browsers that report anonymous extension-injected script blocks no longer produce those empty-sample reports as app errors. Identifiable same-origin blocked scripts are still reported.
- The hosted build now allows the two bundled PDF/fontkit chunks to run when PDF export lazy-loads them. The libraries remain local, and the security policy still authorizes specific script hashes rather than broad inline-script execution.
- Credits, menus and exported character files now consistently identify the app as v4.9.3.3.

## v4.9.3.4 — Storyguide loads when opened

- Storyguide’s code now waits until you open Storyguide, reducing work during initial page startup.
- Existing sagas, Storyguide screens and tools, and automatic restoration of an active Storyguide session are preserved.
## v4.9.3.5 — Storyguide first time, cleaner spell Targets, faster loading

- Storyguide opens on the first click; before, the first click only loaded it. The menu click sound plays once.
- Back and Escape return to the right screen after visiting Storyguide.
- 39 spells whose Target field had picked up part of the description (for example “Ind The spell removes all pain…”) were checked against their books and corrected. Remain Within Those Walls reads Arcane Circle, as printed.
- The in-app changelog lists the newest release first again and includes v4.9.3.1 to v4.9.3.5.
- On the hosted site the page is about half its former size. Fonts, the PDF libraries and the Storyguide are separate files that the browser keeps between visits; the PDF libraries arrive when you first export a sheet, the Storyguide when you first open it. The offline file still contains everything.

## v4.9.4.0 — Hedge known effects finished; True Faith, tempers and Ars Notoria

- **Folk witches** can add the published curses, Flight and the healing table to Known Effects; each one opens its roll in Play with the Ease Factor set. **Elementalists** record their effects by Technique, Form and level beside the summoning chart.
- **True Faith** has its own panel on the Realms tab: Faith Points that return at dawn, Magic Resistance of ten per point of score, and a button under roll results to spend a Faith Point for +3 (+6 from True Faith 3). The blessings of True Faith 2, 3 and 5 are listed and applied.
- **Pray for a miracle** with the level adjusted for how soon and how badly it is needed, and **invoke God’s aid** for +1 to +3 on a scene’s rolls until one fails.
- **Temper** a Dominion aura with one of seven virtues, or **tarnish** an Infernal aura with a sin; the trait then shows as a bonus or penalty you tick on the rolls it touches.
- **Ars Notoria**: recite the seven Rings of Solomon in order, with every modifier; active rings add their experience and Characteristics in Play. Build checks the language requirements and gives 50 experience points for the languages.

## v4.10.0.0 — Creation grants, Faerie Blood varieties, Virtues and Flaws fix (2026-11-13)

- **Fixed: Virtues & Flaws could vanish from Build** for Grogs and Companions after you changed a Characteristic. Your character was never affected.
- **Vernacular Education now gives its 50 experience points** (Definitive Edition p. 77). So do Baccalaureus (90), Cathedral School Master (240), Clan Ilfetu, Falconer, Forge-Companion, Marshal, Physician of Salerno, Trained Assassin and Venditor (50 each); each pool buys only what its Virtue names. Mentored by Demons gives 50 each time you take it.
- **Redcaps** get their 300 apprenticeship experience points and a free Well-Traveled, on top of later life. If your troupe prefers, Settings › Optional rules › Homebrew rules takes the fifteen apprentice years out of later life instead.
- **Virtues that give an Ability now give it at 1, free.** Second Sight, Magic Sensitivity, Entrancement and the other Supernatural Ability Virtues, Faerie Magic (Merinita magi get Faerie Magic 1), Strong Faerie Blood (Second Sight 1) and the faerie power Virtues of *Realms of Power: Faerie*. A missing Ability is added to your sheet.
- **Your own Virtues can grant Abilities.** The custom Virtue window has a new “Abilities it grants” part: pick an Ability and a score.
- **Faerie Blood varieties.** Name the ancestry in the Virtue's detail: Bloodcap, Brownie, Dwarf, Ettin, Faerie God, Ghul, Goblin, Huldra, Nymph, Padfoot, Satyr, Selkie, Sidhe, Undine, Bee King or Spinnen. Characteristic and total bonuses apply by themselves, situational ones are tick boxes in Play, and the rule checks say what the rest do. With **Faerie Legacy**, each benefit becomes its stronger version; for Brownie and Dwarf, name your favoured Profession or Craft in Faerie Legacy's detail.
- If you had already spent 5 experience points on the first point of one of those Abilities, those points are free to spend again.

## v4.9.11.4 — Odds controls moved to Modifiers (2026-11-10)

- **The odds box under the Characteristics is gone.** It took a row of the Play page, did not explain itself, and its − and + also changed the Ease Factor of your next roll.
- **Modifiers › Odds badges.** The roll console's Modifiers tab now explains what the % badges mean and has a tick box, off to start: “Measure the badges against my own numbers”. Ticked, it shows an Ease Factor and a combat opposing total for the badges. These change the badges only, never a roll.
- While the box is unticked, the badges behave as they did before 4.9.11.1.
- No rule or save-format change.

## v4.9.11.3 — Retro seal restored (2026-11-09)

- **Retro has its earlier seal and crest back.** The seal in the header, the main menu and the first-run screen, and the crest on the Play page, are drawn as they were before 4.9.11.1. Modern keeps the newer drawings.
- No rule or save-format change.

## v4.9.11.2 — Roll screen hotfix (2026-11-09)

- **The roll screen waits for you.** It no longer fades out by itself after a couple of seconds; it stays until you click, tap or press a key.
- **Retro has its earlier roll circle back.** The 4.9.11.1 Retro circle drew its medallions as plain studs, did not take the Art and realm colours, and looked wrong in motion.
- **Modern circle fixes.** The medallions fade in with the drawing instead of appearing as dark discs first; they follow the wood, iron and Characteristic dice colours; and they no longer show in Imaginem’s ghost copies.
- No rule or save-format change.

## v4.9.11.1 — Audit fixes, one set of sizes, and new circles (2026-11-09)

- **New art.** The seal (header, main menu, first-run screen and the browser tab icon), the crest on the Play page and the roll circle are redrawn, in both Modern and Retro. The seal now has fifteen marks on its rim for the fifteen Arts and three turning layers. The roll circle carries the Arts as medallions: ten Forms on the outer ring, five Techniques on the pentagon. When you roll a spell, its Technique and Form light up.
- **Abilities fit.** The “all scores” table now fits its card at every window width; before, the Score column was cut off unless the window was very wide. “Bought in” and “XP to the next score” moved to a second line. On a phone each Ability is a small card.
- **Odds explained.** Under the Characteristics in Play, one line says what the percentage badges are measured against: an Ease Factor (9 to start), and in Combat an opposing total (10 to start). Use − and + to change either; every badge follows.
- **Play header.** Wounds sit in equal cells, Confidence shows “Score” and “Points” so the two numbers cannot be confused, and Burden shows only when you carry one.
- **Spell cards** show Range, Duration and Target, and the two colours of the casting bar are keyed.
- **Phones and tablets.** In Combat, each weapon is a card instead of a table cut off at the edge. Jumping to a section no longer hides its title under the summary strip. At tablet width the header stays on one row and the roll console sits beside the page instead of far below it. The roll screen says “Tap to continue”.
- **Settings.** Done stays in view, and sections have space between them.
- **Roll console.** Reset appears only once a modifier is set, the aura fold appears once a roll is loaded, and there is a single sound switch (in the header; in the File menu on a phone).
- **One look.** Text sizes follow one scale with nothing smaller than 12 px; corners, button heights and thin lines are consistent; gold marks the main action on a screen; single-line fields are underlined and notes are boxed, in Build and the Storyguide alike.
- **Fixes:** notes named sections by numerals that were wrong (“Inventory (section IX)”); “Sound off” and “Main menu” wording; Storyguide page headings no longer show a focus box; the Storyguide tile keeps one description.
- No rule or save-format change.

## v4.9.11.0 — Play and the Storyguide catch up with the Build sheet (2026-11-09)

- **Play is faster.** Loading a roll, ticking a modifier or changing a tab now redraws only what changed (the roll console and the section you touched), not the whole page, and the page is laid out once per click instead of three times. On a phone this is about a third quicker.
- **Short sources everywhere.** Play and the Storyguide show sources the way the Build sheet does: “DE p. 367” instead of “Ars Magica Definitive Edition p. 367”. Point at the chip for the full title.
- **One way of writing buttons.** Buttons in the Storyguide and the main menu are in sentence case, like the rest of the app: “New saga”, “Saga library”, “+ New person”, “Next season ▶”. Headings keep their Title Case.
- **Fix:** in the Storyguide, a person’s name or a story’s title at the top of its page is shown exactly as you typed it (it was being capitalized like a heading).
- No rule or save-format change.

## v4.9.10.0 — A clearer Build sheet, and a faster one

- **Boxes and lines:** every list on the Build sheet (Virtues and Flaws, traits, spells, possessions, the tables) sits in its own box with a header band, so each section reads as boxes of rows instead of one mass of text.
- **Rows:** spells and possessions are one aligned row each; the chevron at the end opens the details.
- **Sources:** shown as a short chip such as "DE p. 79"; point at it for the full title.
- **Quieter Virtues and Flaws:** the Free box shows only when ticked or when you point at the row.
- **Retro:** a pixel bookmark ribbon on each section (gold when pinned) replaces the red stripe, and folded sections' summary chips no longer sit on the gold rule.
- **Side panel:** Experience reads spent of total; Best Art is a line under the rings.
- **Faster on phones:** typing, adding rows and redraws do much less work.

## v4.9.9.9 — Fixes from the interface audit

- **Phones:** the style chooser no longer jumps on your first visit, and the fatigue dots and wound buttons are easier to tap.
- **Easier to read:** faint text in the light themes and in the optional sections is darker.
- **Speaker button:** it now sits in the header next to Settings (in the File menu on a phone) instead of floating over the page.
- **Screen readers:** every field has a name, and the roll console's tabs work with the arrow keys.

## v4.9.9.8 — Sample companions and grogs

- **Start from a finished character:** a new companion can begin as the core book's Knight or Female Scholar, and a new grog as its Hunter or Standard Soldier. They are complete and legal, ready to play or to change. The magus example is unchanged.

## v4.9.9.7 — Play screen tidy

- **Pick your Realms tools:** instead of Show all tools, open **Tools shown** and tick exactly the tools you want, realm by realm. Tools your character doesn't use are marked; one click goes back to what the sheet suggests.
- **Situation bar:** Calm, Aura, Mounted and Exertion sit in one tidy strip, and the aura you pick stays visible at every screen size.
- **Legend checked:** every page reference in the roll console's Legend was checked against the core book; wrong pages and a few misleading descriptions are fixed.
- **Less text on every tab:** long explanations are behind the small **i** beside each section title.
- **Fights survive a reload:** a fight in progress and its round count are kept with the character.

## v4.9.9.6 — Saints and relics

- **More saints:** the Saints list now includes the 25 further saints the book names, from St Paul to St Adalbert, with their power and patronage.
- **Your patron and your own saints:** pick your patron saint, and make saints of your own — a local saint, or one your character venerates, like Charlemagne. Give them powers from the book's miracles and curses, or copy a sample saint's.
- **Relic powers:** a relic can carry its saint's powers. Use them from its Divine Might until sunrise. The Head of John the Baptist, Nehushtan and the Ark of the Covenant can be added from the book.
- **Fixes:** Saint Martin of Tours has all seven of his powers, and a few page references are corrected.

## v4.9.9.5 — Realms in realm sub-tabs

- **Realms, one realm at a time:** the Realms tab now has Divine, Infernal, Faerie, Magic and Places sub-tabs, each showing only its own tools.
- **Only what your character uses:** a tool appears when your sheet calls for it — True Faith or Dominion Lore for the Divine tools, Infernal Lore or a sinful Personality Trait for the Infernal ones, Faerie Lore for Faerie, Magic Lore or Animal Handling for Magic. Tick **Show all tools** to see the rest.
- **Less text in the way:** each section's explanation is behind the small **i** button next to its title.
- **Nothing spills out:** long button labels wrap, and fields and tables stay inside their cards on any screen.

## v4.9.9.0 — Faerie and Magic in play

- **The Faerie Realm (Play › Realms):** step into Faerie and track fable points and your fable score. Spend a point for a bonus on a roll, trade Virtues for faerie ones, and make offers to change the story. When you leave, the app works out how long you were really gone and the Warping you chose to take.
- **Magic characters:** at the end of each year the Realms tab shows whether your magic creature is protected from Acclimation (its aura, the Magic Realm, magic it works or receives, vis it eats, a familiar's bond), with the vis roll and the transformation table.
- **Things of Virtue:** 26 herbs, gems, stones and trees that grant a Virtue once Enriched, with how to Enrich them; the Inventory lists the ones you carry.
- **Tamed creatures:** tame a beast season by season, as a magus, a Master of Creatures or a mundane handler; command it and test its loyalty. The twelve mundane beasts of the core book are included.
- **Build:** a Magic being can be a Beast of Virtue or an elemental, with the book's guidance and checks.

## v4.9.8.1 — The style chooser appears sooner

- **First visit:** the screen where you pick Modern or Retro appears sooner, and a click on it while the page is still loading is carried out once the page is ready.

## v4.9.8.0 — A lighter start and smoother changes

- **Faster to open:** the site now downloads about a quarter as much when it opens. Dice pictures arrive when a roll needs them (the die for the check you pick is ready before you press Roll), and the bestiary and hedge-magic lists arrive when you open Realms, Magic or the Storyguide.
- **Smoother theme and skin changes:** light and dark, Modern and Retro, and font changes redraw what is on screen first, so the change no longer stutters on a long sheet.
- **Lighter scrolling:** scrolling the Build sheet does much less work in the background.
- Nothing about your characters, files or rules has changed.

## v4.9.7.6 — A grouped Build sheet and upright portraits

- **Grouped sheet:** the Build sections now follow the side list's order, with a divider for each step: Who, Gifts and Flaws, Skills and Magic, Gear and Story, and Tools.
- **Only what your character can use:** Hedge Magic appears once your character has a hedge tradition's Virtue (Folk Witch, Gruagach, Mathematicus of Bologna, Vitki, or an elementalist Virtue). Arts, Spells, Laboratory and Familiar are for magi. Sections your character can't use yet are greyed out in the side list, with the reason.
- **Headings:** headings are in Title Case, and the side list and the rule checks use the same lettering.
- **Upright portraits:** portraits are now taller than they are wide, in the frame, the crop window, the character card and the PDF sheet, and the Play page shows your portrait large. Pixelization and transparent backgrounds work as before. Square portraits from older files are re-cut when the file opens; use Recrop to adjust them.

## v4.9.7.5 — A tidier Build page; auras, regiones and vis

- **Fold and summarise:** fold a section and it shows what is in it at a glance. Open all, Fold all, and (on by default) opening one section folds the others.
- **Pin for reference:** pin any section to the side panel to keep it in view while you work elsewhere. After jumping from the side list, "Back to …" takes you back.
- **Four steps:** the side list is grouped as Who, Gifts and flaws, Skills and magic, and Gear and story. Laboratory, Familiar and Hedge Magic stay folded until you start them.
- **Particulars in Biography:** gender, nationality, religion, origin, title, height, weight, hair, eyes and handedness are now at the top of Biography.
- **Abilities by stage:** each life stage is a tab with its budget, plus All scores.
- **Help when you want it:** each section's rules sit behind an ⓘ. A rule check that fails now shows inside its own section.
- **File menu:** Export PDF, Save and Load are in one File menu; the PDF options are in the Export dialog. On a phone the header is one row, and a status strip shows your Flaws, Virtues, experience and checks.
- **Fixes:** text boxes grow to fit, inventory rows line up, the example banner no longer jumps, Add buttons keep your place and put the cursor in the new row, and the seal tip no longer blocks the page.
- **Auras:** the Dominion and Infernal auras change with night and holy days; aligned Magic auras, and Debauched, Malevolent and Perfidious Infernal auras, affect your rolls.
- **Regiones:** roll to see the next level of a regio, guess a faerie regio's way in, and resist a celestial regio. Infernalists can make corruption rolls; priests, Dominion rites.
- **The covenant aura:** record its tethers and roll each year's strengthening or weakening, with its regio levels.
- **Vis:** mark raw vis as Faerie, Divine, Infernal (infesta, sordida, prava), dedicated, extraordinary or a faerie kind; Infernal and dedicated vis change your casting bonus and botch dice. After Gauntlet, vis for lab work is checked against Magic Theory × 5 a year.
## v4.9.7.0 — Sin and sanctity

- **Realms tab for everyone:** tie each Personality Trait to a sin or its opposing virtue, keep count of sins until absolution, and earn Confidence through sin. Pray to a saint once a day, or threaten one who refused you. Relics in your inventory show their Faith Points, Divine Might and Magic Resistance.
- **Infernalists:** your Hierarchy Score comes from your Infernal Reputation; roll Vituperation when Hell's power overwhelms you; sacrifices strengthen maleficia; profane holy things into vis. Magi with the Goetic Arts can use Rego and Vim instead.
- **Holy characters:** the Divine Ascent (Gloom, Form or Unity) replaces ordinary Warping; a failed holy power tells you which tragedy of hubris you risk; kabbalists can awaken and empower a golem; two rival tempers in one aura cause schism.
- **Optional rules:** Settings now has an Optional rules tab. Sub rules are the books' optional rules and the author's rulings; Homebrew rules are readings where the books leave it open. Each starts on the book, then the author's ruling, then the recommended reading, and you can switch any of them.
- **Realms tab:** shown for every character unless you switch off all four Realms of Power books in Build's sources.
- **Corrupted beasts:** Greater and Lesser Infernal Power and Horrifying Appearance, as in the book.

## v4.9.6.3 — Realms data fixes

- Two Flaws had been listed under half their names: look for **Susceptibility to Infernal Power** and **Necessary (Realm) Aura for (Ability)**. A character saved with the old names is corrected when you open it.
- Bestiary: beings whose powers were run together in one paragraph now list each power separately, and saints whose powers were only named now show what each miracle or curse does. Nasir and Samuil point to the right page, and Lamashtu has her Fatal Menses.

## v4.9.6.2 — Realm Abilities roll the realm dice

- Rolling Dominion Lore, Sense Holiness and Unholiness, a holy Method or Power, Infernal Lore, an unholy Method or Power, a Goetic Art, Faerie Lore or a faerie Method or Power now uses the matching Divine, Infernal or Faerie die, with its roll circle.

## v4.9.6.1 — Faster start

- The app opens about twice as fast: the sheet is drawn once instead of three times while it loads.
- The hosted site is a quarter smaller. The bestiary and hedge-magic lists arrive as a separate file just after the page opens, and your browser keeps it between visits.
- The Build steps show their groups from the first visit, and the sound button no longer hides behind the menu.

## v4.9.6.0 — Realm dice, training packages and Savantism

- Three new dice. Divine rolls use an alabaster die with a seraph, and the circle fills with a halo and beating wings. Infernal rolls use a charred-iron die with a dragon's head, ringed by crimson flames. Faerie rolls use a dragonfly-glass die, with sparks dancing around the circle. All three have Retro versions.
- A holy magus casts on the Divine die, unless he casts as Hermetic magic. True Faith's miracles and God's aid use it too.
- Training packages from Grogs: build a grog's or companion's Abilities from packages such as Soldier, Farmer or Student in a few clicks. The app suggests the right age and checks the limits.
- Savantism now also halves apprenticeship experience, and the favoured Ability can reach 6 even for a young character. An optional rule buys the favoured Ability at full rate.
- Feral and Covenant Upbringing change what childhood experience can buy.
- A slightly quicker start.

## v4.9.5.3 — Security contact

- The site now lists where to report a security problem: security@arsmachina-scribe-and-cast.win (in /.well-known/security.txt).

## v4.9.5.2 — Even menu spacing

- The four main menu tiles are now evenly spaced; Book catalogues no longer sits flush against About Ars Machina.

## v4.9.5.1 — Clean start-up

- Opening the site no longer flashes the Build screen and the main menu before the style chooser. It waits on a plain background until it is ready, then shows the right screen.

## v4.9.5.0 — Faith Points, Student of the Dominion, security

- A character who takes True Faith now starts with its Faith Point.
- Student of (Realm) understands “Divine” for the Dominion, granting Dominion Lore and its +2.
- A security review: character files are fully checked when opened, the hosted site no longer lets other websites read its files, and it cannot be shown inside another site’s frame.
- Rolls do a little less work when no True Faith, temper or Ars Notoria effect is active.

## Preservation notes

- Character rules, spell order and displayed spell data were preserved by the picker performance and layout changes.
- No library is loaded from another site. On the hosted site the PDF libraries and Storyguide are fetched from the same site, checked against their fingerprints; the offline file needs no network at all.
- The changes described above do not remove artwork, sound, animation or other static assets.

Unofficial fan work. Ars Magica is © Trident, Inc. d/b/a Atlas Games. The project identifies its license as CC BY-SA 4.0; consult the app's Credits for the full disclaimer and third-party notices.
