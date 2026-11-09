/* ---------------------------------------------------------------- training packages (Grogs pp. 66-73) */
/* Each item: "xp Ability[:parameter]" ; "A|B" is a choice ; "@Academic" is any Ability of that category.
   Every five-year option totals 75 XP and every three-year option 45 (15 a year), as the book's do,
   except Natural Philosopher, whose formulae (A&A ch. 5) the app does not track. */
const TP_CHILD=[
 ["athletic","Athletic childhood","",["15 Athletics","15 Brawl","15 Swim"]],
 ["covenant","Covenant-bred childhood","Covenant Upbringing",["5 Athletics","15 Area Lore:Covenant","5 Folk Ken","15 Dead Language:Latin","5 Organization Lore:Order of Hermes"]],
 ["exploring","Exploring childhood","",["15 Area Lore","5 Athletics","5 Awareness","5 Stealth","15 Survival"]],
 ["feral","Feral childhood","Feral Upbringing",["5 Animal Handling","15 Area Lore","15 Athletics","15 Awareness","15 Brawl","15 Hunt","5 Stealth","30 Survival","5 Swim"]],
 ["mischievous","Mischievous childhood","",["15 Brawl","15 Guile","15 Stealth"]],
 ["social","Social childhood","",["15 Charm","15 Folk Ken","15 Guile"]],
 ["traveling","Traveling childhood","",["5 Area Lore:Area A","5 Area Lore:Area B","15 Folk Ken","5 Living Language","15 Survival"]]];
