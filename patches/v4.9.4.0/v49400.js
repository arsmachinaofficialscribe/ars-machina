!function(){
"use strict";
/* ---------------------------------------------------------------- shared */
const N=v=>num(v), H=v=>esc(String(v==null?"":v));
const inPlay=()=>"play"===MODE;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* ================================================================
   #1  Known effects for folk witches and elementalists (HMRE)
   ================================================================ */
const FOLK_FX=[
 ["Curse of Disease","Cursing (folk witch)",9,"Corpus",37,"A fever and a Medium Wound at once; the disease then runs its normal course."],
 ["Curse of Miscarriage","Cursing (folk witch)",9,"Corpus",37,"A Medium Wound to a pregnant woman; if it has not improved at the month’s end, she miscarries."],
 ["Curse of Aging","Cursing (folk witch)",12,"Corpus",37,"An immediate Aging Crisis; it disrupts a Longevity Ritual."],
 ["Curse of Emotion","Cursing (folk witch)",12,"Mentem",37,"One strong emotion toward another person; needs an Arcane Connection to each, and penetrates only the target."],
 ["Curse of the Tongue","Cursing (folk witch)",15,"Mentem",37,"Forgets every language until the curse object is destroyed, the Arcane Connection expires, or magic restores speech."],
 ["Curse of Paralysis","Cursing (folk witch)",15,"Corpus",37,"Cannot move the limbs until the curse object is destroyed, the Arcane Connection expires, or magic restores movement; can still speak."],
 ["Curse of the Beast","Cursing (folk witch)",18,"Animal",37,"Turned into a small animal (frog, newt, rat); still human for Corpus and Mentem effects."],
 ["Curse of Reduction","Cursing (folk witch)",18,"Corpus",38,"Loses a Size level each month, to no less than –18, until the curse ends; then regains one an hour."],
 ["Flight: take to the air","Flight",9,"Auram",38,"Flies at a horse’s gallop for hours equal to Flight. Fetish: 1 long-term Fatigue level even on a failure; Potion: none."]
].map(([n,pw,ef,fo,p,x])=>({n,pw,ef,fo,p,x}));
[["Light Wound",6,3],["Medium Wound",9,4],["Heavy Wound",12,5],["Incapacitating Wound",15,6],["Winded",6,1],["Weary",9,2],["Tired",12,3],["Dazed",15,4]].forEach(([w,ef,v])=>{
 FOLK_FX.push({n:`Heal: ${w}`,pw:"Healing",ef,fo:"Corpus",p:38,x:`True healing that also breaks the Limit of Energy; costs ${v} pawn${v>1?"s":""} of Corpus vis, and must penetrate the target.`});
 FOLK_FX.push({n:`Heal an animal: ${w}`,pw:"Animal Healing",ef,fo:"Animal",p:35,x:`As Healing, for animals; costs ${v} pawn${v>1?"s":""} of Animal vis (HMRE pp. 35, 38).`});
});
const ELEM_TECH=[["sum","Summoning"],["ctl","Controlling"],["div","Divining"],["ref","Refining"]];
const TRADS={folk:"Folk witch",elem:"Elementalist"};
const cut=(v,n)=>String(v==null?"":v).slice(0,n);
function fxSan(s){
 if(!s||"object"!=typeof s)return s;
 Array.isArray(s.hedgeFx)||(s.hedgeFx=[]);
 s.hedgeFx=s.hedgeFx.filter(e=>e&&"object"==typeof e&&TRADS[e.trad]).slice(0,200).map(e=>({
  trad:e.trad,n:cut(e.n,160),pw:cut(e.pw,60),fo:cut(e.fo,60),ef:clamp(N(e.ef),0,99),lvl:clamp(N(e.lvl),0,200),
  method:cut(e.method,20),notes:cut(e.notes,2000),ref:cut(e.ref,40),bi:Number.isInteger(e.bi)?e.bi:-1}));
 /* True Faith and Ars Notoria records (RoP:D) */
 const f=s.faith&&"object"==typeof s.faith?s.faith:{};
 s.faith={score:null==f.score||""===f.score?null:clamp(N(f.score),0,10),pts:clamp(N(f.pts),0,99),test:!!f.test};
 const a=s.notoria&&"object"==typeof s.notoria?s.notoria:{};
 const act={};for(const k of["1","2","3","4","5","6","7"])a.active&&a.active[k]&&(act[k]={seasons:clamp(N(a.active[k].seasons),0,99)});
 s.notoria={learned:clamp(N(a.learned),0,7),active:act,disease:cut(a.disease,80)};
 return s;
}
{const m=migrate;migrate=function(){return fxSan(m.apply(this,arguments))};const b=blankState;blankState=function(){return fxSan(b.apply(this,arguments))};fxSan(st)}

const isFolk=()=>isFolkWitch()||folkPowers().length>0;
const elemFormsAll=()=>Object.keys(HEDGE).filter(k=>HEDGE[k].trad==="elem"&&HEDGE[k].role==="fo");
const isElem=()=>elemForms().length>0||hedgeNames("te","elem").length>0;
const fxTrads=()=>Object.keys(TRADS).filter(t=>"folk"===t?isFolk():isElem());
const fp=(i,k)=>`hedgeFx.${i}.${k}`;

function fxBlock(t){
 const rows=st.hedgeFx.map((e,i)=>[e,i]).filter(([e])=>e.trad===t);
 const what="folk"===t?"powers and curses":"elemental effects";
 const pows="folk"===t?Object.keys(FOLK_POWERS):ELEM_TECH.map(e=>e[0]);
 const body=rows.length?rows.map(([e,i])=>{
  const book="folk"===t&&e.bi>=0?FOLK_FX[e.bi]:null;
  const f="folk"===t
   ?`${sel("Power",fp(i,"pw"),pows.map(p=>[p,p]))}${nin("Ease Factor",fp(i,"ef"),{min:0,max:99})}${sel("Method",fp(i,"method"),[["","—"],["Incantation","Incantation"],["Fetish","Fetish"],["Potion","Potion"]])}`
   :`${sel("Technique",fp(i,"pw"),ELEM_TECH)}${sel("Form",fp(i,"fo"),[["","—"]].concat(elemFormsAll().map(x=>[x,x])))}${nin("Effect level (for Penetration)",fp(i,"lvl"),{min:0,max:200})}`;
  return`<div class="am49-eff"><div class="fields">${txt("Name",fp(i,"n"))}${f}<button class="xbtn" type="button" data-act="h49-rm" data-i="${i}" aria-label="Remove ${H(e.n||"this effect")}">×</button></div>${book?`<p class="am49-x">${H(book.x)} <span class="am49-ref">HMRE p. ${book.p}</span></p>`:""}${area("Notes",fp(i,"notes"),{rows:1,ph:"folk"===t?"Fetish, potion, Arcane Connection, variations":"Target, Size, Might, conditions"})}</div>`}).join(""):`<p class="note">No ${what} recorded yet.</p>`;
 const add="folk"===t
  ?`<select data-h49add="folk" aria-label="Add a published effect"><option value="">Add from the book…</option>${FOLK_FX.map((e,i)=>`<option value="${i}">${H(e.n)} — ${H(e.pw)}, Ease Factor ${e.ef}, HMRE p. ${e.p}</option>`).join("")}</select>`:"";
 const guide="folk"===t
  ?`<details class="tog am49-g"><summary>Folk witch powers (HMRE pp. 36–38)</summary><p class="note">Casting Total: Characteristic + power + aura + vis (Gifted only); a curse on a person takes a season in the kitchen with an Arcane Connection and must penetrate for the whole season (HMRE p. 37). Animal Ken, Dowsing, Second Sight and Shapeshifter work as the Definitive Edition Abilities, with the Ease Factors given there.</p></details>`
  :`<details class="tog am49-g"><summary>Elementalist guidelines (HMRE pp. 23–26)</summary><p class="note">HMRE gives no list of named elementalist effects: each is built from the Technique, an elemental Form and the summoning chart. Summoning reaches the Might and Size in the row of its total; Controlling must exceed the target’s Might on the chart; Divining must exceed the target’s Size; Refining works on vis, Traits and elementals (HMRE p. 26).</p>
   <table class="lt am49-gt"><thead><tr><th>Total</th><th>Might</th><th>Size</th><th>Example</th></tr></thead><tbody>${SUMMON_CHART.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${sgnN(r[2])}</td><td>${H(r[3])}</td></tr>`).join("")}</tbody></table></details>`;
 return`<div class="am49-trad"><h3>${TRADS[t]}: known ${what}</h3>${body}<div class="addrow">${add}<button class="btn small" type="button" data-act="h49-add" data-t="${t}">Add your own</button></div>${guide}</div>`;
}
ACT["h49-add"]=e=>{const t=e.dataset.t;TRADS[t]&&(st.hedgeFx.push({trad:t,n:"",pw:"folk"===t?(folkPowers()[0]||"Cursing (folk witch)"):"sum",fo:"elem"===t?(elemForms()[0]||""):"",ef:"folk"===t?9:0,lvl:0,method:"",notes:"",ref:"",bi:-1}),fxSan(st))};
ACT["h49-rm"]=e=>{st.hedgeFx.splice(+e.dataset.i,1)};
document.addEventListener("change",e=>{
 const s=e.target;if(!s||inPlay()||!s.matches||!s.matches("[data-h49add]"))return;
 const b=FOLK_FX[+s.value];if(""===s.value||!b)return;
 st.hedgeFx.push({trad:"folk",n:b.n,pw:b.pw,fo:b.fo,ef:b.ef,lvl:0,method:"",notes:"",ref:`HMRE p. ${b.p}`,bi:+s.value});
 fxSan(st);persist();renderAll();
});
{const w=sSpells;sSpells=function(){
 const out=w.apply(this,arguments);let tr=[];try{tr=fxTrads()}catch(x){}
 if(!tr.length)return out;
 const blocks=tr.map(fxBlock).join("");
 const i=out.indexOf('id="s-hedge-known"');
 if(i>=0){const j=out.indexOf("</section>",i);if(j>0)return out.slice(0,j)+blocks+out.slice(j)}
 return out+section(7,"s-hedge-known","Hedge Magic: Known Effects","Powers, curses and effects the character knows, from the tradition’s own lists or built with its guidelines. Each one can be used from the Play tab.",blocks);
}}
{const A=tabHedge;tabHedge=function(){
 let pre="";
 try{
  const tr=fxTrads(),list=st.hedgeFx.map((e,i)=>[e,i]).filter(([e])=>tr.includes(e.trad));
  if(list.length)pre=`<div class="pane-h"><h3>Known powers and effects</h3><p class="note">Choose one to load its roll with the power and Ease Factor, or the Form and level, already set.</p></div><div class="acts am49-known">${list.map(([e])=>{
   const id="folk"===e.trad?"x:folk:"+e.pw:"x:elem:"+e.pw,set="folk"===e.trad?{folkEF:e.ef,folkMethod:e.method}:{hFo:e.fo,elemLevel:e.lvl};
   const sub="folk"===e.trad?`${e.pw} · Ease Factor ${e.ef}${e.method?" · "+e.method:""}`:`${(ELEM_TECH.find(x=>x[0]===e.pw)||["",""])[1]} · ${e.fo||"any Form"} · level ${e.lvl}`;
   return`<button type="button" class="act" data-pact="load" data-id="${H(id)}" data-h49set="${H(JSON.stringify(set))}"><span class="an">${H(e.n||"Unnamed")}<small>${H(TRADS[e.trad])} · ${H(sub)}</small></span><span class="av">${"folk"===e.trad?"EF "+e.ef:"L"+e.lvl}</span></button>`}).join("")}</div>`;
 }catch(x){console.error(x)}
 return pre+A.apply(this,arguments);
}}
document.addEventListener("click",e=>{
 const t=e.target.closest&&e.target.closest("[data-h49set]");if(!t)return;
 let a;try{a=JSON.parse(t.dataset.h49set)}catch(x){return}
 const s=XP();
 "folkEF"in a&&(s.folkEF=N(a.folkEF));a.folkMethod&&(s.folkMethod=String(a.folkMethod));
 a.hFo&&(s.hFo=String(a.hFo));"elemLevel"in a&&(s.elemLevel=N(a.elemLevel));
},!0);

/* ================================================================
   #5  True Faith, miracles, God's aid, tempers, Ars Notoria
   ================================================================ */
Object.assign(XDEF,{
 mirLevel:15,mirTime:"0",mirNeed:"0",mirExtra:0,mirMethod:!1,mirCer:0,
 aidCer:0,aidOn:0,aidFor:"",
 tmpName:"",tmpV:0,tmpMode:"ceremonial",tmpPick:"Kind",tmpRollMode:"ceremonial",spAuth:!1,
 tarName:"",tarV:0,tarMode:"ceremonial",tarPick:"Lust",tarRollMode:"ceremonial",
 noRing:1,noSeasons:1,noFast:0,noChaste:!1,noHonMi:0,noHonMa:0,noDisMi:0,noDisMa:0,noVenial:0,noMortal:0,noVar:0,noMR:0,noDivEF:9,noFastSeq:1
});
const TEMPERS=[
 ["Loyal","Pride","Dedicated, Faithful, Humble, Reliable, Trusting","Arrogant, Haughty, Rebellious, Suspicious, Vain"],
 ["Calm","Wrath","Cheerful, Hopeful, Optimistic, Patient, Peaceful","Angry, Desperate, Spiteful, Vengeful, Violent"],
 ["Kind","Envy","Charitable, Compassionate, Forgiving, Generous, Merciful","Cruel, Gossipy, Gruff, Jealous, Meddlesome"],
 ["Brave","Sloth","Bold, Courageous, Determined, Ready, Zealous","Cowardly, Cynical, Indecisive, Lazy, Shy"],
 ["Wise","Lust","Careful, Cautious, Chaste, Practical, Prudent","Fanatical, Lecherous, Naïve, Overconfident, Reckless"],
 ["Strong","Gluttony","Healthy, Pious, Selfless, Temperate, Vigilant","Gluttonous, Greedy, Indulgent, Selfish, Sickly, Weak"],
 ["Just","Avarice","Even-handed, Fair, Honest, Honorable, Straightforward","Ambitious, Corrupt, Cunning, Devious, Manipulative"]];
const SINS=TEMPERS.map(t=>[t[1],t[0]]);
const TIME_MOD=[["10","Immediate (instantly to a few hours) +10"],["5","Day +5"],["0","Week +0"],["-5","Month –5"],["-10","Year –10"],["-20","Generation –20"]];
const NEED_MOD=[["-15","Calamitous –15"],["-10","Dire –10"],["-5","Grave –5"],["0","Beneficial +0"],["10","Frivolous +10"],["20","Impious +20"]];
const CLERGY=["Priest","Senior Clergy","Brother Chaplain","Eastern Priest","Religious","Cathar Perfect","Rabbi","Imam","Monk","Nun","Clerk"];

const faith=()=>st.faith||fxSan(st).faith;
const tfScore=()=>{const f=faith();return null!=f.score?f.score:count(st,"True Faith")};
const tfPts=()=>N(faith().pts);
const spendCap=()=>tfScore()>0?tfScore():1;
const faithBonus=()=>tfScore()>=3?6:3;
const tfMR=()=>10*tfScore();
const hasNotoria=()=>has(st,"Ars Notoria")||st.abil.some(a=>"Ars Notoria"===a.n);
const ringOn=k=>{const a=st.notoria&&st.notoria.active;return!!(a&&a[k])};
const auraLvl=r=>{const a=P().aura;return a&&a.realm===r?N(a.lvl):0};
const dominionLore=()=>Math.max(ablScore(st,"Dominion Lore"),ablScore(st,"Divine Lore"));
const isHoly=()=>tfScore()>0||CLERGY.some(c=>has(st,c));
const holyMethodBest=()=>{const k=Object.keys(HOLY_METHODS).filter(m=>ablScore(st,m)>0).sort((a,b)=>ablScore(st,b)-ablScore(st,a))[0];return k?[k,ablScore(st,k)]:null};

{const R=hasRealms;hasRealms=function(){
 if(R.apply(this,arguments))return!0;
 try{return tfScore()>0||tfPts()>0||hasNotoria()||dominionLore()>0||ablScore(st,"Infernal Lore")>0||CLERGY.some(c=>has(st,c))}catch(x){return!1}
}}

/* Magic Resistance: True Faith Score × 10; sources do not stack (DE p. 55) */
{const M=magicResistance;magicResistance=function(form){
 const r=M.apply(this,arguments);try{
  const t=tfMR();if(t>0){
   if(t>r.mr)r.lines=[{l:`True Faith ${tfScore()} × 10 (higher than ${r.mr} from your other sources; Magic Resistance does not stack, p. 55)`,v:t,ref:"p. 419"}],r.mr=t;
   else r.lines.push({l:`True Faith gives ${t}, lower than this; the higher total applies (p. 55)`,v:0,ref:"p. 419"});
  }
  "Me"===form&&tfScore()>=3&&r.mr>0&&(r.lines.push({l:"Hope (True Faith 3+): doubled against Mentem",v:0,ref:"RoP:D p. 62"}),r.mr*=2);
 }catch(x){console.error(x)}return r;
}}
function faithMRAll(){const t=tfMR();return t?`${t}${tfScore()>=3?` (${2*t} against Mentem)`:""}`:"none"}

/* Ars Notoria: reduces the Divine aura penalty to other magic by 3 per point (RoP:D p. 100) */
{const F=auraFor;auraFor=function(realm){
 const r=F.apply(this,arguments);try{
  const a=P().aura,s=hasNotoria()?ablScore(st,"Ars Notoria"):0;
  if(s>0&&a&&"Divine"===a.realm&&"Divine"!==realm&&r.mod<0){
   const red=Math.min(-r.mod,3*s);r.mod+=red;r.lines=r.lines.concat([{l:`Ars Notoria ${s}: Divine aura penalty reduced by ${red}`,v:red,ref:"RoP:D p. 100"}]);
  }
 }catch(x){console.error(x)}return r;
}}

/* Rings of Solomon in play: experience and Characteristics while a ring is active (RoP:D p. 99) */
const RING_XP={1:"Philosophiae",2:"Theology",3:"Medicine"};
const ringXP=n=>{if(!inPlay())return 0;for(const k in RING_XP)if(RING_XP[k]===n&&ringOn(k))return 100;return 0};
{const C=ablCalc;ablCalc=function(e,a){
 try{if(e===st&&a&&a.n){const x=ringXP(a.n);if(x)return C.call(this,e,Object.assign({},a,{pxp:N(a.pxp)+x}))}}catch(z){}
 return C.apply(this,arguments);
}}
{const S=ablScore;ablScore=function(e,n){
 const v=S.apply(this,arguments);
 try{if(e===st&&!e.abil.some(a=>a.n===n)){const x=ringXP(n);if(x)return Math.max(v,ablFromXp(x).score)}}catch(z){}
 return v;
}}
{const E=charEff;charEff=function(e){
 const t=E.apply(this,arguments);
 try{if(e===st&&inPlay()){ringOn("1")&&(t.Com=Math.max(t.Com,Math.min(5,t.Com+3)));ringOn("2")&&(t.Int=Math.max(t.Int,Math.min(5,t.Int+3)))}}catch(z){}
 return t;
}}

/* ---------------------------------------------------------------- rolls */
const post=()=>condPen().lines.concat(misc0());
const blockedBy=()=>condPen().blocked;
const TEST_BLOCK="Under a test or crisis of faith: Faith Points cannot be spent and holy powers do not work (RoP:D pp. 59–60).";
function infChart(t,steps){let v=0;for(const[ef,b]of steps)t>=ef&&(v=b);return v}
const HOLY_CHART=[[9,1],[15,2],[24,3]];
const INF_CHART=[[9,1],[12,2],[15,3],[18,4],[21,5],[24,6]];

function miracleCheck(id){
 const x=XP(),f=faith(),tf=tfScore(),c=charEff(st),hm=holyMethodBest(),useM=!!(x.mirMethod&&hm);
 if(f.test)return mkCheck({id,title:"Pray for a miracle",blocked:TEST_BLOCK});
 if(tfPts()<1)return mkCheck({id,title:"Pray for a miracle",blocked:"Praying for a miracle costs a Faith Point; without one, invoke God’s aid instead (RoP:D p. 60)."});
 const extra=clamp(N(x.mirExtra),0,tf>0?Math.max(0,Math.min(tf,tfPts()-1)):0);
 const lvl=N(x.mirLevel)+N(x.mirTime)+N(x.mirNeed),aura=auraLvl("Divine"),bb=baseBotch();
 const score=[];tf&&score.push({l:"True Faith Score",v:tf,ref:"RoP:D p. 60"});
 score.push(useM?{l:`${hm[0]} (Holy Method, in place of Concentration)`,v:hm[1],ref:"RoP:D p. 60"}:{l:"Concentration",v:ablScore(st,"Concentration"),ref:"RoP:D p. 60"});
 aura&&score.push({l:`Divine aura ${aura}`,v:aura,ref:"RoP:D p. 60"});
 extra&&score.push({l:`${extra} more Faith Point${extra>1?"s":""} spent (+3 each)`,v:3*extra,ref:"RoP:D p. 60"});
 N(x.mirCer)&&score.push({l:"Others praying with you (Ceremony): their True Faith + Concentration",v:N(x.mirCer),ref:"RoP:D p. 60"});
 const spent=1+extra;
 return mkCheck({id,title:"Pray for a miracle",sub:`level ${lvl}`,formula:"stress die + True Faith + Concentration + aura",score,post:post(),blocked:blockedBy(),die:"stress",nb:bb.nb,nbLines:bb.lines,ef:lvl,efLabel:`Miracle level (base ${N(x.mirLevel)} ${sgnN(N(x.mirTime))} timeliness ${sgnN(N(x.mirNeed))} need)`,conf:!0,kind:"generic",
  notes:[{l:"Rule",t:"Choose an effect from the holy powers (or the Hermetic guidelines), adjust its level for timeliness and need, spend a Faith Point and roll against it. A miracle has infinite Penetration and cannot be resisted, undone or targeted by any power (RoP:D pp. 60–61)."},
   {l:"Storyguide",t:"Miracles are negotiated with the storyguide before the roll, and God’s hand cannot be forced; on a failure the storyguide may grant lesser aid (RoP:D p. 61)."},
   {l:"Aura",t:"The book adds “Aura”; here the Divine aura is added and other auras are not (our reading)."},
   {l:"Warping",t:"Witnesses of a miracle of level 30 or more gain a Warping Point, but not those it was meant to help (RoP:D p. 62)."}],
  botchNote:"Botch: every Faith Point is lost for a week per zero on the botch dice (a character without Faith Points has no prayer answered for that many months), and a tragedy of hubris may follow (RoP:D p. 61).",
  outcome:t=>{const a=[{l:`Spend ${spent} Faith Point${spent>1?"s":""}`,act:"f49faith",n:-spent}];return t>=lvl?{cls:"ok",head:"The miracle is granted",text:`Total ${fmtN(t)} reaches level ${lvl}. Each miracle prayed for counts as a noteworthy action for every Faith Point the character has, if witnessed (RoP:D p. 60).`,actions:a}:{cls:"fail",head:"The prayer is not answered as asked",text:`Total ${fmtN(t)} is below level ${lvl}; the storyguide may send lesser aid (RoP:D p. 61).`,actions:a}}});
}
function aidCheck(id){
 const x=XP(),c=charEff(st),bb=baseBotch(),f=faith(),conf=confidence(st);
 const canC=conf&&conf.score>0&&P().conf>0,canF=tfPts()>0&&!f.test;
 if(!canC&&!canF)return mkCheck({id,title:"Invoke God’s aid",blocked:"It costs a Confidence Point, or a Faith Point for a character with True Faith (RoP:D p. 41)."});
 const score=[{l:"Communication",v:c.Com,ref:"RoP:D p. 41"},{l:"Dominion Lore",v:dominionLore(),ref:"RoP:D p. 41"}];
 N(x.aidCer)&&score.push({l:"Group prayer: Ceremony, and each participant’s Communication + Dominion Lore",v:N(x.aidCer),ref:"RoP:D p. 42"});
 const pay=[];canC&&pay.push({l:"Spend a Confidence Point",act:"f49conf",n:-1});canF&&pay.push({l:"Spend a Faith Point",act:"f49faith",n:-1});
 return mkCheck({id,title:"Invoke God’s aid",formula:"stress die + Communication + Dominion Lore",score,post:post(),blocked:blockedBy(),die:"stress",nb:bb.nb,nbLines:bb.lines,minBotch:3,ef:null,efMode:"none",conf:!1,kind:"generic",
  notes:[{l:"Rule",t:"Utter a short prayer and spend a Confidence Point (or a Faith Point, with True Faith). 9+ gives +1, 15+ gives +2, 24+ gives +3 to every roll in the scene that clearly furthers the objective; the bonus ends at the first failed roll or the scene’s end (RoP:D p. 41)."},{l:"War",t:"In combat, only against infidels, heretics and non-Divine supernatural foes; a Trained Group adds the highest Divine Aid bonus among its members (RoP:D p. 42)."}],
  botchNote:"A zero brings at least three botch dice, and a botch is a sign of divine displeasure, lifted by penance (RoP:D p. 41).",
  outcome:t=>{const b=infChart(t,HOLY_CHART);return b?{cls:"ok",head:`God’s aid: +${b}`,text:`Total ${fmtN(t)}. Add +${b} to this scene’s rolls that further the objective, until one fails (RoP:D p. 41).`,actions:pay.concat([{l:`Apply +${b} to this scene’s rolls`,act:"f49aid",n:b}])}:{cls:"fail",head:"No aid this time",text:`Total ${fmtN(t)} is below 9.`,actions:pay}}});
}
function temperCheck(id){
 const x=XP(),c=charEff(st),bb=baseBotch(),name=x.tmpPick,mode=x.tmpRollMode,cer="ceremonial"===mode?ablScore(st,"Ceremony"):0;
 if(faith().test&&tfScore()>0)return mkCheck({id,title:"Temper the aura",blocked:TEST_BLOCK});
 const score=[{l:"Presence",v:c.Pre,ref:"RoP:D p. 38"},{l:"Leadership",v:ablScore(st,"Leadership"),ref:"RoP:D p. 38"}];
 cer&&score.push({l:"Ceremony (ceremonial influence)",v:cer,ref:"RoP:D p. 38"});
 has(st,"Uncertain Faith")&&score.push({l:"Uncertain Faith",v:-3,ref:"Grogs p. 84"});
 const T=TEMPERS.find(t=>t[0]===name)||TEMPERS[2];
 return mkCheck({id,title:`Temper the aura: ${T[0]}`,sub:`${"ceremonial"===mode?"Ceremonial (a short ceremony; fades a point a day)":"Personal (a season of example; fades a point a season)"}`,formula:"stress die + Presence + Leadership",score,post:post(),blocked:blockedBy(),die:"stress",nb:bb.nb,nbLines:bb.lines,ef:null,efMode:"none",conf:"ceremonial"!==mode,kind:"generic",
  notes:[{l:"Rule",t:`A holy character with spiritual authority over a Dominion aura gives it a virtuous Temper Trait: +value to rolls that serve the ${T[0]} temper, –value to rolls that oppose it (${T[1]}). One temper at a time per character; a new one replaces the old. 9+ gives +1, 15+ +2, 24+ +3 (RoP:D pp. 38–40).`},{l:"Ceremonial",t:"Ceremonial influence spends a Confidence or Faith Point, which does not add 3 (RoP:D p. 38)."}],
  botchNote:"A botch may bring Warping, Fatigue or a bad reputation among the people (RoP:D p. 38).",
  outcome:t=>{const v=infChart(t,HOLY_CHART);return v?{cls:"ok",head:`The aura is tempered: ${T[0]} +${v}`,text:`Total ${fmtN(t)} (RoP:D p. 38).`,actions:[{l:`Set the aura’s temper: ${T[0]} +${v}`,act:"f49tmp",name:T[0],n:v,mode}]}:{cls:"fail",head:"The aura is unchanged",text:`Total ${fmtN(t)} is below 9.`}}});
}
function tarnishCheck(id){
 const x=XP(),c=charEff(st),bb=baseBotch(),sin=x.tarPick,mode=x.tarRollMode;
 const score=[{l:"Presence",v:c.Pre,ref:"RoP:I p. 24"},{l:"Leadership",v:ablScore(st,"Leadership"),ref:"RoP:I p. 24"}];
 return mkCheck({id,title:`Tarnish the aura: ${sin}`,sub:"ceremonial"===mode?"Ceremonial (fades a point each morning)":"Personal (a season of indulgence; fades a point a season)",formula:"stress die + Presence + Leadership",score,post:post(),blocked:blockedBy()||("Infernal"!==P().aura.realm?"Only an Infernal aura can be tarnished; set the aura to Infernal (RoP:I p. 24).":""),die:"stress",nb:bb.nb,nbLines:bb.lines,ef:null,efMode:"none",conf:"ceremonial"!==mode,kind:"generic",
  notes:[{l:"Rule",t:"Gives the Infernal aura a sinful Tarnish Trait. It is added to similar Personality Traits and subtracted from opposing ones; anyone without either simply gains it while inside. Only the strongest tarnish is active. 9+ gives 1, 12+ 2, 15+ 3, 18+ 4, 21+ 5, 24+ 6 (RoP:I pp. 23–24)."},{l:"Ceremony",t:"A ceremonial tarnish spends a Confidence Point; anyone with Infernal Lore 1 knows the ceremony (RoP:I p. 23)."}],
  botchNote:"A botch usually brings Warping Points or Fatigue (RoP:I p. 24).",
  outcome:t=>{const v=infChart(t,INF_CHART);return v?{cls:"ok",head:`The aura is tarnished: ${sin} ${v}`,text:`Total ${fmtN(t)} (RoP:I p. 23).`,actions:[{l:`Set the aura’s tarnish: ${sin} ${v}`,act:"f49tar",name:sin,n:v,mode}]}:{cls:"fail",head:"The aura is unchanged",text:`Total ${fmtN(t)} is below 9.`}}});
}
/* Ars Notoria */
const RINGS={1:["Spring or Autumn","100 XP in Philosophiae; Communication +3 (to a maximum of +5)"],2:["Winter","100 XP in Theology; Intelligence +3 (to a maximum of +5)"],3:["any season","100 XP in Medicine; Greater Purifying Touch against one chosen disease"],4:["season not given","Patron Angel: a Guardian Angel who teaches Artes Liberales, Civil and Canon Law, Medicine, Philosophiae and Theology at 7 (Teach 7, Com +3)"],5:["Summer","Sense a being’s realm: Perception + Ars Notoria vs 6 + its Magic Resistance ÷ 5"],6:["Spring","Holy divination: Perception + Ars Notoria against the question’s Ease Factor"],7:["season not given","All simple dice become stress dice that cannot botch"]};
function notoSuper(){
 const divine=new Set(Object.keys(HOLY_METHODS).concat(HOLY_POWERS,["Sense Holiness and Unholiness","Ceremony","Ars Notoria"]));
 return st.abil.filter(a=>a.n&&"Supernatural"===abilCat(a)&&!divine.has(a.n)).map(a=>[a.n,ablCalc(st,a).total]).filter(a=>a[1]>0);
}
function notoMods(){
 const x=XP(),L=[],add=(c,l,v,r)=>c&&v&&L.push({l,v,ref:r||"RoP:D p. 98"});
 add(N(x.noFast),`Fasting ${N(x.noFast)} season${N(x.noFast)>1?"s":""}`,N(x.noFast));
 add(x.noChaste,"Chastity",1);
 add(N(x.noHonMi),`Honorable Minor Personality Flaw ×${N(x.noHonMi)}`,N(x.noHonMi));
 add(N(x.noHonMa),`Honorable Major Personality Flaw ×${N(x.noHonMa)}`,3*N(x.noHonMa));
 add(N(x.noDisMi),`Dishonorable Minor Personality Flaw ×${N(x.noDisMi)}`,-N(x.noDisMi));
 add(N(x.noDisMa),`Dishonorable Major Virtue or Flaw ×${N(x.noDisMa)}`,-3*N(x.noDisMa));
 add(N(x.noVenial),`Venial sin ×${N(x.noVenial)}`,-3*N(x.noVenial));
 add(N(x.noMortal),`Mortal sin ×${N(x.noMortal)}`,-9*N(x.noMortal));
 for(const[n,v]of notoSuper())L.push({l:`Supernatural Ability: ${n}`,v:-v,ref:"RoP:D p. 98"});
 tfScore()&&L.push({l:"True Faith",v:tfScore(),ref:"RoP:D p. 98"});
 add(N(x.noVar),"Storyguide’s variable modifier (–3 to +3)",clamp(N(x.noVar),-3,3));
 return L;
}
function notoCheck(id){
 const x=XP(),c=charEff(st),bb=baseBotch(),an=ablScore(st,"Ars Notoria"),nt=st.notoria;
 const sub=id.split(":")[2]||"recite",T="Ars Notoria";
 if(!an&&"find"!==sub)return mkCheck({id,title:T,blocked:"Needs the Ars Notoria Ability (RoP:D p. 98)."});
 if("find"===sub)return mkCheck({id,title:"Search a season for the Book of Solomon",formula:"stress die + Intelligence + Dominion Lore vs 21",score:[{l:"Intelligence",v:c.Int,ref:"RoP:D p. 97"},{l:"Dominion Lore",v:dominionLore(),ref:"RoP:D p. 97"}],post:post(),die:"stress",nb:bb.nb,nbLines:bb.lines,ef:21,efLabel:"Find a copy",conf:!1,kind:"generic",notes:[{l:"Reading",t:"Studying it needs Latin, Greek, Hebrew, Chaldean and Artes Liberales at 4; it is a tractatus of Quality 20, and the Gifted learn the Ability from it as a Supernatural Ability (RoP:D pp. 97–98)."}],botchNote:"A botch leads far away to a different book, perhaps a heretical text or a demonic ruse (RoP:D p. 97)."});
 if("fast"===sub){const ef=5+Math.max(1,N(x.noFastSeq));return mkCheck({id,title:"Keep a season’s fast",formula:"stress die + Stamina",score:[{l:"Stamina",v:c.Sta,ref:"RoP:D p. 98"}],post:post(),die:"stress",nb:bb.nb,nbLines:bb.lines,ef,efLabel:`Season ${Math.max(1,N(x.noFastSeq))} of the fast`,conf:!0,kind:"generic",notes:[{l:"Rule",t:"Bread and water for the season: Ease Factor 6, +1 for each consecutive season. Failure ends the fast (RoP:D p. 98)."}],botchNote:"A botch permanently damages the constitution: enough Aging Points to lower Stamina by one (RoP:D p. 98)."})}
 if("sense"===sub){const mr=N(x.noMR),ef=6+Math.floor(mr/5);return mkCheck({id,title:"Fifth ring: sense a being’s realm",formula:"stress die + Perception + Ars Notoria",score:[{l:"Perception",v:c.Per,ref:"RoP:D p. 100"},{l:"Ars Notoria",v:an,ref:"RoP:D p. 100"}],post:post(),blocked:ringOn("5")?"":"The fifth ring is not active.",die:"stress",nb:bb.nb,nbLines:bb.lines,ef,efLabel:`6 + Magic Resistance ${mr} ÷ 5`,conf:!0,kind:"generic",notes:[{l:"Rule",t:"No Penetration is needed. Five or more above the target’s Magic Resistance also reveals its weakest power, and another for each further 5; demons cannot hide their nature (RoP:D p. 100)."}],botchNote:"A botch gives false information about the creature (RoP:D p. 100).",outcome:t=>t>=ef?{cls:"ok",head:"The realm is known",text:t>=mr+5?`Also learn ${1+Math.floor((t-mr-5)/5)} of its powers, weakest first.`:"Its realm is revealed."}:{cls:"fail",head:"Nothing is learned",text:`Below ${ef}.`}})}
 if("div"===sub){const ef=N(x.noDivEF)||9;return mkCheck({id,title:"Sixth ring: holy divination",formula:"stress die + Perception + Ars Notoria",score:[{l:"Perception",v:c.Per,ref:"RoP:D p. 100"},{l:"Ars Notoria",v:an,ref:"RoP:D p. 100"}],post:post(),blocked:ringOn("6")?"":"The sixth ring is not active.",die:"stress",nb:bb.nb,nbLines:bb.lines,ef,efLabel:"Question",efKey:"x.noDivEF",efChips:[[9,"Weather; short-term result of your action"],[12,"Long-term result of your action; auspicious ritual time; another’s short-term"],[15,"Another’s long-term"],[18,"A person’s possible future"]],conf:!0,kind:"generic",notes:[{l:"Rule",t:"A day of fasting and meditation first. An auspicious time for a ritual or formulaic casting adds your Ars Notoria score to that casting (RoP:D p. 100)."}]})}
 const ring=clamp(N(x.noRing),1,7),first=ring>nt.learned,seasons=Math.max(1,N(x.noSeasons));
 const ef=(first?6:3)+3*ring+seasons;
 const block=first&&ring!==nt.learned+1?`Rings are learned in order: recite ring ${nt.learned+1} first (RoP:D p. 99).`:"";
 const score=[{l:"Intelligence",v:c.Int,ref:"RoP:D p. 98"},{l:"Ars Notoria",v:an,ref:"RoP:D p. 98"}].concat(notoMods());
 return mkCheck({id,title:`Recite the ${["","first","second","third","fourth","fifth","sixth","seventh"][ring]} ring of Solomon`,sub:`${first?"First recitation (a season)":`Known ring (${Math.max(1,10-an)} day${Math.max(1,10-an)>1?"s":""})`} · ${RINGS[ring][0]} · ${seasons} season${seasons>1?"s":""}`,formula:"stress die + Intelligence + Ars Notoria + modifiers",score,post:post(),blocked:block||blockedBy(),die:"stress",nb:bb.nb,nbLines:bb.lines,ef,efLabel:`${first?6:3} + 3 × ring ${ring} + ${seasons} season${seasons>1?"s":""}`,conf:!1,kind:"generic",
  notes:[{l:"Ring",t:RINGS[ring][1]+"."},{l:"Rule",t:"Benefits do not stack: reciting an active ring again only lengthens it. While any ring is active you gain no Warping from a Divine aura (RoP:D pp. 99–100)."}],
  botchNote:"A botch marks you unworthy: lost Ars Notoria experience, a Minor Flaw until atoned for, lost benefits, or a time without orations, as the storyguide decides (RoP:D p. 98).",
  outcome:t=>t>=ef?{cls:"ok",head:`Ring ${ring} recited`,text:`Total ${fmtN(t)} meets ${ef}. Its benefit lasts ${seasons} season${seasons>1?"s":""}.`,actions:[{l:`Activate ring ${ring} for ${seasons} season${seasons>1?"s":""}`,act:"f49ring",n:ring,s:seasons}]}:{cls:"fail",head:"The orations fail",text:`Total ${fmtN(t)} is below ${ef}; try again next season.`}});
}
{const G=getCheck;getCheck=function(id){
 let c=null;
 if(id&&id.startsWith("r49:")){const k=id.slice(4);
  c="miracle"===k?miracleCheck(id):"aid"===k?aidCheck(id):"temper"===k?temperCheck(id):"tarnish"===k?tarnishCheck(id):k.startsWith("noto")?notoCheck(id):null;
 }else c=G.apply(this,arguments);
 if(!c||c.blocked)return c;
 try{
  const x=XP(),a=P().aura,tg=c.toggles=(c.toggles||[]).slice();
  N(x.aidOn)>0&&"r49:aid"!==id&&tg.push({key:"t49:aid",l:`God’s aid +${N(x.aidOn)}`,v:N(x.aidOn),cond:"the roll clearly furthers the objective",ref:"RoP:D p. 41"});
  if(x.tmpName&&N(x.tmpV)>0&&a&&"Divine"===a.realm){const T=TEMPERS.find(t=>t[0]===x.tmpName);T&&tg.push({key:"t49:tmp+",l:`${T[0]} temper +${N(x.tmpV)}`,v:N(x.tmpV),cond:`the action serves it (${T[2]})`,ref:"RoP:D p. 38"},{key:"t49:tmp-",l:`${T[0]} temper –${N(x.tmpV)}`,v:-N(x.tmpV),cond:`the action runs against it (${T[1]}: ${T[3]})`,ref:"RoP:D p. 38"})}
  if(x.tarName&&N(x.tarV)>0&&a&&"Infernal"===a.realm&&"trait"===id&&tfScore()<1)tg.push({key:"t49:tar+",l:`Tarnish: ${x.tarName} +${N(x.tarV)}`,v:N(x.tarV),cond:"a similar trait",ref:"RoP:I p. 24"},{key:"t49:tar-",l:`Tarnish: ${x.tarName} –${N(x.tarV)}`,v:-N(x.tarV),cond:"a trait that opposes it",ref:"RoP:I p. 24"});
  if(inPlay()&&ringOn("7")&&c.die!=="none"){"simple"===c.die&&(c.die="stress");c.nb=0;c.nbLines=[{l:"Seventh ring of Solomon: no botch",v:0,ref:"RoP:D p. 100"}];c.minBotch=null;c.notes=(c.notes||[]).concat([{l:"Seventh ring",t:"Simple dice become stress dice, and stress dice cannot botch (RoP:D p. 100)."}])}
 }catch(z){console.error(z)}
 return c;
}}

/* outcome actions */
{const AA=applyAction;applyAction=function(d){
 const a=d&&d.act;if(!a||!/^f49/.test(a))return AA.apply(this,arguments);
 const x=XP(),f=faith();
 if("f49faith"===a)f.pts=Math.max(0,f.pts+N(d.n));
 else if("f49conf"===a)P().conf=Math.max(0,P().conf+N(d.n));
 else if("f49aid"===a)x.aidOn=N(d.n),P().toggles["t49:aid"]=!0;
 else if("f49tmp"===a)x.tmpName=d.name,x.tmpV=N(d.n),x.tmpMode=d.mode;
 else if("f49tar"===a)x.tarName=d.name,x.tarV=N(d.n),x.tarMode=d.mode;
 else if("f49ring"===a){const r=String(N(d.n)),s=N(d.s);st.notoria.learned=Math.max(st.notoria.learned,N(d.n));st.notoria.active[r]={seasons:Math.max(s,st.notoria.active[r]?st.notoria.active[r].seasons:0)}}
 persist();
}}

/* Spending Faith Points like Confidence after a roll (RoP:D p. 57, DE p. 419) */
{const RH=resultHtml;resultHtml=function(e){
 let h=RH.apply(this,arguments);
 try{
  const t=P(),l=t.last;if(!h||!l||l.id!==e.id)return h;
  const tg=t.toggles||{},x=XP(),s=judge(e,l);
  if(N(x.aidOn)>0&&tg["t49:aid"]&&("fail"===s.cls||"botch"===s.cls)&&!l.f49aidEnd){l.f49aidEnd=1;x.aidOn=0;tg["t49:aid"]=!1}
  l.f49aidEnd&&(h=h.replace('<div class="ractions">','<p class="rtext">God’s aid ends: a roll failed (RoP:D p. 41).</p><div class="ractions">'));
  l.faith&&(h=h.replace(/(<div class="rtot">[\s\S]*?)(<\/div>)/,`$1<small>incl. Faith +${N(l.faithV)}</small>$2`));
  const f=faith(),ok=e.conf&&"none"!==e.die&&!l.botch&&tfPts()>0&&!f.test&&N(l.faith)<spendCap()&&"r49:miracle"!==e.id;
  ok&&(h=h.replace('<div class="ractions">',`<div class="ractions"><button type="button" class="btn small gold" data-f49="spend-faith">Spend a Faith Point: +${faithBonus()} (${tfPts()} left)</button>`));
 }catch(z){console.error(z)}
 return h;
}}

/* ---------------------------------------------------------------- Realms tab panels */
const btn=(k,l,extra)=>`<button type="button" class="btn small" data-f49="${k}"${extra||""}>${l}</button>`;
function rowFor(id){const c=getCheck(id);return c?row(id,c.title,c.sub||c.formula,c.blocked?"—":scoreText(c),c):""}
function faithPanel(){
 const f=faith(),tf=tfScore(),pts=tfPts(),hm=holyMethodBest();
 let light=[];tf>=2&&light.push("<li><b>Devotion</b> (True Faith 2): the Premonitions Virtue, and a Faith Point dispels any magical or infernal illusion or faerie glamour, whatever its level.</li>");
 tf>=3&&light.push(`<li><b>Hope</b> (True Faith 3): Faith Points spent like Confidence add +6; Magic Resistance doubled against Mentem.</li>`);
 tf>=5&&light.push(`<li><b>Charity</b> (True Faith 5): a soft glow in the dark, and an Empyreal aura of ${tf-4} to Voice range, which the character may temper.</li>`);
 return`<div class="pane-h"><h3>True Faith</h3><p class="note">True Faith Score ${tf}: Magic Resistance ${faithMRAll()} (score × 10; it does not stack with other Magic Resistance, DE p. 55). Spend up to ${spendCap()} Faith Point${spendCap()>1?"s":""} on a roll like Confidence (+${faithBonus()} each), only when acting in accordance with God’s will. Each dawn you regain Faith Points up to your score (DE p. 419; RoP:D p. 57).</p></div>
 <div class="card"><div class="fields">
  <label class="f"><span>Faith Points</span><span class="mini-step"><button type="button" data-f49="fp-" aria-label="Spend a Faith Point"${pts?"":" disabled"}>−</button><output>${pts}</output><button type="button" data-f49="fp+" aria-label="Gain a Faith Point">+</button></span></label>
  <label class="f"><span>True Faith Score</span><input type="number" min="0" max="10" data-f49in="score" value="${H(null==f.score?"":f.score)}" placeholder="${count(st,"True Faith")} (from Virtues)"></label>
  <label class="chk"><input type="checkbox" data-f49in="test"${f.test?" checked":""}>Under a test or crisis of faith</label>
  ${btn("dawn",`A new dawn: regain to ${tf}`,tf&&pts<tf?"":" disabled")}${tf>=2?btn("dispel","Dispel an illusion or glamour (1 Faith Point)",pts&&!f.test?"":" disabled"):""}</div>
  ${light.length?`<ul class="rnotes">${light.join("")}</ul>`:""}
  <p class="note">Each additional point of True Faith Score is a Major Virtue; Faith Points also come from sacraments, pilgrimage and holy deeds (RoP:D p. 57). Holy powers and Divine Virtues spare you Warping from strong Divine auras (RoP:D p. 62).</p></div>
 <div class="pane-h"><h3>Pray for a miracle</h3><p class="note">Spend a Faith Point and roll True Faith + Concentration + aura + stress die against the miracle’s level (RoP:D p. 60).</p></div>
 <div class="card"><div class="fields">
  <label class="f"><span>Base level (holy power or Hermetic guideline)</span>${numIn("x.mirLevel",' min="0" max="200"')}</label>
  <label class="f"><span>Timeliness</span>${sel2("x.mirTime",TIME_MOD)}</label><label class="f"><span>Need</span>${sel2("x.mirNeed",NEED_MOD)}</label>
  ${tf>0?`<label class="f"><span>More Faith Points spent (+3 each)</span>${numIn("x.mirExtra",` min="0" max="${tf}"`)}</label>`:""}
  ${hm?chk("x.mirMethod",`Use ${hm[0]} ${hm[1]} in place of Concentration`):""}
  ${ablScore(st,"Ceremony")?`<label class="f"><span>Group (Ceremony): others’ True Faith + Concentration</span>${numIn("x.mirCer",' min="0"')}</label>`:""}</div>
  <div class="acts">${rowFor("r49:miracle")}</div></div>`;
}
function aidPanel(){
 const x=XP();
 return`<div class="pane-h"><h3>Invoke God’s aid</h3><p class="note">Anyone who can spend a Confidence Point (or a Faith Point, with True Faith) may pray for aid in an endeavour; the bonus lasts for the scene until a roll fails (RoP:D p. 41).</p></div>
 <div class="card"><div class="fields"><label class="f"><span>Leading a group in prayer: Ceremony + each participant’s Communication + Dominion Lore</span>${numIn("x.aidCer",' min="0"')}</label>
 ${N(x.aidOn)>0?`<span class="note">Active: +${N(x.aidOn)} to rolls that further the objective (tick it on the roll).</span>${btn("aid-end","End God’s aid")}`:""}</div>
 <div class="acts">${rowFor("r49:aid")}</div></div>`;
}
function temperTable(){return`<details class="tog"><summary>The seven tempers (RoP:D pp. 39–40)</summary><table class="lt"><thead><tr><th>Temper</th><th>Opposes</th><th>Served by</th><th>Opposed by</th></tr></thead><tbody>${TEMPERS.map(t=>`<tr><td>${t[0]}</td><td>${t[1]}</td><td>${t[2]}</td><td>${t[3]}</td></tr>`).join("")}</tbody></table></details>`}
function auraState(){
 const x=XP(),a=P().aura,L=[];
 x.tmpName&&N(x.tmpV)>0&&L.push(`<span class="note">Temper: <b>${H(x.tmpName)} +${N(x.tmpV)}</b> (${H(x.tmpMode)}${"Divine"!==a.realm?"; applies only while the aura is Divine":""})</span>${btn("tmp-fade",`A ${"personal"===x.tmpMode?"season":"day"} passes (–1)`)}${btn("tmp-clear","Clear")}`);
 x.tarName&&N(x.tarV)>0&&L.push(`<span class="note">Tarnish: <b>${H(x.tarName)} ${N(x.tarV)}</b> (${H(x.tarMode)}${"Infernal"!==a.realm?"; applies only while the aura is Infernal":""}${tfScore()>0?"; True Faith makes you immune, RoP:I p. 13":""})</span>${btn("tar-fade",`A ${"personal"===x.tarMode?"season":"morning"} passes (–1)`)}${btn("tar-clear","Clear")}`);
 return L.join("");
}
function temperPanel(){
 const x=XP(),can=isHoly()||tfScore()>=5||x.spAuth,tar=ablScore(st,"Infernal Lore")>0;
 let s=`<div class="pane-h"><h3>Tempers and tarnishes</h3><p class="note">A tempered Dominion aura adds its Temper Trait to rolls that serve the temper and subtracts it from rolls that oppose it (RoP:D p. 38). A tarnished Infernal aura adds its sin to similar Personality Traits and subtracts it from opposing ones (RoP:I p. 24). Set an aura someone else has tempered or tarnished under Aura modifiers.</p></div><div class="card">`;
 s+=`<div class="fields">${chk("x.spAuth","I have spiritual authority here (parish, see, household, pupils)")}</div>`;
 can&&(s+=`<div class="fields"><label class="f"><span>Temper</span>${sel2("x.tmpPick",TEMPERS.map(t=>[t[0],`${t[0]} (against ${t[1]})`]))}</label><label class="f"><span>Influence</span>${sel2("x.tmpRollMode",[["ceremonial","Ceremonial (a ceremony; a point fades each day)"],["personal","Personal (a season; a point fades each season)"]])}</label></div><div class="acts">${rowFor("r49:temper")}</div>${temperTable()}`);
 tar&&(s+=`<div class="fields"><label class="f"><span>Tarnish with</span>${sel2("x.tarPick",SINS.map(t=>[t[0],`${t[0]} (against ${t[1]})`]))}</label><label class="f"><span>Influence</span>${sel2("x.tarRollMode",[["ceremonial","Ceremonial (fades each morning)"],["personal","Personal (fades each season)"]])}</label></div><div class="acts">${rowFor("r49:tarnish")}</div>`);
 s+=`<div class="fields">${auraState()}</div></div>`;
 return s;
}
function notoriaPanel(){
 const nt=st.notoria,an=ablScore(st,"Ars Notoria");
 const ringRows=[1,2,3,4,5,6,7].map(k=>{const a=nt.active[k],learned=k<=nt.learned;return`<tr><td>${k}</td><td>${RINGS[k][0]}</td><td>${RINGS[k][1]}</td><td>${learned?"learned":"—"}</td><td>${a?`active, ${a.seasons} season${a.seasons===1?"":"s"} ${btn("ring-end","End",` data-k="${k}"`)}`:""}</td></tr>`}).join("");
 const sum=notoMods().reduce((s,l)=>s+l.v,0),rec=charEff(st).Int+an+sum;
 return`<div class="pane-h"><h3>Ars Notoria</h3><p class="note">Recitation total = Intelligence + Ars Notoria + modifiers + stress die. First recitation: Ease Factor 6 + 3 × ring + 1 per season of duration; a known ring: 3 + 3 × ring + 1 per season. Rings are first learned in order (RoP:D pp. 98–99).</p></div>
 <div class="card"><p class="note">Ars Notoria ${an}; recitation score ${rec} (modifiers ${sgnN(sum)}). Your Ars Notoria score cuts the Divine aura penalty to other magic by 3 a point (RoP:D p. 100).</p>
 <div class="fields"><label class="f"><span>Ring</span>${sel2("x.noRing",[1,2,3,4,5,6,7].map(k=>[k,`Ring ${k}${k<=nt.learned?" (known)":k===nt.learned+1?" (next)":""}`]))}</label>
  <label class="f"><span>Seasons of benefit</span>${numIn("x.noSeasons",' min="1" max="40"')}</label>
  <label class="f"><span>Seasons fasting</span>${numIn("x.noFast",' min="0"')}</label>${chk("x.noChaste","Chaste")}
  <label class="f"><span>Honorable Personality Flaws: Minor / Major</span><span class="tri">${numIn("x.noHonMi",' min="0"')}${numIn("x.noHonMa",' min="0"')}</span></label>
  <label class="f"><span>Dishonorable: Minor Flaws / Major Virtues or Flaws</span><span class="tri">${numIn("x.noDisMi",' min="0"')}${numIn("x.noDisMa",' min="0"')}</span></label>
  <label class="f"><span>Sins last season: venial / mortal</span><span class="tri">${numIn("x.noVenial",' min="0"')}${numIn("x.noMortal",' min="0"')}</span></label>
  <label class="f"><span>Storyguide modifier (–3 to +3)</span>${numIn("x.noVar",' min="-3" max="3"')}</label>
  <label class="f"><span>Learned rings</span><input type="number" min="0" max="7" data-f49in="learned" value="${nt.learned}"></label></div>
 <div class="acts">${rowFor("r49:noto")}${rowFor("r49:noto:fast")}${rowFor("r49:noto:find")}</div>
 ${nt.active[5]||nt.active[6]?`<div class="fields">${nt.active[5]?`<label class="f"><span>Target’s Magic Resistance (fifth ring)</span>${numIn("x.noMR",' min="0"')}</label>`:""}</div><div class="acts">${nt.active[5]?rowFor("r49:noto:sense"):""}${nt.active[6]?rowFor("r49:noto:div"):""}</div>`:""}
 <table class="lt"><thead><tr><th>Ring</th><th>Season</th><th>Benefit</th><th>Known</th><th>Active</th></tr></thead><tbody>${ringRows}</tbody></table>
 ${Object.keys(nt.active).length?`<div class="fields">${btn("ring-season","A season passes for every active ring")}${nt.active[3]?`<label class="f"><span>Disease cured by the third ring</span><input type="text" data-f49in="disease" value="${H(nt.disease)}"></label>`:""}</div><p class="note">While a ring is active its experience and Characteristics count in Play; the Build tab shows the permanent sheet (RoP:D p. 99).</p>`:""}</div>`;
}
{const T=tabRealms;tabRealms=function(){
 let base=T.apply(this,arguments);
 try{
  let add="";(tfScore()>0||tfPts()>0)&&(add+=faithPanel());
  add+=aidPanel();
  add+=temperPanel();
  hasNotoria()&&(add+=notoriaPanel());
  /^<p class="note">No Realms of Power abilities\.<\/p>$/.test(base)&&(base="");
  return add+base;
 }catch(z){console.error(z);return base}
}}

/* Aura modifiers: set a temper or tarnish laid by someone else */
{const MA=modAura;modAura=function(){
 const h=MA.apply(this,arguments);
 try{
  const a=P().aura;
  if("Divine"===a.realm)return h+`<fieldset><legend>Temper of this Dominion aura</legend><label class="f"><span>Temper</span>${sel2("x.tmpName",[["","None"]].concat(TEMPERS.map(t=>[t[0],t[0]])))}</label><label class="f"><span>Value</span>${numIn("x.tmpV",' min="0" max="3"')}</label><label class="f"><span>Fades</span>${sel2("x.tmpMode",[["ceremonial","a point a day"],["personal","a point a season"]])}</label></fieldset>`;
  if("Infernal"===a.realm)return h+`<fieldset><legend>Tarnish of this Infernal aura</legend><label class="f"><span>Sin</span>${sel2("x.tarName",[["","None"]].concat(SINS.map(t=>[t[0],t[0]])))}</label><label class="f"><span>Value</span>${numIn("x.tarV",' min="0" max="6"')}</label><label class="f"><span>Fades</span>${sel2("x.tarMode",[["ceremonial","a point each morning"],["personal","a point a season"]])}</label></fieldset>`;
 }catch(z){console.error(z)}
 return h;
}}

/* ---------------------------------------------------------------- Play controls */
document.addEventListener("click",e=>{
 const b=e.target.closest&&e.target.closest("[data-f49]");if(!b||!inPlay())return;
 const k=b.dataset.f49,f=faith(),x=XP(),t=P();
 if("fp-"===k)f.pts=Math.max(0,f.pts-1);
 else if("fp+"===k)f.pts=Math.min(99,f.pts+1);
 else if("dawn"===k)f.pts=Math.max(f.pts,tfScore());
 else if("dispel"===k){if(f.pts>0&&!f.test){f.pts--;toast("A Faith Point spent: the illusion or glamour is dispelled (RoP:D p. 62).","ok")}}
 else if("aid-end"===k)x.aidOn=0,t.toggles&&(t.toggles["t49:aid"]=!1);
 else if("tmp-fade"===k)x.tmpV=Math.max(0,N(x.tmpV)-1),x.tmpV||(x.tmpName="");
 else if("tmp-clear"===k)x.tmpName="",x.tmpV=0;
 else if("tar-fade"===k)x.tarV=Math.max(0,N(x.tarV)-1),x.tarV||(x.tarName="");
 else if("tar-clear"===k)x.tarName="",x.tarV=0;
 else if("ring-end"===k)delete st.notoria.active[b.dataset.k];
 else if("ring-season"===k){for(const r of Object.keys(st.notoria.active)){const a=st.notoria.active[r];a.seasons=Math.max(0,a.seasons-1);a.seasons||delete st.notoria.active[r]}}
 else if("spend-faith"===k){
  const l=t.last,c=getCheck(t.sel);
  if(!c||!l||l.botch||f.pts<1||f.test||N(l.faith)>=spendCap())return;
  const v=faithBonus();f.pts--;l.faith=N(l.faith)+1;l.faithV=N(l.faithV)+v;l.total+=v;
  const j=judge(c,l);t.log&&t.log[0]&&Object.assign(t.log[0],{total:l.total,head:j.head,cls:j.cls});
 }else return;
 e.preventDefault();persist();renderPlay();
});
document.addEventListener("change",e=>{
 const i=e.target;if(!i||!inPlay()||!i.dataset)return;
 const k=i.dataset.f49in,f=faith();
 if(!k)return;
 "score"===k?f.score=""===i.value?null:clamp(N(i.value),0,10):"test"===k?f.test=!!i.checked:"disease"===k?st.notoria.disease=cut(i.value,80):"learned"===k&&(st.notoria.learned=clamp(N(i.value),0,7));
 persist();renderPlay();
});

/* ---------------------------------------------------------------- Build: Ars Notoria */
BONUS_OK["Ars Notoria"]=a=>langIsA(a,["latin","greek","hebrew","chaldean","aramaic"]);
{const B=bonusPools;bonusPools=function(e){const a=B.apply(this,arguments);try{has(e,"Ars Notoria")&&a.push(["Ars Notoria (Latin, Greek, Hebrew, Chaldean; RoP:D p. 92)",50])}catch(z){}return a}}
{const K=checks;checks=function(e){
 const a=K.apply(this,arguments);
 try{if(has(e,"Ars Notoria")){
  const sc=n=>Math.max(0,...e.abil.filter(r=>n(r)).map(r=>ablCalc(e,r).score),0);
  const need=[["Artes Liberales",r=>"Artes Liberales"===r.n],["Latin",r=>langIsA(r,["latin"])],["Greek",r=>langIsA(r,["greek"])],["Hebrew",r=>langIsA(r,["hebrew"])],["Chaldean",r=>langIsA(r,["chaldean","aramaic"])]];
  const low=need.filter(([,f])=>sc(f)<4).map(([n])=>n);
  a.push({ok:!low.length,t:low.length?`Ars Notoria: needs ${low.join(", ")} at 4 or more (RoP:D p. 92)`:"Ars Notoria: Artes Liberales, Latin, Greek, Hebrew and Chaldean at 4 or more",g:"vf"});
  "magus"!==e.type&&a.push({ok:has(e,"Magister in Artibus")||has(e,"Clerk")||has(e,"Priest"),t:"Ars Notoria at creation: a magus, or a Gifted Magister in Artibus, Clerk or Priest (RoP:D p. 92)",g:"vf"});
 }}catch(z){console.error(z)}
 return a;
}}

/* ---------------------------------------------------------------- changelog */
const C=window.CHANGELOG&&window.CHANGELOG[0];
C&&C.items.unshift(["4.9.4.0","Hedge known effects finished; True Faith, tempers and Ars Notoria",[
 "Known effects for folk witches and elementalists. Folk witches can add the published curses, Flight and the Healing and Animal Healing table from Hedge Magic (pp. 35–38); each loads its roll in Play with the power and Ease Factor set. Elementalists record effects by Technique, Form and level, with the summoning chart (pp. 23–26); the book prints no named elementalist effects. Nightwalker powers were already complete in Play.",
 "True Faith: Faith Points with a dawn refresh, Magic Resistance of score × 10 (the higher of it and other Magic Resistance applies, Definitive Edition p. 55), spending Faith Points on a roll like Confidence, and the benefits of Embodying the Light at scores 2, 3 and 5 (RoP:D pp. 57–62).",
 "Pray for a miracle: True Faith + Concentration (or a Holy Method) + Divine aura against the miracle’s level, adjusted for timeliness and need, with group prayer through Ceremony (RoP:D pp. 60–61). Invoke God’s aid for +1 to +3 on a scene’s rolls, ending at the first failure (RoP:D pp. 41–42).",
 "Tempers and tarnishes: temper a Dominion aura with one of the seven tempers (RoP:D pp. 38–40) or tarnish an Infernal aura with a sin (RoP:I pp. 23–24). The trait then appears as a bonus or penalty you can tick on the rolls it affects; set an aura someone else tempered under Aura modifiers.",
 "Ars Notoria: recitation totals with every modifier, the seven Rings of Solomon learned in order, their active benefits applied in Play (experience, Communication and Intelligence, sensing realms, divination, the seventh ring’s stress dice), the search for the book and the fast, and the Divine aura reduction for other magic (RoP:D pp. 97–100). Build checks its language requirements and gives its 50 experience points for languages.",
 "Ars Notoria is now listed as a Supernatural Ability (RoP:D p. 92); it was filed under Academic."]]);
}();
