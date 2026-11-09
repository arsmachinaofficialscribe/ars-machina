/* ================================================================
   v4.9.7.0  Sin and sanctity
   Realms of Power: The Infernal (RoP:I) pp. 17-24, 78, 94-96, 123-124
   Realms of Power: The Divine (RoP:D) pp. 41-46, 62-65, 85-91, 142-143
   ================================================================ */
const N=v=>num(v),H=v=>esc(String(v==null?"":v));
const inPlay=()=>"play"===MODE;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const cut=(v,n)=>String(v==null?"":v).slice(0,n);
const btn=(k,l,extra)=>`<button type="button" class="btn small" data-f97="${k}"${extra||""}>${l}</button>`;
const rowFor=id=>{const c=getCheck(id);return c?row(id,c.title,c.sub||c.formula,c.blocked?"—":scoreText(c),c):""};
const post=()=>condPen().lines.concat(misc0());
const blockedBy=()=>condPen().blocked;
function chart(t,steps){let v=0;for(const[ef,b]of steps)t>=ef&&(v=b);return v}
const opt=(k,d)=>window.amOpt?amOpt(k):d;
const bookOn=b=>srcOn(st,b);
const anyRoP=()=>["RoP:D","RoP:I","RoP:F","RoP:M"].some(bookOn);
const auraLvl=r=>{const a=P().aura;return a&&a.realm===r?N(a.lvl):0};
const auraAny=()=>{const a=P().aura;return a&&a.realm&&"None"!==a.realm?N(a.lvl):0};

/* ---------------------------------------------------------------- the seven sins (RoP:I p. 21) */
const SIN7=[
 ["Proud","Arrogant, Haughty, Rebellious, Suspicious, Vain","Loyal","Dedicated, Faithful, Humble, Reliable, Trusting"],
 ["Wrathful","Angry, Desperate, Spiteful, Vengeful, Violent","Calm","Cheerful, Hopeful, Optimistic, Patient, Peaceful"],
 ["Envious","Cruel, Gossipy, Gruff, Jealous, Meddlesome","Kind","Charitable, Compassionate, Forgiving, Generous, Merciful"],
 ["Slothful","Cowardly, Cynical, Indecisive, Lazy, Shy","Brave","Bold, Courageous, Determined, Ready, Zealous"],
 ["Lustful","Fanatical, Lecherous, Naïve, Overconfident, Reckless","Wise","Careful, Cautious, Chaste, Practical, Prudent"],
 ["Greedy","Gluttonous, Needy, Self-Indulgent, Sickly, Weak","Strong","Healthy, Pious, Steady, Temperate, Vigilant"],
 ["Avaricious","Ambitious, Corrupt, Cunning, Devious, Manipulative","Just","Even-handed, Fair, Honest, Honorable, Straightforward"]];
const SIN_OF={};
SIN7.forEach(([s,sl,v,vl])=>{SIN_OF[s.toLowerCase()]=[s,1];SIN_OF[v.toLowerCase()]=[s,-1];
 sl.split(", ").forEach(t=>SIN_OF[t.toLowerCase()]=[s,1]);vl.split(", ").forEach(t=>SIN_OF[t.toLowerCase()]=[s,-1])});
Object.assign(SIN_OF,{pride:["Proud",1],wrath:["Wrathful",1],envy:["Envious",1],sloth:["Slothful",1],lust:["Lustful",1],gluttony:["Greedy",1],avarice:["Avaricious",1],greed:["Avaricious",1]});
/* a Personality Flaw counts as a +3 (Minor) or +6 (Major) trait (RoP:I p. 22) */
const SIN_FLAWS={Avaricious:"Avaricious",Envious:"Envious",Greedy:"Greedy",Lecherous:"Lustful",Proud:"Proud",Wrathful:"Wrathful",Cowardly:"Slothful",Lazy:"Slothful",Vain:"Proud",Cruel:"Envious"};
const SIN_TAGS=[["","Not a vice or virtue"]].concat(SIN7.flatMap(([s,,v])=>[[s,`${s} (sin)`],[v,`${v} (opposes ${s})`]]));
function traitSin(t){
 const tag=t&&t.sin;if(tag){const k=SIN_OF[tag.toLowerCase()];return k?{sin:k[0],sign:k[1],auto:!1}:null}
 const w=String(t&&t.t||"").trim().toLowerCase().replace(/\s*[+–-]?\d+\s*$/,"");
 const k=SIN_OF[w];return k?{sin:k[0],sign:k[1],auto:!0}:null;
}
function sinTraits(){
 const out=[];
 (st.traits||[]).forEach((t,i)=>{const s=traitSin(t);if(!s||!t.t)return;out.push({i,t:t.t,v:N(t.v),sin:s.sin,sv:s.sign*N(t.v),auto:s.auto,src:"trait"})});
 st.vf.forEach(v=>{const s=SIN_FLAWS[v.n];if(!s||"F"!==v.kind)return;const big="Ma"===vfSize(v);out.push({t:v.n+" (Flaw)",v:big?6:3,sin:s,sv:big?6:3,src:"flaw"})});
 return out;
}

/* ---------------------------------------------------------------- persistent records */
function f97San(s){
 if(!s||"object"!=typeof s)return s;
 Array.isArray(s.traits)&&s.traits.forEach(t=>{if(t&&"object"==typeof t){const g=t.sin;t.sin=g&&SIN_OF[String(g).toLowerCase()]?cut(g,20):""}});
 const a=s.sin&&"object"==typeof s.sin?s.sin:{};
 s.sin={venial:clamp(N(a.venial),0,999),mortal:clamp(N(a.mortal),0,999),warpSrc:["","Infernal","Divine","Other"].includes(a.warpSrc)?a.warpSrc:""};
 const d=s.ascent&&"object"==typeof s.ascent?s.ascent:{};
 s.ascent={form:["","Gloom","Form","Unity"].includes(d.form)?d.form:"",virtue:cut(d.virtue,40),until:cut(d.until,60)};
 const g=s.golem&&"object"==typeof s.golem?s.golem:{};
 s.golem={on:!!g.on,name:cut(g.name,60),acc:clamp(N(g.acc),0,999),seasons:clamp(N(g.seasons),0,99),might:clamp(N(g.might),0,999),
  powers:(Array.isArray(g.powers)?g.powers:[]).filter(p=>p&&"object"==typeof p).slice(0,30).map(p=>({n:cut(p.n,80),lvl:clamp(N(p.lvl),0,200),acc:clamp(N(p.acc),0,999)}))};
 s.falseGift=!!s.falseGift;
 return s;
}
{const m=migrate;migrate=function(){return f97San(m.apply(this,arguments))};const b=blankState;blankState=function(){return f97San(b.apply(this,arguments))};f97San(st)}

Object.assign(XDEF,{
 inflMode:"personal",inflTrait:"",
 sinMode:"season",sinPick:"",
 vitGain:2,vitAccept:!1,
 sacr:"",
 goeHerm:!1,
 ascGain:2,ascUseMed:!1,
 stCat:"50",stName:"",stPatron:!0,stTomb:!1,stFeast:!1,stPilg:!1,stRelic:!1,stDon:0,stPeril:!1,stSinMo:0,stNoDon:!1,stRecent:!1,
 thBones:!1,thWhip:!1,thBerate:!1,thBar:!1,thPeril:!1,thUnfam:!1,
 tmp2Name:"",tmp2V:0,
 glKab:1,glCer:0,glFinal:!1,glPow:"",glPowLvl:20,
 rfp:{}
});

