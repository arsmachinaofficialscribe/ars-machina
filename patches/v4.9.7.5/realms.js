/* ================================================================
   v4.9.7.5  Auras, regiones and vis
   Definitive Edition (DE) pp. 50, 410-411, 413-422
   Realms of Power: Magic (RoP:M) pp. 7-16, 119-123
   Realms of Power: The Infernal (RoP:I) pp. 10-19
   Realms of Power: The Divine (RoP:D) pp. 7-15
   Realms of Power: Faerie (RoP:F) pp. 14-19
   ================================================================ */
const N=v=>num(v),H=v=>esc(String(v==null?"":v));
const inPlay=()=>"play"===MODE;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const cut=(v,n)=>String(v==null?"":v).slice(0,n);
const opt=(k,d)=>window.amOpt?amOpt(k):d;
const bookOn=b=>srcOn(st,b);
const btn=(k,l,extra)=>`<button type="button" class="btn small" data-f975="${k}"${extra||""}>${l}</button>`;
const rowFor=id=>{const c=getCheck(id);return c?row(id,c.title,c.sub||c.formula,c.blocked?"—":scoreText(c),c):""};
const post=()=>condPen().lines.concat(misc0());
const tfX=()=>{const f=st.faith||{};return null!=f.score?N(f.score):count(st,"True Faith")};
const TE=ARTS.slice(0,5),FO=ARTS.slice(5);
const selF=(k,v,opts,lbl)=>`<select data-f975in="${k}"${lbl?` aria-label="${H(lbl)}"`:""}>${opts.map(([a,b])=>`<option value="${H(a)}"${String(v)===String(a)?" selected":""}>${H(b)}</option>`).join("")}</select>`;
const numF=(k,v,a)=>`<input type="number" data-f975in="${k}" value="${H(v)}"${a||""}>`;

/* ---------------------------------------------------------------- optional rules */
window.amOptAdd&&amOptAdd([
 {id:"faeRegioAware",grp:"sub",def:!0,by:"book",l:"Faerie regiones: find the way in with Perception + Awareness",
  x:"The Definitive Edition’s regio sight roll is Perception + the appropriate Ability. Realms of Power: Faerie gives the faerie version: Perception + Awareness, for a character with Faerie Sight, Second Sight or Magic Sensitivity. Off: faerie regiones use the sight Ability, like the others.",ref:"RoP:F p. 16; DE p. 421"},
 {id:"visInfestaRoP",grp:"sub",def:!1,by:"book",l:"Vis infesta: one botch die a pawn, as in The Infernal",
  x:"The Definitive Edition says Infernally tainted vis adds at least twice the usual botch dice. The Infernal gives vis infesta no extra dice, only worse botches. Off (the Definitive Edition): two botch dice a pawn.",ref:"DE p. 422; RoP:I p. 18"},
 {id:"visStorage",grp:"sub",def:!1,by:"book",l:"Large stores of one Art’s vis cause spontaneous spells",
  x:"The storyguide’s option: from a rook or two (low-vis saga) to a queen or more (high-vis saga) of one Art stored together, spells of that Art occur within Voice range, one magnitude for each multiple of the threshold. On: Build shows the magnitude under Raw vis.",ref:"RoP:M p. 123"},
 {id:"auraBotchEach",grp:"home",def:!1,by:"ours",l:"Yearly aura modifier: count every magical botch",
  x:"The table gives +1 for a beneficial and –1 for a detrimental magical botch (2 or more Warping Points), without the “per instance” it gives vis. Recommended: one +1 or –1 a year. On: each such botch counts.",ref:"RoP:M p. 10"}
]);

/* ---------------------------------------------------------------- persistent records */
const TETHER_T={feature:["n","Natural feature",null,""],
 residue:["p","Magic residue","Ritual level equivalent","(level – 40) ÷ 10"],
 monument:["p","Magic monument","Full centuries of active use","1 a century"],
 being:["p","Magic being living there a year or more","Its Might","Might ÷ 10"],
 burial:["p","Death, burial or half-life home of a magic being","Its Might","Might ÷ 20"],
 vissource:["p","Vis source (with no other tether)","Pawns a year","pawns ÷ 3"],
 other:["p","Other preternatural tether",null,""]};
function tetherScore(t){const x=N(t.x);switch(t.t){case"residue":return clamp(Math.floor((x-40)/10),0,5);case"monument":return clamp(Math.floor(x),0,5);case"being":return clamp(Math.floor(x/10),0,5);case"burial":return clamp(Math.floor(x/20),0,5);case"vissource":return clamp(Math.floor(x/3),0,5);case"feature":return clamp(N(t.v),1,2);default:return clamp(N(t.v),1,5)}}
const VIS_KINDS=[
 ["","Ordinary vis",""],
 ["faerie","Faerie vis","DE p. 422"],
 ["divine","Divine vis","DE p. 422"],
 ["infernal","Infernal vis","DE p. 422","noI"],
 ["infesta","Vis infesta (unsafe)","RoP:I p. 18","RoP:I"],
 ["sordida","Vis sordida (filthy)","RoP:I pp. 18–19","RoP:I"],
 ["prava","Vis prava (wicked)","RoP:I p. 19","RoP:I"],
 ["dedicated","Dedicated vis (one Technique and Form)","RoP:M pp. 122–123","RoP:M"],
 ["extraordinary","Extraordinary vis","RoP:M pp. 119–122","RoP:M"],
 ["encased","Encased vis (Magic vis under glamour)","RoP:F p. 18","RoP:F"],
 ["anchor","A faerie’s anchor","RoP:F pp. 18–19","RoP:F"],
 ["accrued","Accrued vis","RoP:F p. 19","RoP:F"],
 ["sleeping","Sleeping vis","RoP:F p. 19","RoP:F"],
 ["abstract","Abstract vis (no real vis)","RoP:F p. 19","RoP:F"]];
const VK_BY={};VIS_KINDS.forEach(k=>VK_BY[k[0]]=k);
const vkShown=(k,cur)=>{const g=k[3];return k[0]===cur||!g||("noI"===g?!bookOn("RoP:I"):bookOn(g))};
const VIS_NOTE={
 faerie:"Faerie vis is generally safe and does not distort spells, though it may have strange side effects (DE p. 422).",
 divine:"Gathering Divine vis may annoy the Church, and many magi think using it sacrilegious (DE p. 422).",
 infernal:"Infernally tainted vis adds at least twice the usual botch dice to spellcasting and needs a roll on the experimentation chart for an enchanted item. Its taint cannot be detected by Hermetic magic (DE p. 422).",
 infesta:"Vis infesta: vis that spent a year in an Infernal aura, or came from a minor demon (Might under 10) or a corrupted beast. Its botches are more severe; studying it gives a tainted Personality Trait; an enchantment experimented with takes the worst result (RoP:I p. 18). Botch dice: the Definitive Edition doubles them (DE p. 422; Settings › Optional rules).",
 sordida:"Vis sordida: forms in Infernal auras or comes from demons of Might 10–25. +5 a pawn to a Casting Total, three botch dice a pawn and never fewer botch dice than pawns; +1 Source Quality a pawn for study; each pawn taints ten levels of an enchantment (RoP:I pp. 18–19). Infernalists use it as ordinary vis.",
 prava:"Vis prava: from Infernal auras of 5 or more, from demons of Might over 25, or as Vim vis extracted from any Infernal aura. Any roll using it counts as a zero, with two botch dice a pawn (never fewer than the pawns); studying it costs a Warping Point a pawn; in the laboratory it gives only Experimental Disaster. It vaporizes in a Divine aura of 5 or more or when blessed by a priest. Infernalists gain +5 a pawn (RoP:I p. 19).",
 dedicated:"Dedicated vis: one Technique and Form. For a spell or Ritual of exactly that pair each pawn counts twice: +4 a pawn, two pawns for a Ritual or an enchantment, and double for botch dice. It cannot be split into separate pawns; study gains both Arts at half Source Quality ((stress die + aura) ÷ 2, double-botch is Twilight); enchanted in its own shape it doubles the shape and material bonus and counts as already opened (RoP:M pp. 122–123).",
 extraordinary:"Extraordinary vis carries a lesser enchantment (usually level 30 or lower) or a spell-like effect (usually level 60 or lower). Lab Total to investigate a spell-like effect: half its level. Moving it into another shape, or using it for Hermetic purposes, ends the special power (RoP:M pp. 119–122).",
 encased:"Encased vis is Magic vis a faerie has claimed with glamour; the faerie may want it back (RoP:F p. 18).",
 anchor:"An anchor holds a faerie’s glamour; the faerie stays conscious inside it and can be spoken to with Intellego Vim (RoP:F pp. 18–19).",
 accrued:"Accrued vis is left where faeries end their roles; a faerie offered it may take up the old role (RoP:F p. 19).",
 sleeping:"Sleeping vis holds a dormant glamour; given vitality it may wake as a faerie (RoP:F p. 19).",
 abstract:"Abstract vis is glamour on matter, not vis: it detects as enchanted but magi cannot use it for anything concrete (RoP:F p. 19)."};
