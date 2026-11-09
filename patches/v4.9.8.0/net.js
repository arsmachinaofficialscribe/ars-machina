/* 4.9.8.0 network: no bulk downloads at start-up.
   Die art: the start-up loop that fetched all 30 dice (about 2 MB) is gone; the selected check's die is
   warmed in idle time once Play shows it, so the first roll still has its frames ready.
   Bestiary and hedge lists: fetched only when a panel first asks for them (the getter in v4.9.0.0); the panel redraws on arrival. */
const idle=window.requestIdleCallback?(f,t)=>requestIdleCallback(f,{timeout:t}):(f,t)=>setTimeout(f,Math.min(t,60));
const warmed=new Set();
const warmUrl=u=>{if(!u||warmed.has(u))return;warmed.add(u);const i=new Image;i.decoding="async";"fetchPriority"in i&&(i.fetchPriority="low");i.src=u};
window.amWarmDie=function(key){if("undefined"==typeof DIE_ART)return;const a=DIE_ART[key];if(!a)return;
 const r="retro"===document.documentElement.getAttribute("data-skin");r?(warmUrl(a.pt),warmUrl(a.p)):(warmUrl(a.t),warmUrl(a.h));try{window.DieFace&&DieFace.preload(key)}catch(e){}};
const warmSel=()=>{try{if("undefined"==typeof MODE||MODE!=="play"||"function"!=typeof getCheck||"function"!=typeof dieArtKey)return;
 const s=P().sel;if(!s)return;const c=getCheck(s);c&&amWarmDie(dieArtKey(c))}catch(e){}};
let warmQ=0;const RP=renderPlay;renderPlay=function(){const r=RP.apply(this,arguments);warmQ||(warmQ=1,idle(()=>{warmQ=0;warmSel()},1500));return r};
/* warm the bestiary and hedge lists when the pointer or focus reaches something that shows them */
const AM49_INTENT='[data-t="realms"],[data-t="hedge"],[data-t="magic"],[data-mn="storyguide"]';
const am49Intent=e=>{const t=e.target;if(!window.AM49L||AM49L.ready()||!t.closest||!t.closest(AM49_INTENT))return;
 document.removeEventListener("pointerover",am49Intent);document.removeEventListener("focusin",am49Intent);AM49L.load()};
document.addEventListener("pointerover",am49Intent,{passive:!0});document.addEventListener("focusin",am49Intent);
