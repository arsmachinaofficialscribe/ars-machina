# Ars Machina — Scribe and Cast

A free, unofficial companion app for **Ars Magica Fifth Edition**: build magi, companions and grogs, then play them at the table. It runs entirely in your browser. Nothing is sent to a server; characters live in your browser and in `.json` files you save yourself.

**Use it:** <https://arsmachina-scribe-and-cast.win> — or download the offline file from the [releases](../../releases) and open it in any modern browser.

## What it does

- **Build:** magi, companions and grogs with life-stage experience, Virtues and Flaws from the Definitive Edition and the supplements, Characteristics, Abilities, Arts and spells, with rule checks as you go.
- **Spells:** about 1,180 spells, each with its book and page, and checks for spell variants against the book's level.
- **Play:** every roll with its odds, including casting, combat, Certamen, Twilight, aging, Realms powers, True Faith and Ars Notoria.
- **Beings:** Might-based characters and a bestiary drawn from every Might stat block across 35 books.
- **Laboratory:** Lab Totals, seasons of study and lab work, familiars, Longevity Rituals and enchanted items.
- **Export:** an illustrated, fillable PDF character sheet and a character card.

Every rule carries a book and page reference. Where a book is silent, the reading used is labelled as such, and optional readings can be switched in Settings.

## Repository layout

```
src/                 the app's source: index.html, images in src/assets/, site headers, docs
pack.py, minify.js   build: src/ → out/ (Cloudflare Pages site, offline HTML file, zip)
tests/run-tests.js   regression tests: static, browser, offline, accessibility and screenshots
patches/             one script per release, recording exactly what each release changed
tools/               dice renderer and UI audit
```

See [BUILDING.md](BUILDING.md) to build and test it yourself.

## Contributing

Bug reports and rules corrections are very welcome; please include the book and page. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Ars Machina contains two kinds of material, under two licenses:

- **The program** (code, design, calculators, roll engine and its own artwork) is © 2026 Haikku, licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0](LICENSE) (CC BY-NC-SA 4.0). You may share and adapt it with credit, under the same license, and not for commercial purposes.
- **Adapted Ars Magica game material** (rules, tables and game text, summarized, reorganized into data and calculations, and in places quoted) is based on the material for Ars Magica, ©1993–2024, licensed by Trident, Inc. d/b/a Atlas Games®, under [Creative Commons Attribution-ShareAlike 4.0](LICENSES/CC-BY-SA-4.0.txt). That material stays under CC BY-SA 4.0 with no further restriction.

Third-party libraries, fonts and icons keep their own licenses. See [NOTICE.md](NOTICE.md) for the full attributions and trademark statements.

Ars Machina is a free fan work. It is not sold, carries no advertising, and is not affiliated with, published or endorsed by Atlas Games, Trident, Inc. or Paradox Interactive AB.

## Contact

Questions, bug reports, corrections and rights requests: **arsmachina.official.scribe@gmail.com**, or Haikku on Discord (`haiktan`).
