/* ================================================================
   v4.9.9.0  Faerie and Magic in play
   Realms of Power: Faerie (RoP:F) pp. 23, 25-30
   Realms of Power: Magic (RoP:M) pp. 41, 52-56, 78-79, 124-131, 134-139
   Definitive Edition (DE) pp. 203, 384-386, 389, 429-435, 449-456
   (the DE carries the training rules, the mundane beasts and the elemental tables; it governs them)
   ================================================================ */
const N=v=>num(v),H=v=>esc(String(v==null?"":v));
const inPlay=()=>"play"===MODE;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const cut=(v,n)=>String(v==null?"":v).slice(0,n);
const opt=(k,d)=>window.amOpt?amOpt(k):d;
const bookOn=b=>srcOn(st,b);
const FO=ARTS.slice(5);
const btnG=(k,l,x)=>`<button type="button" class="btn small" data-f990="${k}"${x||""}>${l}</button>`;
const selG=(k,v,opts,lbl)=>`<select data-f990in="${k}"${lbl?` aria-label="${H(lbl)}"`:""}>${opts.map(([a,b])=>`<option value="${H(a)}"${String(v)===String(a)?" selected":""}>${H(b)}</option>`).join("")}</select>`;
const numG=(k,v,a)=>`<input type="number" data-f990in="${k}" value="${H(v)}"${a||""}>`;
const chkG=(k,v,l)=>`<label class="chk"><input type="checkbox" data-f990in="${k}"${v?" checked":""}>${l}</label>`;
const fld=(l,inner)=>`<label class="f"><span>${l}</span>${inner}</label>`;
const rowFor=id=>{const c=getCheck(id);return c?row(id,H(c.title),H(c.sub||c.formula),c.blocked?"—":scoreText(c),c):""};
const post=()=>condPen().lines.concat(misc0());
const magn=m=>Math.ceil(Math.max(0,N(m))/5);
const being=()=>st.being&&st.being.on?st.being:null;
const magicBeing=()=>{const b=being();return b&&"Magic"===b.realm?b:null};

/* ---------------------------------------------------------------- optional rule */
window.amOptAdd&&amOptAdd([
 {id:"faeOfferAA",grp:"sub",def:!1,by:"book",l:"Faerie offers: artistic Reputation and a faerie patron’s Might",
  x:"For troupes using Art & Academe’s rules for artistic creation: an offer also gains +1 for every 3 points (or fraction) of artistic Reputation and +1 for every 5 points (or fraction) of Might bequeathed by a faerie patron. Off: neither appears.",ref:"RoP:F p. 28"}]);

/* ---------------------------------------------------------------- Things of Virtue (RoP:M pp. 124-130) */
/* k, name, kind, pawns, Art of its vis, what it grants once Enriched, Flaw it brings, years it lasts (0 = durable),
   how it is Enriched, Shape and Material bonuses, page */
const TOV=[
 ["centaury","Centaury of Virtue","Herb",2,"Re","Greater Power: flight for the imbiber and up to 12 others in close company (ReCo 30); every flier loses a Fatigue level","Necessary Condition: intoxication",0,"Leaves dried by moonlight, then steeped in strong liquor for a season","+3 flight",125],
 ["cinquefoil","Cinquefoil of Virtue","Herb",1,"Me","Inspirational (placed under the tongue)","",0,"Pressed between two sheets of mica and buried in a tin box for a season","+3 Leadership, +1 Rego Mentem",125],
 ["pennyroyal","Pennyroyal of Virtue","Herb",1,"Co","Greater Purifying Touch against one ailment, set by the ruling star when Enriched (Mars flux, Venus pox, Mercury kidney stones, Jupiter fever, Saturn falling sickness)","Delusion (devils will undo the healer’s work)",0,"Painted with resin from a lightning-struck pine, a new layer each week for a season","+3 healing",126],
 ["fennel","Fennel of Virtue","Herb",2,"Vi","Greater Power: a wand that drives away evil spirits; a creature of Infernal Might 25 or less loses 5 Infernal Might; each attack costs the wielder a Fatigue level (PeVi, Penetration +35)","The owner must stay Continent or the power fades",0,"Plucked on a day sacred to St. Michael, wrapped in lamb’s wool and snakeskin and kept in a scabbard for a season","+5 repel ghosts, +5 repel evil spirits, +2 dreams",126],
 ["mistletoe","Mistletoe of Virtue","Herb",2,"In","Supernatural Ability Divination & Augury at 3: visions from the berries (ceremonial bonuses Dreams +2, Herbam +5, Intentions +1)","Fragile Constitution",2,"Cut from an apple tree without a leaf touching the ground, bound over the left breast for a season until it roots in the flesh","+7 divination",126],
 ["periwinkle","Periwinkle of Virtue","Herb",1,"Me","Venus’s Blessing","Reckless",0,"A garland of perfect flowers trampled by rutting deer, hung on the dominant stag for ninety days","+3 love, +1 loyalty or affection",126],
 ["amethyst","Amethyst of Virtue","Object",1,"Me","Lesser Immunity (drunkenness), while the stone touches the drinker’s skin","",0,"Steeped for a month in the strongest drink made harmless; about a season in all","",127],
 ["bloodstone","Bloodstone of Virtue","Object",1,"Cr","Rapid Convalescence, in contact, while resting in bed without exertion","",0,"A month in mud from a healing site, then washing in water from a curative spring; about a season","",127],
 ["sapphire","Sapphire of Virtue","Object",1,"In","Intuition, gazing into the gem","",0,"Exposed to full-moon light over a season, wrapped in violet fabric at all other times","",127],
 ["clamshell","Clam Shell of Virtue","Object",1,"Te","Tough, worn or carried","",0,"A season in the torrent of a powerful waterfall","",127],
 ["bufonite","Bufonite (Toad Stone) of Virtue","Object",2,"In","Lesser Power: detects poison by turning pink or dull red (InAq 15)","",0,"Taken from the head of a living Toad of Virtue, kept on red cloth until set in jewelry or a vessel; about a season","+3 detect poison",127],
 ["emerald","Emerald of Virtue","Object",2,"An","Animal Ken, with the Restriction that it works only with serpents","",0,"Left three months in a snake’s nest; Enriched if gem and snake are both still there","",127],
 ["opal","Opal of Virtue","Object",2,"Te","Sure Traveler (Houses of Hermes: True Lineages p. 107)","A Minor Personality Flaw, chosen by the storyguide",0,"Kept a season at the highest point nearby, with a clear view in all directions","",127],
 ["jet","Jet of Virtue","Object",1,"Pe","Puissant Stealth; lost if anyone but the owner sees the jet","",0,"Hidden a season where people gather, moved to a new hiding place each month","",127],
 ["topaz","Topaz of Virtue","Object",1,"Me","Puissant Leadership","",0,"Bound with gold-colored wire to fur, feathers or teeth of a pack or flock leader and kept in a high place for a season","",127],
 ["clach","Clach Crubain of Virtue","Formed stone",1,"Pe","Lesser Immunity (arthritis), carried close","",0,"Rubbed with pure oil and dried in warm sunlight, three times; about a season","+2 arthritis",127],
 ["ovum","Ovum Anguinum (Serpent’s Egg) of Virtue","Formed stone",2,"Cr","Improved Characteristics (Stamina +2); or, by a variant process, Improved Characteristics (Communication +2) for legal disputes, or Tough","",0,"At midsummer, catch in a cloth the froth from entwined snakes before it lands, carry it over a river they cannot swim and keep the stone in it a month","+2 against infection and poison, +2 legal arguments, +2 resist injury",128],
 ["thunderbolt","Thunderbolt of Virtue","Formed stone",1,"Au","Greater Power: Ward against Demons of the Air of Might 10 or less (ReAu 20, Penetration +20)","Necessary Condition: held in the hand",0,"Fastened high in a lightning-struck tree through three storms, at least three months","+3 lightning, +2 Auram, +4 protection from demons",128],
 ["cornu","Cornu Ammonis (Horn of Ammon) of Virtue","Formed stone",2,"In","Visions, as dreams, for whoever sleeps with it under the head (this grants a Minor Supernatural Flaw)","",0,"Under a hallucinogenic draught, learn where an animal hibernates; leave the stone in its nest for the winter","+3 affect visions, dreams",128],
 ["glossopetrae","Glossopetrae (Stone Adder’s Tongue) of Virtue","Formed stone",1,"Aq","Lesser Power: an antidote to liquid poison left to stand in it two Diameters; the poisoned lose a Fatigue level instead of taking a wound (PeAq 20)","",0,"Soaked a month in a captured snake’s venom, then washed nightly for a month in rainwater caught in a special bowl; kept in snakeskin","+5 resist snake venom",128],
 ["loaves","Fairy Loaves of Virtue","Formed stone",1,"Mu","Lesser Power: keeps stored milk fresh (MuAq 15)","",0,"A visit to a Faerie aura or a bargain with a minor faerie; about a season","+4 keep milk fresh",128],
 ["blackthorn","Blackthorn of Virtue (13 thorns)","Tree",2,"Pe","Hex, aligned with Magic (Realms of Power: The Infernal p. 92), with a Restriction: only against a victim whose wax figure, made with an Arcane Connection, is pierced; each thorn once","",0,"The 13 longest thorns anointed with human blood on the tree, under different phases of the moon, at new moon in flower","",129],
 ["hazel","Hazel of Virtue (forked branch)","Tree",1,"In","Dowsing","",0,"Shaped into a forked wand and buried seven days at each of seven places of mystical significance","",129],
 ["oak","Oak of Virtue (heartwood)","Tree",2,"Au","Lesser Immunity (lightning) to its possessor, or to a whole ship or building it is built into","",0,"Seasoned in incense and herb smoke for a season, brought under the open sky once while lightning flashes","",130],
 ["rowan","Rowan of Virtue (amulet)","Tree",0,"","Lesser Power: a Rego Vim ward of level 10, Penetration 10, Target Individual, against one realm chosen when made (Magic, Infernal or Faerie)","",7,"Twigs steeped in a brew of star-marked berries, basil, rue and rain water, fresh each day from one quarter-day to the next, then tied in a cross with red thread","",130],
 ["mandrake","Mandrake Root of Virtue","Tree",5,"Co","Premonitions 3 (the root creeps and twitches; it is a Magic Thing of Might 5)","Necessary Condition: fed blood",0,"Buried a season under horse manure, dug up often to be fed blood, milk and honey","",130]];
