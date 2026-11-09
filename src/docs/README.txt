Ars Machina — Scribe and Cast (v4.9.6.2)

Deploying on Cloudflare Pages
1. In the Cloudflare dashboard open Workers & Pages, then your Pages project (or Create > Pages > Upload assets).
2. Create a new deployment and drag this ZIP (or the unzipped folder) onto the upload area. No build command or framework.
3. The ZIP's top level is the site root: index.html, _headers, assets/, favicon.svg, robots.txt.

Cloudflare settings to check on a custom domain (Speed and Scrape Shield)
- Rocket Loader: off. (The scripts are also marked data-cfasync="false", so Rocket Loader skips them.)
- Email Address Obfuscation and other features that insert scripts: off. The security policy blocks injected scripts.

What is inside
- index.html   the app (code, styles and data, minified)
- assets/      images, fonts and on-demand code, each named by its content hash and cached for a year.
               The PDF libraries load when a sheet is first exported; the Storyguide when it is first opened.
- _headers     security and cache headers. The Content-Security-Policy is a <meta> element in index.html because
               Cloudflare Pages limits each header value to 2,000 characters; it admits scripts only by exact SHA-256 hash.
- favicon.svg  the tab icon
- robots.txt   lets search engines index the page
- CHANGES-*.txt, SOURCE-VERIFICATION-*.txt, PLAYER-CHANGELOG-v4.9.6.2.md: inert change and source-audit records
For an offline copy use Ars_Machina_v4.9.6.2_offline.html, a single file that opens directly from disk.

Contact
- arsmachina.official.scribe@gmail.com : questions, bug reports and corrections, and official correspondence from rights holders,
  including requests to change, re-credit or remove material (please put "Rights request" in the subject).

Notes
- Characters, sagas and settings are saved in each visitor's own browser (localStorage). Nothing is sent to a server.
  Saved data belongs to the site address, so moving to a new address starts empty: use Save .json / Export in the app first.
- Unofficial fan-made work; not published or endorsed by Atlas Games or Paradox Interactive AB.
- Based on the material for Ars Magica, ©1993–2024, licensed by Trident, Inc. d/b/a Atlas Games®, under Creative Commons
  Attribution-ShareAlike 4.0 International license 4.0 ("CC-BY-SA 4.0"), https://creativecommons.org/licenses/by-sa/4.0/
  The adapted game material stays under CC BY-SA 4.0. The program (code, design, its own artwork) is © 2026 Haikku,
  CC BY-NC-SA 4.0, https://creativecommons.org/licenses/by-nc-sa/4.0/ . Third-party parts (pdf-lib, pako, tslib, fontkit, fflate, fonts, game-icons.net icons) keep their own licenses.
- Ars Magica Open License Logo ©2024 Trident, Inc. The Ars Magica Open License Logo, Ars Magica, and Mythic Europe are
  trademarks of Trident, Inc., and are used with permission. Order of Hermes, Tremere, Doissetep, and Grimgroth are
  trademarks of Paradox Interactive AB and are used with permission.
- The House symbols are drawn after the House marks in Ars Magica Fifth Edition, ©1993–2024 Trident, Inc. d/b/a Atlas
  Games®; used without permission in a free work, not a challenge to Trident, Inc.'s ownership.
- Offered as it is, without warranty of any kind. Where the program and the books disagree, the books govern.
- Full credits, contact and disclaimer: open the app's Credits.
