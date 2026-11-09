/* Saints and relics: the book's further saints, your own saints and patron, and relic powers
   (RoP:D pp. 43-45, 87-91; DE pp. 419, 501). */
const s9n=v=>{const n=Math.floor(+v);return isFinite(n)?n:0};
const s9c=(v,m)=>String(null==v?"":v).replace(/[\u0000-\u001f]/g," ").slice(0,m);
/* "More Saints" (RoP:D p. 91): named with patronage only; the book gives them no powers */
const S91=[
 ["St Paul, apostle",75,"Greece"],["St Andrew, apostle",75,"Scotland, fishermen and sailors"],["St James the Great of Compostela, apostle",75,"Spain, pilgrims and laborers"],
 ["St John the Evangelist, apostle",75,"Asia Minor, friendship and writers"],["St Matthew, apostle",75,"tax collectors, bookkeepers and bankers"],["St Thomas, apostle",75,"India, architects and surveyors"],
 ["St Jude, apostle",75,"lost causes"],["St Ambrose",75,"bishops, learning and bees"],["St Jerome",75,"scholars"],
 ["St Edward the Confessor",50,"England"],["St Patrick",50,"Ireland"],["St Benedict of Nursia",50,"Europe, monks and farm workers"],["St Thomas a Becket",50,"Canterbury"],
 ["St Denis",50,"Paris"],["St Boniface",50,"Germany, brewers and tailors"],["St Wenceslaus",50,"Bohemia"],
 ["St Finnbarr",25,"Cork"],["St Gilbert",25,"Sempringham"],["St Godric",25,"Durham and Finchale"],["St David of Thessalonike",25,"Thessalonike"],["St Kevin",25,"Dublin"],
 ["St Eulogius",25,"Cordoba"],["St Irene",25,"Thessalonica"],["St Gotthard",25,"Hildesheim"],["St Adalbert",25,"Prague"]];
const S9_CAT=[[75,"Greater saint, Divine Might 75"],[50,"Area saint, Divine Might 50"],[25,"Local saint, Divine Might 25"]];
const S9_CURSE=new Set(["Blindness","Blisters of Humility","Dysenteric Infliction","Flabbergast the Impertinent","Humility of Caesar","Ignis Domini","Rebuke the Unfaithful","Smiting of the Lord","Swallowed Alive and Sent to Hell","Terrify the Unbeliever","The Earth’s Riches","The Feast of Worms"]);
/* Sample relics (RoP:D p. 44): Faith by the bearer's faith, Divine Might from the highest Faith */
const S9_RELIC=[
 ["head","The head of John the Baptist (Christian or Muslim bearer)",{n:"Head of John the Baptist",faith:5,hf:5,rpw:["Resist Temptation","The Faithful Made Whole"],notes:"Usable by Christians and Muslims; several churches and mosques claim it"}],
 ["neh-j","Nehushtan, re-assembled (Jewish bearer)",{n:"Nehushtan, the brazen serpent",faith:3,hf:3,rpw:["Mass Healing"],notes:"Heals any group who look on it and pray together; no more healing once its Might is spent, until sunrise"}],
 ["neh-c","Nehushtan, re-assembled (Christian or Muslim bearer)",{n:"Nehushtan, the brazen serpent",faith:2,hf:3,rpw:["Mass Healing"],notes:"Heals any group who look on it and pray together; no more healing once its Might is spent, until sunrise"}],
 ["ark-j","The Ark of the Covenant (Jewish bearer)",{n:"Ark of the Covenant",faith:10,hf:10,rpw:[],notes:"Its powers are the storyguide’s to choose; best kept as the focus of a saga"}],
 ["ark-c","The Ark of the Covenant (Christian or Muslim bearer)",{n:"Ark of the Covenant",faith:7,hf:10,rpw:[],notes:"Its powers are the storyguide’s to choose; best kept as the focus of a saga"}]];