function f975San(s){
 if(!s||"object"!=typeof s)return s;
 Array.isArray(s.rawvis)&&s.rawvis.forEach(r=>{if(!r||"object"!=typeof r)return;VK_BY[r.kind]||(r.kind="");r.art2=FO.some(f=>f[1]===r.art2)?r.art2:""});
 s.ages&&"object"==typeof s.ages&&(s.ages.visSchedule=cut(s.ages.visSchedule,200));
 const g=s.site&&"object"==typeof s.site?s.site:{},y=g.yr&&"object"==typeof g.yr?g.yr:{};
 s.site={name:cut(g.name,80),cur:null==g.cur||""===g.cur?null:clamp(N(g.cur),0,10),dice:clamp(N(g.dice),0,20),latent:[-3,0,3].includes(N(g.latent))?N(g.latent):0,
  tethers:(Array.isArray(g.tethers)?g.tethers:[]).filter(t=>t&&TETHER_T[t.t]).slice(0,20).map(t=>({t:t.t,x:clamp(N(t.x),0,999),v:clamp(N(t.v),0,5),n:cut(t.n,80)})),
  regio:(Array.isArray(g.regio)?g.regio:[]).map(N).filter(v=>v>=0&&v<=10).filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>a-b).slice(0,11),
  yr:{fs:{Magic:!!(y.fs&&y.fs.Magic),Faerie:!!(y.fs&&y.fs.Faerie),Divine:!!(y.fs&&y.fs.Divine),Infernal:!!(y.fs&&y.fs.Infernal)},act:["","spring","summer","autumn"].includes(y.act)?y.act:"",bb:clamp(N(y.bb),0,20),db:clamp(N(y.db),0,20),vx:clamp(N(y.vx),0,40),ex:clamp(N(y.ex),0,40)},
  log:(Array.isArray(g.log)?g.log:[]).filter(l=>l&&"object"==typeof l).slice(-12).map(l=>({y:cut(l.y,20),t:cut(l.t,300)}))};
 s.visStore=[10,20,100].includes(N(s.visStore))?N(s.visStore):10;
 return s;
}
{const m=migrate;migrate=function(){return f975San(m.apply(this,arguments))};const b=blankState;blankState=function(){return f975San(b.apply(this,arguments))};f975San(st)}
Object.assign(XDEF,{rsRealm:"",rsFrom:"same",rsCur:0,rsNext:3,rsLost:!1,feNarrow:!1,ceRating:3,crTemp:0,crDom:3,crSacr:"",crRite:!1,faeMight:25,faeMight2:0,empL:50,divMight:20,visKind:"",visDedTe:"",visDedFo:"",infAligned:!1,celest975:0,yrRe:0,yrLat:0});

/* ---------------------------------------------------------------- aura options in Play (Modifiers) */
const A975=()=>{const a=P().aura;a.v975&&"object"==typeof a.v975||(a.v975={});return a.v975};
const TIME_D=[["night","Night","−1"],["holy","Sunday or a holy day","+1"]];
const INF_DAY=[["","An ordinary day"],["holyweek","Wednesday to Good Friday of Holy Week (Christian lands) +1"],["shabbat","The Shabbat, kept by the whole Jewish community −1"],["easter","Good Friday dusk to Easter Monday: 0"],["qadr","The Night of Destiny, until dawn: 0"],["ramadan","The rest of Ramadan after the Night of Destiny −2"]];
function timeEff(realm,base,t){
 base=N(base);
 if("Divine"===realm)return clamp(base-(t.night?1:0)+(t.holy?1:0),0,10);
 if("Infernal"===realm){if("easter"===t.day||"qadr"===t.day)return 0;return clamp(base+(t.night?1:0)+("holyweek"===t.day?1:0)+("shabbat"===t.day?-1:0)+("ramadan"===t.day?-2:0)+(t.interdict?1:0),0,10)}
 return base;
}
function timeSync(){const a=P().aura,t=a.t975;if(!t)return;if(t.realm!==a.realm||N(a.lvl)!==N(t.exp))delete a.t975}
function timeSet(k,v){
 timeSync();const a=P().aura,t=a.t975||{realm:a.realm,base:N(a.lvl)};t[k]=v;
 const any=t.night||t.holy||t.interdict||t.day;
 if(!any){a.lvl=t.base;delete a.t975;return}
 a.lvl=timeEff(a.realm,t.base,t);t.exp=a.lvl;a.t975=t;
}
function auraMods975(){
 timeSync();const v=A975(),a=P().aura,lvl=N(a.lvl),t=a.t975||{};let h="";
 if("Divine"===a.realm||"Infernal"===a.realm){
  const base=null!=t.base?t.base:lvl,I="Infernal"===a.realm;
  h+=`<div class="fields f975-time">${(I?[["night","Night","+1"]]:TIME_D).map(([k,l,d])=>`<label class="chk"><input type="checkbox" data-f975in="time.${k}"${t[k]?" checked":""}>${l} (${d})</label>`).join("")}
  ${I?`<label class="f"><span>Day</span>${selF("time.day",t.day||"",INF_DAY)}</label><label class="chk"><input type="checkbox" data-f975in="time.interdict"${t.interdict?" checked":""}>Under an Interdict (+1)</label>`:""}</div>
  <p class="note">${a.t975?`Base strength ${base}, now ${lvl}. `:""}${I?"Infernal auras rise by one at night and on unholy nights, never above 10. On Good Friday they fall to 0 and regain strength evenly over the week after Easter Monday; after the Night of Destiny they stay 2 lower until the end of Ramadan (RoP:I pp. 10–11; DE p. 415).":"The Dominion is one weaker at night and one stronger on Sundays and holy days (RoP:D p. 10; DE p. 418)."} Changing the strength by hand clears the time of day.</p>`;
 }
 if("Magic"===a.realm&&bookOn("RoP:M")){
  const al=v.align||"",opts=[["","Not aligned"]].concat(ARTS.map(([k,n])=>[k,`Aligned with ${n}`]),[["emo","Enhances an emotion (a Personality Trait)"],["Healing","Healing"],["Luck","Luck"],["Distracting","Distracting"]]);
  h+=`<div class="fields"><label class="f"><span>Aligned aura</span>${selF("align",al,opts)}</label>${"emo"===al?`<label class="f"><span>The Trait it enhances</span><input type="text" data-f975in="trait" value="${H(v.trait||"")}" placeholder="e.g. Fearful, Aggressive"></label>`:""}</div>`;
  const AN={"":"",emo:`Everyone without a Magic supernatural ability (such as The Gift) gains or adds to ${v.trait?H(v.trait):"the Trait"} by ${lvl>=7?3:lvl>=4?2:lvl>=1?1:0} after a few minutes here (aura 1–3 +1, 4–6 +2, 7–10 +3); it fades within minutes of leaving, and cannot change an Essential Trait (RoP:M p. 15).`,
   Healing:`Recovery rolls add half the aura, rounded up (+${Math.ceil(lvl/2)}) (RoP:M p. 16).`,
   Luck:`Rolls where luck matters most gain +${lvl>=9?3:lvl>=5?2:1}, for everyone in the aura (RoP:M p. 16). Offered as a choice on each roll.`,
   Distracting:`Concentration is needed more often${lvl>=5?", and its Ease Factors are 3 higher":""} (aura 5 or more) (RoP:M p. 16).`};
  ART_BY_ABBR[al]?h+=`<p class="note">Spells and lab work using ${ART_BY_ABBR[al]} add the aura again (it counts double); a creature whose Might is of that Form pays one Might point less for a power that costs more than 0. Opposed Arts are not penalized (RoP:M p. 16). Up to aura 5 such auras are safe to live in (p. 15).</p>`:AN[al]&&(h+=`<p class="note">${AN[al]}</p>`);
 }
 if("Infernal"===a.realm&&bookOn("RoP:I")){
  h+=`<div class="fields"><label class="f"><span>Corrupted aura</span>${selF("kind",v.kind||"",[["","Not corrupted"],["Debauched","Debauched (self-indulgence)"],["Malevolent","Malevolent (violence, cruelty)"],["Perfidious","Perfidious (deceit, betrayal)"]])}</label>
  ${a.regio?`<label class="f"><span>Infernal regio</span>${selF("rkind",v.rkind||"",[["","Not Tartaran or Abyssal"],["Tartaran","Tartaran (hellfire)"],["Abyssal","Abyssal (privation)"]])}</label>`:""}</div>`;
  const L=[];
  const tn=XP().tarName;tn&&L.push(`Tarnished with ${H(tn)} (set on the Realms tab): Personality Traits here shift toward it by the aura’s strength, and indulging it is a ritual of that sin, a Warping Point and a Confidence Point (RoP:I p. 13).`);
  "Debauched"===v.kind&&L.push(`Debauched: Confidence Points cannot be spent here; leaving needs a Personality roll against the tarnish of 3 + aura (${3+lvl}); one who indulged wants to return (6 + aura, ${6+lvl}) and takes a permanent shift of 1 toward the tarnish (RoP:I p. 14).`);
  "Malevolent"===v.kind&&L.push(`Malevolent: +${lvl} to every Damage total; physical activities roll ${lvl} more botch dice, and a botch wounds (Light, double botch Medium, and so on); old wounds from Infernal beings reopen (RoP:I p. 15).`);
  "Perfidious"===v.kind&&L.push(`Perfidious: add ${lvl} to the Ease Factor of any attempt to spot a lie; Infernal beings gain a temporary Confidence Point on entering; failing a roll with Confidence here loses all Confidence Points and stuns for one round per 2 points lost (RoP:I pp. 15–16).`);
  v.kind&&lvl<3&&L.push("A corrupted aura is always strength 3 or more (RoP:I p. 14).");
  a.regio&&L.push(`Infernal regio: Divine powers are suspended except miracles; holy powers and holy magic suffer –${lvl} despite the usual realm interaction (RoP:I p. 16).`);
  "Tartaran"===v.rkind&&L.push("Tartaran: all Fatigue is long-term until you leave; carried metal burns as Heat of the Searing Forge; hellfire does +5 to +35, more by the sum of your sinful Personality Traits (RoP:I p. 16).");
  "Abyssal"===v.rkind&&L.push(`Abyssal: every Characteristic is ${lvl} lower while here, and each day an Intelligence roll against ${lvl} or a temporary Flaw of madness (permanent on a botch) (RoP:I p. 17).`);
  L.push(`Recovery from wounds and disease here is ${lvl} lower, and diseases never improve; at least one later Recovery roll is penalized too (RoP:I p. 12). A magus who casts and loses Fatigue to the aura notices only with Perception + Magic Theory against ${9+lvl} (p. 13).`);
  tfX()>=1&&L.push("True Faith: immune to the tarnish and to the corrupted and regio effects, though not to the general effects (RoP:I p. 13).");
  h+=`<ul class="rnotes">${L.map(x=>`<li>${x}</li>`).join("")}</ul>`;
 }
 if("Divine"===a.realm&&bookOn("RoP:D")&&a.regio){
  h+=`<p class="note">A Divine regio: celestial regiones overwhelm mortals (Realms tab › Regiones). The penalty, once overwhelmed, applies to every roll until you leave (RoP:D pp. 14–15).</p>`;
 }
 if("Faerie"===a.realm&&bookOn("RoP:F")){
  h+=`<p class="note">Faerie auras rise and fall with how well the place suits the presiding faerie’s glamour, and with the time and season of its story (DE p. 417; RoP:F p. 15). Change the strength by hand.</p>`;
 }
 return h?`<fieldset class="f975-aura"><legend>This aura</legend>${h}</fieldset>`:"";
}
{const MA=modAura;modAura=function(){const h=MA.apply(this,arguments);try{return h+auraMods975()}catch(z){console.error(z);return h}}}