/* ---------------------------------------------------------------- who is what */
const realmAbil=l=>l.some(n=>st.abil.some(a=>a.n===n&&ablScore(st,n)>0));
const hasUnholy=()=>realmAbil(Object.keys(UNHOLY_METHODS).concat(UNHOLY_POWERS));
const hasGoetic=()=>realmAbil(Object.keys(GOETIC));
const INF_V=["Diabolist","Summoner","Devil Child","Demonic Blood"];
const isInfernalist=()=>hasUnholy()||hasGoetic()||INF_V.some(v=>has(st,v))||st.falseGift||infernalRep()>0;
const holyPowerAbil=()=>realmAbil(Object.keys(HOLY_METHODS).concat(HOLY_POWERS,["Holy Magic"]))||has(st,"Holy Magic");
const tfScoreX=()=>{const f=st.faith||{};return null!=f.score?N(f.score):count(st,"True Faith")};
const allReps=()=>(typeof reputations==="function"?reputations(st):[]).concat(st.reps||[]);
/* Hierarchy Score: the score of the highest Infernal Reputation (RoP:I p. 95) */
function infernalRep(){let v=0;for(const r of allReps())r&&/infernal/i.test(String(r.type||""))&&(v=Math.max(v,N(r.v)));return v}

/* ================================================================
   Rolls
   ================================================================ */
const INFL_CHART=[[9,1],[12,2],[15,3],[18,4],[21,5],[24,6]];
function influenceCheck(id){
 const x=XP(),c=charEff(st),cer="ceremonial"===x.inflMode,conf=confidence(st);
 if(cer&&ablScore(st,"Infernal Lore")<1)return mkCheck({id,title:"Infernal influence",blocked:"Ceremonial influence needs Infernal Lore 1 or more (RoP:I p. 23)."});
 if(cer&&!(P().conf>0))return mkCheck({id,title:"Infernal influence",blocked:"Ceremonial influence costs a Confidence Point (RoP:I p. 23)."});
 const score=[{l:"Presence",v:c.Pre,ref:"RoP:I p. 23"},{l:"Leadership",v:ablScore(st,"Leadership"),ref:"RoP:I p. 23"}];
 return mkCheck({id,title:"Infernal influence",sub:cer?"Ceremonial: a short invocation and a Confidence Point":"Personal: a season of example",formula:"simple die + Presence + Leadership",score,post:post(),blocked:blockedBy(),die:"simple",nb:0,ef:9,efLabel:"Trait value chart",efMode:"none",kind:"generic",conf:!0,
  notes:[{l:"Rule",t:"Those who follow your lead gain a sinful Personality Trait, or a virtuous one with a negative score, valued by the chart: 9 +1, 12 +2, 15 +3, 18 +4, 21 +5, 24 +6. Only the willing are affected: a character who resists is not. Only an Inspirational character can ceremonially influence strangers (RoP:I p. 23)."},
   {l:"Duration",t:"Traits from personal influence may linger about a year, from ceremonial influence about a week, unless the character’s actions reinforce them (RoP:I p. 23)."}],
  outcome:t=>{const v=chart(t,INFL_CHART),pay=cer?[{l:"Spend the Confidence Point",act:"f97conf",n:-1}]:[];return v?{cls:"ok",head:`Followers gain a trait at ${v>0?"+":""}${v}`,text:`Total ${fmtN(t)} (RoP:I p. 23).`,actions:pay}:{cls:"fail",head:"No trait is gained",text:`Total ${fmtN(t)} is below 9.`,actions:pay}}});
}
/* Vituperation (RoP:I p. 95): the infernalist's Twilight */
function vitCheck(id){
 const x=XP(),c=charEff(st),ws=warpingScore(st),g=N(x.vitGain),hi=infernalRep(),aura=auraAny(),conf=confidence(st),cs=conf?conf.score:0;
 const score=[{l:"Stamina",v:c.Sta,ref:"RoP:I p. 95"},{l:"Concentration",v:ablScore(st,"Concentration"),ref:"RoP:I p. 95"},{l:"Confidence Score",v:cs,ref:"RoP:I p. 95"}];
 const base=ws+g+hi+aura;
 return mkCheck({id,title:"Vituperation",formula:"Stamina + Concentration + Confidence Score + stress die",score,post:post(),die:"stress",nb:baseBotch().nb,nbLines:baseBotch().lines,ef:base,efLabel:"Infernal side",conf:!0,kind:"generic",
  opp:{label:`Warping Score ${ws} + points gained ${g} + Hierarchy ${hi} + aura ${aura} + stress die (no botch)`,base,die:"stress-nb"},
  notes:[{l:"Trigger",t:"An infernalist rolls when he gains 2 or more Warping Points at once, or fails to control the Infernal power he channels. He may accept Vituperation without rolling, to harden his will (RoP:I p. 95)."},
   {l:"Hierarchy",t:`Hierarchy Score = the highest Infernal Reputation (${hi}) (RoP:I p. 95).`},
   {l:"False Gift",t:"A character with the False Gift undergoes Vituperation instead of Twilight (RoP:I p. 124)."}],
  outcome:(t,l)=>{const lost=!l.botch&&t>=l.opp.total;if(lost)return{cls:"ok",head:"The Infernal is mastered",text:`${fmtN(t)} vs ${fmtN(l.opp.total)}: after two minutes the malign forces are controlled, with no lasting harm (RoP:I p. 95).`};
   return vitResult(ws,g,!!l.botch,`${fmtN(t)} vs ${fmtN(l.opp.total)}`)}});
}
function vitResult(ws,g,botched,txt){
 const dur=TWILIGHT_TIME[Math.max(0,Math.min(10,ws))],cs=(confidence(st)||{score:0}).score,dec=decrepScore(st),up=cs<ws||cs<dec;
 const acts=[{l:"Roll the Vituperation Aging roll",act:"load",id:"r49:vitage"}];
 botched||acts.push({l:`Gain ${g} Confidence Point${1===g?"":"s"}`,act:"f97conf",n:g});
 return{cls:botched?"botch":"fail",head:"Vituperation",text:`${txt?txt+". ":""}Torn into Hell for ${dur} (the Wizard’s Twilight time for Warping Score ${ws}). Afterwards roll for aging, adding the Warping Score. ${up?"His Confidence Score may rise by one (it is below his Warping Score or Decrepitude). ":""}${botched?"A botched avoidance roll gives no Confidence Points.":`He gains ${g} Confidence Point${1===g?"":"s"}.`} (RoP:I p. 95)`,actions:acts};
}
function vitAgeCheck(id){
 const ws=warpingScore(st),age=ageOf(st),liv=N(P().living);
 return mkCheck({id,title:"Vituperation: aging",formula:"stress die (no botch) + age ÷ 10 (rounded up) – living conditions + Warping Score",score:[{l:`Age ${age} ÷ 10, rounded up`,v:Math.ceil(age/10),ref:"RoP:I p. 95"},{l:"Living conditions (last year, if it lasted a season or less)",v:-liv,ref:"RoP:I p. 95"},{l:"Warping Score",v:ws,ref:"RoP:I p. 95"}],post:[],die:"stress-nb",nb:0,ef:null,efMode:"none",conf:!1,kind:"generic",
  notes:[{l:"Rule",t:"Longevity Rituals and other life-extending effects do not count: they do not function during the abuse. Compare the total with the aging chart as usual (RoP:I p. 95; DE p. 391)."}]});
}
const SACR=[["","No sacrifice"],["2","Effigy of the target +2"],["4","An animal +4"],["6","A black animal +6"],["8","A human +8"],["10","An innocent human +10"]];