/* [id, name, permission needed ("" | Academic | Martial | Arcane | Academic or none), page, needs Virtue, options {label: items}, note] */
const TP=[
 ["advocate","Advocate","Academic or none",68,"",{"Five years":["40 Civil and Canon Law|Common Law","5 Leadership","15 Artes Liberales","15 Dead Language:Latin"],"Three years":["30 Civil and Canon Law|Common Law","5 Leadership","5 Artes Liberales","5 Dead Language:Latin"]},"In England, Common Law in place of Civil and Canon Law. The Jurist Virtue (A&A p. 91) permits the key Abilities as a layman."],
 ["animaltrainer","Animal Trainer","",68,"",{"Five years":["30 Animal Handling","30 Profession:Animal Trainer","15 Ride"],"Three years":["30 Animal Handling","15 Ride"]}],
 ["apothecary","Apothecary","",68,"",{"Five years":["15 Area Lore","20 Chirurgy","40 Profession:Apothecary"],"Three years":["5 Area Lore","10 Chirurgy","30 Profession:Apothecary"]}],
 ["archer","Archer","Martial",68,"",{"Five years":["20 Awareness","40 Bows","15 Concentration"],"Three years":["15 Awareness","30 Bows"]}],
 ["churchman","Churchman","Academic",69,"",{"Five years":["10 Artes Liberales","30 Organization Lore:Church","5 Dead Language:Latin","30 Civil and Canon Law"],"Three years":["5 Artes Liberales","20 Organization Lore:Church","20 Civil and Canon Law"]}],
 ["conman","Conman","",69,"",{"Five years":["15 Charm","30 Guile","30 Intrigue"],"Three years":["15 Charm","15 Guile","15 Intrigue"]}],
 ["courtier","Courtier","",69,"",{"Five years":["15 Charm","30 Etiquette","15 Folk Ken","15 Intrigue"],"Three years":["5 Charm","30 Etiquette","5 Folk Ken","5 Intrigue"]}],
 ["craftsman","Craftsman","",69,"",{"Five years":["10 Bargain","25 Craft:Type A","15 Craft:Type B","15 Organization Lore:Guild","10 Folk Ken"],"Three years":["10 Bargain","15 Craft:Type A","10 Craft:Type B","5 Organization Lore:Guild","5 Folk Ken"]}],
 ["cultist","Cultist","Arcane",69,"",{"Five years":["15 Guile","50 Infernal Lore|Faerie Lore|Magic Lore","10 Stealth"],"Three years":["15 Guile","30 Infernal Lore|Faerie Lore|Magic Lore"]},"A pagan takes Faerie Lore; a mystery cultist Organization Lore: Cult and Magic Lore. With the Ceremony Virtue some Infernal Lore may go to Ceremony."],
 ["cunningman","Cunning Man","Arcane",69,"",{"Three years":["10 Area Lore","5 Bargain","30 Faerie Lore"]}],
 ["cutter","Cutter","",69,"",{"Three years":["40 Chirurgy","5 Folk Ken"]}],
 ["failedapp","Failed Apprentice","",69,"Failed Apprentice",{"Five years":["5 Artes Liberales","5 Code of Hermes","5 Concentration","5 Finesse","10 Dead Language:Latin","25 Magic Theory","15 Organization Lore:Order of Hermes","5 Penetration"],"Three years":["5 Concentration","10 Dead Language:Latin","20 Magic Theory","5 Organization Lore:Order of Hermes","5 Penetration"]}],
 ["farmer","Farmer","",69,"",{"Five years":["15 Animal Handling","15 Area Lore","5 Folk Ken","40 Profession:Farmer"],"Three years":["10 Animal Handling","5 Folk Ken","30 Profession:Farmer"]}],
 ["fisherman","Fisherman","",69,"",{"Five years":["15 Area Lore","30 Profession:Fisherman","15 Survival","15 Swim"],"Three years":["5 Area Lore","20 Profession:Fisherman","5 Survival","15 Swim"]}],
 ["footpad","Footpad","",69,"",{"Five years":["15 Athletics","15 Guile","15 Legerdemain","30 Stealth"],"Three years":["5 Athletics","5 Guile","15 Legerdemain","20 Stealth"]}],
 ["harlot","Harlot","",69,"",{"Five years":["30 Charm","30 Carouse|Etiquette","15 Organization Lore"],"Three years":["20 Charm","20 Carouse|Etiquette","5 Organization Lore"]}],
 ["herbwife","Herbwife","",70,"",{"Five years":["10 Area Lore","30 Chirurgy","5 Folk Ken","30 Profession:Apothecary"],"Three years":["5 Area Lore","30 Chirurgy","10 Profession:Apothecary"]}],
 ["javeliner","Javeliner","Martial",70,"",{"Five years":["20 Athletics","15 Awareness","40 Thrown Weapon"],"Three years":["10 Athletics","5 Awareness","30 Thrown Weapon"]}],
 ["laborer","Laborer","",70,"",{"Five years":["20 Athletics","15 Brawl","40 Profession:Laborer"],"Three years":["10 Athletics","5 Brawl","30 Profession:Laborer"]}],
 ["laybrother","Lay Brother","",70,"",{"Five years":["50 Organization Lore:Church","10 Folk Ken","15 Profession"],"Three years":["30 Organization Lore:Church","15 Profession"]},"The Profession could be Scribe, Gardener, Brewer or any suitable trade."],
 ["magician","Magician","Arcane",70,"",{"Five years":["15 Concentration","30 Magic Lore","30 Penetration"],"Three years":["15 Concentration","15 Magic Lore","15 Penetration"]}],
 ["minstrel","Minstrel","",70,"",{"Five years":["15 Carouse","5 Charm","5 Folk Ken","50 Music"],"Three years":["15 Carouse","30 Music"]}],
 ["mystic","Mystic","Arcane",70,"",{"Five years":["20 Concentration","5 Organization Lore:Church","30 Dominion Lore","20 Survival"],"Three years":["10 Concentration","20 Dominion Lore","15 Survival"]},"Another realm's Lore may stand in for Dominion Lore."],
 ["natphil","Natural Philosopher","Academic",70,"",{"Five years":["40 Philosophiae"],"Three years":["30 Philosophiae"]},"The book adds 7 formulae (five years) or 3 (three years), 5 XP each (A&A ch. 5); the app adds only the Philosophiae, so 35 or 15 XP stay to be placed."],
 ["pikeman","Pikeman","Martial",70,"",{"Five years":["20 Athletics","15 Awareness","40 Great Weapon"],"Three years":["10 Athletics","5 Awareness","30 Great Weapon"]}],
 ["physician","Physician","Academic",70,"",{"Five years":["15 Folk Ken","40 Medicine","20 Profession:Apothecary"],"Three years":["5 Folk Ken","30 Medicine","10 Profession:Apothecary"]},"Should take at least five years of Student first."],
 ["official","Public Official","",70,"",{"Five years":["15 Area Lore","15 Intrigue","15 Leadership","30 Organization Lore"],"Three years":["10 Area Lore","10 Intrigue","10 Leadership","15 Organization Lore"]}],
 ["sailor","Sailor","",71,"",{"Five years":["15 Area Lore:Area A","10 Area Lore:Area B","30 Profession:Sailor","5 Survival","15 Swim"],"Three years":["5 Area Lore","20 Profession:Sailor","5 Survival","15 Swim"]}],
 ["scout","Scout","",71,"",{"Five years":["15 Area Lore","30 Awareness","30 Stealth"],"Three years":["15 Area Lore","15 Awareness","15 Stealth"]}],
 ["scribe","Scribe","Academic",71,"",{"Five years":["20 Artes Liberales","15 Dead Language:Latin","40 Profession:Scribe"],"Three years":["10 Artes Liberales","10 Dead Language:Latin","25 Profession:Scribe"]},"Latin may be replaced by the language the scribe uses."],
 ["sentry","Sentry","Martial",71,"",{"Five years":["30 Awareness","15 Concentration","30 Single Weapon"],"Three years":["20 Awareness","5 Concentration","20 Single Weapon"]}],
 ["servant","Servant","",71,"",{"Five years":["15 Folk Ken","20 Organization Lore","40 Profession:Servant"],"Three years":["10 Folk Ken","5 Organization Lore","30 Profession:Servant"]}],
 ["soldier","Soldier","Martial",71,"",{"Five years":["15 Athletics","20 Brawl","40 Single Weapon"],"Three years":["5 Athletics","10 Brawl","30 Single Weapon"]}],
 ["storyteller","Storyteller","",71,"",{"Five years":["15 Guile","5 Carouse","5 Folk Ken","50 Profession:Storyteller"],"Three years":["15 Guile","30 Profession:Storyteller"]}],
 ["student","Student","Academic",71,"",{"Five years (cathedral school)":["15 Artes Liberales","30 Dead Language:Latin","15 Theology","15 Civil and Canon Law|Philosophiae"],"Five years (monastic school)":["15 Artes Liberales","30 Dead Language:Latin","15 Theology","15 Medicine|Philosophiae"],"Five years (private tutor or university)":["15 Artes Liberales","30 Dead Language:Latin","30 @Academic"],"Three years (parish school)":["15 Artes Liberales","30 Dead Language:Latin"]},"A parish school gives only the three-year package. University students gain more XP from their Social Status Virtues (A&A pp. 90-92)."],
 ["teacher","Teacher","Academic",71,"",{"Five years":["15 Artes Liberales","5 Folk Ken","15 Dead Language:Latin|Living Language","40 Teaching"]},"The language is the one he teaches in, usually Latin."],
 ["tinker","Tinker","",71,"",{"Five years":["15 Area Lore:Area A","15 Area Lore:Area B","15 Bargain","15 Craft","15 Survival"],"Three years":["15 Area Lore","15 Craft","15 Survival"]}],
 ["theologian","Theologian","Academic",71,"",{"Five years":["15 Civil and Canon Law","15 Organization Lore:Church","5 Dead Language:Latin","40 Theology"],"Three years":["5 Civil and Canon Law","5 Organization Lore:Church","5 Dead Language:Latin","30 Theology"]},"Should take at least five years of Student first."],
 ["trader","Trader","",72,"",{"Five years":["30 Bargain","15 Folk Ken","30 Profession:Merchant"],"Three years":["20 Bargain","5 Folk Ken","20 Profession:Merchant"]},"Any trade: change the Profession."],
 ["tumbler","Tumbler","",72,"",{"Five years":["50 Athletics","10 Carouse","15 Legerdemain"],"Three years":["30 Athletics","5 Carouse","10 Legerdemain"]}],
 ["woodsman","Woodsman","",72,"",{"Five years":["15 Area Lore","30 Hunt","15 Stealth","15 Survival"],"Three years":["5 Area Lore","20 Hunt","5 Stealth","15 Survival"]}],
 /* non-career, three years only (pp. 72-73) */
 ["athlete","Athlete","",72,"",{"Three years":["30 Athletics","5 Brawl","5 Ride","5 Swim"]},null,1],
 ["brawler","Brawler","",72,"",{"Three years":["15 Athletics","30 Brawl"]},null,1],
 ["charmer","Charmer","",72,"",{"Three years":["30 Charm","5 Folk Ken","5 Guile","5 Intrigue"]},null,1],
 ["covenfolk","Covenfolk","",72,"",{"Three years":["5 Area Lore","20 Area Lore:Covenant","15 Dead Language:Latin","5 Organization Lore:Order of Hermes"]},"Without exposure to Latin, put its 15 XP into this package's other Abilities.",1],
 ["forager","Forager","",73,"",{"Three years":["15 Area Lore","15 Hunt","15 Survival"]},null,1],
 ["leader","Leader","",73,"",{"Three years":["10 Folk Ken","5 Charm","30 Leadership"]},null,1],
 ["local","Local","",73,"",{"Three years":["15 Area Lore","15 Folk Ken","15 Organization Lore"]},null,1],
 ["rider","Rider","",73,"",{"Three years":["15 Animal Handling","30 Ride"]},null,1],
 ["trainer","Trainer","",73,"",{"Three years":["5 Folk Ken","5 Dead Language:Latin|Living Language","5 Leadership","30 Teaching"]},null,1],
 ["wastrel","Wastrel","",73,"",{"Three years":["5 Brawl","30 Carouse","5 Folk Ken","5 Guile"]},null,1]];