/* ---------------------------------------------------------------- vis spent in a casting */
function visSpend(){const p=P();return p.fast?0:N(p.visTe)+N(p.visFo)}
{const MS=modSpell;modSpell=function(){
 const h=MS.apply(this,arguments);
 try{
  const x=XP(),k=x.visKind||"",opts=VIS_KINDS.filter(q=>vkShown(q,k)).map(q=>[q[0],q[1]]);
  let f=`<label class="f"><span>Kind of vis spent</span>${sel2("x.visKind",opts)}</label>`;
  "dedicated"===k&&(f+=`<label class="f"><span>Dedicated to</span>${sel2("x.visDedTe",[["","Technique…"]].concat(TE.map(([a,n])=>[a,n])))}</label><label class="f"><span>and</span>${sel2("x.visDedFo",[["","Form…"]].concat(FO.map(([a,n])=>[a,n])))}</label>`);
  /^(infernal|infesta|sordida|prava)$/.test(k)&&(f+=chk("x.infAligned","The caster is aligned with the Infernal (no ill effects)"));
  return h+`<fieldset class="f975-vis"><legend>Vis</legend><div class="fields">${f}</div>${k&&VIS_NOTE[k]?`<p class="note">${VIS_NOTE[k]}</p>`:""}</fieldset>`;
 }catch(z){console.error(z);return h}
}}
function applyVisKind(id,c){
 if(!("spell"===c.kind||"spont"===c.kind))return;
 const x=XP(),k=x.visKind||"",e=visSpend();if(!k||!e)return;
 const isB=l=>/^(Extra vis boost|Vis boost)/.test(l.l),ar=c.score.some(isB)?"score":"post",bi=c[ar].findIndex(isB),ni=c.nbLines.findIndex(l=>/^Vis used/.test(l.l));
 const setBoost=(per,why,ref)=>{if(bi<0)return;const L=c[ar].slice();L[bi]=Object.assign({},L[bi],{l:`${L[bi].l.replace(/ × 2.*$/,"")} × ${per} (${why})`,v:per*e,ref});c[ar]=L};
 const addBotch=(n,why,ref)=>{if(!n)return;c.nb+=n;c.nbLines=c.nbLines.concat([{l:why,v:n,ref}])};
 const note=t=>c.notes=(c.notes||[]).concat([{l:"Vis",t}]);
 const al=!!x.infAligned;
 if("dedicated"===k){const te=x.visDedTe,fo=x.visDedFo;
  if(te&&fo&&c.te===te&&c.fo===fo){setBoost(4,"dedicated vis","RoP:M p. 122");addBotch(e,"Dedicated vis counts double for botch dice","RoP:M p. 122");c.ritual&&note("Dedicated vis of this pair counts as two pawns toward the Ritual’s vis (RoP:M p. 122).")}
  else note(te&&fo?`Dedicated ${ART_BY_ABBR[te]} ${ART_BY_ABBR[fo]} vis helps this spell only as ordinary vis (RoP:M p. 122).`:"Choose the Technique and Form the vis is dedicated to.");
 }else if("infernal"===k){al||addBotch(e,"Infernally tainted vis: twice the botch dice","DE p. 422")}
 else if("infesta"===k){al?note("Infernally aligned: vis infesta has no ill effects (RoP:I p. 18)."):(opt("visInfestaRoP",!1)?note("Vis infesta: no extra botch dice, but any botch is severe and perilous (RoP:I p. 18)."):(addBotch(e,"Vis infesta: twice the botch dice (DE; Settings › Optional rules)","DE p. 422"),note("A botch with vis infesta is severe and perilous (RoP:I p. 18).")))}
 else if("sordida"===k){if(al)note("Infernally aligned: vis sordida works as ordinary vis (RoP:I p. 19).");else{setBoost(5,"vis sordida","RoP:I p. 19");addBotch(2*e,"Vis sordida: three botch dice a pawn","RoP:I p. 19");c.minBotch=Math.max(N(c.minBotch),e);c.die="stress";note("Never fewer botch dice than pawns of vis sordida; a botch is severe (RoP:I p. 19).")}}
 else if("prava"===k){if(al){setBoost(5,"vis prava, infernally aligned","RoP:I p. 19")}else{setBoost(0,"vis prava: the roll is a zero","RoP:I p. 19");addBotch(e,"Vis prava: two botch dice a pawn","RoP:I p. 19");c.minBotch=Math.max(N(c.minBotch),e);c.die="stress";c.forceZero=!0;note("Any roll using vis prava counts as a zero: only the botch dice are rolled (RoP:I p. 19).")}}
 else if("abstract"===k){setBoost(0,"abstract vis holds no vis","RoP:F p. 19");ni>=0&&(c.nb=Math.max(0,c.nb-e),c.nbLines=c.nbLines.filter((l,i)=>i!==ni));note(VIS_NOTE.abstract)}
 else VIS_NOTE[k]&&note(VIS_NOTE[k]);
 c.ritual&&/^(infesta|sordida|prava|dedicated|infernal)$/.test(k)&&note("The kind applies to the extra vis entered here; the Ritual’s own vis is counted as ordinary.");
}
/* a roll that counts as a zero (vis prava): only the botch dice are rolled */
{const DR=doRoll;doRoll=function(e){
 if(!e||!e.forceZero)return DR.apply(this,arguments);
 const RD=rollDie;rollDie=function(k,nb){if(/^stress/.test(k)){const s="stress-nb"===k?0:Math.max(0,0|nb),n=[];for(let i=0;i<s;i++)n.push(d10());const o=n.filter(v=>0===v).length;return{kind:k,faces:[0],value:0,zero:!0,botchDice:n,botches:o,botch:o>0}}return RD.apply(this,arguments)};
 try{return DR.apply(this,arguments)}finally{rollDie=RD}
}}
{const CO=checkOdds;checkOdds=function(e){const r=CO.apply(this,arguments);try{if(e&&e.forceZero&&r){r.pB=1-Math.pow(.9,N(r.parts&&r.parts.nb));r.p=0}}catch(z){}return r}}

