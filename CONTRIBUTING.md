# Contributing

Thank you for helping. Ars Machina follows the published books closely, so the most useful reports are precise ones.

## Reporting a bug or a rules error

Open an issue with:

- what you did, what you expected, and what happened;
- the app version (shown in the header) and your browser;
- for a rules error, **the book and page** that shows the correct value. The Ars Magica Definitive Edition governs the core rules; supplements apply where it is silent;
- if you can, the character `.json` file (File › Save) that shows the problem.

## Changing the code

1. Read [BUILDING.md](BUILDING.md) and run the tests once on an unchanged checkout.
2. Make your change in `src/`. Larger changes are recorded as a script in `patches/`, one per release.
3. Add a check to `tests/run-tests.js` for the bug you fixed or the feature you added.
4. Run `python pack.py` and `node tests/run-tests.js out`, and open a pull request with the result.

Rules you add need a book and page reference. Where the books are silent, say so and label the reading as your own.

## Ground rules

- Everything stays in the browser: no servers, analytics or external scripts. Scripts are admitted by exact SHA-256 hash in the Content Security Policy, which `pack.py` recomputes.
- No paywalls or commercial use: the program is CC BY-NC-SA 4.0 and the game material CC BY-SA 4.0 (see [NOTICE.md](NOTICE.md)).
- Keep the credits, attributions, trademarks and disclaimers intact.

By contributing you agree that your contribution is licensed under the same terms as the part of the project it changes.