/* Divine Ascension (RoP:D p. 63) */
function ascCheck(id){
 const x=XP(),c=charEff(st),ws=warpingScore(st),g=N(x.ascGain),tf=tfScoreX(),aura=auraAny();
 const med=x.ascUseMed&&ablScore(st,"Meditation")>0;
 const ch=opt("ascPresence",!0)?["Presence","Pre"]:["Intelligence","Int"];
 const score=[{l:ch[0],v:c[ch[1]],ref:"RoP:D p. 63"},med?{l:"Meditation (in place of Concentration)",v:ablScore(st,"Meditation"),ref:"RoP:D p. 63"}:{l:"Concentration",v:ablScore(st,"Concentration"),ref:"RoP:D p. 63"}];
 const base=ws+g+tf+aura;
 if(!holyPowerAbil())return mkCheck({id,title:"Divine Ascension",blocked:"Only holy characters with a holy Power or Miraculous Ability (such as Purity or Holy Magic) experience the Divine Ascent. Characters with only True Faith or a Divine Virtue take ordinary Warping; Hermetic magi with True Faith take Twilight (RoP:D p. 63)."});
 return mkCheck({id,title:"Divine Ascension",formula:`${ch[0]} + Concentration (or Meditation) + stress die`,score,post:post(),die:"stress",nb:baseBotch().nb,nbLines:baseBotch().lines,ef:base,efLabel:"Divine side",conf:!0,kind:"generic",
  opp:{label:`Warping Score ${ws} + points gained ${g} + True Faith ${tf} + aura ${aura} + stress die (no botch)`,base,die:"stress-nb"},
  notes:[{l:"Trigger",t:"Roll when a holy character gains two or more Warping Points from one event; add them to the Warping total first (RoP:D p. 63)."},
   {l:"Book",t:"The rule box says Presence; the book’s worked example adds Intelligence and reaches a total one higher than its dice. Settings › Optional rules chooses which is used (recommended: Presence)."}],
  outcome:(t,l)=>{const m=Math.max(0,l.opp.total-t);if(!l.botch&&t>=l.opp.total)return{cls:"ok",head:"Too tied to the world to ascend",text:`${fmtN(t)} vs ${fmtN(l.opp.total)} (RoP:D p. 63).`};
   const wsN=ablFromXp(warpPoints(st)+m).score,d=Math.max(1,ws+g+m-tf),unit=wsN>=6?"month":"day";
   return{cls:"fail",head:"The Divine Ascent",text:`${fmtN(t)} vs ${fmtN(l.opp.total)}: ${m} more Warping Point${1===m?"":"s"} (they do not trigger another Ascension). The Ascent lasts ${d} ${unit}${1===d?"":"s"} (Warping Score + points gained – True Faith, at least 1; months from Warping Score 6). The body stays, immune to all supernatural powers, illness, deprivation and wounds, or vanishes until it returns (RoP:D p. 63).${st.ascent.form?` Form: Divine ${st.ascent.form}.`:" Choose the form with the storyguide: Divine Gloom, Form or Unity; it is the same for life."}`,
    actions:[{l:`Record ${m} more Warping Point${1===m?"":"s"}`,act:"f97warp",n:m}]}}});
}
/* Tragedy of hubris on a failed holy power (RoP:D p. 46) */
function hubris(level,total){
 const tf=tfScoreX(),eff=Math.max(total,10*tf),gap=level-eff;
 if(gap<=0)return tf&&total<level?`True Faith ${tf}: Faith × 10 (${10*tf}) stands in for the total, so no tragedy of hubris (RoP:D p. 46).`:"";
 const band=gap<=10?["Minor","a Method, Power or other Supernatural Ability halved; a Minor Flaw; a Light Wound; three extra botch dice on all rolls; or a Warping Point"]:gap<=20?["Major","a Method, Power or other Supernatural Ability lost; a Major Flaw; a Heavy Wound; a minor tragedy for good; or a Decrepitude Point"]:["Ultimate","all Supernatural Abilities lost; possession; an Incapacitating Wound; a major tragedy for good; or plague, war or famine on the region"];
 return`${band[0]} tragedy of hubris (${gap} short${tf?`, using True Faith × 10 = ${10*tf}`:""}): ${band[1]}. It lasts until atoned for (RoP:D p. 46).`;
}

/* Saints (RoP:D pp. 87-89) */
const SAINT_CAT=[["100","The Blessed Virgin Mary, Divine Might 100"],["75","A greater saint, Divine Might 75"],["50","An area saint, Divine Might 50"],["25","A local saint, Divine Might 25"]];
function saintList(){try{const d=window.AM49&&AM49.data&&AM49.data();return(d&&d.best||[]).filter(b=>"Divine"===b.realm&&/^(Saint|St\.|Blessed Virgin)/.test(b.n)&&N(b.might)>0).map(b=>[b.n,N(b.might),b.src,b.p])}catch(z){return[]}}
function saintMight(){const x=XP(),s=saintList().find(r=>r[0]===x.stName);return s?s[1]:N(x.stCat)}
function invokeCheck(id){
 const x=XP(),c=charEff(st),aura=auraLvl("Divine"),tf=tfScoreX(),mods=[];
 const m=(on,l,v)=>on&&v&&mods.push({l,v,ref:"RoP:D p. 87"});
 m(x.stTomb,"At the saint’s tomb",1);m(aura>0,`In a Divine aura ${aura}`,aura);m(x.stFeast,"The saint’s feast day",3);m(x.stPilg,"Pilgrimage in the saint’s honour within a year",2);
 m(x.stRelic,"Touching the saint’s relic",1);m(N(x.stDon)>0,"A monetary donation",clamp(N(x.stDon),0,3));m(x.stPeril,"Imminent peril",2);m(tf>0,`True Faith ${tf}`,tf);
 m(N(x.stSinMo)>0,"An unchristian act in the last month",-clamp(N(x.stSinMo),0,3));m(x.stNoDon,"No donation within a year",-3);m(x.stRecent,"A miracle received within a month",-20);m(!x.stPatron,"Not your patron saint",-15);
 const secret=opt("saintSecret",!0),base={id,title:`Invoke a saint${x.stName?": "+x.stName:""}`,formula:"Communication + Charm + modifiers + simple die vs 15 + simple die",score:[{l:"Communication",v:c.Com,ref:"RoP:D p. 87"},{l:"Charm",v:ablScore(st,"Charm"),ref:"RoP:D p. 87"}].concat(mods),post:post(),die:"simple",nb:0,conf:!0,kind:"generic",
  notes:[{l:"Rule",t:"Once a day anyone may ask a saint for aid; the saint answers with one of its powers. No Ability or Virtue is needed (RoP:D p. 87)."},{l:"Saint’s die",t:secret?"The storyguide rolls the saint’s simple die in secret and compares your total with 15 + that die (RoP:D p. 87).":"The saint’s die is rolled openly here (optional rule; the book has the storyguide roll it in secret, RoP:D p. 87)."}]};
 if(secret)return mkCheck(Object.assign(base,{ef:null,efMode:"none",
  outcome:t=>({cls:"ok",head:`Your total: ${fmtN(t)}`,text:`The storyguide rolls a simple die in secret: the saint answers if ${fmtN(t)} reaches 15 + that die (16 to 25). If not, petition again tomorrow, or threaten the saint (RoP:D p. 87).`,actions:[{l:"Threaten the saint",act:"load",id:"r49:threat"}]})}));
 return mkCheck(Object.assign(base,{ef:15,efLabel:"The saint",opp:{label:"15 + a simple die (the ineffable mind of God)",base:15,die:"simple"},
  outcome:(t,l)=>t>=l.opp.total?{cls:"ok",head:"The saint answers",text:`${fmtN(t)} vs ${fmtN(l.opp.total)}: the saint uses one of its powers for you (RoP:D p. 87).`}:{cls:"fail",head:"No aid today",text:`${fmtN(t)} vs ${fmtN(l.opp.total)}. You may petition again tomorrow, or threaten the saint (RoP:D p. 87).`,actions:[{l:"Threaten the saint",act:"load",id:"r49:threat"}]}}));
}
function threatCheck(id){
 const x=XP(),c=charEff(st),dm=saintMight(),ef=9+Math.floor(dm/5),mods=[];
 const m=(on,l,v)=>on&&mods.push({l,v,ref:"RoP:D p. 88"});
 m(x.thBones,"Exposing the saint’s bones",1);m(x.thWhip,"Whipping or defiling the saint’s relics",2);m(x.thBerate,"Berating the saint in front of others",1);
 m(x.thBar,"Barring others from venerating the saint",3);m(x.thPeril,"Imminent peril",1);m(x.stRecent,"A miracle received within the past month",-20);m(x.thUnfam,"Threatening an unfamiliar saint",-15);
 return mkCheck({id,title:"Threaten a saint",sub:"only after the saint has refused an invocation",formula:"Presence + Leadership + modifiers + stress die",score:[{l:"Presence",v:c.Pre,ref:"RoP:D p. 88"},{l:"Leadership",v:ablScore(st,"Leadership"),ref:"RoP:D p. 88"}].concat(mods),post:post(),blocked:blockedBy(),die:"stress",nb:baseBotch().nb,nbLines:baseBotch().lines,ef,efLabel:`9 + Divine Might ${dm} ÷ 5`,conf:!0,kind:"generic",
  notes:[{l:"Rule",t:"Confidence Points may be spent on this roll, Faith Points may not (RoP:D p. 88)."}],
  botchNote:"A botch: the saint inflicts its curse on you (RoP:D p. 88).",
  outcome:t=>t>=ef?{cls:"ok",head:"The saint grants the miracle",text:`Total ${fmtN(t)} reaches ${ef}: the miracle you seek, if it is within the saint’s powers (RoP:D p. 88).`}:t<=ef-10?{cls:"fail",head:"The saint punishes you",text:`Total ${fmtN(t)} is 10 or more below ${ef}: a minor curse (one costing the saint 1 Might) and no aid for a season (RoP:D p. 88).`}:{cls:"fail",head:"The saint is annoyed",text:`Total ${fmtN(t)} is below ${ef}: no response to your petitions for a month (RoP:D p. 88).`}});
}