/* ---------------------------------------------------------------- aura effects on rolls */
function applyAura(id,c){
 const a=P().aura,lvl=N(a.lvl),v=a.v975||{};if(!a.realm||"None"===a.realm||!lvl)return;
 const noteC=(l,t)=>c.notes=(c.notes||[]).concat([{l,t}]);
 if("Magic"===a.realm&&bookOn("RoP:M")){
  if(ART_BY_ABBR[v.align]&&("spell"===c.kind||"spont"===c.kind)&&(c.te===v.align||c.fo===v.align)&&!("function"==typeof holyCasting&&holyCasting()))
   c.post=c.post.concat([{l:`Aura aligned with ${ART_BY_ABBR[v.align]}: counts double`,v:lvl,ref:"RoP:M p. 16"}]);
  "Healing"===v.align&&/^rec:/.test(id)&&(c.post=c.post.concat([{l:`Healing aura: half the aura, rounded up`,v:Math.ceil(lvl/2),ref:"RoP:M p. 16"}]));
  "Luck"===v.align&&c.die&&"none"!==c.die&&(c.toggles=(c.toggles||[]).concat([{key:"t975:luck",l:`Lucky aura +${lvl>=9?3:lvl>=5?2:1}`,v:lvl>=9?3:lvl>=5?2:1,cond:"luck plays a large part in the outcome",ref:"RoP:M p. 16"}]));
  "Distracting"===v.align&&"conc"===id&&lvl>=5&&null!=c.ef&&(c.ef=N(c.ef)+3,noteC("Distracting aura","Concentration Ease Factors are 3 higher in a distracting aura of 5 or more (RoP:M p. 16)."));
 }
 if("Infernal"===a.realm&&bookOn("RoP:I")){
  /^rec:/.test(id)&&(c.post=c.post.concat([{l:`Infernal aura: wounds fester`,v:-lvl,ref:"RoP:I p. 12"}]));
  if(tfX()<1){
   "Debauched"===v.kind&&c.conf&&(c.conf=!1,noteC("Debauched aura","Confidence Points cannot be spent in this aura (RoP:I p. 14)."));
   "Malevolent"===v.kind&&(/^(char:(Str|Sta|Dex|Qik)|abil:\d+)$/.test(id)&&c.die&&"none"!==c.die&&(c.toggles=(c.toggles||[]).concat([{key:"t975:malev",l:"Physical activity in a Malevolent aura",v:0,b:lvl,cond:`+${lvl} botch dice; a botch wounds`,ref:"RoP:I p. 15"}])),/^w:\d+:attack$/.test(id)&&noteC("Malevolent aura",`Add ${lvl} to the Damage total (RoP:I p. 15).`));
   if(a.regio&&"Abyssal"===v.rkind){const names=CHARS.map(q=>q[1]);(c.score||[]).filter(s=>names.includes(s.l)).forEach(s=>c.post=c.post.concat([{l:`Abyssal regio: ${s.l} –${lvl}`,v:-lvl,ref:"RoP:I p. 17"}]))}
  }
  a.regio&&("r:holy"===id||("spell"===c.kind||"spont"===c.kind)&&"function"==typeof holyCasting&&holyCasting())&&(c.post=c.post.concat([{l:"Infernal regio: holy powers suffer the aura",v:-lvl,ref:"RoP:I p. 16"}]));
 }
}
function applyCelest(id,c){const r=N(XP().celest975);r>0&&c.die&&"none"!==c.die&&!/^r975:/.test(id)&&(c.post=c.post.concat([{l:`Overwhelmed in a celestial regio (rating ${r} × 3)`,v:-3*r,ref:"RoP:D p. 15"}]))}

/* ---------------------------------------------------------------- new rolls */
function sightAbility(realm){
 const fae="Faerie"===realm&&bookOn("RoP:F")&&opt("faeRegioAware",!0);
 if(fae){const ok=["Faerie Sight","Second Sight","Magic Sensitivity"].some(n=>has(st,n)||ablScore(st,n)>0);return ok?{n:"Awareness",v:ablScore(st,"Awareness"),ref:"RoP:F p. 16",fae:!0}:null}
 const L=["Second Sight","Magic Sensitivity"];("Divine"===realm||"Infernal"===realm)&&L.push("Sense Holiness and Unholiness");
 return L.map(n=>({n,v:ablScore(st,n),ref:"DE p. 421",own:has(st,n)||ablScore(st,n)>0})).filter(q=>q.own).sort((p,q)=>q.v-p.v)[0]||null;
}
function rsRealm(){const x=XP();return x.rsRealm||("None"!==P().aura.realm&&P().aura.realm)||"Magic"}
function regioSightCheck(id){
 const x=XP(),c=charEff(st),realm=rsRealm(),ab=sightAbility(realm),cur=N(x.rsCur),nxt=N(x.rsNext),same="same"===x.rsFrom;
 const ef=5+2*(same?Math.abs(nxt-cur):cur+nxt);
 const t=`Regio sight: ${realm}`;
 if(!ab&&!x.rsLost)return mkCheck({id,title:t,blocked:"Seeing into a regio needs Second Sight or Magic Sensitivity, or Sense Holiness and Unholiness for Divine and Infernal regiones (DE p. 421)"+("Faerie"===realm&&bookOn("RoP:F")&&opt("faeRegioAware",!0)?"; for a faerie regio, Faerie Sight, Second Sight or Magic Sensitivity (RoP:F p. 16)":"")+". Tick “Lost near the boundary” to roll with a score of 0."});
 const score=[{l:"Perception",v:c.Per,ref:"DE p. 421"},ab?{l:ab.n,v:ab.v,ref:ab.ref}:{l:"No sight Ability (lost: counts as 0)",v:0,ref:"DE p. 421"}];
 const bb=baseBotch();
 return mkCheck({id,title:t,sub:same?`From level ${cur} to level ${nxt}`:`From a different aura of ${cur} into a level of ${nxt}`,formula:"Perception + sight Ability + stress die",score,post:post(),blocked:condPen().blocked,die:"stress",nb:bb.nb,nbLines:bb.lines,ef,efLabel:same?`5 + 2 × difference ${Math.abs(nxt-cur)}`:`5 + 2 × (${cur} + ${nxt})`,kind:"generic",conf:!0,
  notes:[{l:"Ways in",t:"Any native of a regio affiliated to its realm can lead anyone to any level; a magus living in a Magic regio counts as native. Some regiones open only by a path or ritual, which may still need this roll (DE pp. 420–421)."},
   {l:"Magic in regiones",t:"A regio level’s aura modifies powers as any aura; a power of another realm rolls twice the botch dice (DE p. 422). Set the aura and the regio box under Modifiers."}],
  outcome:t=>t>=ef?{cls:"ok",head:"You see the next level",text:`Total ${fmtN(t)} against ${ef}: you can step into it, and lead any number of people with you (DE p. 421).`}:{cls:"fail",head:"The next level stays hidden",text:`Total ${fmtN(t)} against ${ef}. Particular days or deeds can change the Ease Factor greatly (DE p. 421).`}});
}
function faeActionCheck(id){
 const x=XP(),c=charEff(st),ef=x.feNarrow?3:15;
 return mkCheck({id,title:"Faerie regio: guess the way in",sub:x.feNarrow?"The story narrows the choice":"From the faeries’ motif",formula:"Intelligence + Faerie Lore",score:[{l:"Intelligence",v:c.Int,ref:"RoP:F p. 16"},{l:"Faerie Lore",v:ablScore(st,"Faerie Lore"),ref:"RoP:F p. 16"}],post:post(),blocked:condPen().blocked,
  die:P().stressed?"stress":"simple",nb:baseBotch().nb,nbLines:baseBotch().lines,ef,efLabel:x.feNarrow?"A choice the story offers":"Ease Factor",kind:"generic",conf:!0,
  notes:[{l:"Rule",t:"A character who has found an entrance but not the action that opens it guesses it from the local faeries’ motif. A True Love inside always finds the entrance; an Arcane Connection followed with the right sense finds it too, but not the action (RoP:F p. 16)."}],
  outcome:t=>t>=ef?{cls:"ok",head:"The right action",text:`Total ${fmtN(t)} against ${ef} (RoP:F p. 16).`}:{cls:"fail",head:"A wrong guess",text:`Total ${fmtN(t)} against ${ef}. A wrong choice may cast the character out (RoP:F p. 16).`}});
}
function celestCheck(id){
 const x=XP(),c=charEff(st),r=clamp(N(x.ceRating),1,10),dl=ablScore(st,"Dominion Lore"),pm=ablScore(st,"Parma Magica"),use=pm>dl?{l:"Parma Magica (higher than Dominion Lore)",v:pm}:{l:"Dominion Lore",v:dl},ef=3*r,bb=baseBotch();
 return mkCheck({id,title:"Celestial disorientation",sub:`A celestial regio of rating ${r}`,formula:"Stamina + Dominion Lore (or Parma Magica) + stress die",score:[{l:"Stamina",v:c.Sta,ref:"RoP:D p. 14"},Object.assign(use,{ref:"RoP:D p. 14"})],post:post(),blocked:condPen().blocked,
  die:"stress",nb:bb.nb,nbLines:bb.lines,ef,efLabel:`Rating ${r} × 3`,kind:"generic",conf:!0,
  notes:[{l:"Faith",t:"A character with Faith Points may spend one to ignore the disorientation altogether (RoP:D p. 15)."},
   {l:"Exposure",t:`After Stamina + Parma Magica + 3 = ${c.Sta+pm+3} hours (days with True Faith) a mortal loses a Fatigue level an hour; once unconscious, Warping Points at the rating each hour, which may start the Divine Ascent (RoP:D p. 15).`}],
  outcome:t=>t>=ef?{cls:"ok",head:"You keep your senses",text:`Total ${fmtN(t)} against ${ef}: you act without penalty, though the sensations remain (RoP:D p. 15).`}:{cls:"fail",head:"Bewildered and overwhelmed",text:`Total ${fmtN(t)} against ${ef}: –${3*r} to every roll until you leave (RoP:D p. 15).`,actions:[{l:`Apply –${3*r} until you leave`,act:"f975celest",n:r}]}});
}
const SACR975=[["","No sacrifice"],["2","Effigy +2"],["4","An animal +4"],["6","A black animal +6"],["8","A human +8"],["10","An innocent human +10"]];
function corruptCheck(id){
 const x=XP(),tmp=clamp(N(x.crTemp),0,10),dom=clamp(N(x.crDom),0,10),sac=N(x.crSacr),keep=3+dom,up=6+dom;
 const p=post().concat(sac?[{l:"Sacrifice in the corruption rite",v:sac,ref:"RoP:I pp. 12, 95"}]:[]);
 return mkCheck({id,title:"Corruption roll",sub:"After a mortal sin in the place",formula:"stress die + temporary Infernal aura",score:[{l:"Temporary Infernal aura (0 if none, or if it is the strongest)",v:tmp,ref:"RoP:I p. 11"}],post:p,
  die:"stress-nb",nb:0,ef:keep,efLabel:`3 + strongest aura ${dom} (to maintain); ${up} to increase`,kind:"generic",conf:!!x.crRite,
  notes:[{l:"Ease Factors",t:`The strongest aura in the place, even an Infernal one, adds to both: ${keep} to maintain a temporary Infernal aura, ${up} to raise it by one or create one of 1. The book’s example counts a roll equal to the Ease Factor as a success (RoP:I pp. 11–12).`},
   {l:"Corruption rites",t:"An infernalist with Infernal Lore 2 may learn rites that formalize the sin; the trappings change nothing, but he may add Confidence and a sacrifice’s bonus, at most one successful rite a season (RoP:I p. 12)."}],
  outcome:t=>t>=up?{cls:"ok",head:"The Infernal aura rises by 1",text:`Total ${fmtN(t)} reaches ${up}: a new aura of 1, or +1 to the present one. If that makes it the strongest it replaces the old aura; otherwise it erodes as a temporary aura (RoP:I p. 12).`}
   :t>=keep?{cls:"part",head:"The aura is maintained",text:`Total ${fmtN(t)} reaches ${keep}: a temporary Infernal aura inside a stronger one restarts its erosion clock. With no Infernal aura, or a dominant one, this has no effect (RoP:I p. 12).`}
   :{cls:"fail",head:"No effect",text:`Total ${fmtN(t)} is below ${keep}.`}});
}
function domRiteCheck(id){
 const c=charEff(st),th=ablScore(st,"Theology"),dl=ablScore(st,"Dominion Lore"),use=dl>th?{l:"Dominion Lore",v:dl}:{l:"Theology",v:th},bb=baseBotch();
 const soc=["Priest","Rabbi","’Alim","'Alim","Alim","Clerk","Monk","Mendicant Friar"].filter(n=>has(st,n));
 if(use.v<2)return mkCheck({id,title:"Dominion rite",blocked:"The celebrant needs Theology or Dominion Lore 2 or more, and a Social Virtue such as Priest, Rabbi or ’Alim (RoP:D p. 11)."});
 return mkCheck({id,title:"Dominion rite",sub:"Consecrate a place, or let the Dominion in",formula:"Communication + Theology (or Dominion Lore) + stress die",score:[{l:"Communication",v:c.Com,ref:"RoP:D p. 11"},Object.assign(use,{ref:"RoP:D p. 11"})],post:post(),blocked:condPen().blocked,
  die:"stress",nb:bb.nb,nbLines:bb.lines,ef:6,kind:"generic",conf:!0,
  notes:[{l:"Needs",t:`A celebrant with a fitting Social Virtue (${soc.length?soc.join(", ")+" on this sheet":"none found on this sheet: Priest, Rabbi or ’Alim, for instance"}), a consecrated altar (or Torah scrolls and lamp, or recitation of the Qur’an) and a congregation of at least ten (RoP:D p. 11).`},
   {l:"Two rites",t:"The first successful rite consecrates the place; a second lets the Dominion in. It begins at 3, rises to 4 after a year of weekly worship, and to 5 after a decade for a large and significant church; dwellings take 3, workplaces 2 or 1. When worship stops it fades over as long as it was kept (RoP:D pp. 11–12)."}],
  outcome:t=>t>=6?{cls:"ok",head:"The rite is performed",text:`Total ${fmtN(t)} against 6 (RoP:D p. 11).`}:{cls:"fail",head:"The rite fails",text:`Total ${fmtN(t)} against 6. A botch may bring Warping, Divine displeasure, or the notice of Infernal beings (RoP:D p. 12).`}});
}

