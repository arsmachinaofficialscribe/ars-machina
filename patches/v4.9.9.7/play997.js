/* Play screen tidy: section descriptions behind the info button on every Play tab, the Realms tool picker's open
   state, and the fight kept with the sheet. */
const I97=new Set(),P97={pick:!1};
const i97dec=s=>String(s).replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
const i97txt=s=>String(s).replace(/<[^>]*>/g,"").replace(/\s+/g," ").trim();
const i97plain=p=>!/<(b|strong|input|button|select|a|output)\b|data-/.test(p);
/* every Play tab but Realms (which does this itself): a long section note, and long plain notes in the body, go behind "i" */
function i97(h){
 return h.replace(/<section class="psec[^"]*" id="([^"]+)" data-sec-key="([^"]*)">[\s\S]*?<\/section>/g,(sec,id,key)=>{
  if(/class="rinfo-b"/.test(sec))return sec;
  const L=[];
  sec=sec.replace(/<p class="note psec-note">([\s\S]*?)<\/p>/,(m,t)=>i97txt(t).length>90?(L.push(t),""):m);
  sec=sec.replace(/<p class="note">([\s\S]*?)<\/p>/g,(m,t)=>i97txt(t).length>140&&i97plain(t)?(L.push(t),""):m);
  if(!L.length)return sec;
  const o=I97.has(i97dec(key));
  return sec.replace(/(<h3 class="psec-h">[\s\S]*?<\/button>)(<\/h3>)/,`$1<button type="button" class="rinfo-b" data-rinfo="${id}" data-rinfo-key="${key}" data-i97 aria-expanded="${o}" aria-controls="${id}-i" aria-label="About this section" title="About this section">i</button>$2`)
   .replace(/<div class="psec-in">/,`<div class="psec-in"><div class="rinfo" id="${id}-i"${o?"":" hidden"}>${L.map(t=>`<p class="note">${t}</p>`).join("")}</div>`);
 });
}
{const S=sectionize;sectionize=function(e,t){const h=S.apply(this,arguments);if("realms"===e)return h;try{return i97(h)}catch(z){console.error(z);return h}}}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-i97]");if(!b)return;const k=b.dataset.rinfoKey;"true"===b.getAttribute("aria-expanded")?I97.add(k):I97.delete(k)});
/* Realms: which tools to show */
window.AMR97={pickOpen:()=>P97.pick};
document.addEventListener("toggle",e=>{const d=e.target;d&&d.classList&&d.classList.contains("rlm-pick")&&(P97.pick=d.open)},!0);
document.addEventListener("change",e=>{
 const c=e.target;if(!c||!c.matches||!c.matches("[data-rlm-on]")||"play"!==MODE)return;
 const ov=Object.assign(Object.create(null),XP().rlmOn);ov[c.dataset.rlmOn]=c.checked?1:0;XP().rlmOn=Object.assign({},ov);persist();renderPlay();
});
document.addEventListener("click",e=>{
 const b=e.target.closest&&e.target.closest("[data-rlm-set]");if(!b||"play"!==MODE)return;e.preventDefault();
 const all="all"===b.dataset.rlmSet;Object.assign(XP(),{rlmAll:all,rlmOn:{}});persist();renderPlay();
});