/* Golems (RoP:D pp. 142-143) */
const golemBase=()=>{const x=XP(),c=charEff(st);return[{l:"Intelligence",v:c.Int,ref:"RoP:D p. 142"},{l:"Kabbalah",v:ablScore(st,"Kabbalah"),ref:"RoP:D p. 142"},{l:"Wonders",v:ablScore(st,"Wonders"),ref:"RoP:D p. 142"}].concat(N(x.glCer)?[{l:"Ceremony bonus (each participant’s Intelligence + Kabbalah)",v:N(x.glCer),ref:"RoP:D p. 142"}]:[],auraLvl("Divine")?[{l:"Dominion aura",v:auraLvl("Divine"),ref:"RoP:D p. 142"}]:[])};
function golemCheck(id){
 const x=XP(),g=st.golem,cap=5*ablScore(st,"Kabbalah"),fin=!!x.glFinal,base=golemBase(),tot=sumL(base)+sumL(post());
 if(!fin)return mkCheck({id,title:"Awaken a golem: a season of work",formula:"Intelligence + Kabbalah + Wonders + Ceremony bonus + Dominion aura",score:base,post:post(),die:"none",ef:30,efLabel:"Ease Factor",conf:!1,kind:"generic",
  notes:[{l:"Rule",t:"The first season forms the clay body. In each later season, every point of the Awaken Golem Total over 30 is one point toward the golem’s Divine Might; the work may run for more consecutive seasons (RoP:D p. 142)."}],
  outcome:t=>{const p=Math.max(0,Math.floor(t)-30);return{cls:p?"ok":"fail",head:p?`${p} point${1===p?"":"s"} toward its Might`:"No progress this season",text:`Total ${fmtN(t)} against 30. Accumulated so far: ${g.acc} over ${g.seasons} season${1===g.seasons?"":"s"}.`,actions:p?[{l:`Add ${p} to the golem’s Might`,act:"f97golem",n:p}]:[]}}});
 return mkCheck({id,title:"Awaken a golem: the final season",formula:"accumulated points + stress die",score:[{l:"Accumulated points",v:g.acc,ref:"RoP:D p. 142"}],post:[],die:"stress",nb:Math.max(1,N(x.glKab)),nbLines:[{l:"One botch die per kabbalist taking part",v:Math.max(1,N(x.glKab)),ref:"RoP:D p. 142"}],ef:null,efMode:"none",conf:!1,kind:"generic",
  notes:[{l:"Rule",t:`The golem’s Divine Might is the accumulated points plus the stress die, capped at five times the lead kabbalist’s Kabbalah (${cap}). Only one living golem may protect a community; a second attempt gives every kabbalist a Minor Tragedy of Hubris and fails (RoP:D pp. 142–143).`}],
  outcome:t=>{const mt=Math.min(cap,Math.floor(t));return{cls:"ok",head:`The golem awakens: Divine Might ${mt}`,text:`${fmtN(t)}${t>cap?`, capped at ${cap}`:""}. It has Unaging, Improved Characteristics and Weak-Willed; (Area) Lore 5, Awareness 1, Brawl 5, Charm 3, Concentration 1, Hebrew 5; Loyal to its Community +3, Trusting +3, Vengeful –3 (RoP:D p. 142).`,actions:[{l:`Record Divine Might ${mt}`,act:"f97golemM",n:mt}]}}});
}
function empowerCheck(id){
 const x=XP(),lvl=N(x.glPowLvl),base=golemBase();
 return mkCheck({id,title:"Empower a golem",sub:x.glPow||"a power",formula:"Intelligence + Kabbalah + Wonders + Ceremony bonus + Dominion aura",score:base,post:post(),die:"none",ef:lvl,efLabel:"Power level",conf:!1,kind:"generic",
  notes:[{l:"Rule",t:"Design the power with the holy Methods and Powers guidelines, the golem as caster. Each season the Empower Golem Total must exceed the level; every point over it accumulates, and the golem gains the power once the points equal the level. It holds magnitudes of powers up to its Divine Might; using one costs its magnitude in Might, Initiative = Quickness, Penetration as DE p. 191; the pool refreshes at sunset. Removing a power adds its level to the total (RoP:D pp. 142–143)."}],
  outcome:t=>{const p=Math.max(0,Math.floor(t)-lvl);return p?{cls:"ok",head:`${p} point${1===p?"":"s"} toward the power`,text:`Total ${fmtN(t)} exceeds level ${lvl}.`,actions:[{l:`Add ${p} toward ${x.glPow||"the power"}`,act:"f97gpow",n:p,name:cut(x.glPow||"Power",80),lvl}]}:{cls:"fail",head:"No progress",text:`The total must exceed the power’s level ${lvl}.`}}});
}
function madnessCheck(id){
 return mkCheck({id,title:"Golem: madness",formula:"stress die",score:[],post:[],die:"stress",nb:1,nbLines:[{l:"Stress die",v:1,ref:"RoP:D p. 143"}],ef:null,efMode:"none",conf:!1,kind:"generic",
  notes:[{l:"When",t:"Roll whenever a kabbalist who awakened the golem suffers a tragedy of hubris, the golem is told to transgress a mitzvah, or it is taken outside its community. Changes are permanent (RoP:D p. 143)."},{l:"Book",t:"The table is used as printed, row by row."}],
  botchNote:"Botch: madness (RoP:D p. 143).",
  outcome:t=>{const r=t<5?"–1 to Trusting":t<10?"+1 to Vengeful":t<15?"–1 to Loyal to Community":"Roll twice more";return{cls:"ok",head:r,text:`Roll ${fmtN(t)} (RoP:D p. 143).`}}});
}