/* ---------------------------------------------------------------- the covenant aura (RoP:M pp. 8-14) */
const S=()=>st.site;
function siteBase(){const T=S().tethers.map(t=>({k:TETHER_T[t.t][0],v:tetherScore(t)})).filter(t=>t.v>0);
 const nat=Math.min(5,T.filter(t=>"n"===t.k).reduce((a,t)=>a+t.v,0)),pre=T.filter(t=>"p"===t.k).map(t=>t.v).sort((a,b)=>b-a),ps=pre.length?Math.min(5,pre[0]+pre.length-1):0;
 return{nat,pre:ps,base:nat+ps,n:T.length}}
const siteCur=()=>null==S().cur?siteBase().base:S().cur;
function yearMod(){
 const s=S(),y=s.yr,b=siteBase().base,cur=siteCur(),L=[],each=opt("auraBotchEach",!1);
 b!==cur&&L.push([`Base ${b} vs current ${cur}: 3 × (base – current)`,3*(b-cur)]);
 [["Magic",2],["Faerie",1],["Divine",-6],["Infernal",-2]].forEach(([r,v])=>y.fs[r]&&L.push([`A stronger ${r} aura impinges`,v]));
 y.act&&L.push([{spring:"Labwork and spellcasting of a typical Spring covenant",summer:"… of a typical Summer covenant",autumn:"… of a typical Autumn or Winter covenant"}[y.act],{spring:1,summer:2,autumn:3}[y.act]]);
 y.bb&&L.push([`Beneficial magical botch${each&&y.bb>1?`es (${y.bb})`:""}`,each?y.bb:1]);
 y.db&&L.push([`Detrimental magical botch${each&&y.db>1?`es (${y.db})`:""}`,each?-y.db:-1]);
 y.vx&&L.push([`Vis spent in study, spellcasting or certamen, 3+ pawns (${y.vx})`,y.vx]);
 y.ex&&L.push([`Vis extracted from the aura (${y.ex} season${1===y.ex?"":"s"})`,-y.ex]);
 s.latent&&L.push(["Latent change from last year",s.latent]);
 const raw=L.reduce((a,l)=>a+l[1],0);return{L,raw,mod:clamp(raw,-9,9)};
}
const STRONG=[[0,"No change to the aura."],[7,"Symptoms of a strengthening aura are noticed."],[9,"Latent strengthening: +3 to next year’s modifier."],[10,"Spontaneous magic effects; anyone they target gains a Warping Point; spontaneous spells gain up to +3."],[11,"The aura is 1 stronger for one season."],[12,"Vis creation: 1 to 3 pawns appear in the aura (real and permanent)."],[13,"A patch of the aura (a chamber, a laboratory) is 1 stronger; mundane residents there gain a Warping Point."],[14,"The aura expands by several yards (permanent)."],[15,"The current aura score rises by 1 (permanent)."],[21,"Roll twice more on this table, counting 21 or more as 20."]];
const WEAK=[[0,"No change to the aura."],[7,"Symptoms of a weakening aura are noticed."],[9,"Latent weakening: –3 to next year’s modifier."],[10,"Spontaneous magic is stifled: up to –3 to spontaneous spells."],[11,"The aura is 1 weaker for one season."],[12,"Vis wasting: 1 to 3 pawns in the aura lose their power (permanent)."],[13,"A patch of the aura (a chamber, a laboratory) is 1 weaker."],[14,"The aura contracts by several yards (permanent)."],[15,"The current aura score falls by 1 (permanent)."],[21,"Roll twice more on this table, counting 21 or more as 20."]];
const tableRow=(T,t)=>{let r=T[0];for(const q of T)t>=q[0]&&(r=q);return r};
function yearCheck(id){
 const s=S(),ym=yearMod(),m=ym.mod,up=m>0,dice=s.dice,x=XP();
 if(Math.abs(m)<4)return mkCheck({id,title:"The covenant aura: this year",blocked:`Yearly modifier ${sgnN(m)}: between –3 and +3 the aura is stable and no roll is made (RoP:M p. 11). Close the year below.`});
 return mkCheck({id,title:`The covenant aura: ${up?"strengthening":"weakening"}`,sub:`Yearly modifier ${sgnN(m)}${x.yrRe>0?` · ${x.yrRe} more roll${1===x.yrRe?"":"s"}, 21+ counts as 20`:""}`,formula:"stress die + the yearly modifier (ignoring its sign)",
  score:[{l:`Yearly aura modifier${up?"":" (sign ignored)"}`,v:Math.abs(m),ref:"RoP:M p. 11"}],post:[],die:"stress",nb:dice,nbLines:dice?[{l:"Aura botch dice (+1 after each roll of 9 or more, –1 after a year with no roll)",v:dice,ref:"RoP:M p. 11"}]:[],ef:null,efMode:"none",kind:"generic",conf:!1,
  notes:[{l:"Table",t:`${up?"Aura Strengthening":"Aura Weakening"} Table: unless stated, an outcome lasts at most a year. With a regio, the change applies to the top level only (RoP:M p. 11).`}],
  outcome:(t,l)=>{
   if(l&&l.botch)return{cls:"botch",head:up?"A regio level appears":"A regio level disappears",text:up?"The aura becomes a regio (a mundane level and a top level at the aura score), or a new intermediate level appears. Everyone present gains 3 Warping Points; a double botch doubles them and fractures it badly (RoP:M pp. 11, 13).":"One regio level vanishes (its people drop a level); with no regio, a regio arises and the covenant retreats into its magical level, leaving the mundane level deserted. Everyone present gains 3 Warping Points (RoP:M pp. 11, 14).",
    actions:[{l:up?"Record the new regio level":"Record the lost regio level",act:"f975yr",tot:0,botch:1,dir:up?1:-1},{l:"Gain 3 Warping Points",act:"f975warp",n:3}]};
   const T=x.yrRe>0?Math.min(t,20):t,r=tableRow(up?STRONG:WEAK,T);
   if(21===r[0])return{cls:"ok",head:`Total ${fmtN(t)}`,text:r[1]+" (RoP:M p. 11)",actions:[{l:"Roll the two extra rolls",act:"f975re"}]};
   return{cls:T>=7?"ok":"part",head:`Total ${fmtN(T)}`,text:r[1]+(T>=9?" The aura’s botch dice rise by one.":"")+" (RoP:M p. 11)",actions:[{l:"Record this and close the year",act:"f975yr",tot:T,botch:0,dir:up?1:-1}]};
  }});
}
function regioShift(d){
 const s=S(),cur=siteCur(),R=s.regio.slice();
 if(R.length>1){if(d<0){const nv=cur-1;R.includes(nv)?R.pop():R[R.length-1]=Math.max(0,nv)}else R[R.length-1]=Math.min(10,cur+1);s.regio=R;s.cur=R[R.length-1];return}
 s.cur=clamp(cur+d,0,10);
}
function regioBotch(dir){
 const s=S(),cur=siteCur(),R=s.regio.slice();
 if(R.length<2){s.regio=[0,cur];return dir>0?`A regio forms: a mundane level and a level of ${cur}.`:`A regio forms, and the covenant retreats into its level of ${cur}.`}
 if(dir>0){if(R.length>=cur+1)return`No room for another level (at most aura + 1 = ${cur+1} levels).`;const free=[];for(let v=1;v<cur;v++)R.includes(v)||free.push(v);if(!free.length)return"No free strength for a new level.";const v=free[Math.floor(Math.random()*free.length)];R.push(v);R.sort((a,b)=>a-b);s.regio=R;return`A new level of ${v} appears (chosen at random).`}
 const k=1+Math.floor(Math.random()*(R.length-1)),gone=R[k];R.splice(k,1);s.regio=R.length>1?R:[];s.cur=R.length>1?R[R.length-1]:0;return`The level of ${gone} vanishes (chosen at random; change it by hand if the story says otherwise).`;
}
function closeYear(tot,dir,botch){
 const s=S(),ym=yearMod(),x=XP(),roll=Math.abs(ym.mod)>=4;let txt=`Modifier ${sgnN(ym.mod)}`;
 if(!roll){s.dice=Math.max(0,s.dice-1);txt+=": stable, no roll; botch dice –1."}
 else if(botch)txt+=`: botch. ${regioBotch(dir)}`;
 else{txt+=`: total ${tot}. ${tableRow(dir>0?STRONG:WEAK,tot)[1]}`;tot>=9&&s.dice++;9===tot&&(x.yrLat=dir>0?3:-3);tot>=15&&regioShift(dir)}
 s.log.push({y:cut(st.info&&st.info.year,20),t:cut(txt,300)});s.log=s.log.slice(-12);
 if(roll&&x.yrRe>0){x.yrRe--;if(x.yrRe>0)return}
 s.latent=N(x.yrLat);x.yrLat=0;
 s.yr={fs:{Magic:!1,Faerie:!1,Divine:!1,Infernal:!1},act:s.yr.act,bb:0,db:0,vx:0,ex:0};
}