const TOV_BY=Object.create(null);TOV.forEach(t=>TOV_BY[t[0]]=t);
const tovKind=k=>({Herb:"Herbs of Virtue",Object:"Objects of Virtue","Formed stone":"Formed stones","Tree":"Trees and roots of Virtue"})[k];

/* ---------------------------------------------------------------- mundane beasts (DE pp. 429-435) */
const BEASTS=__BEASTS__;
const beastConf=b=>N(String(b["Confidence Score"]||"0").replace(/\(.*$/,""));

/* ---------------------------------------------------------------- saved records */
const FAE_REASONS=[["food","Ate food of the Faerie Realm"],["travel","Accepted a fantastic means of travel"],["contest","Met an obstacle on its own terms"],["hero","Identified with the Hero"],["mercy","Showed a defeated villain mercy"],["interdict","Deliberately broke an interdiction"],["device","Used a plot device"],["other","Another dramatic choice to play along"]];
function san990(s){
 if(!s||"object"!=typeof s)return s;
 const f=s.fae&&"object"==typeof s.fae?s.fae:{};
 s.fae={in:!!f.in,trip:clamp(N(f.trip),0,999),fp:clamp(N(f.fp),0,999),score:clamp(N(f.score),0,99),days:clamp(N(f.days),0,99999),warp:clamp(N(f.warp),0,99),
  group:""===f.group||null==f.group?"":clamp(N(f.group),0,99),elys:!!f.elys,
  gained:(Array.isArray(f.gained)?f.gained:[]).filter(g=>FAE_REASONS.some(r=>r[0]===g)).slice(0,60),
  exch:(Array.isArray(f.exch)?f.exch:[]).filter(e=>e&&"object"==typeof e).slice(0,40).map(e=>({out:cut(e.out,80),in:cut(e.in,80),maj:!!e.maj,trip:clamp(N(e.trip),0,999)}))};
 const m=s.m990&&"object"==typeof s.m990?s.m990:{},a=m.acc&&"object"==typeof m.acc?m.acc:{};
 s.m990={bk:["","bov","elem"].includes(m.bk)?m.bk:"",elem:["Earth","Water","Air","Fire"].includes(m.elem)?m.elem:"Earth",
  acc:{aura:clamp(N(a.aura),0,10),time:["always","half","freq"].includes(a.time)?a.time:"always",realm:clamp(N(a.realm),0,4),
   eff:["none","constant","regular","occasional"].includes(a.eff)?a.eff:"none",effBy:"other"===a.effBy?"other":"own",effLvl:clamp(N(a.effLvl),0,200),effS:clamp(N(a.effS),0,4),
   vis:clamp(N(a.vis),0,400),fam:!!a.fam}};
 s.tov=(Array.isArray(s.tov)?s.tov:[]).filter(t=>t&&"object"==typeof t&&TOV_BY[t.k]).slice(0,30).map(t=>({k:t.k,en:!!t.en,tal:!!t.tal,n:cut(t.n,120)}));
 s.tame=(Array.isArray(s.tame)?s.tame:[]).filter(t=>t&&"object"==typeof t).slice(0,30).map(t=>({n:cut(t.n,80),might:clamp(N(t.might),0,200),mund:!!t.mund,conf:clamp(N(t.conf),0,10),
  fo:FO.some(f=>f[0]===t.fo)?t.fo:"An",how:["hermetic","master","mundane"].includes(t.how)?t.how:"mundane",lab:clamp(N(t.lab),-50,300),text:clamp(N(t.text),0,200),exp:clamp(N(t.exp),0,10),
  pts:clamp(N(t.pts),0,999),seasons:clamp(N(t.seasons),0,99),tamed:!!t.tamed,loyal:clamp(N(t.loyal),0,3),cmdAb:["Animal Handling","Ride","Magic Lore"].includes(t.cmdAb)?t.cmdAb:"Animal Handling",
  cmdEF:[0,6,9,12,15].includes(N(t.cmdEF))?N(t.cmdEF):6,bi:Number.isInteger(t.bi)&&BEASTS[t.bi]?t.bi:-1}));
 return s;
}
{const m=migrate;migrate=function(){return san990(m.apply(this,arguments))};const b=blankState;blankState=function(){return san990(b.apply(this,arguments))};san990(st)}
Object.assign(XDEF,{fab990:0,offAb:"",offGoods:0,offPromise:0,offChange:"env",offEF:12,offRestore:!1,offRep:0,offPatron:0,arcAb:"",arcAura:0,arcDest:0,arcAC:!1,trSQ:5,trVis:0,trAura:0,tovAt:"",warpScore:1,warpMagic:!0});

/* ---------------------------------------------------------------- Faerie: fable (RoP:F pp. 25-30) */
const TIME990=["1 hour","12 hours","1 day","3 days","1 week","1 month","1 season","1 year"];
const faeTripNew=()=>st.fae.exch.filter(e=>e.trip===st.fae.trip).reduce((a,e)=>a+(e.maj?3:1),0);
function faeSettle(){const f=st.fae;let fp=f.fp,sc=f.score;if(!sc&&fp>0){sc=1;fp--}while(fp>=sc+1){fp-=sc+1;sc++}return{fp,score:sc}}
function faeLeave(){
 const f=st.fae,s=faeSettle(),warp=clamp(N(f.warp),0,s.score),eff=s.score-warp,g=""===f.group?null:N(f.group),final=null!=g&&g<eff?g:eff,extra=s.score-final-warp;
 return{score:s.score,fp:s.fp,warp,eff,final,extra:Math.max(0,extra),time:TIME990[Math.min(7,final)],totalWarp:warp+Math.max(0,extra)};
}
function offerAbilities(){const L=st.abil.map(a=>abilLabel(a)).filter(n=>/^(Charm|Profession|Craft)\b/.test(n));L.includes("Charm")||L.unshift("Charm");return[...new Set(L)]}
const CHANGE990=Object.assign(Object.create(null),{obj:[3,"one object becomes a tool"],env:[0,"the immediate environment"],int:[-3,"a faerie’s intentions"],mind:[-6,"a faerie’s whole mind"],motif1:[-3,"a faerie’s motif, to a strongly related one"],motif2:[-6,"a faerie’s motif, to a tenuously related one"]});
function offerCheck(id){
 const x=XP(),f=st.fae,c=charEff(st),L=offerAbilities(),ab=L.includes(x.offAb)?x.offAb:L[0],fe=has(st,"Free Expression");
 const goods=N(x.offGoods),best=Math.max(goods,fe?3:0),bestL=fe&&3>=goods?"Free Expression":["","Minor mortal goods with vitality (bread, beer, milk)","Mortal crafts that express creativity","Highly desirable goods (vis, a human child)"][goods];
 const p=post();
 best&&p.push({l:`Offer modifier: ${bestL} (only the highest applies)`,v:best,ref:"RoP:F pp. 27–28"});
 if(opt("faeOfferAA",!1)){const r=Math.ceil(N(x.offRep)/3),pt=Math.ceil(N(x.offPatron)/5);r&&p.push({l:"Artistic Reputation (+1 per 3 or fraction)",v:r,ref:"RoP:F p. 28"});pt&&p.push({l:"Might bequeathed by a faerie patron (+1 per 5 or fraction)",v:pt,ref:"RoP:F p. 28"})}
 N(x.offPromise)&&p.push({l:"Promise of service",v:N(x.offPromise),ref:"RoP:F p. 28"});
 const chg=CHANGE990[x.offChange]||CHANGE990.env;chg[0]&&p.push({l:`The change asked for: ${chg[1]}`,v:chg[0],ref:"RoP:F pp. 28–29"});
 f.elys&&!x.offRestore&&p.push({l:"A story in Elysium resists change",v:-6,ref:"RoP:F p. 27"});
 const ef=Math.max(0,N(x.offEF)-(f.elys&&x.offRestore?3:0)),bb=baseBotch();
 const block=!f.in?"Offers can be made only inside the Faerie Realm (RoP:F p. 27).":f.fp<1&&!(P().last&&P().last.id===id)?"Making an offer costs an unspent fable point; you have none (RoP:F p. 27).":null;
 return mkCheck({id,title:"Faerie offer",sub:`A change to the story, against a ${["","","","","","","Trivial","","","Minor","","","Serious","","","Major","","","Overwhelming"][N(x.offEF)]||""} threat`,
  formula:"Communication + Charm, Profession or Craft + offer, promise and change modifiers + stress die",blocked:block||condPen().blocked,
  score:[{l:"Communication",v:c.Com,ref:"RoP:F p. 27"},{l:ab,v:ablScore(st,ab),ref:"RoP:F p. 27"}],post:p,die:"stress",nb:bb.nb,nbLines:bb.lines,ef,
  efLabel:f.elys&&x.offRestore?"Threat Ease Factor – 3 (putting an Elysian story back on track)":"Ease Factor of the threat overcome",kind:"generic",conf:!0,
  notes:[{l:"Cost",t:"Rolling the offer spends a fable point and a Long-Term Fatigue level whether or not it is accepted; the promise does not bind if the offer is not comprehended. An offer made with too little skill always fails (RoP:F p. 27)."},
   {l:"Limits",t:"Creativity changes one plot element, never a whole story, and should come with a clever use of the character’s art (RoP:F p. 29)."}],
  outcome:t=>t>=ef?{cls:"ok",head:"The offer is accepted",text:`Total ${fmtN(t)} against ${ef}: the change happens as described, and the promise must be kept. Woe to those who renege (RoP:F p. 28).`}
   :{cls:"fail",head:"The offer is refused",text:`Total ${fmtN(t)} against ${ef}: the fable point and Fatigue level are spent all the same (RoP:F p. 27).`}});
}
function arcanCheck(id,out){
 const x=XP(),c=charEff(st),L=st.abil.map(a=>abilLabel(a)).filter(Boolean),ab=L.includes(x.arcAb)?x.arcAb:(L.find(n=>/^(Craft|Profession|Charm)/.test(n))||"Charm"),bb=baseBotch();
 const ok=has(st,"Arcadian Travel");
 const ef=out?Math.max(0,(13-N(x.arcDest))*3-(x.arcAC?6:0)):null;
 return mkCheck({id,title:out?"Arcadian Travel: leave the Faerie Realm":"Arcadian Travel: Threshold points",sub:out?`To a place of aura ${sgnN(N(x.arcDest))}${x.arcAC?", with an Arcane Connection":""}`:"With a charm made beforehand",
  formula:"stress die + Perception + the charm’s Ability + aura",blocked:ok?condPen().blocked:"Needs the Mystery Virtue Arcadian Travel (Houses of Hermes: Mystery Cults p. 92; add it as a custom Virtue) (RoP:F pp. 23, 29).",
  score:[{l:"Perception",v:c.Per,ref:"RoP:F p. 23"},{l:ab,v:ablScore(st,ab),ref:"RoP:F p. 23"},{l:"Aura",v:N(x.arcAura),ref:"RoP:F p. 23"}],post:post(),die:"stress",nb:bb.nb,nbLines:bb.lines,
  ef,efLabel:out?`(13 – destination aura ${N(x.arcDest)}) × 3${x.arcAC?" – 6 for an Arcane Connection":""}`:"",kind:"generic",conf:!0,
  notes:[{l:"The charm",t:"An object (Dexterity + Ability) or a performance (Communication + Ability) against Ease Factor 18, at least ten minutes to make (RoP:F p. 23)."},
   {l:"Companions",t:`Up to Faerie Magic ${ablScore(st,"Faerie Magic")} others who take part in the charm; leaving, they need not be those who came in (RoP:F pp. 23, 29).`}],
  outcome:t=>out?(t>=ef?{cls:"ok",head:"You leave for your destination",text:`Total ${fmtN(t)} against ${ef}: you leave before the story ends, to the place you chose. Time and Warping are worked out as for any traveler leaving (RoP:F p. 29).`}:{cls:"fail",head:"The way does not open",text:`Total ${fmtN(t)} against ${ef}.`})
   :{cls:"ok",head:`${fmtN(t)} Threshold points`,text:"Added to the Threshold total for entering the Faerie Realm (RoP:F p. 23)."}});
}
function faePanel(){
 const f=st.fae,b=being(),fb=b&&"Faerie"===b.realm,sa=b&&b.powers.some(p=>/spirit away/i.test(p.n||""));
 const spirit=sa?`<p class="note"><b>Spirit Away</b> (Greater Faerie Power, Vim): add Threshold points to a mortal’s or a group’s existing Threshold total at 1 Might Point each, or send characters out of the Faerie Realm at 3 Might Points each. The characters still face the Guardian of the Threshold (RoP:F p. 23). Might pool now ${b.pool===""?N(b.might):N(b.pool)}.</p>`:"";
 const fnote=fb?`<p class="note">A faerie enters as mortals do, and knows which of the Guardian’s choices leads into the Faerie Realm. Inside, it counts as having Common Sense, and with its Might it takes no Warping on leaving. Highly cognizant faeries have Threshold points equal to their Might’s magnitude; narrowly cognizant ones add it where the Threshold fits their role (RoP:F pp. 23–24).</p>`:"";
 if(!f.in)return`<div class="pane-h"><h3>The Faerie Realm</h3><p class="note">Inside the Faerie Realm a human who plays along with the story spends vitality and gains fable points: a bonus to rolls, power over the story, and in the end time lost and Warping (RoP:F pp. 25–30).</p></div>
  <div class="card f990-fae">${fnote}${spirit}${f.exch.length?`<p class="note">${f.exch.length} Virtue${1===f.exch.length?"":"s"} exchanged on earlier visits reassert themselves when you return (RoP:F p. 26).</p>`:""}<div class="fields">${btnG("fae-in","Enter the Faerie Realm")}</div></div>`;
 const lv=faeLeave(),used=faeTripNew(),x=XP();
 const exRows=f.exch.map((e,i)=>`<tr><td>${H(e.out)||"—"}</td><td>${H(e.in)||"—"}</td><td>${e.maj?"Major (3)":"Minor (1)"}</td><td>${e.trip===f.trip?"this visit":"earlier"}</td><td>${btnG("fae-ex-rm","Remove",` data-i="${i}"`)}</td></tr>`).join("");
 return`<div class="pane-h"><h3>The Faerie Realm</h3><p class="note">Fable score <b>${f.score}</b>, unspent fable points <b>${f.fp}</b>${f.score?`. Raising the score to ${f.score+1} costs ${f.score+1} points; a spent point adds +${f.score} to one roll`:""} (RoP:F p. 26).</p></div>
 <div class="card f990-fae">${fnote}${spirit}
  <div class="fields">${fld("Gain a fable point for",selG("fae-reason","",[["","Choose…"]].concat(FAE_REASONS)))}${btnG("fae-raise",`Raise the score (${f.score?f.score+1:1} point${f.score?"s":""})`,f.fp>=(f.score?f.score+1:1)&&f.score?"":" disabled")}${btnG("fae-spend",x.fab990?`+${x.fab990} waits for the next roll`:`Spend a point: +${f.score} to the next roll`,f.fp>0&&f.score&&!x.fab990?"":" disabled")}</div>
  <p class="note">The first point becomes a fable score of 1 at once. Each kind of choice earns a point once, when first made: eating faerie food earns one, not one a meal (RoP:F p. 26).${f.gained.length?` This visit: ${f.gained.map(g=>(FAE_REASONS.find(r=>r[0]===g)||["",g])[1]).join("; ")}.`:""}</p>
  <h4>Becoming faerie</h4>
  <p class="note">Exchange up to fable score ${f.score} Virtues for faerie Virtues (a Major Virtue counts 3); this visit has used ${used}. The storyguide or troupe exchanges as many Flaws. Exchanged Virtues fall away on leaving and return on the next visit; keep them on a Faerie copy of the sheet. Each visit’s new exchanges count against that visit’s score (our reading). Experience-granting Virtues give Pretences, not Abilities; a faerie body (Humanoid Faerie, say) brings a glamoured body and a Traditional Ward and must come before Increased Might, which gives a Might pool but no Magic Resistance (RoP:F pp. 26–27).</p>
  ${exRows?`<table class="lt"><thead><tr><th>Gave up</th><th>Took</th><th>Counts</th><th></th><th></th></tr></thead><tbody>${exRows}</tbody></table>`:""}
  <div class="fields">${fld("Virtue given up",`<input type="text" data-f990in="ex.out" placeholder="e.g. Puissant Stealth">`)}${fld("Faerie Virtue taken",`<input type="text" data-f990in="ex.in" placeholder="e.g. Humanoid Faerie">`)}${chkG("ex.maj",!1,"Major")}${btnG("fae-ex-add","Record the exchange",used<f.score?"":" disabled")}</div>
  <h4>Creativity</h4>
  <div class="fields">${fld("Ability",selG("offAb",x.offAb,offerAbilities().map(n=>[n,n])))}
   ${fld("Goods offered",selG("offGoods",x.offGoods,[[0,"None"],[1,"Bread, beer, milk, wine (+1)"],[2,"A craft: clothes, tools, ornaments (+2)"],[3,"Vis or a human child (+3)"]]))}
   ${fld("Promise",selG("offPromise",x.offPromise,[[-6,"Mundane actions overcome it (–6)"],[-3,"Simple symbolic actions (–3)"],[0,"A conventional story (0)"],[3,"A cunning plan likely to fail (+3)"]]))}
   ${fld("Change",selG("offChange",x.offChange,[["obj","One object becomes a tool (+3)"],["env","The immediate environment (0)"],["int","A faerie’s intentions, traits up to 3 (–3)"],["mind","A faerie’s mind, traits up to 5 (–6)"],["motif1","A faerie’s motif, strongly related (–3)"],["motif2","A faerie’s motif, tenuously related (–6)"]]))}
   ${fld("Threat",selG("offEF",x.offEF,[[6,"Trivial (6)"],[9,"Minor (9)"],[12,"Serious (12)"],[15,"Major (15)"],[18,"Overwhelming (18)"]]))}
   ${chkG("fae-elys",f.elys,"The story is in Elysium")}${f.elys?chkG("offRestore",x.offRestore,"Putting the Elysian story back on track"):""}
   ${opt("faeOfferAA",!1)?fld("Artistic Reputation",numG("offRep",x.offRep,' min="0" max="30"'))+fld("Patron’s bequeathed Might",numG("offPatron",x.offPatron,' min="0" max="100"')):""}</div>
  <div class="acts">${rowFor("r990:offer")}</div>
  ${has(st,"Arcadian Travel")?`<h4>Arcadian Travel</h4><div class="fields">${fld("Charm Ability",selG("arcAb",x.arcAb,st.abil.map(a=>abilLabel(a)).filter(Boolean).map(n=>[n,n])))}${fld("Aura here",numG("arcAura",x.arcAura,' min="-10" max="10"'))}${fld("Destination aura",numG("arcDest",x.arcDest,' min="-10" max="10"'))}${chkG("arcAC",x.arcAC,"Arcane Connection to the destination")}</div><div class="acts">${rowFor("r990:arcin")}${rowFor("r990:arcout")}</div>`:""}
  <h4>Leaving Faerie</h4>
  <div class="fields">${fld("Days spent in Faerie",numG("fae-days",f.days,' min="0" max="99999"'))}${fld("Warping Points taken to keep time",numG("fae-warp",f.warp,` min="0" max="${lv.score}"`))}${fld("Lowest effective score in the group",`<input type="number" data-f990in="fae-group" value="${H(f.group)}" min="0" max="99" placeholder="alone">`)}</div>
  <ul class="rnotes"><li>Leftover points become score where they can: final fable score ${lv.score}${lv.fp?`, ${lv.fp} point${1===lv.fp?"":"s"} lost`:""}.</li>
   <li>Effective score ${lv.eff}${lv.extra?`; the group leaves at ${lv.final}, so ${lv.extra} more Warping Point${1===lv.extra?"":"s"}`:""}: each Faerie day lasted <b>${lv.time}</b> in the mundane world (${N(f.days)} day${1===N(f.days)?"":"s"} spent).</li>
   <li>${b?"With a Might Score the Warping has no effect (RoP:F p. 24).":`Warping Points: ${lv.totalWarp}. A magus makes no Twilight check for them.`} Aging rolls follow the time spent in Faerie, not the time that passed outside (RoP:F p. 30).</li>
   <li>Characters cannot stay by avoiding stories: resolving any nuisance ends the story. Ten years after reaching a fable score of 10, a character staying on may become a faerie (RoP:F pp. 29–30).</li></ul>
  <div class="fields">${btnG("fae-out","Leave the Faerie Realm")}</div>
 </div>`;
}

/* ---------------------------------------------------------------- Magic characters (RoP:M pp. 41, 52-54) */
const ACC_AURA={always:[1,1,2,3,4,5,6,7,8,9,10],half:[5,6,7,8,9,10],freq:[8,9,10]};
const accRow=m=>m<=0?0:Math.ceil(m/5);
const accAura=(m,t)=>{const r=ACC_AURA[t],i=accRow(m);return i<r.length?r[i]:null};
const ACC_SEASONS=[[null,null,null],[4,null,null],[3,null,null],[2,4,null],[1,2,4],[1,1,2],[1,1,1]];
const accSeasons=(lvl,how)=>{const v=N(lvl),i=v<=0?0:v>50?6:Math.ceil(v/10);return ACC_SEASONS[i][["constant","regular","occasional"].indexOf(how)]};
function accState(){
 const b=magicBeing();if(!b)return null;
 const a=st.m990.acc,prone=(b.mq||[]).some(q=>"Acclimation Prone"===q.n),M=N(b.might),Mx=prone?2*M:M,L=[];
 let ok=!1;
 if(a.fam){ok=!0;L.push([!0,"Bound as a familiar: the cords protect it from Acclimation for good (RoP:M p. 53)."])}
 const need=accAura(Mx,a.time),tl={always:"always within",half:"half its time within",freq:"frequent visits to"}[a.time];
 const ao=null!=need&&N(a.aura)>=need;ok=ok||ao;
 L.push([ao,null==need?`No Magic aura is strong enough for Might ${Mx}${prone?" (doubled: Acclimation Prone)":""} by ${tl} it (RoP:M p. 53).`:`Aura ${N(a.aura)}, ${tl} it: needs ${need} for Might ${Mx}${prone?" (doubled)":""} (RoP:M p. 53).`]);
 if(N(a.realm)){const h=Math.ceil(Mx/2),s=10>=(accAura(h,"freq")||99)?1:10>=(accAura(h,"half")||99)?2:10>=(accAura(h,"always")||99)?4:null,r=null!=s&&N(a.realm)>=s;ok=ok||r;
  L.push([r,null==s?`Seasons in the Magic Realm cannot protect a Might of ${Mx}: halved to ${h}, an aura of 10 is not enough.`:`${N(a.realm)} season${1===N(a.realm)?"":"s"} in the Magic Realm (aura 10, Might halved to ${h}): needs ${s} (RoP:M p. 53).`])}
 if("none"!==a.eff){const lvl="own"===a.effBy?Mx:N(a.effLvl),s0=accSeasons("own"===a.effBy?M:N(a.effLvl),a.eff),s=null==s0?null:prone?Math.min(99,2*s0):s0,r=null!=s&&N(a.effS)>=s;ok=ok||r;
  L.push([r,null==s?`${a.eff[0].toUpperCase()+a.eff.slice(1)} effects at ${"own"===a.effBy?"Might":"level"} ${"own"===a.effBy?M:lvl} cannot protect it.`:`${N(a.effS)} season${1===N(a.effS)?"":"s"} of ${a.eff} ${"own"===a.effBy?"use of its powers on a Magic-aligned character without Might":"effects from a caster without Might"}: needs ${s}${prone?" (doubled)":""} (RoP:M pp. 53–54).`])}
 const vn=Math.ceil(Mx/2),vo=N(a.vis)>=vn&&vn>0;ok=ok||vo;
 L.push([vo,`Vis eaten this year: ${N(a.vis)} of ${vn} pawn${1===vn?"":"s"} (Might${prone?" doubled":""} ÷ 2, rounded up) (RoP:M p. 54).`]);
 return{b,M,Mx,prone,ok,L,visNeed:vn};
}
function visEatCheck(id){
 const A=st.m990.acc,p=N(A.vis);
 return mkCheck({id,title:"Vis eaten against Acclimation",sub:`${p} pawn${1===p?"":"s"} consumed this year`,formula:"stress die (botch dice: one a pawn)",blocked:magicBeing()?(p?null:"Enter the pawns eaten this year first."):"For a Magic being (RoP:M p. 54).",
  score:[{l:"No additions",v:0,ref:"RoP:M p. 54"}],post:[],die:"stress",nb:p,nbLines:[{l:"One botch die a pawn consumed",v:p,ref:"RoP:M p. 54"}],kind:"generic",conf:!1,
  notes:[{l:"Botch",t:"A Minor Inferiority for each botch, a Major one for every three, or another fitting harm: an injury, lost Fatigue, a ruined project (RoP:M p. 54)."}],
  outcome:t=>t>=10?{cls:"ok",head:`Transformation: ${fmtN(t)} experience points`,text:"Spend them on a new Quality or on fitting Abilities, without subtracting Might (unless Gifted and learning a new Supernatural Ability) (RoP:M p. 54)."}
   :t>=9?{cls:"part",head:"A special or story event",text:"Something for the whole troupe, or unseen by the character: a pregnancy, a vision, the notice of a mightier being (RoP:M p. 54)."}
   :t>=7?{cls:"ok",head:"A positive side effect",text:"A magical side effect suited to the vis: a spontaneous effect, Might Points gained, or an Essential Trait raised (RoP:M p. 54)."}
   :t>=5?{cls:"fail",head:"A negative side effect",text:"A magical side effect suited to the vis: Might Points lost, or an Essential Trait lowered (RoP:M p. 54)."}
   :{cls:"part",head:"No effect",text:"The vis keeps Acclimation away this year (RoP:M p. 54)."}});
}
function transVisCheck(id){
 const b=magicBeing(),x=XP(),M=b?N(b.might):0,nb=Math.ceil(M/5);
 return mkCheck({id,title:"Vis as a source of transformation",sub:`${M} pawns of vis (the Might Score) consumed`,formula:"stress die + aura",blocked:b?null:"For a Magic being (RoP:M p. 52).",
  score:[{l:"Aura where it studies",v:N(x.trAura),ref:"RoP:M p. 52"}],post:[],die:"stress",nb,nbLines:[{l:"One botch die for every 5 pawns (rounded up, our reading)",v:nb,ref:"RoP:M p. 52"}],kind:"generic",conf:!1,
  notes:[{l:"Rule",t:"The result is experience points for Qualities and Inferiorities, with no Might subtracted. Each botch gives a Minor Inferiority, three a Major one (RoP:M p. 52)."}],
  outcome:t=>({cls:"ok",head:`${fmtN(t)} experience points`,text:"Spend them on the Quality table (RoP:M p. 52)."})});
}
const TRANS_XP=[[0,"Turn a Virtue into a Magic Quality of the same size, a Flaw into an Inferiority, or swap one Quality or Inferiority for another of the same size"],[5,"A Minor Quality with a Minor Inferiority"],[10,"A Minor Quality"],[15,"A Major Quality with a Major Inferiority"],[20,"Minor Quality to Major; Minor Inferiority to Minor Quality; Major Inferiority to Minor"],[25,"A Major Quality with a Minor Inferiority"],[30,"A Major Quality"]];
function magicPanel(){
 const s=accState();if(!s)return"";
 const a=st.m990.acc,x=XP(),pen=Math.max(0,s.M-2*N(x.trVis)),net=Math.max(0,N(x.trSQ)-pen);
 return`<div class="pane-h"><h3>A magic character’s year</h3><p class="note">${H(st.info&&st.info.name||"This character")}: Magic Might ${s.M}. Magic characters do not age; at year’s end, when others make Aging rolls, Acclimation takes a Magic Quality or 1 point of Might unless one protection holds (RoP:M pp. 52–53).</p></div>
 <div class="card f990-acc">
  <div class="fields">${chkG("acc.fam",a.fam,"Bound as a familiar")}${fld("Magic aura where it lives",numG("acc.aura",a.aura,' min="0" max="10"'))}${fld("Time in that aura",selG("acc.time",a.time,[["always","Nearly always (fewer than 40 days away)"],["half","Half its time, or two seasons"],["freq","Frequent visits, about one season"]]))}
   ${fld("Seasons spent in the Magic Realm",numG("acc.realm",a.realm,' min="0" max="4"'))}</div>
  <div class="fields">${fld("Magic effects",selG("acc.eff",a.eff,[["none","None"],["constant","Constant"],["regular","Regular (about daily)"],["occasional","Occasional (about weekly)"]]))}
   ${"none"!==a.eff?fld("Whose",selG("acc.effBy",a.effBy,[["own","Its powers on a Magic-aligned person without Might"],["other","Cast on it by someone without Might"]]))+("other"===a.effBy?fld("Effect level",numG("acc.effLvl",a.effLvl,' min="0" max="200"')):"")+fld("Seasons this year",numG("acc.effS",a.effS,' min="0" max="4"')):""}
   ${fld("Pawns of vis eaten this year",numG("acc.vis",a.vis,' min="0" max="400"'))}</div>
  <ul class="checks">${s.L.map(([o,t])=>`<li class="${o?"":"no"}">${H(t)}</li>`).join("")}</ul>
  <p class="note"><b>${s.ok?"Protected from Acclimation this year.":"Not protected: at year’s end it loses a Magic Quality or 1 point of Might, the player’s choice. If it can lose neither, it ceases to be a magic character (RoP:M pp. 52–53)."}</b></p>
  <div class="fields">${s.ok?"":btnG("acc-might","Lose 1 point of Might")}${N(a.vis)?"":""}</div>
  ${N(a.vis)?`<div class="acts">${rowFor("r990:viseat")}</div>`:""}
  <h4>Advancement and transformation</h4>
  <div class="fields">${fld("Advancement Total (Source Quality)",numG("trSQ",x.trSQ,' min="0" max="60"'))}${fld("Pawns of vis eaten to offset Might",numG("trVis",x.trVis,' min="0" max="200"'))}${fld("Aura for vis study",numG("trAura",x.trAura,' min="-10" max="10"'))}</div>
  <p class="note">Might ${s.M} is subtracted from every Advancement Total; each pawn of vis consumed lowers that by 2, never adding to the total: ${N(x.trSQ)} – ${pen} = <b>${net}</b> experience points. A Gifted magic character also subtracts its other Supernatural Ability scores when learning one, eating at most its Might in pawns a season. Practising a Quality it has: Study Total 5 (RoP:M p. 52).</p>
  <table class="lt"><thead><tr><th>Experience</th><th>Transformation</th></tr></thead><tbody>${TRANS_XP.map(([v,t])=>`<tr><td>${v}</td><td>${H(t)}</td></tr>`).join("")}</tbody></table>
  <p class="note">A transformation must suit the creature’s true nature (RoP:M p. 52).</p>
  <div class="acts">${rowFor("r990:transvis")}</div>
 </div>`;
}

/* ---------------------------------------------------------------- Things of Virtue and warped animals (RoP:M pp. 78-79, 124-130) */
function tovLine(t){return`${t[1]}: ${t[3]?`${t[3]} pawn${1===t[3]?"":"s"} of ${(ART_BY_ABBR[t[4]]||t[4])} vis; `:""}Enriched: ${t[5]}${t[6]?`; brings ${t[6]}`:""}${t[7]?`; lasts ${t[7]} years`:""} (RoP:M p. ${t[10]})`}
function knowCheck(id,enrich){
 const x=XP(),c=charEff(st),t=TOV_BY[x.tovAt],ml=ablScore(st,"Magic Lore"),aura=P().aura&&"Magic"===P().aura.realm?N(P().aura.lvl):0;
 if(enrich)return mkCheck({id,title:`Enrichment Total${t?": "+t[1]:""}`,sub:"A season of uninterrupted magical work",formula:"Intelligence + Magic Lore + Magic aura",
  blocked:ml<1?"Enriching a Thing of Virtue needs the Magic Lore Ability (RoP:M p. 124).":null,
  score:[{l:"Intelligence",v:c.Int,ref:"RoP:M p. 125"},{l:"Magic Lore",v:ml,ref:"RoP:M p. 125"},{l:"Magic aura (set under Modifiers)",v:aura,ref:"RoP:M p. 125"}],post:[],die:"none",ef:9,efLabel:"Enrichment Level 9",kind:"generic",
  notes:[{l:"What it costs",t:"The thing’s vis goes into the Enrichment and can no longer be used or extracted. No laboratory is needed (RoP:M pp. 124–125)."}],
  outcome:t=>t>=9?{cls:"ok",head:"Enriched",text:`Total ${fmtN(t)} reaches 9 (RoP:M p. 125).`}:{cls:"fail",head:"Not enough",text:`Total ${fmtN(t)} is below 9 (RoP:M p. 125).`}});
 const bb=baseBotch();
 return mkCheck({id,title:`Knowing a Thing of Virtue${t?": "+t[1]:""}`,sub:"Its powers and how to Enrich it",formula:"Intelligence + Magic Lore + die",blocked:ml<1?"Needs the Magic Lore Ability (RoP:M p. 124).":condPen().blocked,
  score:[{l:"Intelligence",v:c.Int,ref:"RoP:M p. 124"},{l:"Magic Lore",v:ml,ref:"RoP:M p. 124"}],post:post(),die:P().stressed?"stress":"simple",nb:bb.nb,nbLines:bb.lines,ef:9,kind:"generic",conf:!0,
  notes:[{l:"Die",t:"The book names no die; a simple die, or a stress die when the situation is stressful (our reading)."},{l:"Choice",t:"A thing with several possible Virtues gets one, chosen when it is Enriched, for good (RoP:M p. 124)."}],
  outcome:r=>r>=9?{cls:"ok",head:"You know its powers",text:t?tovLine(t):"You know what it can grant and the method (RoP:M p. 124)."}:{cls:"fail",head:"Its virtue escapes you",text:`Total ${fmtN(r)} against 9.`}});
}
function warpAnimal(w,magic){
 const L=[];w=N(w);
 w>=1&&L.push(magic?"Score 1: a Minor Flaw, such as Warped Senses or (Form) Monstrosity":"Score 1: a Minor Flaw");
 w>=3&&L.push(magic?"Score 3: another Minor Flaw (Warped Senses or (Form) Monstrosity)":"Score 3: another Minor Flaw");
 w>=5&&L.push(magic?"Score 5: a Minor Virtue, the Lesser Power; it no longer gains Warping from the same kind of aura":"Score 5: a Minor Virtue; it no longer gains Warping from the same kind of aura");
 for(let i=6;i<=w&&i<=20;i++)L.push(magic?`Score ${i}: a Major Flaw, such as Hunger for (Form) Magic or Bound to Magic`:`Score ${i}: a Major Flaw`);
 return L;
}
function thingsPanel(){
 const x=XP(),wl=warpAnimal(x.warpScore,x.warpMagic);
 const grp=["Herb","Object","Formed stone","Tree"].map(k=>`<optgroup label="${H(tovKind(k))}">${TOV.filter(t=>t[2]===k).map(t=>`<option value="${t[0]}"${x.tovAt===t[0]?" selected":""}>${H(t[1])}</option>`).join("")}</optgroup>`).join("");
 const t=TOV_BY[x.tovAt];
 return`<div class="pane-h"><h3>Magic things and warped beasts</h3><p class="note">Herbs, Objects and Trees of Virtue hold 1 or 2 pawns of vis; Enriched by someone with Magic Lore, they grant a Virtue to whoever carries them without Magic Resistance (RoP:M pp. 124–125).</p></div>
 <div class="card f990-things">
  <div class="fields"><label class="f"><span>Thing of Virtue</span><select data-f990in="tovAt"><option value="">Choose…</option>${grp}</select></label></div>
  ${t?`<p class="note">${H(tovLine(t))}. <b>Enrichment:</b> ${H(t[8])}.${t[9]?` Shape and Material: ${H(t[9])}.`:""}</p>`:""}
  <div class="acts">${rowFor("r990:know")}${rowFor("r990:enrich")}</div>
  <ul class="rnotes"><li>Carried, it grants its Virtue while intact, to a bearer with no Magic Resistance; any Aegis of the Hearth suppresses it. A Supernatural Ability it grants is at 3 and cannot rise. A Major Virtue brings a Minor Flaw. It Warps as a Constant Effect of Low Power: 1 Warping Point a year (RoP:M p. 125; DE p. 389).</li>
   <li>Herbs last a year for each pawn of vis they held, and usually grant a Major Virtue; other things are durable and grant a Minor one (RoP:M p. 125).</li>
   <li>A magus’s Forms give him Magic Resistance, so he gains nothing, unless he Enriched the thing himself and made it his talisman: then it ignores his Magic Resistance and does not Warp him (RoP:M p. 125).</li>
   <li>The corpse of a Beast of Virtue holds 1 pawn for every 5 points of its Might, often in a part a hedge wizard can make into an Object of Virtue (RoP:M p. 55). Trees in a Magic aura of 6 or more are fully awake, with Cunning but no Might (RoP:M p. 128).</li></ul>
  <h4>A warped animal</h4>
  <div class="fields">${fld("Warping Score",numG("warpScore",x.warpScore,' min="0" max="20"'))}${chkG("warpMagic",x.warpMagic,"Mostly from Magic")}</div>
  <ul class="rnotes">${wl.map(l=>`<li>${H(l)}</li>`).join("")||"<li>No Warping Score yet.</li>"}<li>Animals gain Warping Points as people do. A Transformed Animal gains no Might; its new traits come from the magic that changed it, not from its nature (RoP:M pp. 78–79; DE p. 389).</li></ul>
 </div>`;
}

/* ---------------------------------------------------------------- training creatures (DE pp. 384-386) */
function giftPen(){return has(st,"Gentle Gift")?0:has(st,"Blatant Gift")?-6:has(st,"The Gift")||"magus"===st.type?-3:0}
function tameSeason(t){
 const c=charEff(st),ah=ablScore(st,"Animal Handling"),ak=ablScore(st,"Animal Ken"),M=t.mund?1+2*N(t.conf):Math.max(1,N(t.might)),L=[];
 let v=0;
 if("hermetic"===t.how){v=N(t.lab)+ah+ak+N(t.exp)+Math.floor(N(t.text)/5);L.push(`Rego ${ART_BY_ABBR[t.fo]||t.fo} Lab Total ${N(t.lab)} + Animal Handling ${ah} + Animal Ken ${ak}${N(t.exp)?` + experimentation ${N(t.exp)}`:""}${N(t.text)?` + ${Math.floor(N(t.text)/5)} from a level ${N(t.text)} Lab Text`:""}`)}
 else if("master"===t.how){const b=being(),ml=ablScore(st,"Magic Lore"),bm=b?N(b.might):0,same=b&&b.mform===t.fo,m=Math.max(same?2*bm:bm,ml);v=m+ah+ak;L.push(`${m===ml&&ml>=bm?`Magic Lore ${ml}`:`Might ${bm}${same?" doubled (same Form)":""}`} + Animal Handling ${ah} + Animal Ken ${ak}`)}
 else{v=c.Int+ah+ak;L.push(`Intelligence ${c.Int} + Animal Handling ${ah} + Animal Ken ${ak}`)}
 const g=t.mund?giftPen():0;g&&(v+=g,L.push(`The Gift ${g} (taming a mundane beast is social; DE p. 203)`));
 L.push(`– Might ${M}${t.mund?" (1 + 2 × Confidence)":""}`);
 return{pts:Math.max(0,v-M),M,L,blocked:"master"===t.how&&!has(st,"Master of (Form) Creatures")?"Needs the Virtue Master of (Form) Creatures for this Form (DE p. 385).":"hermetic"===t.how&&"magus"!==st.type?"Hermetic taming is laboratory work for a magus (DE p. 384).":null};
}
function cmdCheck(id,i){
 const t=st.tame[i];if(!t)return null;
 const c=charEff(st),ab=t.cmdAb,ef=N(t.cmdEF),bb=baseBotch();
 return mkCheck({id,title:`Command ${t.n||"the creature"}`,sub:["Something it has done many times","","","","","","Not often done, or stressful","","","Complex, or new to it","","","It fears part of the task","","","Clearly suicidal"][ef]||"",formula:`Presence + ${ab} + stress die`,
  blocked:t.tamed?condPen().blocked:"Only a tamed creature can be commanded (DE p. 385).",
  score:[{l:"Presence",v:c.Pre,ref:"DE p. 386"},{l:ab,v:ablScore(st,ab),ref:"DE p. 386"}],post:post(),die:ef?"stress":"none",nb:bb.nb,nbLines:bb.lines,ef:ef||null,kind:"generic",conf:!0,
  notes:[{l:"Loyalty",t:ef>=12?`With no Confidence Score it also makes a Loyalty test against ${ef>=15?9:6} (Loyal ${t.loyal} + stress die); for a suicidal task always against 9 (DE p. 386).`:"Ride may replace Animal Handling for a mount, Magic Lore for an elemental (DE p. 386)."},
   {l:"Botch",t:"It may flee, do the wrong thing, or turn on its master (DE p. 386)."}],
  outcome:r=>!ef?{cls:"ok",head:"It obeys",text:"An Ability it has, on a task done many times: automatic (DE p. 386)."}:r>=ef?{cls:"ok",head:"It obeys",text:`Total ${fmtN(r)} against ${ef} (DE p. 386).`}:{cls:"fail",head:"It does not obey",text:`Total ${fmtN(r)} against ${ef}.`}});
}
function loyalCheck(id,i){
 const t=st.tame[i];if(!t)return null;const g=giftPen(),bb=baseBotch(),x=XP();
 return mkCheck({id,title:`Loyalty test: ${t.n||"the creature"}`,sub:"Its Loyal trait toward you",formula:"Loyal + stress die",blocked:t.tamed?null:"A creature becomes Loyal +0 when tamed (DE p. 385).",
  score:[{l:"Loyal",v:t.loyal,ref:"DE p. 385"}],post:g?[{l:"The Gift (a social interaction)",v:g,ref:"DE pp. 203, 385"}]:[],die:"stress",nb:bb.nb,nbLines:bb.lines,ef:N(P().ef)||6,efLabel:"Ease Factor (6 usually; 9 for a suicidal task)",kind:"generic",conf:!1,
  notes:[{l:"When",t:"Teaching it an Ability it lacks (end of season, Ease Factor 6), feared or suicidal commands, and fighting as a group may call for it (DE pp. 385–386)."}],
  outcome:r=>r>=(N(P().ef)||6)?{cls:"ok",head:"It stays loyal",text:`Total ${fmtN(r)} (DE p. 385).`}:{cls:"fail",head:"Its loyalty fails",text:`Total ${fmtN(r)}.`}});
}
function beastCard(b){return`<details class="f990-beast"><summary>${H(b.n)} <small>DE p. ${b.p}</small></summary><dl>${["Characteristics","Size","Confidence Score","Virtues and Flaws","Qualities","Personality Traits","Reputations","Combat","Soak","Fatigue Levels","Wound Penalties","Abilities","Powers","Natural Weapons"].filter(k=>b[k]).map(k=>`<dt>${k}</dt><dd>${H(b[k])}</dd>`).join("")}</dl></details>`}
function tamePanel(){
 const rows=st.tame.map((t,i)=>{const s=tameSeason(t);
  return`<div class="card f990-tame"><div class="fields">${fld("Creature",`<input type="text" data-f990in="tame.${i}.n" value="${H(t.n)}">`)}
   ${chkG(`tame.${i}.mund`,t.mund,"Mundane beast")}${t.mund?fld("Confidence Score",numG(`tame.${i}.conf`,t.conf,' min="0" max="10"')):fld("Might",numG(`tame.${i}.might`,t.might,' min="0" max="200"'))}
   ${fld("Form",selG(`tame.${i}.fo`,t.fo,FO.map(f=>[f[0],f[1]])))}${fld("Tamer",selG(`tame.${i}.how`,t.how,[["hermetic","A magus in the laboratory"],["master","Master of (Form) Creatures"],["mundane","A mundane trainer"]]))}
   ${"hermetic"===t.how?fld("Rego (Form) Lab Total, before taming bonuses",numG(`tame.${i}.lab`,t.lab,' min="-50" max="300"'))+fld("Experimentation bonus",numG(`tame.${i}.exp`,t.exp,' min="0" max="10"'))+fld("Similar Lab Text level",numG(`tame.${i}.text`,t.text,' min="0" max="200"')):""}</div>
   <p class="note">${s.blocked?`<b>${H(s.blocked)}</b> `:""}Each consecutive season: ${H(s.L.join(" "))} = <b>${s.pts}</b> point${1===s.pts?"":"s"}. Tamed when the points exceed ${s.M}; a season spent on anything else loses them (DE p. 384).</p>
   <p class="note">${t.tamed?`<b>Tamed</b>, Loyal ${sgnN(t.loyal)} toward its tamer.`:`${t.pts} point${1===t.pts?"":"s"} after ${t.seasons} season${1===t.seasons?"":"s"}.`}</p>
   <div class="fields">${t.tamed?btnG("tame-loyal",t.loyal<3?"A season raising its loyalty (+1)":"Loyal +3 (the most)",` data-i="${i}"${t.loyal<3?"":" disabled"}`):btnG("tame-season","Add a season of taming",` data-i="${i}"${s.blocked?" disabled":""}`)}${t.tamed?"":btnG("tame-lose","The seasons were broken off",` data-i="${i}"`)}${btnG("tame-rm","Remove",` data-i="${i}"`)}</div>
   ${t.tamed?`<div class="fields">${fld("Command with",selG(`tame.${i}.cmdAb`,t.cmdAb,[["Animal Handling","Animal Handling"],["Ride","Ride (as a mount)"],["Magic Lore","Magic Lore (an elemental)"]]))}${fld("Task",selG(`tame.${i}.cmdEF`,t.cmdEF,[[0,"Done many times (automatic)"],[6,"Not often, or stressful (6)"],[9,"Complex or new (9)"],[12,"It fears part of it (12)"],[15,"Clearly suicidal (15)"]]))}</div><div class="acts">${rowFor("r990:cmd:"+i)}${rowFor("r990:loyal:"+i)}</div>`:""}
   ${t.bi>=0?beastCard(BEASTS[t.bi]):""}</div>`}).join("");
 return`<div class="pane-h"><h3>Tamed creatures</h3><p class="note">Any creature with Cunning can be tamed over consecutive seasons by daily dealings, then commanded, trained and led as a group. A tamer who earns enough in one season may tame up to Animal Handling ${ablScore(st,"Animal Handling")} more of the same species (DE pp. 384–386).</p></div>
  ${rows}
  <div class="card"><div class="fields">${btnG("tame-add","Add a creature")}<label class="f"><span>Or a mundane beast</span><select data-f990in="tame-beast"><option value="">Choose…</option>${BEASTS.map((b,i)=>`<option value="${i}">${H(b.n)}</option>`).join("")}</select></label></div>
  <p class="note">Mundane beasts count as Animal Might 1 + 2 × Confidence for taming, and the tamer’s Gift penalty applies; animals have no Might and no vis. Abilities a tamed animal has can be trained by anyone with Animal Handling and a higher score; one it lacks needs a Loyalty test against 6 at the season’s end. Animal Handling replaces Leadership for leading animals as a trained group (DE pp. 384–386, 429).</p>
  <details class="f990-bestiary"><summary>Book of Mundane Beasts (DE pp. 429–435)</summary>${BEASTS.map(beastCard).join("")}</details></div>`;
}

/* ---------------------------------------------------------------- rolls */
{const G=getCheck;getCheck=function(id){
 if(id&&id.startsWith("r990:")){const k=id.slice(5),m=/^(cmd|loyal):(\d+)$/.exec(k);if(m)return"cmd"===m[1]?cmdCheck(id,+m[2]):loyalCheck(id,+m[2]);
  const f={offer:offerCheck,arcin:i=>arcanCheck(i,!1),arcout:i=>arcanCheck(i,!0),viseat:visEatCheck,transvis:transVisCheck,know:i=>knowCheck(i,!1),enrich:i=>knowCheck(i,!0)}[k];if(f)return f(id)}
 const c=G.apply(this,arguments);
 try{const fb=N(XP().fab990);if(c&&!c.blocked&&fb&&"none"!==c.die&&st.fae&&st.fae.in){c.post=(c.post||[]).concat([{l:"A fable point spent",v:fb,ref:"RoP:F p. 26"}])}}catch(z){console.error(z)}
 return c;
}}
{const DR=doRoll;doRoll=function(e){
 const r=DR.apply(this,arguments);
 try{const x=XP();if(e&&"none"!==e.die&&N(x.fab990))x.fab990=0;
  if(e&&"r990:offer"===e.id&&st.fae.fp>0){st.fae.fp--;applyAction({act:"fat",n:1,long:!0});toast("The offer spends a fable point and a Long-Term Fatigue level (RoP:F p. 27).")}}catch(z){console.error(z)}
 return r;
}}

/* ---------------------------------------------------------------- the Realms tab */
{const T=tabRealms;tabRealms=function(){
 let base=T.apply(this,arguments);
 try{
  let add="";
  bookOn("RoP:F")&&(add+=faePanel());
  bookOn("RoP:M")&&(add+=magicPanel(),add+=thingsPanel());
  (bookOn("RoP:M")||st.tame.length||ablScore(st,"Animal Handling")>0)&&(add+=tamePanel());
  add&&/^<p class="note">No Realms of Power abilities\.<\/p>$/.test(base)&&(base="");
  return base+`<div class="f990-realms">${add}</div>`;
 }catch(z){console.error(z);return base}
}}

/* ---------------------------------------------------------------- Play controls */
document.addEventListener("click",e=>{
 const b=e.target.closest&&e.target.closest("[data-f990]");if(!b||!inPlay())return;
 const k=b.dataset.f990,f=st.fae,x=XP(),i=+b.dataset.i;
 if("fae-in"===k){Object.assign(f,{in:!0,trip:f.trip+1,fp:0,score:0,days:1,warp:0,group:"",gained:[]});toast("In the Faerie Realm: fable score 0 (RoP:F p. 26).","ok")}
 else if("fae-raise"===k){const c=f.score?f.score+1:1;if(f.fp>=c){f.fp-=c;f.score++}}
 else if("fae-spend"===k){if(f.fp>0&&f.score){f.fp--;x.fab990=f.score;toast(`+${f.score} waits for your next roll (RoP:F p. 26).`,"ok")}}
 else if("fae-ex-add"===k){const o=document.querySelector('[data-f990in="ex.out"]'),n=document.querySelector('[data-f990in="ex.in"]'),m=document.querySelector('[data-f990in="ex.maj"]');
  const maj=!!(m&&m.checked);if(faeTripNew()+(maj?3:1)>f.score){toast("That exchange is more than this visit’s fable score allows (RoP:F p. 26).","bad");return}
  f.exch.push({out:cut(o&&o.value,80),in:cut(n&&n.value,80),maj,trip:f.trip})}
 else if("fae-ex-rm"===k)f.exch.splice(i,1);
 else if("fae-out"===k){const lv=faeLeave();if(!being()&&lv.totalWarp)st.status.warpPts=Math.max(0,warpPoints(st)+lv.totalWarp);
  Object.assign(f,{in:!1,fp:0,score:0,warp:0,group:"",gained:[]});x.fab990=0;
  toast(`Back in the mundane world: each Faerie day lasted ${lv.time}${being()||!lv.totalWarp?"":`; ${lv.totalWarp} Warping Point${1===lv.totalWarp?"":"s"} recorded`} (RoP:F p. 30).`,"ok")}
 else if("acc-might"===k){const bb=magicBeing();bb&&(bb.might=Math.max(0,N(bb.might)-1),toast(`Acclimation: Magic Might ${bb.might} (RoP:M p. 52).`))}
 else if("tame-add"===k)st.tame.push({n:"",might:5,mund:!1,conf:0,fo:"An",how:"magus"===st.type?"hermetic":"mundane",lab:0,text:0,exp:0,pts:0,seasons:0,tamed:!1,loyal:0,cmdAb:"Animal Handling",cmdEF:6,bi:-1});
 else if("tame-rm"===k)st.tame.splice(i,1);
 else if("tame-season"===k){const t=st.tame[i];if(t){const s=tameSeason(t);if(!s.blocked){t.pts+=s.pts;t.seasons++;t.pts>s.M&&(t.tamed=!0,t.loyal=0,toast(`${t.n||"The creature"} is tamed: Loyal +0 toward you (DE p. 385).`,"ok"))}}}
 else if("tame-lose"===k){const t=st.tame[i];t&&(t.pts=0,t.seasons=0)}
 else if("tame-loyal"===k){const t=st.tame[i];t&&t.loyal<3&&t.loyal++}
 else return;
 e.preventDefault();san990(st);persist();renderPlay();
});
document.addEventListener("change",e=>{
 const i=e.target;if(!i||!inPlay()||!i.dataset||!i.dataset.f990in)return;
 const k=i.dataset.f990in,f=st.fae,x=XP(),a=st.m990.acc,val="checkbox"===i.type?!!i.checked:i.value;
 let m;
 if(/^ex\./.test(k))return;
 if("fae-reason"===k){if(!val)return;if(f.gained.includes(val)&&"other"!==val){toast("That kind of choice has already earned its point on this visit (RoP:F p. 26).","bad");i.value="";return}
  f.gained.push(val);f.score?f.fp++:f.score=1}
 else if("fae-elys"===k)f.elys=!!val;
 else if("fae-days"===k)f.days=clamp(N(val),0,99999);
 else if("fae-warp"===k)f.warp=clamp(N(val),0,99);
 else if("fae-group"===k)f.group=""===val?"":clamp(N(val),0,99);
 else if(["offAb","arcAb","tovAt"].includes(k))x[k]=cut(val,80);
 else if("offChange"===k)x.offChange=CHANGE990[val]?val:"env";
 else if(["offRestore","arcAC","warpMagic"].includes(k))x[k]=!!val;
 else if(["offGoods","offPromise","offEF","offRep","offPatron","arcAura","arcDest","trSQ","trVis","trAura","warpScore"].includes(k))x[k]=N(val);
 else if(m=/^acc\.(\w+)$/.exec(k))a[m[1]]="checkbox"===i.type?!!val:["time","eff","effBy"].includes(m[1])?val:N(val);
 else if(m=/^tame\.(\d+)\.(\w+)$/.exec(k)){const t=st.tame[+m[1]];if(!t)return;t[m[2]]="checkbox"===i.type?!!val:["n","fo","how","cmdAb"].includes(m[2])?val:N(val)}
 else if("tame-beast"===k){const b=BEASTS[+val];if(!b)return;st.tame.push({n:b.n.replace(/\s*\(.*\)$/,""),might:0,mund:!0,conf:beastConf(b),fo:"An",how:"magus"===st.type?"hermetic":"mundane",lab:0,text:0,exp:0,pts:0,seasons:0,tamed:!1,loyal:0,cmdAb:"Animal Handling",cmdEF:6,bi:+val})}
 else return;
 san990(st);persist();renderPlay();
});

/* ================================================================
   Build: Beasts of Virtue and elementals (RoP:M pp. 55-56, 134-139; DE pp. 449-456);
   Things of Virtue carried (RoP:M pp. 124-130)
   ================================================================ */
const ELEM={Earth:{fo:"Te",noneg:["Str","Sta","Dex","Qik"],move:"Athletics",pow:"Crush",ways:"Ways of the (Land): the cavern, mountain or land it rose from",
  powText:"Crush (0 points, Init Qik – 2, Terram; R: Touch, D: Sun, T: Ind): a melee blow; at equal or greater Size it pins, adding Might ÷ 5 (rounded up) to Grapple Strength, and breaks the victim’s gear. Re(Pe)Te 30 (RoP:M p. 136)."},
 Water:{fo:"Aq",noneg:["Str","Sta","Int","Per"],move:"Swim",pow:"Drown",powText:"Drown (0 points, Init Qik – 2, Aquam; R: Touch, D: Sun, T: Ind): after a hit it engulfs a smaller target, who rolls to avoid deprivation each round and may grapple free. Its attacks do only Scuffle damage. ReAq(Co) 30 (RoP:M p. 137)."},
 Air:{fo:"Au",noneg:["Int","Per","Pre","Com"],move:"Athletics",pow:"Suffocate",powText:"Suffocate (0 points, Init Qik – 2, Auram; R: Touch, D: Sun, T: Ind): it enters the lungs; the victim rolls against deprivation, escaping by Quickness + Athletics stress rolls against the elemental’s (Might ÷ 5 as Athletics). Weapons pass through it; it has no natural attack. PeAu(Co) 30 (RoP:M p. 138)."},
 Fire:{fo:"Ig",noneg:["Pre","Com","Dex","Qik"],move:"Athletics",pow:"Burn",powText:"Burn (0 points, Init Qik – 2, Ignem; R: Touch, D: Sun, T: Ind): touching it does damage equal to a stress die + its current Might pool; flammables catch fire; metal in contact heats as Heat of the Searing Forge. Cr(Re)Ig 30 (RoP:M p. 139)."}};
const ELEM_T=[[1,-18,"+2, +2, +1, +1, +1, 0, –1, –1"],[5,-6,"+3, +2, +1, +1, 0, 0, –1, –2"],[10,-3,"+3, +3, +1, +1, 0, 0, –1, –3"],[15,0,"+4, +3, +2, +1, 0, 0, –2, –4"],[20,3,"+6, +5, +2, +2, +1, 0, –5, –6"],[25,6,"+7, +6, +2, +2, +1, 0, –6, –7"],[30,9,"+8, +6, +2, +2, +1, 0, –6, –8"],[35,12,"+9, +7, +2, +2, +1, 0, –7, –9"],[40,15,"+10, +8, +2, +2, +1, 0, –8, –10"],[45,18,"+11, +9, +2, +2, +1, 0, –9, –11"],[50,21,"+12, +9, +2, +2, +1, 0, –9, –12"]];
const elemSize=m=>{m=Math.max(1,N(m));return m<=5?-18+3*(m-1):-6+3*Math.ceil((m-5)/5)};
const elemRow=m=>{let r=ELEM_T[0];for(const t of ELEM_T)N(m)>=t[0]&&(r=t);return r};
const CHAR_NAME={Int:"Cunning",Per:"Perception",Pre:"Presence",Com:"Communication",Str:"Strength",Sta:"Stamina",Dex:"Dexterity",Qik:"Quickness"};
function beingCard(){
 const b=magicBeing();if(!b||!bookOn("RoP:M"))return"";
 const m=st.m990,M=N(b.might);
 let body="";
 if("bov"===m.bk)body=`<p class="note">A Beast of Virtue epitomizes its species; its powers only perfect its mythic properties. Inherited: Magic Animal and an Essential Virtue (Minor or Major) typifying the species, and any Personality Flaw; never a Flaw that makes it a worse example of its kind (never Lame or Blind). Seven points of Characteristics; Book of Mundane Beasts mental scores may be kept. Most have the Magical Creature Social Status Flaw. Large: –1 Quickness, +2 Strength. Subtract its Size from the initial Might to get the final Might; Qualities are bought with the initial Might. Its corpse holds ${Math.ceil(M/5)} pawn${1===Math.ceil(M/5)?"":"s"} of vis (1 per 5 Might or fraction) (RoP:M pp. 55–56).</p>`;
 else if("elem"===m.bk){const E=ELEM[m.elem],r=elemRow(M),sz=elemSize(M),mg=magn(M);
  body=`<div class="fields"><label class="f"><span>Element</span><select data-k="m990.elem" data-rr>${Object.keys(ELEM).map(k=>`<option${k===m.elem?" selected":""}>${k}</option>`).join("")}</select></label></div>
  <ul class="rnotes"><li>Might ${M}: Size <b>${sgnN(sz)}</b> (Might 1 is Size –18; each magnitude adds 3). Size is not bought with Qualities (DE p. 450).</li>
   <li>Characteristics for Might ${r[0]}${r[0]!==M?` (the row at or below ${M}, our reading)`:""}: ${r[2]}, bought with Qualities and Inferiorities that cancel out. ${m.elem} elementals take no negative ${E.noneg.map(c=>CHAR_NAME[c]).join(", ")}. Then subtract Size from Quickness and add twice Size to Strength (DE p. 450; RoP:M p. 134).</li>
   <li>Inherited: Magic Thing; Ways of the (Land); Poor Memory, Short Attention Span, Simple-Minded. No Fatigue and Temporary Might come free. Brawl and ${E.move} at the magnitude of its Might, ${mg} (buy Improved Abilities if experience runs short); usually a Spring character (RoP:M pp. 134–135).</li>
   <li>Obligatory Greater Power: ${H(E.powText)} It needs no Might for this attack, so its Penetration is usually its Might (DE p. 451).</li>
   <li>Each wound costs Might pool equal to its penalty (Incapacitating: 5); pieces broken off hold ((total wound penalty ÷ 5) – pawns already lost) pawns of ${ART_BY_ABBR[E.fo]} vis. At pool 0 it falls inanimate, mistaken for raw vis. It recovers Might only resting in a Magic aura of at least Might ÷ 5, over a season, or by eating vis (DE pp. 449–451).</li>
   <li>Spells: Creo (Form) 25 Ritual creates one from a base amount (Rarefy the Crude Water, CrAq 30); Rego (Form) 5 controls one completely (Command the Living Fire, ReIg 20); Perdo (Form) lowers its Might by the spell’s level + 10 (RoP:M p. 133).</li></ul>`}
 return`<div class="f990-being"><h4>Kind of magic being</h4><div class="fields"><label class="f"><span>Kind</span><select data-k="m990.bk" data-rr>${[["","Another magic being"],["bov","A Beast of Virtue"],["elem","An elemental"]].map(([v,l])=>`<option value="${v}"${m.bk===v?" selected":""}>${l}</option>`).join("")}</select></label></div>${body}</div>`;
}
{const V=sVF;sVF=function(){
 let t=V.apply(this,arguments);
 try{const c=beingCard();if(c){const i=t.indexOf('id="s-being"');if(i>=0){const j=t.indexOf("</section>",i);j>0&&(t=t.slice(0,j)+c+t.slice(j))}}}catch(z){console.error(z)}
 return t;
}}
const hasMR=()=>"magus"===st.type||!!being()||ablScore(st,"Parma Magica")>0;
function tovCard(){
 if(!bookOn("RoP:M"))return"";
 const rows=st.tov.map((r,i)=>{const t=TOV_BY[r.k];return`<tr><td>${H(t[1])}</td><td><label class="chk"><input type="checkbox" data-k="tov.${i}.en" data-rr${r.en?" checked":""}>Enriched</label>${"magus"===st.type?`<label class="chk"><input type="checkbox" data-k="tov.${i}.tal" data-rr${r.tal?" checked":""}>My talisman, Enriched by me</label>`:""}</td><td>${r.en?H(t[5])+(t[6]?`; ${H(t[6])}`:""):`${t[3]?`${t[3]} pawn${1===t[3]?"":"s"} of ${ART_BY_ABBR[t[4]]||t[4]} vis`:"—"}`}</td><td>RoP:M p. ${t[10]}</td><td><button type="button" class="btn small" data-f990b="tov-rm" data-i="${i}">Remove</button></td></tr>`}).join("");
 const opts=["Herb","Object","Formed stone","Tree"].map(k=>`<optgroup label="${H(tovKind(k))}">${TOV.filter(t=>t[2]===k).map(t=>`<option value="${t[0]}">${H(t[1])}</option>`).join("")}</optgroup>`).join("");
 return`<div class="f990-tov"><h4>Things of Virtue</h4>${rows?`<table class="lt"><thead><tr><th>Thing</th><th>State</th><th>Grants or holds</th><th>Source</th><th></th></tr></thead><tbody>${rows}</tbody></table>`:""}
  <div class="fields"><label class="f"><span>Add a Thing of Virtue</span><select data-f990b="tov-add"><option value="">Choose…</option>${opts}</select></label></div>
  <p class="note">Enriched, it grants its Virtue to a bearer without Magic Resistance, and Warps him 1 point a year (Constant Effect of Low Power). Herbs fade after a year for each pawn they held (RoP:M p. 125; DE p. 389).</p></div>`;
}
{const I=sInventory;sInventory=function(){
 let t=I.apply(this,arguments);
 try{const c=tovCard();if(c){const i=t.indexOf('id="s-inv"');if(i>=0){const j=t.indexOf("</section>",i);j>0&&(t=t.slice(0,j)+c+t.slice(j))}}}catch(z){console.error(z)}
 return t;
}}
document.addEventListener("click",e=>{
 const b=e.target.closest&&e.target.closest('[data-f990b="tov-rm"]');if(!b||inPlay())return;
 st.tov.splice(+b.dataset.i,1);e.preventDefault();persist();renderAll();
});
document.addEventListener("change",e=>{
 const s=e.target;if(!s||inPlay()||!s.matches||!s.matches('select[data-f990b="tov-add"]'))return;
 TOV_BY[s.value]&&st.tov.length<30&&st.tov.push({k:s.value,en:!1,tal:!1,n:""});persist();renderAll();
});
{const K=checks;checks=function(e){
 const a=K.apply(this,arguments);
 try{
  const b=e.being&&e.being.on&&"Magic"===e.being.realm?e.being:null,m=e.m990||{};
  if(b&&srcOn(e,"RoP:M")){
   const vf=n=>e.vf.some(v=>v.n===n),M=N(b.might);
   if("bov"===m.bk){
    a.push({ok:vf("Magic Animal"),t:"A Beast of Virtue has the Magic Animal Virtue (RoP:M p. 55)",g:"vf"});
    a.push({ok:vf("Essential Virtue")||(b.mq||[]).some(q=>/^Essential Virtue/.test(q.n)),t:"…and an Essential Virtue typifying its species (RoP:M p. 55)",g:"vf"});
    a.push({ok:e.vf.some(v=>"F"===vfMeta(v).kind&&isType(v,"Personality")),t:"…and inherits a Personality Flaw (RoP:M p. 55)",g:"vf"});
    a.push({ok:!vf("Lame")&&!vf("Blind"),t:"A Beast of Virtue is never Lame or Blind (RoP:M p. 55)",g:"vf"});
    const bad=["Deaf","Crippled","Poor Eyesight","Poor Hearing","Missing Eye","Missing Ear","Missing Hand"].filter(vf);
    a.push({ok:!bad.length,t:`No Flaw that makes it a worse example of its species${bad.length?`: ${bad.join(", ")}`:""} (RoP:M p. 55; this list is our reading)`,g:"vf"});
   }else if("elem"===m.bk){
    const E=ELEM[m.elem]||ELEM.Earth,mg=magn(M),sz=elemSize(M);
    a.push({ok:vf("Magic Thing"),t:"An elemental is a Magic Thing (RoP:M p. 134)",g:"vf"});
    a.push({ok:vf("Ways of the (Land)")&&vf("Poor Memory")&&vf("Short Attention Span")&&vf("Simple-Minded"),t:"…with Ways of the (Land), Poor Memory, Short Attention Span and Simple-Minded (RoP:M p. 134)",g:"vf"});
    a.push({ok:N(b.size)===sz,t:`Size ${sgnN(sz)} for Might ${M} (DE p. 450)`,g:"char"});
    a.push({ok:ablScore(e,"Brawl")>=mg&&ablScore(e,E.move)>=mg,t:`Brawl and ${E.move} at least ${mg}, the magnitude of its Might (RoP:M p. 134)`,g:"xp"});
   }
  }
  const mr="magus"===e.type||!!(e.being&&e.being.on)||ablScore(e,"Parma Magica")>0;
  (e.tov||[]).filter(r=>r.en&&TOV_BY[r.k]).forEach(r=>a.push({ok:!mr||!!r.tal,t:`${TOV_BY[r.k][1]} grants its Virtue only to a bearer without Magic Resistance (RoP:M p. 125)`,g:"inv"}));
 }catch(z){console.error(z)}
 return a;
}}
