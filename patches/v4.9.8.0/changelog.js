const CLG=window.CHANGELOG&&window.CHANGELOG[0];
CLG&&CLG.items.unshift(["4.9.8.0","Lighter start, smoother changes",[
 "The site downloads about a quarter as much when it opens (about 0.8 MB instead of 3.4 MB). The dice pictures are fetched when a roll needs them: the die for the check you pick is ready before you press Roll. The bestiary and hedge-magic lists arrive when you open Realms, Magic or the Storyguide.",
 "Switching between light and dark, Modern and Retro, or changing fonts redraws only what is on screen first; the rest of the sheet catches up quietly afterwards. The cross-fade no longer stutters on long sheets.",
 "Scrolling is lighter: the sound button checks whether it covers something once scrolling stops, not on every frame.",
 "Retro: the pixel sigils behind the menu or a roll pause while they are covered.",
 "Start-up does less work before the app is ready: the spell catalogue is read without unpacking, and the first-run chooser lays itself out after the page instead of during it.",
 "The roll backdrop no longer blurs the page behind it; it was too dark for the blur to show, and the blur cost a full-screen pass on every frame."]]);