/* outcome actions */
{const AA=applyAction;applyAction=function(d){
 const a=d&&d.act;if(!a||!/^f975/.test(a))return AA.apply(this,arguments);
 const x=XP();
 if("f975celest"===a)x.celest975=clamp(N(d.n),0,10);
 else if("f975warp"===a)st.status.warpPts=Math.max(0,warpPoints(st)+N(d.n));
 else if("f975yr"===a)closeYear(N(d.tot),N(d.dir)||1,N(d.botch));
 else if("f975re"===a){const s=S();s.dice++;s.log.push({y:cut(st.info&&st.info.year,20),t:"Total 21 or more: two more rolls, 21+ counting as 20; botch dice +1."});s.log=s.log.slice(-12);x.yrRe=2;P().sel="r975:year"}
 persist();
}}

/* registry and effects */
{const G=getCheck;getCheck=function(id){
 if(id&&id.startsWith("r975:")){const k=id.slice(5),f={sight:regioSightCheck,feact:faeActionCheck,celest:celestCheck,corrupt:corruptCheck,domrite:domRiteCheck,year:yearCheck}[k];if(f)return f(id)}
 const c=G.apply(this,arguments);
 if(!c||c.blocked)return c;
 try{applyVisKind(id,c);applyAura(id,c);applyCelest(id,c)}catch(z){console.error(z)}
 return c;
}}

/* ================================================================
   Realms tab panels
   ================================================================ */