function san996(s){
 if(!s||"object"!=typeof s)return s;
 const o=s.sn996&&"object"==typeof s.sn996?s.sn996:{};
 const own=(Array.isArray(o.own)?o.own:[]).slice(0,40).filter(v=>v&&"object"==typeof v).map(v=>({n:s9c(v.n,80),dm:[75,50,25].includes(s9n(v.dm))?s9n(v.dm):25,pat:s9c(v.pat,160),
  pw:[...new Set((Array.isArray(v.pw)?v.pw:[]).filter(p=>"string"==typeof p).map(p=>s9c(p,60)))].slice(0,30)}));
 s.sn996={own,patron:s9c(o.patron,120)};
 (Array.isArray(s.inv)?s.inv:[]).forEach(r=>{if(!r||"object"!=typeof r||"relic"!==r.cat)return;
  r.saint=s9c(r.saint,120);r.rpw=[...new Set((Array.isArray(r.rpw)?r.rpw:[]).filter(p=>"string"==typeof p).map(p=>s9c(p,60)))].slice(0,30);
  r.hf=Math.max(0,Math.min(20,s9n(r.hf)))});
 return s;
}
{const m=migrate;migrate=function(){return san996(m.apply(this,arguments))};const b=blankState;blankState=function(){return san996(b.apply(this,arguments))};san996(st)}
const s9data=()=>{try{const d=window.AM49&&AM49.data&&AM49.data();d&&!(d.powers||[]).length&&window.AM49L&&AM49L.load&&AM49L.load();return d||{}}catch(z){return{}}};
const s9cat=()=>(s9data().powers||[]).filter(p=>"D"===p.b&&(88===p.p||89===p.p));
const s9pw=n=>s9cat().find(p=>p.n===n)||null;
const s9book=()=>(s9data().best||[]).filter(b=>"Divine"===b.realm&&/^(Saint|St\.|Blessed Virgin)/.test(b.n)&&+b.might>0);
const s9norm=n=>String(n).toLowerCase().replace(/^(saint|st\.?)\s+/,"").replace(/[,(].*$/,"").trim();
/* the same saints statted elsewhere: St Kevin (Glendalough, CI p. 135); St John the Evangelist (Antagonists p. 61) */
const S9_ALIAS={"kevin":"kevin of glendalough","john the evangelist":"john the apostle"};
/* the saint's powers: book saints from the bestiary, your saints as chosen; null where the book gives none */
function s9powers(name){
 if(!name)return null;const own=st.sn996.own.find(v=>v.n===name);if(own)return own.pw.slice();
 const b=s9book().find(v=>v.n===name);if(b)return(b.powers||[]).map(p=>p.n).filter(n=>n&&"Notes"!==n);
 return null;
}
window.AMSAINT={
 extend(list){
  const have=new Set(list.map(r=>s9norm(r[0])));
  const more=S91.filter(r=>{const k=s9norm(r[0]);return!have.has(k)&&!have.has(S9_ALIAS[k])}).map(r=>[r[0],r[1],"RoP:D",91]);
  const own=st.sn996.own.filter(v=>v.n).map(v=>[v.n,v.dm,"your saint",""]);
  return list.concat(more,own);
 },
 isPatron:n=>!!n&&n===st.sn996.patron,
 panel(S,dm){
  const x=XP(),sel=x.stName,pw=s9powers(sel),cat=s9cat(),own=st.sn996.own;
  const pwLine=!sel?"":null===pw?`<p class="note">${esc(sel)}: the book names this saint and its patronage but gives no powers (RoP:D p. 91). Make it one of your saints below to choose them; the simplest way is to take a sample saint’s (RoP:D p. 89).</p>`
   :pw.length?`<p class="note s996-pws"><b>${esc(sel)}’s powers</b> (a threat can force only one of these, RoP:D p. 88): ${pw.map(n=>{const p=s9pw(n);return p?`${esc(n)} (${esc(p.c)}, Penetration ${dm-5*s9n(p.c)})`:esc(n)}).join("; ")}.</p>`:`<p class="note">${esc(sel)} has no powers chosen yet.</p>`;
  const pat=st.sn996.patron;
  const patSel=`<label class="f"><span>Your patron saint</span><select data-s996in="patron"><option value="">None</option>${S.map(s=>`<option value="${esc(s[0])}"${pat===s[0]?" selected":""}>${esc(s[0])}</option>`).join("")}</select></label>`;
  const opts=()=>s9book().filter(b=>(b.powers||[]).some(p=>"Notes"!==p.n)).map(b=>`<option value="${esc(b.n)}">${esc(b.n)} (Might ${+b.might})</option>`).join("");
  const pwBoxes=(i,have)=>{if(!cat.length)return`<p class="note">The saints’ powers are still loading.</p>`;
   const grp=(t,f)=>`<fieldset class="s996-pw"><legend>${t}</legend>${cat.filter(f).map(p=>`<label class="chk"><input type="checkbox" data-s996in="pw.${i}" value="${esc(p.n)}"${have.includes(p.n)?" checked":""}>${esc(p.n)} <small class="note">${esc(p.c)} pt${"1"===p.c?"":"s"}</small></label>`).join("")}</fieldset>`;
   return grp("Miracles (RoP:D p. 88)",p=>!S9_CURSE.has(p.n))+grp("Curses (RoP:D p. 89)",p=>S9_CURSE.has(p.n))};
  const cards=own.map((v,i)=>{const cost=v.pw.reduce((t,n)=>t+s9n((s9pw(n)||{}).c),0),cap=Math.floor(v.dm/5),over=cat.length&&cost>cap;
   return`<div class="card s996-saint"><div class="fields"><label class="f"><span>Name</span><input type="text" data-s996in="n.${i}" value="${esc(v.n)}" maxlength="80" placeholder="e.g. Charlemagne, or a local martyr"></label>
    <label class="f"><span>Kind of saint</span><select data-s996in="dm.${i}">${S9_CAT.map(([m,l])=>`<option value="${m}"${v.dm===m?" selected":""}>${l}</option>`).join("")}</select></label>
    <label class="f"><span>Patron of</span><input type="text" data-s996in="pat.${i}" value="${esc(v.pat)}" maxlength="160" placeholder="a town, a craft, a people"></label></div>
    <div class="fields"><label class="f"><span>Take the powers of</span><select data-s996in="from.${i}"><option value="">Choose a saint…</option>${opts()}</select></label>
    <button type="button" class="btn small" data-s996="del" data-i="${i}">Remove this saint</button></div>
    <p class="note${over?" s996-over":""}">Powers cost ${cost} in all; the rule of thumb is no more than a fifth of the Divine Might, ${cap} (RoP:D p. 89). ${v.dm>=75?"Greater saints have most of the powers":v.dm>=50?"Area saints have many of the powers":"Local saints have only the lowest-costing powers"} (RoP:D p. 88).</p>
    ${pwBoxes(i,v.pw)}</div>`}).join("");
  const add91=`<label class="f"><span>From the book’s list (RoP:D p. 91)</span><select data-s996in="add91"><option value="">Choose a saint…</option>${S91.map((r,i)=>`<option value="${i}">${esc(r[0])} (Might ${r[1]}; ${esc(r[2])})</option>`).join("")}</select></label>`;
  const relicAdd=`<label class="f"><span>Sample relic (RoP:D p. 44)</span><select data-s996in="rsample"><option value="">Choose a relic…</option>${S9_RELIC.map(r=>`<option value="${r[0]}">${esc(r[1])}</option>`).join("")}</select></label>`;
  return`${pwLine}<div class="fields">${patSel}</div>${pat?`<p class="note">Invoking ${esc(pat)} counts as invoking your patron; any other saint takes –15 (RoP:D p. 87).</p>`:""}
  <details class="tog" data-s996d="own"${S9_OPEN.has("own")?" open":""}><summary>Your saints (${own.length})</summary>
   <p class="note">Everyone has a saint most familiar to them, their patron: of a person, a town, a craft or a kingdom (RoP:D p. 87). Many saints in heaven are not on the Church’s list, which is still being settled in 1220, and a troupe can make up a local saint for its story (DE p. 501). The simplest way is to take a sample saint’s powers under a new name (RoP:D p. 89). A saint of your own is invoked and threatened like any other, with its Divine Might.</p>
   ${cards}<div class="fields"><button type="button" class="btn small" data-s996="add">New saint</button>${add91}</div></details>
  <details class="tog" data-s996d="relic"${S9_OPEN.has("relic")?" open":""}><summary>Relics of the saints</summary><p class="note">A saint’s relics usually have that saint’s powers; other relics have powers given by Divine Will (DE p. 419; RoP:D p. 45). Add a relic under Inventory, or one of the book’s sample relics here.</p><div class="fields">${relicAdd}</div></details>`;
 },
 relics(R){
  const x=XP(),cat=s9cat(),saints=s9book().filter(b=>(b.powers||[]).some(p=>"Notes"!==p.n)).map(b=>b.n).concat(st.sn996.own.filter(v=>v.n&&v.pw.length).map(v=>v.n));
  return R.map(([r,i])=>{const f=s9n(r.faith),hf=Math.max(f,s9n(r.hf)),dm=10*hf,left=null==(x.rdm||{})[i]?dm:s9n(x.rdm[i]);
   const use=r.rpw.map(n=>{const p=s9pw(n),c=p?s9n(p.c):0;return`<button type="button" class="btn small" data-s996="ruse" data-i="${i}" data-pw="${esc(n)}"${p&&left>=c?"":" disabled"} title="${esc(p?p.x||"":"")}">${esc(n)}${p?` (${c} Might; Penetration ${dm-5*c})`:""}</button>`}).join("");
   return`<details class="tog s996-relic" data-s996d="r${i}"${S9_OPEN.has("r"+i)?" open":""}><summary>${esc(r.n||"Relic")}: Divine Might ${left} of ${dm}${r.rpw.length?`, ${r.rpw.length} power${1===r.rpw.length?"":"s"}`:""}</summary>
    <div class="fields"><label class="f"><span>Highest Faith Score, any faith (sets Divine Might)</span><input type="number" min="0" max="20" data-s996in="rhf.${i}" value="${hf}"></label>
    <label class="f"><span>Relic of</span><select data-s996in="rsaint.${i}"><option value="">No saint</option>${saints.map(n=>`<option value="${esc(n)}"${r.saint===n?" selected":""}>${esc(n)}</option>`).join("")}</select></label>
    ${r.saint?`<button type="button" class="btn small" data-s996="rtake" data-i="${i}">Take ${esc(r.saint)}’s powers</button>`:""}</div>
    ${use?`<div class="fields s996-use">${use}</div>`:`<p class="note">No powers chosen. A plain relic has none (DE p. 105).</p>`}
    ${cat.length?`<details class="tog"><summary>Choose its powers</summary>${["Miracles","Curses"].map(t=>`<fieldset class="s996-pw"><legend>${t}</legend>${cat.filter(p=>"Curses"===t===S9_CURSE.has(p.n)).map(p=>`<label class="chk"><input type="checkbox" data-s996in="rpw.${i}" value="${esc(p.n)}"${r.rpw.includes(p.n)?" checked":""}>${esc(p.n)} <small class="note">${esc(p.c)}</small></label>`).join("")}</fieldset>`).join("")}</details>`:""}
    <p class="note">Using a power spends its cost from the relic’s Divine Might, which returns at sunrise; Penetration is the relic’s Divine Might – 5 × the cost, as for a saint (our reading of RoP:D pp. 45, 88).</p></details>`}).join("");
 }
};
const S9_OPEN=new Set();
document.addEventListener("toggle",e=>{const d=e.target;if(!d||!d.dataset||!d.dataset.s996d)return;d.open?S9_OPEN.add(d.dataset.s996d):S9_OPEN.delete(d.dataset.s996d)},!0);
const s9redraw=()=>{san996(st);persist();renderPlay()};
document.addEventListener("click",e=>{
 const d=e.target.closest&&e.target.closest('[data-f97="rfp-dawn"]');if(d&&"play"===MODE){XP().rdm={};return}
 const b=e.target.closest&&e.target.closest("[data-s996]");if(!b||"play"!==MODE)return;
 const k=b.dataset.s996,i=+b.dataset.i,own=st.sn996.own;
 if("add"===k){own.push({n:"",dm:25,pat:"",pw:[]});S9_OPEN.add("own")}
 else if("del"===k)own.splice(i,1);
 else if("rtake"===k){const r=st.inv[i],p=r&&s9powers(r.saint);r&&p&&(r.rpw=p.slice(),toast(`${r.n||"The relic"} takes ${r.saint}’s powers (RoP:D p. 45).`,"ok"))}
 else if("ruse"===k){const r=st.inv[i],p=r&&s9pw(b.dataset.pw);if(!r||!p)return;const x=XP(),dm=10*Math.max(s9n(r.faith),s9n(r.hf)),rdm=Object.assign({},x.rdm),left=null==rdm[i]?dm:s9n(rdm[i]),c=s9n(p.c);
  if(left<c)return;rdm[i]=left-c;XP().rdm=rdm;toast(`${p.n}: ${c} Might spent, ${left-c} left until sunrise; Penetration ${dm-5*c}.`,"ok")}
 else return;
 e.preventDefault();s9redraw();
});
document.addEventListener("change",e=>{
 const t=e.target,k=t&&t.dataset&&t.dataset.s996in;if(!k||"play"!==MODE)return;
 const [f,j]=k.split("."),i=+j,own=st.sn996.own;
 if("patron"===f)st.sn996.patron=t.value;
 else if("add91"===f){const r=S91[+t.value];if(!r)return;own.push({n:r[0],dm:r[1],pat:r[2],pw:[]});S9_OPEN.add("own")}
 else if("rsample"===f){const r=S9_RELIC.find(v=>v[0]===t.value);if(!r)return;st.inv.push(Object.assign(invBlank("relic"),{power:"",saint:"",src:"RoP:D",p:44},JSON.parse(JSON.stringify(r[2]))));toast(`${r[2].n} added to the Inventory.`,"ok")}
 else if(own[i]&&"n"===f)own[i].n=t.value;
 else if(own[i]&&"dm"===f)own[i].dm=+t.value;
 else if(own[i]&&"pat"===f)own[i].pat=t.value;
 else if(own[i]&&"from"===f){const p=s9powers(t.value);p&&(own[i].pw=p.slice())}
 else if(own[i]&&"pw"===f){const s=new Set(own[i].pw);t.checked?s.add(t.value):s.delete(t.value);own[i].pw=[...s]}
 else if("rhf"===f&&st.inv[i])st.inv[i].hf=t.value;
 else if("rsaint"===f&&st.inv[i])st.inv[i].saint=t.value;
 else if("rpw"===f&&st.inv[i]){const r=st.inv[i],s=new Set(r.rpw);t.checked?s.add(t.value):s.delete(t.value);r.rpw=[...s]}
 else return;
 s9redraw();
});