/* ---------------------------------------------------------------- registry */
{const G=getCheck;getCheck=function(id){
 if(id&&id.startsWith("r49:")){const k=id.slice(4),f={infl:influenceCheck,vit:vitCheck,vitage:vitAgeCheck,ascent:ascCheck,invoke:invokeCheck,threat:threatCheck,golem:golemCheck,gempower:empowerCheck,gmad:madnessCheck}[k];if(f)return f(id)}
 const c=G.apply(this,arguments);
 if(!c||c.blocked)return c;
 try{
  const raw=P().x||{};
  /* sacrifice adds to an infernal effect total (RoP:I p. 95) */
  if(("r:mal"===id||(opt("sacrGoetic",!1)&&("r:goetic"===id||"r:scour"===id)))&&N(raw.sacr)>0){const s=SACR.find(r=>r[0]===String(raw.sacr));c.post=c.post.concat([{l:`Sacrifice: ${s?s[1]:""} (about an hour more)`,v:N(raw.sacr),ref:"RoP:I p. 95"}])}
  /* Goetic magic: Rego for the Goetic Art, Vim for the (Realm) Lore (RoP:I p. 124) */
  if(("r:goetic"===id||"r:scour"===id)&&raw.goeHerm&&"magus"===st.type){const A=arts(st),re=A.Re.total,vi=A.Vi.total;
   c.score=c.score.map(s=>{const hi=opt("goeticHigher",!0);if(GOETIC[s.l]&&(!hi||re>N(s.v)))return Object.assign({},s,{l:`Rego in place of ${s.l} (Goetic magic)`,v:re,ref:"RoP:I p. 124"});if(/Lore/.test(s.l)&&!/Area/.test(s.l)&&(!hi||vi>N(s.v)))return Object.assign({},s,{l:`Vim in place of ${s.l} (Goetic magic)`,v:vi,ref:"RoP:I p. 124"});return s})}
  /* a failed holy power risks a tragedy of hubris (RoP:D p. 46) */
  if("r:holy"===id&&c.outcome){const O=c.outcome,lvl=N(c.ef);c.outcome=function(t,l){const o=O.apply(this,arguments);if(o&&"ok"!==o.cls){const hb=hubris(lvl,t);hb&&(o.text=(o.text?o.text+" ":"")+hb)}return o}}
  /* Divine Form: an impious act botches harder (RoP:D p. 65) */
  if("Form"===st.ascent.form&&c.die&&"none"!==c.die&&warpingScore(st)>0){const w=warpingScore(st);c.toggles=(c.toggles||[]).concat([{key:"t97:impious",l:"Impious act (Divine Form)",v:0,b:3*w,cond:`stress die; ${3*w} more botch dice, after any reduction`,ref:"RoP:D p. 65"}]);"simple"===c.die&&P().toggles["t97:impious"]&&(c.die="stress")}
  /* a second temper in the same Dominion aura: schism (RoP:D p. 41) */
  const a=P().aura;
  if(raw.tmp2Name&&N(raw.tmp2V)>0&&a&&"Divine"===a.realm){const T=SIN7.find(s=>s[2]===raw.tmp2Name);T&&(c.toggles=(c.toggles||[]).concat([{key:"t97:tmp2+",l:`Rival temper: ${T[2]} +${N(raw.tmp2V)}`,v:N(raw.tmp2V),cond:`the action serves it (schism)`,ref:"RoP:D p. 41"},{key:"t97:tmp2-",l:`Rival temper: ${T[2]} –${N(raw.tmp2V)}`,v:-N(raw.tmp2V),cond:`the action opposes it (schism)`,ref:"RoP:D p. 41"}]))}
  /* the False Gift: Vituperation instead of Twilight (RoP:I p. 124) */
  if("twilight"===id&&st.falseGift)c.notes=(c.notes||[]).concat([{l:"False Gift",t:"A character with the False Gift does not enter Twilight: roll Vituperation instead (Realms tab; RoP:I p. 124)."}]);
 }catch(z){console.error(z)}
 return c;
}}
/* Faith Points may not be spent on threatening a saint (RoP:D p. 88): marked for the 4.9.4.0 spend button */
window.AM497={noFaith:id=>"r49:threat"===id};

/* outcome actions */
{const AA=applyAction;applyAction=function(d){
 const a=d&&d.act;if(!a||!/^f97/.test(a))return AA.apply(this,arguments);
 if("f97conf"===a)P().conf=Math.max(0,N(P().conf)+N(d.n));
 else if("f97warp"===a)st.status.warpPts=Math.max(0,warpPoints(st)+N(d.n));
 else if("f97golem"===a)st.golem.acc+=N(d.n),st.golem.seasons++,st.golem.on=!0;
 else if("f97golemM"===a)st.golem.might=N(d.n),st.golem.on=!0;
 else if("f97gpow"===a){const g=st.golem,p=g.powers.find(q=>q.n===d.name&&q.lvl===N(d.lvl))||(g.powers.push({n:d.name,lvl:N(d.lvl),acc:0}),g.powers[g.powers.length-1]);p.acc=Math.min(p.lvl,p.acc+N(d.n))}
 persist();
}}

/* ================================================================
   Realms tab panels
   ================================================================ */