const TP_BY={};TP.forEach(p=>TP_BY[p[0]]=p);
const tpYears=label=>/^Five/.test(label)?5:3;
const tpItem=s=>{const m=/^(\d+) (.+)$/.exec(s);return{xp:+m[1],alts:m[2].split("|")}};
const tpSpec=s=>{const i=s.indexOf(":");return i<0?{n:s,prm:""}:{n:s.slice(0,i),prm:s.slice(i+1)}};
const tpLabel=s=>{if(s[0]==="@")return"any "+s.slice(1)+" Ability";const a=tpSpec(s);return a.n==="Dead Language"&&a.prm?a.prm:a.prm?a.n+": "+a.prm:a.n};
const tpState=()=>{const t=st.tpk=Array.isArray(st.tpk)?st.tpk:[];return t};
const tpFind=(n,prm)=>{const p=norm(prm||"");let i=st.abil.findIndex(a=>a.n===n&&norm(a.prm||"")===p);
 if(i<0&&!p)i=st.abil.findIndex(a=>a.n===n&&!a.native);return i};
function tpApply(stage,items,sign){
 const out=[];
 for(const it of items){
  const s=tpSpec(it.pick);if(!s.n)continue;
  let i=tpFind(s.n,s.prm);
  if(i<0){if(sign<0)continue;st.abil.push({n:s.n,prm:s.prm,sp:"",xp:0,xps:{},free:0});i=st.abil.length-1}
  const a=st.abil[i];a.xps=a.xps&&"object"==typeof a.xps?a.xps:{};
  const v=Math.max(0,num(a.xps[stage])+sign*it.xp);
  v?a.xps[stage]=v:delete a.xps[stage];a.xp=stageSum(a);out.push(i);
 }
 /* drop rows a removal emptied, unless they hold anything else */
 if(sign<0)for(let i=st.abil.length-1;i>=0;i--){const a=st.abil[i];if(!a.native&&!a.house&&!num(a.free)&&!Object.keys(a.xps||{}).length&&!num(a.pxp))st.abil.splice(i,1)}
 return out;
}
const tpPkg=r=>r.stage==="child"?TP_CHILD.find(p=>p[0]===r.id):TP_BY[r.id];
const tpItems=r=>{const p=tpPkg(r);if(!p)return[];const list=r.stage==="child"?p[3]:p[5][r.opt]||[];
 return list.map((s,k)=>{const it=tpItem(s),c=(r.pick||{})[k],any=it.alts[0][0]==="@";
  return{xp:it.xp,pick:any?(c||""):it.alts.includes(c)?c:it.alts[0]}})};