const DOM_EX=[["Rural area","1"],["Town or fortification","2"],["City","3"],["Consecrated ground","3–5"],["Small church","4"],["Large church or cathedral","5"],["Site of pilgrimage or veneration","4–8"],["St Peter’s, Holy Wisdom, the Dome of the Rock, Mount Sinai","5–10"]];
const INF_EX=[["A den of iniquity","1"],["The site of a grisly murder","2"],["A crossroads where suicides are buried","3"],["A plague pit","4"],["An underground temple of a diabolic cult","5"],["The sanctum of a powerful infernalist","6"],["A site where 1,000 innocents were murdered","7"],["Aceldama, where Judas hanged himself","8"],["The Gates of Hell","9"]];
const exTable=(L,h)=>`<table class="lt f975-ex"><thead><tr><th>${h}</th><th>Aura</th></tr></thead><tbody>${L.map(([a,b])=>`<tr><td>${H(a)}</td><td class="n">${b}</td></tr>`).join("")}</tbody></table>`;
function regioPanel(){
 const x=XP(),realm=rsRealm(),F=bookOn("RoP:F"),D=bookOn("RoP:D"),ab=sightAbility(realm);
 const realms=["Magic","Faerie","Divine","Infernal"].map(r=>[r,r]);
 return`<div class="pane-h"><h3>Regiones</h3><p class="note">A regio is a stack of aura levels on one spot, rising in strength from the level joined to the mundane world. Enter by being led by a native, by seeing the next level and stepping in, by a path or ritual, or by getting lost (DE pp. 420–421).</p></div>
 <div class="card"><div class="fields"><label class="f"><span>Regio of the realm</span>${sel2("x.rsRealm",[["","Same as the aura"]].concat(realms))}</label>
  <label class="f"><span>Looking from</span>${sel2("x.rsFrom",[["same","A level of the same regio"],["other","An aura of another realm"]])}</label>
  <label class="f"><span>Current aura</span>${numIn("x.rsCur",' min="0" max="10"')}</label><label class="f"><span>Level sought</span>${numIn("x.rsNext",' min="0" max="10"')}</label>
  ${chk("x.rsLost","Lost near the boundary (no Ability counts as 0)")}</div>
  <p class="note">${ab?`Sight: Perception + ${H(ab.n)}${ab.fae?" (faerie regio, Settings › Optional rules)":""}.`:"No sight Ability on this sheet."} Ease Factor 5 + twice the difference between the levels; from an aura of another realm, add the two auras instead: a Divine 3 aura into a Magic 5 regio is 21.</p>
  <div class="acts">${rowFor("r975:sight")}</div>
  ${F?`<p class="note"><b>Faerie regiones</b> come from an affront to the presiding faerie’s glamour, or from rival faeries whose clash turns each level into an act of the story; the way in is nearly always an action, and someone who has seen it can explain it but not do it for others. Time inside follows the faerie’s story, and Faerieland’s gates count as level 10 (RoP:F pp. 16–18).</p>
   <div class="fields">${chk("x.feNarrow","The story narrows the choice (Ease Factor 3)")}</div><div class="acts">${rowFor("r975:feact")}</div>`:""}
  ${D?`<p class="note"><b>Divine regiones</b> are terrestrial (holy versions of a place, often typifying a virtue) or celestial (homes of angels, rarely entered except by invitation). Divine beings of Might 20 or more can make one: 10 Might for a level of 1, 10 more per level or point, lasting a year unless sustained each month (RoP:D pp. 13–16).</p>
   <div class="fields"><label class="f"><span>Celestial regio rating</span>${numIn("x.ceRating",' min="1" max="10"')}</label>${N(x.celest975)?btn("celest-off",`Leave the regio (clear –${3*N(x.celest975)})`):""}</div><div class="acts">${rowFor("r975:celest")}</div>`:""}
 </div>`;
}
function infernalAuraPanel(){
 const x=XP(),t=clamp(N(x.crTemp),0,10),yrs=t*(t+1)/2;
 return`<div class="pane-h"><h3>Infernal auras</h3><p class="note">Born of sin and of demons; they follow walls and doors from their focus. Only a dominant Infernal aura has supernatural effects; a weaker one inside a stronger aura loses a point every (its strength) years unless evil maintains it (RoP:I pp. 10–12).</p></div>
 <div class="card"><div class="fields"><label class="f"><span>Temporary Infernal aura</span>${numIn("x.crTemp",' min="0" max="10"')}</label><label class="f"><span>Strongest aura in the place</span>${numIn("x.crDom",' min="0" max="10"')}</label>
  <label class="f"><span>Sacrifice</span>${sel2("x.crSacr",SACR975)}</label>${chk("x.crRite","A corruption rite (Confidence may be spent)")}</div>
  <div class="acts">${rowFor("r975:corrupt")}</div>
  ${t?`<p class="note">Neglected inside a stronger aura, an Infernal aura of ${t} is gone in ${yrs} year${1===yrs?"":"s"} (${Array.from({length:t},(_,i)=>t-i).join(" + ")}) (RoP:I p. 11).</p>`:""}
  <details class="f975-ref"><summary>Example strengths (RoP:I p. 11)</summary>${exTable(INF_EX,"Place")}</details>
  <p class="note"><b>Vis:</b> vis kept a year in an Infernal aura becomes vis infesta; vis found there is vis sordida, or vis prava in an aura of 5 or more; Vim vis extracted from any Infernal aura is vis prava (RoP:I pp. 18–19). Set the kind under Build › Arts › Raw vis.</p></div>`;
}
function divineAuraPanel(){
 const x=XP(),L=N(x.empL),em=L>=50?1+Math.floor((L-50)/5):0,dm=Math.floor(N(x.divMight)/10);
 return`<div class="pane-h"><h3>The Dominion and Empyreal auras</h3><p class="note">The Dominion surrounds a community at worship and is strongest at its altar; an Empyreal aura comes from a relic, a saint, a miracle or a Divine creature. They differ only in their source (RoP:D pp. 9–12).</p></div>
 <div class="card"><div class="acts">${rowFor("r975:domrite")}</div>
  <div class="fields"><label class="f"><span>Miracle level</span>${numIn("x.empL",' min="0" max="200" step="5"')}</label><span class="note">Empyreal aura ${em} while the miracle’s effect lasts: 1 at level 50, +1 for each 5 levels more (RoP:D p. 12).</span></div>
  <div class="fields"><label class="f"><span>Divine creature’s Might</span>${numIn("x.divMight",' min="0" max="200"')}</label><span class="note">Its home gains an Empyreal aura of 1 after a season, +1 a season, up to ${dm} (Might ÷ 10) (RoP:D pp. 12–13).</span></div>
  <p class="note">A relic with more than five Faith Points raises the Dominion by one for each Faith Point over five; the Eucharist radiates a Dominion of 5, falling by one every five paces (RoP:D pp. 11–12). In an Infernal regio Divine powers are suspended, except miracles (RoP:I p. 16).</p>
  <details class="f975-ref"><summary>Dominion strengths (RoP:D p. 10)</summary>${exTable(DOM_EX,"Area")}<p class="note">At night subtract one; on holy days, Sundays among them, add one.</p></details></div>`;
}
function faerieAuraPanel(){
 const x=XP(),m1=N(x.faeMight),m2=N(x.faeMight2),one=Math.floor(m1/5),two=m2>0?Math.min(9,2+Math.floor(Math.max(m1,m2)/5)):null;
 return`<div class="pane-h"><h3>Faerie auras</h3><p class="note">A faerie with Extend Glamour that claims a place gives it an aura of its Might ÷ 5; the aura vanishes when it leaves, unless another takes the role. Stories told of a place make and strengthen auras too (RoP:F p. 14; DE p. 417).</p></div>
 <div class="card"><div class="fields"><label class="f"><span>Presiding faerie’s Might</span>${numIn("x.faeMight",' min="0" max="200"')}</label><label class="f"><span>A rival’s Might (clash)</span>${numIn("x.faeMight2",' min="0" max="200"')}</label></div>
  <p class="note">Aura ${one}${null!=two?`; while the two pour glamour over it, 2 + the higher Might ÷ 5 = ${two} (at most 9)`:""} (RoP:F p. 14). A place kept by a steward has the steward’s Might ÷ 5 (p. 16).</p>
  <p class="note"><b>Taking vis:</b> if the presiding faerie cannot stop the extraction, the aura falls by 1 for each extraction, in a hole about 300 paces across, until the faerie takes back something of equal symbolic value; a bargain avoids the loss (RoP:F p. 15).</p></div>`;
}
function sitePanel(){
 const s=S(),b=siteBase(),cur=siteCur(),ym=yearMod(),y=s.yr,each=opt("auraBotchEach",!1);
 const tRows=s.tethers.map((t,i)=>{const T=TETHER_T[t.t];return`<tr><td>${H(T[1])}${T[3]?`<small class="note"> ${T[3]}</small>`:""}</td><td>${T[2]?`${numF(`tether.${i}.x`,t.x,` min="0" max="999" aria-label="${H(T[2])}"`)}<small class="note"> ${H(T[2])}</small>`:numF(`tether.${i}.v`,t.v||1,` min="1" max="${"n"===T[0]?2:5}" aria-label="Tether score"`)}</td><td class="n">${tetherScore(t)}</td><td><input type="text" data-f975in="tether.${i}.n" value="${H(t.n)}" placeholder="What it is" aria-label="Note"></td><td><button type="button" class="xbtn" data-f975="tether-rm" data-i="${i}" aria-label="Remove tether">×</button></td></tr>`}).join("");
 const regio=s.regio.length>1?s.regio.map((v,i)=>`<span class="tag">${0===v?"Mundane 0":`Level ${v}`}${i&&i<s.regio.length-1?` <button type="button" class="xbtn" data-f975="regio-rm" data-i="${i}" aria-label="Remove level ${v}">×</button>`:""}</span>`).join(" "):'<span class="note">No regio.</span>';
 return`<div class="pane-h"><h3>The covenant aura</h3><p class="note">Track one Magic aura over the years, normally the covenant’s: base ${b.base}, now ${cur}${s.regio.length>1?`, a regio of ${s.regio.length} levels`:""}. Tethers fix its base; the yearly modifier moves it (RoP:M pp. 8–12).</p></div>
 <div class="card f975-site">
  <div class="fields"><label class="f"><span>Name</span><input type="text" data-f975in="site.name" value="${H(s.name)}" placeholder="e.g. the covenant"></label>
   <label class="f"><span>Current aura</span>${numF("site.cur",cur,' min="0" max="10"')}</label><label class="f"><span>Aura botch dice</span>${numF("site.dice",s.dice,' min="0" max="20"')}</label></div>
  <table class="lt f975-teth"><thead><tr><th>Tether</th><th>Measure</th><th>Score</th><th>Note</th><th></th></tr></thead><tbody>${tRows||'<tr><td colspan="5" class="note">No tethers: base aura 0.</td></tr>'}</tbody></table>
  <div class="fields"><label class="f"><span>Add a tether</span>${selF("tether-add","",[["","Choose…"]].concat(Object.entries(TETHER_T).map(([k,v])=>[k,`${"n"===v[0]?"Natural":"Preternatural"}: ${v[1]}`])))}</label></div>
  <p class="note">Base aura ${b.base} = natural ${b.nat} (sum of natural tethers, at most 5) + preternatural ${b.pre} (the strongest, +1 for each other, at most 5). A natural tether scores 1 or 2, a preternatural one 1 to 5. A being that leaves or dies lowers its tether by 1 a year (RoP:M pp. 8–10).</p>
  <p class="note"><b>Regio:</b> ${regio}${s.regio.length>1?"":""} A regio has at most aura + 1 levels, each of a different strength, the top one equal to the aura (RoP:M p. 13).</p>
  <h4>This year</h4>
  <div class="fields">${["Magic","Faerie","Divine","Infernal"].map(r=>`<label class="chk"><input type="checkbox" data-f975in="yr.fs.${r}"${y.fs[r]?" checked":""}>A stronger ${r} aura impinges (${{Magic:"+2",Faerie:"+1",Divine:"–6",Infernal:"–2"}[r]})</label>`).join("")}</div>
  <div class="fields"><label class="f"><span>Magical activity</span>${selF("yr.act",y.act,[["","Little or none"],["spring","A typical Spring covenant (+1)"],["summer","A typical Summer covenant (+2)"],["autumn","A typical Autumn or Winter covenant (+3)"]])}</label>
   <label class="f"><span>Beneficial magical botches</span>${numF("yr.bb",y.bb,' min="0" max="20"')}</label><label class="f"><span>Detrimental magical botches</span>${numF("yr.db",y.db,' min="0" max="20"')}</label>
   <label class="f"><span>Vis spent, 3+ pawns at a time</span>${numF("yr.vx",y.vx,' min="0" max="40"')}</label><label class="f"><span>Seasons of vis extraction</span>${numF("yr.ex",y.ex,' min="0" max="40"')}</label></div>
  <ul class="rnotes">${ym.L.map(([l,v])=>`<li>${H(l)}: ${sgnN(v)}</li>`).join("")||"<li>Nothing moves the aura this year.</li>"}<li><b>Yearly modifier ${sgnN(ym.mod)}</b>${ym.raw!==ym.mod?` (${sgnN(ym.raw)}, held to ±9)`:""}. A botch counts only when it gave 2 or more Warping Points${each?"; each one counts (optional rule)":""}. Enchanting, familiars and Longevity Rituals do not release vis into the aura (RoP:M p. 10).</li></ul>
  ${Math.abs(ym.mod)<4?`<div class="fields">${btn("year-stable",`Close a stable year (botch dice ${s.dice}${s.dice?" → "+(s.dice-1):""})`)}</div>`:`<div class="acts">${rowFor("r975:year")}</div>`}
  <div class="fields">${btn("site-use","Use this aura under Modifiers")}${s.log.length?btn("site-log-clear","Clear the log"):""}</div>
  ${s.log.length?`<ul class="rnotes f975-log">${s.log.slice().reverse().map(l=>`<li>${l.y?`<b>${H(l.y)}</b> `:""}${H(l.t)}</li>`).join("")}</ul>`:""}
  <p class="note">Spells: Feeding the Font of the Covenant (CrVi 25+ Ritual) rolls on the Strengthening table with magnitude – 5 and +1 botch die; Stratifying the Subtle Realities (CrVi 30+ Ritual, Muto) with magnitude – 6, a 2 counting as 0 and +5 botch dice; Stripping the Superfluous Realities (PeVi 30 Ritual, Muto) on the Weakening table, destroying the level on a botch. Intellego Vim level 4 discerns an aura’s alignment (RoP:M p. 14).</p>
 </div>`;
}
{const T=tabRealms;tabRealms=function(){
 let base=T.apply(this,arguments);
 try{
  let add="";const I=bookOn("RoP:I"),D=bookOn("RoP:D"),F=bookOn("RoP:F"),M=bookOn("RoP:M");
  add+=regioPanel();
  I&&(add+=infernalAuraPanel());
  D&&(add+=divineAuraPanel());
  F&&(add+=faerieAuraPanel());
  M&&(add+=sitePanel());
  add&&/^<p class="note">No Realms of Power abilities\.<\/p>$/.test(base)&&(base="");
  return base+`<div class="f975-realms">${add}</div>`;
 }catch(z){console.error(z);return base}
}}