function sinPanel(){
 const L=sinTraits(),x=XP(),sel=L.filter(t=>t.sv>0);
 const rows=(st.traits||[]).map((t,i)=>{if(!t||!t.t)return"";const s=traitSin(t);return`<tr><td>${H(t.t)} ${sgnN(N(t.v))}</td><td><select data-f97in="tsin" data-i="${i}" aria-label="Vice or virtue of ${H(t.t)}">${SIN_TAGS.map(([v,l])=>`<option value="${H(v)}"${(t.sin||"")===v?" selected":""}>${H(l)}</option>`).join("")}</select></td><td class="note">${s?`${H(s.sin)} ${sgnN(s.sign*N(t.v))}${s.auto&&!t.sin?" (from the trait’s name)":""}`:"—"}</td></tr>`}).join("");
 const fl=L.filter(t=>"flaw"===t.src).map(t=>`<li>${H(t.t)} counts as ${H(t.sin)} +${t.v}</li>`).join("");
 return`<div class="pane-h"><h3>Sin and temptation</h3><p class="note">Each Personality Trait can be tied to one of the seven sins or the virtue that opposes it; a virtuous trait is the sin at a negative score, so Dedicated +3 (Loyal) is Proud –3 (RoP:I p. 21). A Minor Personality Flaw counts as a +3 trait and a Major one as +6 (p. 22).</p></div>
 <div class="card"><table class="lt"><thead><tr><th>Trait</th><th>Vice or virtue</th><th>As a sin</th></tr></thead><tbody>${rows||'<tr><td colspan="3" class="note">No Personality Traits on the sheet.</td></tr>'}</tbody></table>${fl?`<ul class="rnotes">${fl}</ul>`:""}
  <div class="fields"><label class="f"><span>Venial sins since absolution</span><span class="mini-step"><button type="button" data-f97="ven-" aria-label="One fewer">−</button><output>${st.sin.venial}</output><button type="button" data-f97="ven+" aria-label="One more">+</button></span></label>
  <label class="f"><span>Mortal sins since absolution</span><span class="mini-step"><button type="button" data-f97="mor-" aria-label="One fewer">−</button><output>${st.sin.mortal}</output><button type="button" data-f97="mor+" aria-label="One more">+</button></span></label>
  ${btn("absolve","Absolution: the mark of sin removed",st.sin.venial||st.sin.mortal?"":" disabled")}</div>
  <p class="note">Sin needs a conscious act: a character compelled by a supernatural power does not sin, but dealing with demons or using Infernal powers stains the soul each time, even unknowingly. Any true repentance removes the mark: confession and penance for Christians, ritual fasts of atonement for Jews and Muslims (RoP:I pp. 20–22).</p></div>
 <div class="pane-h"><h3>Confidence through sin</h3><p class="note">With a trait that shows a penchant for a sin, indulging it at every chance for a season, or a short ritual of the sin (which also gives an infernal Warping Point), yields a Confidence Point. Venial sins serve for traits of +3 or less; above that it usually takes a mortal sin. A season in an aura tarnished with the sin usually earns one too. Characters without a Confidence Score still gain these points, and may spend them on ceremonial influence, tarnishing, or +1 each to a roll of that trait, up to its score (RoP:I p. 24).</p></div>
 <div class="card"><div class="fields"><label class="f"><span>Sin</span><select data-pk="x.sinPick"><option value="">Choose a trait…</option>${sel.map(t=>`<option value="${H(t.sin)}"${x.sinPick===t.sin?" selected":""}>${H(t.t)}: ${H(t.sin)} +${t.sv}</option>`).join("")}</select></label>
  ${btn("sin-season","A season of indulgence: +1 Confidence Point",x.sinPick?"":" disabled")}${btn("sin-ritual","A ritual of the sin: +1 Confidence Point, +1 Warping Point",x.sinPick?"":" disabled")}</div></div>
 <div class="pane-h"><h3>Infernal influence</h3><p class="note">Lead others into sin by example for a season (personal) or with a short invocation and a Confidence Point (ceremonial; needs Infernal Lore 1) (RoP:I p. 23).</p></div>
 <div class="card"><div class="fields"><label class="f"><span>Kind</span>${sel2("x.inflMode",[["personal","Personal (a season)"],["ceremonial","Ceremonial (a Confidence Point)"]])}</label></div><div class="acts">${rowFor("r49:infl")}</div></div>`;
}
const INF_WARP=[[1,"A Minor Personality Flaw of obsession with sin: Avaricious, Envious, Greedy, Hatred, Lecherous, Proud or Wrathful taken as Minor, or Delusion, Obsessed or Compulsion; Weak-Willed for one prone to many venial sins."],
 [3,"Offensive to Animals if the Warping comes mostly from venial sins; Tainted with Evil if from mortal sins or traffic with Infernal powers."],
 [5,"A Minor Supernatural Virtue granted by Hell: Enticer of Multitudes, Infernal Protection, Gender Shift, Paragon Through Sin, or Infernal Blessings (Minor)."],
 [6,"Hell is keen on this soul: Age Quickly or Enfeebled are common, and sometimes a demon is sent so he does not repent (Plagued by a Demon)."]];