const tpPostYears=()=>tpState().filter(r=>r.stage!=="child").reduce((s,r)=>s+tpYears(r.opt),0);
function tpSuggestAge(e){const y=tpPostYears();const f="magus"!==e.type&&has(e,"Wealthy")?.75:"magus"!==e.type&&has(e,"Poor")?1.5:1;return{y,f,age:5+Math.ceil(y*f)}}

function tpHtml(stage){
 const rows=tpState().filter(r=>r.stage===stage);
 const used=rows.map(r=>{const p=tpPkg(r);if(!p)return"";const its=tpItems(r);
  return`<li><b>${H(p[1])}</b>${stage==="child"?"":` · ${H(r.opt.toLowerCase())}`} <span class="tag">${its.map(i=>`+${i.xp} ${H(i.pick?tpLabel(i.pick):"(choose)")}`).join(", ")}</span> <button type="button" class="btn small" data-act="tp-rm" data-tp="${tpState().indexOf(r)}">Remove</button></li>`}).join("");
 let pick;
 if(stage==="child"){
  const ok=p=>!p[2]||has(st,p[2]);
  pick=`<select data-tp-pkg="child" aria-label="Childhood package">${TP_CHILD.filter(ok).map(p=>`<option value="${p[0]}">${H(p[1])}</option>`).join("")}</select>`;
 }else{
  const opt=p=>`<option value="${p[0]}">${H(p[1])}${p[2]?` (${H(p[2])})`:""}${p[4]?` (needs ${H(p[4])})`:""}</option>`;
  pick=`<select data-tp-pkg="later" aria-label="Training package"><optgroup label="Career (pp. 68-72)">${TP.filter(p=>!p[7]).map(opt).join("")}</optgroup><optgroup label="Non-career, three years (pp. 72-73)">${TP.filter(p=>p[7]).map(opt).join("")}</optgroup></select>
   <select data-tp-opt aria-label="Length"></select>`;
 }
 const sug=stage==="later"?tpSuggestAge(st):null,mag="magus"===st.type;
 const ageLine=sug&&sug.y?`<p class="note">Packages give ${sug.y} years after childhood${sug.f!==1?` (${sug.f===.75?"Wealthy: one quarter fewer":"Poor: half as many again"}, Grogs p. 68)`:""}. ${mag?"Apprenticeship would start at":"Age at creation would be"} <b>${sug.age}</b>. <button type="button" class="btn small" data-act="tp-age">${mag?"Set apprenticeship start":"Set age"} to ${sug.age}</button></p>`:"";
 const sav=has(st,"Savantism")?`<p class="note">Savantism halves this stage's XP (DE p. 143); packages add their full XP, so trim to the halved total.</p>`:"";
 return`<details class="tp-box" data-tp-box="${stage}"${rows.length?" open":""}><summary>${stage==="child"?"Childhood package":"Training packages"} <span class="tag">Grogs pp. ${stage==="child"?"66":"67-73"}</span></summary>
  <p class="note">${stage==="child"?"One package for the first five years; the native language's 75 XP are separate (p. 48).":"Each package adds its XP to this stage. Take a package more than once for more years; no more than 15 years in one package for a starting character (p. 68)."}</p>
  ${used?`<ul class="tp-list">${used}</ul>`:""}
  <div class="tp-add">${pick}<span data-tp-choices></span><button type="button" class="btn small" data-act="tp-add" data-stage="${stage}">Add package</button></div>
  <p class="note" data-tp-note></p>${ageLine}${sav}</details>`;
}
function tpRefresh(box){
 if(!box)return;const stage=box.dataset.tpBox,sel=box.querySelector("[data-tp-pkg]");if(!sel)return;
 const optSel=box.querySelector("[data-tp-opt]"),ch=box.querySelector("[data-tp-choices]"),note=box.querySelector("[data-tp-note]");
 let list,p;
 if(stage==="child"){p=TP_CHILD.find(x=>x[0]===sel.value);list=p?p[3]:[]}
 else{p=TP_BY[sel.value];if(!p)return;const keep=optSel.value;optSel.innerHTML=Object.keys(p[5]).map(k=>`<option${k===keep?" selected":""}>${H(k)}</option>`).join("");list=p[5][optSel.value]||[]}
 ch.innerHTML=list.map((s,k)=>{const it=tpItem(s);
  if(it.alts[0][0]==="@"){const cat=it.alts[0].slice(1);return`<select data-tp-ch="${k}" aria-label="Any ${H(cat)} Ability">${ABILITIES.filter(a=>a[1]===cat).map(a=>`<option>${H(a[0])}</option>`).join("")}</select>`}
  return it.alts.length>1?`<select data-tp-ch="${k}" aria-label="Choice">${it.alts.map(a=>`<option value="${H(a)}">${H(tpLabel(a))}</option>`).join("")}</select>`:""}).join("");
 const items=list.map(s=>{const it=tpItem(s);return`+${it.xp} ${it.alts.map(tpLabel).join(" or ")}`});
 note.textContent=p?`${items.join(", ")}.${stage!=="child"&&p[6]?" "+p[6]:""}${stage!=="child"?` Grogs p. ${p[3]}.`:""}`:"";
}
document.addEventListener("change",e=>{const b=e.target.closest&&e.target.closest("[data-tp-box]");b&&(e.target.matches("[data-tp-pkg],[data-tp-opt]"))&&tpRefresh(b)});
document.addEventListener("toggle",e=>{e.target.matches&&e.target.matches("[data-tp-box]")&&tpRefresh(e.target)},!0);
Object.assign(ACT,{
 "tp-add":b=>{const box=b.closest("[data-tp-box]");if(!box)return;const stage=box.dataset.tpBox,id=box.querySelector("[data-tp-pkg]").value;
  const r={stage,id,opt:stage==="child"?"Five years":box.querySelector("[data-tp-opt]").value,pick:{}};
  box.querySelectorAll("[data-tp-ch]").forEach(s=>r.pick[s.dataset.tpCh]=s.value);
  if(stage==="child"&&tpState().some(x=>x.stage==="child")){toast("Only one childhood package: remove the current one first.");return}
  tpState().push(r);tpApply(stage,tpItems(r),1);
  if(stage==="child"&&id==="feral"){const n=st.abil.find(a=>a.native);n&&(n.free=0)}
  persist()},
 "tp-rm":b=>{const t=tpState(),i=+b.dataset.tp,r=t[i];if(!r)return;tpApply(r.stage,tpItems(r),-1);
  if(r.stage==="child"&&r.id==="feral"){const n=st.abil.find(a=>a.native);n&&(n.free=75)}
  t.splice(i,1);persist()},
 "tp-age":()=>{const s=tpSuggestAge(st);"magus"===st.type?st.ages.apprentAt=s.age:st.ages.age=s.age;persist()}
});
{const SC=stageCard;stageCard=function(t){const h=SC.apply(this,arguments);try{
 if(("child"===t.id||"later"===t.id)&&!t.orphan)return h.replace('<div class="stg-addrow">',tpHtml(t.id)+'<div class="stg-addrow">')}catch(z){console.error(z)}return h}}
{const R=renderAll;renderAll=function(){const r=R.apply(this,arguments);try{document.querySelectorAll("[data-tp-box]").forEach(tpRefresh)}catch(z){}return r}}