/* ---------------------------------------------------------------- Play controls */
document.addEventListener("click",e=>{
 const b=e.target.closest&&e.target.closest("[data-f975]");if(!b||!inPlay())return;
 const k=b.dataset.f975,s=S(),x=XP();
 if("celest-off"===k)x.celest975=0;
 else if("tether-rm"===k)s.tethers.splice(+b.dataset.i,1);
 else if("regio-rm"===k){s.regio.splice(+b.dataset.i,1);s.regio.length<2&&(s.regio=[])}
 else if("year-stable"===k){closeYear(0,1,0);toast("A stable year: the aura’s botch dice fall by one (RoP:M p. 11).","ok")}
 else if("site-use"===k){const a=P().aura;a.realm="Magic";a.lvl=siteCur();a.regio=s.regio.length>1;delete a.t975;toast(`Aura set to Magic ${a.lvl}.`,"ok")}
 else if("site-log-clear"===k)s.log=[];
 else return;
 e.preventDefault();persist();renderPlay();
});
document.addEventListener("change",e=>{
 const i=e.target;if(!i||!inPlay()||!i.dataset||!i.dataset.f975in)return;
 const k=i.dataset.f975in,s=S(),v=A975(),val="checkbox"===i.type?!!i.checked:i.value;
 let m;
 if(/^time\./.test(k))timeSet(k.slice(5),"day"===k.slice(5)?(INF_DAY.some(d=>d[0]===val)?val:""):!!val);
 else if("align"===k)v.align=ART_BY_ABBR[val]||["emo","Healing","Luck","Distracting"].includes(val)?val:"";
 else if("trait"===k)v.trait=cut(val,40);
 else if("kind"===k)v.kind=["Debauched","Malevolent","Perfidious"].includes(val)?val:"";
 else if("rkind"===k)v.rkind=["Tartaran","Abyssal"].includes(val)?val:"";
 else if("site.name"===k)s.name=cut(val,80);
 else if("site.cur"===k)s.cur=""===val?null:clamp(N(val),0,10);
 else if("site.dice"===k)s.dice=clamp(N(val),0,20);
 else if(m=/^tether\.(\d+)\.(x|v|n)$/.exec(k)){const t=s.tethers[+m[1]];t&&("n"===m[2]?t.n=cut(val,80):t[m[2]]=clamp(N(val),0,"x"===m[2]?999:5))}
 else if("tether-add"===k){TETHER_T[val]&&s.tethers.length<20&&s.tethers.push({t:val,x:0,v:1,n:""})}
 else if(m=/^yr\.fs\.(Magic|Faerie|Divine|Infernal)$/.exec(k))s.yr.fs[m[1]]=!!val;
 else if("yr.act"===k)s.yr.act=["","spring","summer","autumn"].includes(val)?val:"";
 else if(m=/^yr\.(bb|db|vx|ex)$/.exec(k))s.yr[m[1]]=clamp(N(val),0,40);
 else return;
 persist();renderPlay();
});

/* ================================================================
   Build: kind of raw vis; the post-Gauntlet vis budget (DE p. 50)
   ================================================================ */
function visTotals(){const T={};(st.rawvis||[]).forEach(r=>{const p=N(r.pawns);if(!p)return;r.art&&(T[r.art]=(T[r.art]||0)+p);"dedicated"===r.kind&&r.art2&&(T[r.art2]=(T[r.art2]||0)+p)});return T}
function decorRawVis(){
 const ins=[...document.querySelectorAll('#work [data-k^="rawvis."][data-k$=".form"]')];if(!ins.length)return;
 const used=new Set();
 ins.forEach(inp=>{const m=/^rawvis\.(\d+)\.form$/.exec(inp.dataset.k);if(!m)return;const i=+m[1],r=st.rawvis[i];if(!r)return;const cell=inp.closest("td")||inp.parentElement;if(!cell||cell.querySelector(".f975-vk"))return;
  r.kind&&used.add(r.kind);
  const w=document.createElement("div");w.className="f975-vk";
  w.innerHTML=`<select data-k="rawvis.${i}.kind" data-rr aria-label="Kind of vis">${VIS_KINDS.filter(q=>vkShown(q,r.kind||"")).map(q=>`<option value="${H(q[0])}"${(r.kind||"")===q[0]?" selected":""}>${H(q[1])}</option>`).join("")}</select>${"dedicated"===r.kind?`<select data-k="rawvis.${i}.art2" data-rr aria-label="Dedicated Form"><option value="">and the Form…</option>${FO.map(([,n])=>`<option value="${n}"${r.art2===n?" selected":""}>${n}</option>`).join("")}</select>`:""}`;
  cell.appendChild(w)});
 const tbl=ins[0].closest("table");if(!tbl)return;
 let box=tbl.parentElement.querySelector(":scope > .f975-visnotes");box||(box=document.createElement("div"),box.className="f975-visnotes",tbl.after(box));
 let h=[...used].filter(k=>VIS_NOTE[k]).map(k=>`<p class="note"><b>${H(VK_BY[k][1])}:</b> ${VIS_NOTE[k]}</p>`).join("");
 used.has("dedicated")&&(h+='<p class="note">Choose the Technique as the row’s Art and the Form beside it; each pawn counts as one of each, but cannot be split.</p>');
 if(opt("visStorage",!1)&&bookOn("RoP:M")){const T=visTotals(),min=st.visStore,L=Object.entries(T).filter(([,p])=>p>=min).map(([a,p])=>`${a} ${p} pawns: spontaneous ${a} effects of up to level ${5*Math.floor(p/min)}`);
  h+=`<p class="note"><b>Stored vis</b> (optional rule, RoP:M p. 123): threshold <select data-k="visStore" data-num data-rr aria-label="Threshold">${[[10,"a rook, 10 pawns (low-vis saga)"],[20,"two rooks, 20 pawns"],[100,"a queen, 100 pawns (high-vis saga)"]].map(([v,l])=>`<option value="${v}"${min===v?" selected":""}>${l}</option>`).join("")}</select>. ${L.length?L.join("; ")+", within Voice range of the store.":"No Art reaches it."}</p>`}
 box.innerHTML=h;
}
/* a year's vis for lab work after Gauntlet: at most Magic Theory × 5 pawns, not carried over (DE p. 50) */
function visSched(){const a=String(st.ages&&st.ages.visSchedule||"").trim();if(!a)return null;const t=a.split(/[\s,;]+/).filter(Boolean).map(Number);return t.every(v=>Number.isInteger(v)&&v>=0)?t:[]}
{const SC=sConcept;sConcept=function(){
 let t=SC.apply(this,arguments);
 try{
  if(isMagus()&&N(st.ages&&st.ages.post)&&/data-k="ages\.labNotes"/.test(t)){
   const mt=ablScore(st,"Magic Theory"),cap=5*mt,L=visSched(),over=L?L.map((v,i)=>[v,i+1]).filter(([v])=>v>cap):[];
   const f=`<label class="f"><span>Vis pawns used, by year</span><input type="text" data-k="ages.visSchedule" value="${H(st.ages.visSchedule||"")}" placeholder="e.g. 10, 0, 15"></label>`;
   t=t.replace(/(<input type="text" data-k="ages\.labNotes"[^>]*><\/label>)/,m=>m+f);
   const n=`<p class="note f975-visbud">Vis for lab work: at most Magic Theory ${mt} × 5 = ${cap} pawn${1===cap?"":"s"} a year, of the Arts the work needs, and none carried from year to year (DE p. 50).${L?` Schedule: ${L.reduce((a,v)=>a+v,0)} pawns over ${L.length} year${1===L.length?"":"s"}.`:""}${L&&!L.length?" Use whole numbers.":""}${over.length?` Over the cap in year ${over.map(o=>o[1]).join(", ")}.`:""}${L&&L.length>N(st.ages.post)?` More years than the ${N(st.ages.post)} since Gauntlet.`:""}</p>`;
   t=t.replace(/(data-k="ages\.visSchedule"[^>]*><\/label><\/div>)/,m=>m+n);
  }
 }catch(z){console.error(z)}
 return t;
}}
{const K=checks;checks=function(e){
 const a=K.apply(this,arguments);
 try{
  if("magus"===e.type&&N(e.ages&&e.ages.post)){const s=String(e.ages.visSchedule||"").trim();if(s){const L=s.split(/[\s,;]+/).filter(Boolean).map(Number),cap=5*ablScore(e,"Magic Theory");
   a.push({ok:L.every(v=>Number.isInteger(v)&&v>=0&&v<=cap)&&L.length<=N(e.ages.post),t:`Vis after Gauntlet: no year over Magic Theory × 5 = ${cap} pawns (DE p. 50)`,g:"magic"})}}
 }catch(z){console.error(z)}
 return a;
}}