const DIV_FLAWS="Minor: Compassionate, Compulsion (prayer, self-flagellation), Continence, Disfigured (stigmata), Driven (Minor), Fear (of the Divine or Infernal), Fragile Constitution, Generous, Humble, Lame, Obsessed (God, sin, sinners), Pious (Minor), Soft-Hearted, Susceptibility to Divine Power, Susceptibility to Infernal Power, Temperate, Visions. Major: Blind, Deaf, Driven (Major), Enfeebled, Pious (Major).";
function warpPanel(){
 const ws=warpingScore(st),src=st.sin.warpSrc,inf=INF_WARP.filter(r=>ws>=r[0]).map(r=>`<li><b>Warping Score ${r[0]}${6===r[0]?"+":""}:</b> ${r[1]}</li>`).join("");
 return`<div class="pane-h"><h3>Warping by realm</h3><p class="note">Warping Points are not tracked by realm, but when most of a character’s points come from one realm its effects take that realm’s flavour (RoP:I p. 17; RoP:D p. 62).</p></div>
 <div class="card"><div class="fields"><label class="f"><span>Most Warping Points come from</span><select data-f97in="warpsrc">${[["","Not recorded"],["Infernal","the Infernal (sin, Infernal powers and auras)"],["Divine","the Divine"],["Other","Magic, Faerie or several realms"]].map(([v,l])=>`<option value="${v}"${src===v?" selected":""}>${H(l)}</option>`).join("")}</select></label><span class="note">Warping Score ${ws}</span></div>
 ${"Infernal"===src&&bookOn("RoP:I")?`<ul class="rnotes">${inf||"<li>No Infernal Warping effects below Warping Score 1.</li>"}</ul><p class="note">Sources: a ritual of sin for Confidence (1 point); strong Infernal auras, unless he has Infernal powers or Supernatural Abilities, which make him immune to Infernal auras only; Infernal powers of level 30+, or of 6+ Might spent; one point per zero on a botch with an unholy power or Infernal Supernatural Ability (RoP:I pp. 17–18).</p>`:""}
 ${"Divine"===src&&bookOn("RoP:D")?`<p class="note">Divine Warping punishes the sinful toward redemption or drives the devout to pious extremes. Common Flaws — ${DIV_FLAWS} Flaws from Warping do not stop further Warping; Minor Virtues gained at Warping Score 5 stop Warping from strong auras. Sources: strong Divine auras (not for those with holy powers, Divine Virtues or Faith Points); witnessing a miracle of level 30+ (not its beneficiaries); holy powers of level 30+; one point per zero on a botch with a holy power or Divine Ability (RoP:D p. 62).</p>`:""}</div>`;
}
function infernalistPanel(){
 const x=XP(),hi=infernalRep(),conf=confidence(st);
 return`<div class="pane-h"><h3>Infernalist</h3><p class="note">Hierarchy Score ${hi}: the highest Infernal Reputation (add one under Reputations with type Infernal; a character who starts with Infernal or tainted Abilities, Virtues or Flaws may begin at 1). Infernal Reputations count as beneficial and cannot come from a Flaw that grants a bad Reputation (RoP:I p. 95).</p></div>
 <div class="card"><div class="fields"><label class="f"><span>Warping Points gained at once</span>${numIn("x.vitGain",' min="0" max="99"')}</label>${chk("x.vitAccept","Accept it without rolling (to harden the will)")}${chk("x.goeHerm","Goetic magic: use Rego and Vim in place of a Goetic Art and (Realm) Lore")}</div>
  <div class="acts">${x.vitAccept?btn("vit-accept","Undergo Vituperation"):rowFor("r49:vit")}${rowFor("r49:vitage")}</div>
  <div class="fields"><label class="f"><span>Sacrifice for the next maleficium</span>${sel2("x.sacr",SACR)}</label></div>
  <p class="note">Sacrifice adds to the effect total of an infernal power and takes about an hour more (RoP:I p. 95). Goetic magic: a magus with the Goetic Art in question may use his Rego for it and his Vim for the Lore, may bond a spirit as familiar using a Goetic Art as the Technique, and may learn Goetic Mastery for Rego Vim summoning spells: add the most fitting Goetic Art to the Casting Total and Hierarchy × 5 to Penetration against a demon (whose Hierarchy × 5 the storyguide subtracts); such spells seem unholy (RoP:I p. 124).</p>
  <p class="note"><b>Profaning the holy:</b> spend a Confidence Point to taint a blessed object or symbol of faith into one pawn of vis of a fitting Form, usually vis infesta (a very holy object may give vis sordida or even prava). A relic’s Faith stands in for the Confidence Point, but only a character whose Confidence Score exceeds the relic’s Faith Score can profane it, and the saint will not forgive it (RoP:I p. 96).</p>
  <div class="fields">${btn("profane","Profane an object: –1 Confidence Point, +1 pawn of vis infesta",P().conf>0?"":" disabled")}<label class="chk"><input type="checkbox" data-f97in="falsegift"${st.falseGift?" checked":""}>The Gift is a False Gift (RoP:I p. 124)</label></div></div>`;
}
function ascentPanel(){
 const a=st.ascent,ws=warpingScore(st),tf=tfScoreX(),A={Gloom:`Each time he gains Warping Points he gains as many experience points for Dominion Lore, holy Power Abilities and the Abilities of holy Virtues, and loses as many from mundane Abilities (such as Swim, Charm or Profession). He shines like a torch to angels, demons, faeries and spirits (RoP:D pp. 63–64).`,
  Form:`Magic Resistance ${ws+10*tf} (Warping Score ${ws}${tf?` + True Faith ${10*tf}`:""}; it stacks with True Faith only, not with Parma or holy powers), Soak +${Math.floor((ws+10*tf)/5)}, Penetration ${ws+5*tf} for the commanding aura (Warping Score + Faith × 5). An impious act that needs a roll uses a stress die with ${3*ws} more botch dice; a venial sin brings a Light Wound and a mortal sin a Medium Wound at once, unsoakable and healed only naturally or by miracle (RoP:D p. 65).`,
  Unity:`He personifies one virtue: add the Warping Score (${ws}) to that Personality Trait. Those in his company for a season or more are affected as by holy influence toward it, and any aura he spends a season in takes the matching temper, which may cause schism (RoP:D p. 65).`};
 return`<div class="pane-h"><h3>The Divine Ascent</h3><p class="note">Holy characters with a holy Power or Miraculous Ability take this form of Warping in place of the ordinary effects. There is no final Ascent (RoP:D p. 63).</p></div>
 <div class="card"><div class="fields"><label class="f"><span>Warping Points gained at once</span>${numIn("x.ascGain",' min="0" max="99"')}</label>${ablScore(st,"Meditation")>0?chk("x.ascUseMed","Use Meditation in place of Concentration"):""}
  <label class="f"><span>Form of the Ascent (for life)</span><select data-f97in="ascform">${[["","Not yet"],["Gloom","Divine Gloom"],["Form","Divine Form"],["Unity","Divine Unity"]].map(([v,l])=>`<option value="${v}"${a.form===v?" selected":""}>${l}</option>`).join("")}</select></label>
  ${"Unity"===a.form?`<label class="f"><span>The virtue personified</span><input type="text" data-f97in="ascvirtue" value="${H(a.virtue)}" placeholder="e.g. Charity, Justice, Fortitude"></label>`:""}</div>
  ${a.form?`<p class="note"><b>Divine ${a.form}:</b> ${A[a.form]}</p>`:""}
  <div class="acts">${rowFor("r49:ascent")}</div></div>`;
}
function relicsPanel(){
 const R=(st.inv||[]).map((r,i)=>[r,i]).filter(([r])=>r&&"relic"===r.cat);if(!R.length)return"";
 const x=XP(),top=R.reduce((m,[r])=>Math.max(m,N(r.faith)),0);
 return`<div class="pane-h"><h3>Relics</h3><p class="note">A relic holds Faith Points equal to its Faith Score, spent to give its carrier Magic Resistance or like Confidence. Its Divine Might is Faith × 10, refreshed each sunrise; it limits how often its powers work and resists spells aimed at the relic. Infernal creatures whose Might does not exceed it cannot come within its Might in feet, and those that do take damage equal to its Might each round (Soak applies). Its powers work only for followers of its faith, and fail while the bearer acts impiously (RoP:D p. 45).</p></div>
 <div class="card"><table class="lt"><thead><tr><th>Relic</th><th>Faith</th><th>Divine Might</th><th>Faith Points</th></tr></thead><tbody>${R.map(([r,i])=>{const f=N(r.faith),left=null==(x.rfp||{})[i]?f:N(x.rfp[i]);return`<tr><td>${H(r.n)}${r.power?`<br><span class="note">${H(r.power)}</span>`:""}</td><td class="n">${f}</td><td class="n">${10*f}</td><td><span class="mini-step"><button type="button" data-f97="rfp-" data-i="${i}" aria-label="Spend a Faith Point"${left?"":" disabled"}>−</button><output>${left}</output><button type="button" data-f97="rfp+" data-i="${i}" aria-label="Restore a Faith Point"${left<f?"":" disabled"}>+</button></span></td></tr>`}).join("")}</tbody></table>
 ${btn("rfp-dawn","Sunrise: relics refresh")}<p class="note">Most powerful relic carried: Magic Resistance ${10*top} (Faith × 10). For a crowned or invested ruler it adds to the commanding aura’s Magic Resistance, but not to its Soak (RoP:D p. 43). ${opt("relicMRAdds",!1)?"It also adds to any other Magic Resistance (optional rule).":"Otherwise the higher Magic Resistance applies (DE p. 55; recommended reading, see Settings › Optional rules)."}</p></div>`;
}
function saintsPanel(){
 const x=XP(),S=saintList(),dm=saintMight();
 let cat=[];try{const d=window.AM49&&AM49.data&&AM49.data();cat=(d&&d.powers||[]).filter(p=>"D"===p.b&&(88===p.p||89===p.p))}catch(z){}
 return`<div class="pane-h"><h3>Saints</h3><p class="note">Ask a saint for aid once a day; threaten one who refused. A saint’s power penetrates with its Divine Might – 5 × the power’s cost (RoP:D pp. 87–88).</p></div>
 <div class="card"><div class="fields"><label class="f"><span>Saint</span><select data-pk="x.stName"><option value="">By category</option>${S.map(s=>`<option value="${H(s[0])}"${x.stName===s[0]?" selected":""}>${H(s[0])} (Might ${s[1]}; ${H(s[2])} p. ${s[3]})</option>`).join("")}</select></label>
  ${x.stName?"":`<label class="f"><span>Category</span>${sel2("x.stCat",SAINT_CAT)}</label>`}<span class="note">Divine Might ${dm}</span></div>
  <div class="fields">${chk("x.stPatron","Your patron saint (or the area’s)")}${chk("x.stTomb","At the saint’s tomb +1")}${chk("x.stFeast","Feast day +3")}${chk("x.stPilg","Pilgrimage within a year +2")}${chk("x.stRelic","Touching the relic +1")}
   <label class="f"><span>Donation (+1 to +3)</span>${numIn("x.stDon",' min="0" max="3"')}</label>${chk("x.stPeril","Imminent peril +2")}<label class="f"><span>Unchristian act this month (–1 to –3)</span>${numIn("x.stSinMo",' min="0" max="3"')}</label>${chk("x.stNoDon","No donation within a year –3")}${chk("x.stRecent","A miracle within a month –20")}</div>
  <div class="acts">${rowFor("r49:invoke")}</div>
  <div class="fields">${chk("x.thBones","Exposing the bones +1")}${chk("x.thWhip","Whipping or defiling the relics +2")}${chk("x.thBerate","Berating it before others +1")}${chk("x.thBar","Barring its veneration +3")}${chk("x.thPeril","Imminent peril +1")}${chk("x.thUnfam","An unfamiliar saint –15")}</div>
  <div class="acts">${rowFor("r49:threat")}</div>
  ${cat.length?`<details class="tog"><summary>Saints’ miracles and curses (RoP:D pp. 88–89)</summary><table class="lt"><thead><tr><th>Power</th><th>Cost</th><th>Init</th><th>Form</th><th>Penetration</th></tr></thead><tbody>${cat.map(p=>`<tr><td title="${H(p.x)}">${H(p.n)}</td><td class="n">${H(p.c)}</td><td class="n">${H(p.i)}</td><td>${H(p.f)}</td><td class="n">${dm-5*N(p.c)}</td></tr>`).join("")}</tbody></table><p class="note">The Blessed Virgin has Divine Might 100, greater saints 75, area saints 50, local saints 25; a saint’s powers usually cost in all no more than a fifth of its Might (RoP:D p. 89).</p></details>`:""}</div>`;
}
function golemPanel(){
 const g=st.golem,x=XP(),cap=5*ablScore(st,"Kabbalah"),used=g.powers.filter(p=>p.acc>=p.lvl).reduce((s,p)=>s+Math.ceil(p.lvl/5),0);
 return`<div class="pane-h"><h3>Golems</h3><p class="note">Kabbalah’s pinnacle: clay with earth from beneath a synagogue, awakened over seasons into a living protector of a community (RoP:D pp. 142–143). Might cap: Kabbalah × 5 = ${cap}.</p></div>
 <div class="card"><div class="fields"><label class="f"><span>Kabbalists taking part (botch dice)</span>${numIn("x.glKab",' min="1" max="20"')}</label><label class="f"><span>Ceremony bonus</span>${numIn("x.glCer",' min="0"')}</label>${chk("x.glFinal","The final season (add the stress die)")}</div>
  <p class="note">${g.on?`${g.name?H(g.name)+": ":""}accumulated ${g.acc} over ${g.seasons} season${1===g.seasons?"":"s"}${g.might?`; Divine Might ${g.might}, holding ${used} of ${g.might} magnitudes of powers`:""}.`:"No golem in progress."} ${g.on?btn("golem-clear","Clear the record"):""}</p>
  <div class="acts">${rowFor("r49:golem")}</div>
  <div class="fields"><label class="f"><span>Power to bestow</span><input type="text" data-pk="x.glPow" value="${H(x.glPow)}" placeholder="e.g. Instil anxiety over greed"></label><label class="f"><span>Its level</span>${numIn("x.glPowLvl",' min="1" max="200"')}</label></div>
  ${g.powers.length?`<ul class="rnotes">${g.powers.map(p=>`<li>${H(p.n)} (level ${p.lvl}): ${p.acc>=p.lvl?"gained":`${p.acc} of ${p.lvl}`}</li>`).join("")}</ul>`:""}
  <div class="acts">${rowFor("r49:gempower")}${rowFor("r49:gmad")}</div></div>`;
}