/* ---------------------------------------------------------------- Feral and Covenant Upbringing in childhood (DE pp. 124, 129) */
const FERAL_OK=["Area Lore","Animal Handling","Athletics","Awareness","Brawl","Hunt","Stealth","Survival","Swim"];
{const SX=stageCtx;stageCtx=function(e){const c=SX.apply(this,arguments);try{const ok=c.okFor;
 c.okFor=function(pool,a){if(pool&&"child"===pool.id&&!a.native){
   if(has(e,"Feral Upbringing"))return FERAL_OK.includes(a.n)?"":"Feral Upbringing: childhood XP buys only (Area) Lore, Animal Handling, Athletics, Awareness, Brawl, Hunt, Stealth, Survival and Swim (DE p. 129)";
   if(has(e,"Covenant Upbringing")&&(isLatinA(a)||"Organization Lore"===a.n&&/order of hermes/i.test(a.prm||"")))return"";}
  return ok.apply(this,arguments)}}catch(z){console.error(z)}return c}}

/* ---------------------------------------------------------------- Savantism (DE p. 143; Grogs p. 84) */
/* v4.8.3.0 already halves the childhood and later-life pools (rounded down), requires the favoured Ability to be
   named, caps Abilities at 3 (favoured 6) and halves Seasons Advancement Totals except the favoured Ability's.
   4.9.6.0 adds: apprenticeship and after-Gauntlet pools halved too (decided, Haik); the favoured Ability may reach 6
   whatever the age (reading ours); the optional full-rate rule; Feral Upbringing's 120 childhood XP. */
