/* Play › Realms in realm sub-tabs, each tool shown only when the sheet calls for it (our reading), descriptions behind an info button */
const RLM_G=[["div","Divine"],["inf","Infernal"],["fae","Faerie"],["mag","Magic"],["plc","Places"]];
const RLM_INFO=new Set();
const rlmDec=s=>String(s).replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
const RX=n=>{const f=window.AMRLM&&window.AMRLM[n];return"function"==typeof f?f():f};
const rlmAb=n=>{try{return ablScore(st,n)}catch(z){return 0}};
const rlmVF=re=>(st.vf||[]).some(v=>v&&re.test(v.n||""));
const rlmAura=r=>{try{const a=P().aura;return!!a&&a.realm===r}catch(z){return!1}};
const rlmBeing=r=>{try{const b=window.AM49&&AM49.beingOn&&AM49.beingOn()&&AM49.being&&AM49.being();return!!b&&b.realm===r}catch(z){return!1}};
const rlmSafe=f=>{try{return!!f()}catch(z){return!1}};
/* who the tools are for: the sheet's traits that bring a realm into play */
const gDiv=()=>rlmSafe(()=>RX("tfScore")>0||RX("tfPts")>0)||rlmSafe(()=>RX("dominionLore")>0)||rlmSafe(()=>RX("holyPowerAbil"))||rlmSafe(()=>holyMagus(st))||rlmSafe(()=>(RX("CLERGY")||[]).some(c=>has(st,c)))||rlmVF(/^(Pious|Sense Holiness and Unholiness)$/)||rlmBeing("Divine");
const gInf=()=>rlmAb("Infernal Lore")>0||rlmSafe(()=>RX("isInfernalist"))||rlmBeing("Infernal");
const gSinful=()=>rlmSafe(()=>RX("sinTraits").some(t=>t.sv>0));
const gSin=()=>rlmSafe(()=>RX("sinTraits").length>0)||rlmSafe(()=>st.sin.venial>0||st.sin.mortal>0)||gInf();
const gFae=()=>rlmAb("Faerie Lore")>0||rlmVF(/faerie|arcadian|fairy/i)||rlmBeing("Faerie")||rlmSafe(()=>st.fae.in||st.fae.score>0||st.fae.fp>0);
const gMag=()=>rlmAb("Magic Lore")>0||rlmBeing("Magic");
const gMagus=()=>rlmSafe(isMagus);
const gAnyLore=()=>["Dominion Lore","Divine Lore","Infernal Lore","Faerie Lore","Magic Lore"].some(n=>rlmAb(n)>0);
const RLM_SEC={
 "Holy magic":["div",()=>!0],"Holy powers":["div",()=>!0],"True Faith":["div",()=>!0],"Pray for a miracle":["div",()=>!0],
 "Invoke God’s aid":["div",gDiv],
 "Tempers and tarnishes":[()=>gDiv()||!gInf()?"div":"inf",()=>gDiv()||rlmAb("Infernal Lore")>0||rlmSafe(()=>{const x=XP();return x.spAuth||(x.tmpName&&+x.tmpV>0)||(x.tarName&&+x.tarV>0)})],
 "Relics":["div",()=>!0],"Saints":["div",()=>gDiv()||rlmSafe(()=>!!XP().stName)],"The Divine Ascent":["div",()=>!0],"Ars Notoria":["div",()=>!0],"Golems":["div",()=>!0],
 "The Dominion and Empyreal auras":["div",()=>gDiv()||rlmAura("Divine")],
 "Maleficia":["inf",()=>!0],"Ars Goetia":["inf",()=>!0],"Infernalist":["inf",()=>!0],
 "Sin and temptation":["inf",gSin],"Confidence through sin":["inf",gSinful],"Infernal influence":["inf",()=>gSinful()||gInf()],
 "Infernal auras":["inf",()=>gInf()||rlmAura("Infernal")],
 "Faerie wizardry":["fae",()=>!0],"Faerie auras":["fae",()=>gFae()||rlmAura("Faerie")],"The Faerie Realm":["fae",gFae],
 "The covenant aura":["mag",()=>gMagus()||gMag()||rlmAura("Magic")],"A magic character’s year":["mag",()=>!0],
 "Magic things and warped beasts":["mag",()=>gMag()||rlmSafe(()=>st.tov.length>0)],
 "Tamed creatures":["mag",()=>rlmSafe(()=>st.tame.length>0)||rlmAb("Animal Handling")>0||rlmAb("Animal Ken")>0],
 "Regiones":["plc",()=>gMagus()||gAnyLore()||rlmVF(/^Second Sight$/)],
 "Warping by realm":["plc",()=>rlmSafe(()=>warpingScore(st)>0||!!st.sin.warpSrc)]
};
const rlmLongNote=p=>p.length>140&&!/<(b|input|button|select|a)\b|data-/.test(p);
function rlmSplit(html){
 const parts=String(html).split(/(?=<div class="pane-h">)/),pre=parts[0].startsWith('<div class="pane-h">')?"":parts.shift();
 return{pre,chunks:parts.map(c=>{const t=((c.match(/<h3>([\s\S]*?)<\/h3>/)||[,""])[1]).trim(),d=RLM_SEC[t];
  const g=d?("function"==typeof d[0]?d[0]():d[0]):"plc",on=d?rlmSafe(d[1]):!0;return{t,g,on,c}})};
}
function rlmInfo(c){
 /* the section's own note and any long plain note in its body go behind the info button */
 const e=c.indexOf("</div>")+6;let head=c.slice(0,e),body=c.slice(e);const L=[];
 head=head.replace(/<p class="note">([\s\S]*?)<\/p>/,(m,t)=>(L.push(t),""));
 body=body.replace(/<p class="note">([\s\S]*?)<\/p>/g,(m,t)=>rlmLongNote(t)?(L.push(t),""):m);
 if(!L.length)return c;
 return head.replace(/<\/div>$/,`<p class="note">${L.map(t=>`<span class="rinfo-p">${t}</span>`).join("")}</p></div>`)+body;
}
{const T=tabRealms;tabRealms=function(){
 const base=T.apply(this,arguments);
 try{
  const x=XP(),all=!!x.rlmAll,{pre,chunks}=rlmSplit(base),vis=chunks.filter(k=>all||k.on),hid=chunks.length-chunks.filter(k=>k.on).length;
  const groups=RLM_G.filter(([g])=>vis.some(k=>k.g===g)),cur=groups.some(([g])=>g===x.rlmTab)?x.rlmTab:(groups[0]||[""])[0];
  const keep=/^<p class="note">No Realms of Power abilities\.<\/p>$/.test(pre.trim())?"":pre;
  const bar=`<div class="rlm-bar">${groups.length?`<div class="rlm-tabs" role="group" aria-label="Realm">${groups.map(([g,l])=>`<button type="button" class="rlm-t" data-rlm="${g}" aria-pressed="${g===cur}">${l}<span class="rlm-n">${vis.filter(k=>k.g===g).length}</span></button>`).join("")}</div>`:""}<label class="chk rlm-all"><input type="checkbox" data-rlm-all${all?" checked":""}>Show all tools${hid&&!all?` (${hid} hidden)`:""}</label></div>`;
  const empty=groups.length?"":`<p class="note rlm-empty">Nothing on this sheet calls for the realm tools yet. They appear with True Faith, Dominion Lore, Infernal Lore, Faerie Lore, Magic Lore, Animal Handling, a sinful Personality Trait, a realm being, or a realm’s aura set under Modifiers. Show all tools lists every one.</p>`;
  return`<!--rlm-->${bar}<!--/rlm-->${keep}${empty}`+vis.filter(k=>k.g===cur).map(k=>rlmInfo(k.c)).join("");
 }catch(z){console.error(z);return base}
}}
{const S=sectionize;sectionize=function(e,t){
 let h=S.apply(this,arguments);
 if("realms"!==e)return h;
 try{
  let bar="";h=h.replace(/<!--rlm-->([\s\S]*?)<!--\/rlm-->/,(m,b)=>(bar=b,"")).replace(/<nav class="psec-nav"[\s\S]*?<\/nav>/,"");
  h=h.replace(/(<section class="psec[^"]*" id="([^"]+)" data-sec-key="([^"]*)">\s*<h3 class="psec-h">)([\s\S]*?<\/button>)(<\/h3>\s*<div class="psec-b" id="[^"]+"><div class="psec-in">)<p class="note psec-note">([\s\S]*?)<\/p>/g,(m,a,id,key,btn,mid,note)=>{
   const o=RLM_INFO.has(rlmDec(key));
   return`${a}${btn}<button type="button" class="rinfo-b" data-rinfo="${id}" data-rinfo-key="${key}" aria-expanded="${o}" aria-controls="${id}-i" aria-label="About this section" title="About this section">i</button>${mid}<div class="rinfo" id="${id}-i"${o?"":" hidden"}>${note.replace(/<span class="rinfo-p">([\s\S]*?)<\/span>/g,'<p class="note">$1</p>').replace(/^(?!<p)([\s\S]+)$/,'<p class="note">$1</p>')}</div>`});
  return bar+h;
 }catch(z){console.error(z);return h}
}}
document.addEventListener("click",e=>{
 const i=e.target.closest&&e.target.closest("[data-rinfo]");
 if(i){e.preventDefault();const p=document.getElementById(i.dataset.rinfo+"-i"),o=!!p&&p.hidden;p&&(p.hidden=!o);i.setAttribute("aria-expanded",String(o));o?RLM_INFO.add(i.dataset.rinfoKey):RLM_INFO.delete(i.dataset.rinfoKey);return}
 const b=e.target.closest&&e.target.closest("[data-rlm]");if(!b||"play"!==MODE)return;
 if(!RLM_G.some(([g])=>g===b.dataset.rlm))return;
 e.preventDefault();XP().rlmTab=b.dataset.rlm;persist();renderPlay();
});
document.addEventListener("change",e=>{
 const c=e.target;if(!c||!c.matches||!c.matches("[data-rlm-all]")||"play"!==MODE)return;
 XP().rlmAll=!!c.checked;persist();renderPlay();
});