{const T=tabRealms;tabRealms=function(){
 let base=T.apply(this,arguments);
 try{
  let add="";const I=bookOn("RoP:I"),D=bookOn("RoP:D");
  I&&(add+=sinPanel());
  (I||D)&&(add+=warpPanel());
  I&&isInfernalist()&&(add+=infernalistPanel());
  D&&holyPowerAbil()&&(add+=ascentPanel());
  D&&(add+=relicsPanel());
  D&&(add+=saintsPanel());
  D&&ablScore(st,"Kabbalah")>0&&(add+=golemPanel());
  add&&/^<p class="note">No Realms of Power abilities\.<\/p>$/.test(base)&&(base="");
  return base+add;
 }catch(z){console.error(z);return base}
}}
/* the Realms tab shows for every character while any Realms of Power book is switched on (Build › sources) */
{const R=hasRealms;hasRealms=function(){try{return anyRoP()}catch(z){return R.apply(this,arguments)}}}

/* a rival temper in the aura settings: schism (RoP:D p. 41) */
{const MA=modAura;modAura=function(){
 const h=MA.apply(this,arguments);
 try{const a=P().aura;if("Divine"===a.realm)return h+`<fieldset><legend>Rival temper (schism)</legend><label class="f"><span>Temper</span>${sel2("x.tmp2Name",[["","None"]].concat(SIN7.map(t=>[t[2],t[2]])))}</label><label class="f"><span>Value</span>${numIn("x.tmp2V",' min="0" max="3"')}</label><p class="note">When two leaders with spiritual authority invoke different tempers in one aura, both apply; a bonus and a penalty on the same action may cancel (RoP:D p. 41).</p></fieldset>`}catch(z){console.error(z)}
 return h;
}}

/* ---------------------------------------------------------------- Play controls */
document.addEventListener("click",e=>{
 const b=e.target.closest&&e.target.closest("[data-f97]");if(!b||!inPlay())return;
 const k=b.dataset.f97,x=XP(),s=st.sin;
 if("ven+"===k)s.venial++;else if("ven-"===k)s.venial=Math.max(0,s.venial-1);
 else if("mor+"===k)s.mortal++;else if("mor-"===k)s.mortal=Math.max(0,s.mortal-1);
 else if("absolve"===k){s.venial=0;s.mortal=0;toast("The mark of sin is removed by repentance (RoP:I p. 22).","ok")}
 else if("sin-season"===k){P().conf=N(P().conf)+1;toast("A Confidence Point from a season of indulgence (RoP:I p. 24).","ok")}
 else if("sin-ritual"===k){P().conf=N(P().conf)+1;st.status.warpPts=warpPoints(st)+1;s.warpSrc=s.warpSrc||"Infernal";toast("A Confidence Point and an infernal Warping Point (RoP:I pp. 18, 24).","ok")}
 else if("vit-accept"===k){const r=vitResult(warpingScore(st),N(x.vitGain),!1,"Accepted without a roll");P().conf=N(P().conf)+N(x.vitGain);toast(r.text,"ok")}
 else if("profane"===k){if(!(P().conf>0))return;P().conf--;st.rawvis.push({art:"",pawns:1,form:"Profaned object: vis infesta (RoP:I p. 96)"});toast("A pawn of vis infesta added under Raw vis; set its Art there.","ok")}
 else if("rfp-"===k||"rfp+"===k){const i=+b.dataset.i,r=st.inv[i];if(!r)return;x.rfp=Object.assign({},x.rfp);const f=N(r.faith),cur=null==x.rfp[i]?f:N(x.rfp[i]);x.rfp[i]=clamp(cur+("rfp+"===k?1:-1),0,f)}
 else if("rfp-dawn"===k)x.rfp={};
 else if("golem-clear"===k)st.golem={on:!1,name:"",acc:0,seasons:0,might:0,powers:[]};
 else return;
 e.preventDefault();persist();renderPlay();
});
document.addEventListener("change",e=>{
 const i=e.target;if(!i||!inPlay()||!i.dataset||!i.dataset.f97in)return;
 const k=i.dataset.f97in;
 if("tsin"===k){const t=st.traits[+i.dataset.i];t&&(t.sin=SIN_OF[String(i.value).toLowerCase()]?i.value:"")}
 else if("warpsrc"===k)st.sin.warpSrc=["","Infernal","Divine","Other"].includes(i.value)?i.value:"";
 else if("ascform"===k)st.ascent.form=["","Gloom","Form","Unity"].includes(i.value)?i.value:"";
 else if("ascvirtue"===k)st.ascent.virtue=cut(i.value,40);
 else if("falsegift"===k)st.falseGift=!!i.checked;
 else return;
 persist();renderPlay();
});

/* ---------------------------------------------------------------- Build checks */
{const K=checks;checks=function(e){
 const a=K.apply(this,arguments);
 try{
  const cb=["Greater Infernal Power","Lesser Infernal Power","Horrifying Appearance"].filter(n=>has(e,n));
  cb.length&&a.push({ok:has(e,"Corrupted Beast"),t:`${cb.join(", ")}: corrupted beasts only, with the Corrupted Beast Flaw (RoP:I p. 78)`,g:"vf"});
 }catch(z){console.error(z)}
 return a;
}}