const savFav=(e,a)=>!!a&&(vfDetailHas(e,"Savantism",a.n)||!!a.prm&&vfDetailHas(e,"Savantism",a.prm)||vfDetailHas(e,"Savantism",abilLabel(a)));
const savHalf=v=>Math.floor(v/2);
BONUS_OK.Savantism=a=>savFav(st,a);
{const B=budget;budget=function(e){let b=B.apply(this,arguments);try{
 const feral=has(e,"Feral Upbringing"),sav=has(e,"Savantism");if(!feral&&!sav)return b;
 b=Object.assign({},b); /* budget() may hand back a shared object: never change it in place */
 b.pools=b.pools.map(([n,v])=>{
  if(feral&&/^Early childhood/.test(n))return[n,sav?savHalf(120):120];
  if(sav&&/^Apprenticeship/.test(n)){b.appr=savHalf(v);return["Apprenticeship (halved by Savantism)",b.appr]}
  if(sav&&/^After Gauntlet/.test(n)){b.post=savHalf(v);return[n.replace(/\)$/,", halved by Savantism)"),b.post]}
  return[n,v]});
 b.xpAvail=b.pools.reduce((s,p)=>s+p[1],0);b.left=b.xpAvail-b.spent;
 sav&&"magus"===e.type&&(b.artLimit=num(b.appr)+num(b.post)-num(b.levelOver));
}catch(z){console.error(z)}return b}}
{const BP=bonusPools;bonusPools=function(e){const a=BP.apply(this,arguments);try{
 if(has(e,"Savantism")&&e.savFull){const f=e.abil.find(x=>savFav(e,x));
  if(f)a.push(["Savantism (favored Ability at full rate, optional rule)",Math.floor(stageSum(f)/2)])}}catch(z){}return a}}
{const K=checks;checks=function(e){const a=K.apply(this,arguments);try{
 if(has(e,"Savantism")){
  const cap=budget(e).cap,fav=e.abil.find(x=>savFav(e,x));
  /* the favoured Ability may reach 6 whatever the age (reading ours): lift it out of the age-cap line */
  if(fav&&ablCalc(e,fav).score<=6){const i=a.findIndex(c=>!c.ok&&/^Over the age cap of /.test(c.t));
   if(i>=0){const rest=e.abil.filter(x=>x!==fav&&!noAgeCap(x)&&ablCalc(e,x).score>cap+(ablCalc(e,x).aff?2:0));
    a[i]=rest.length?Object.assign({},a[i],{t:`Over the age cap of ${cap}: ${rest.map(abilLabel).join(", ")}`}):Object.assign({},a[i],{ok:true,t:`Abilities within the age cap of ${cap} (Savantism's favoured Ability may reach 6)`})}}
 }
 if(has(e,"Feral Upbringing")){const l=e.abil.filter(x=>/Language$/.test(x.n)&&ablCalc(e,x).score>0);
  a.push({ok:!l.length,t:l.length?`Feral Upbringing: no score in a Language at the start (DE p. 129): ${l.map(abilLabel).join(", ")}`:"Feral Upbringing: no Language",g:"xp"})}
 const per={};tpState().filter(r=>r.stage!=="child").forEach(r=>per[r.id]=(per[r.id]||0)+tpYears(r.opt));
 const long=Object.entries(per).filter(([,y])=>y>15);
 Object.keys(per).length&&a.push({ok:!long.length,t:long.length?`Training packages: more than 15 years in ${long.map(([k,y])=>`${TP_BY[k][1]} (${y})`).join(", ")} (Grogs p. 68)`:"Training packages: no more than 15 years in any one",g:"xp"});
 tpState().forEach(r=>{const p=tpPkg(r);const need=p&&(r.stage==="child"?p[2]:p[4]);need&&!has(e,need)&&a.push({ok:false,t:`${p[1]} needs ${need} (Grogs pp. 66, 69)`,g:"xp"})});
}catch(z){console.error(z)}return a}}
/* the optional full-rate rule is a per-character switch shown with the Abilities */
{const SA=sAbil;sAbil=function(){const h=SA.apply(this,arguments);try{if(has(st,"Savantism")){
 const f=st.abil.find(x=>savFav(st,x));
 const box=`<div class="note sav-box"><b>Savantism</b> (DE p. 143): creation XP halved (rounded down), no Ability above 3 except the native language and the favored Ability${f?`, <b>${H(abilLabel(f))}</b>,`:" (name it in the Flaw's detail)"} which may reach 6.
  <label class="chk"><input type="checkbox" data-sav-full${st.savFull?" checked":""}><span>Optional rule: the favored Ability is bought at full rate (its XP count half against the halved pools)</span></label></div>`;
 return h.replace('<div class="facts" style="margin:0 0 10px" data-oh="xp.pools"></div>','<div class="facts" style="margin:0 0 10px" data-oh="xp.pools"></div>'+box)}}catch(z){console.error(z)}return h}}
document.addEventListener("change",e=>{if(e.target.matches&&e.target.matches("[data-sav-full]")){st.savFull=!!e.target.checked;persist();renderAll()}});
