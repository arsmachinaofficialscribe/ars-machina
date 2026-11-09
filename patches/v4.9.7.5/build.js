/* ================================================================
   v4.9.7.5  Build layout
   Folded summaries, pinned references, back to where you were, four-step rail,
   a quieter ledger, one-row phone header with a File menu, Abilities by life stage,
   help on demand, and field fixes. Layout only: no rule changes.
   ================================================================ */
const LS={get(k,d){try{const v=localStorage.getItem(k);return null==v?d:JSON.parse(v)}catch(z){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(z){}}};
const PIN_KEY="am-pins",FOLD_KEY="am-fold-others",OPENED_KEY="am-opened",ABT_KEY="am-abil-tab";
let PINS=LS.get(PIN_KEY,[]);Array.isArray(PINS)||(PINS=[]);PINS=PINS.filter(x=>"string"==typeof x).slice(0,4);
let OPENED=new Set(LS.get(OPENED_KEY,[]));
const foldOthers=()=>!1!==LS.get(FOLD_KEY,!0);
const isBuild=()=>"play"!==MODE;
const SEC_NAME={"s-concept":"Concept","s-house":"House","s-vf":"Virtues & Flaws","s-chars":"Characteristics","s-abil":"Abilities","s-arts":"Arts","s-spells":"Spells","s-being":"Might-based being","s-hedge-known":"Hedge Magic","s-lab":"Laboratory","s-fam":"Familiar","s-combat":"Combat","s-inv":"Inventory","s-persona":"Personality","s-bio":"Biography","s-calc":"Stat calculator"};
const secName=id=>SEC_NAME[id]||((document.querySelector(`#${id} > header h2`)||{}).textContent||id);
const GROUPS=[["Who",["s-concept","s-house","s-chars"]],["Gifts and flaws",["s-vf"]],["Skills and magic",["s-abil","s-arts","s-spells","s-being","s-hedge-known","s-lab","s-fam"]],["Gear and story",["s-combat","s-inv","s-persona","s-bio"]],["Tools",["s-calc"]]];
const groupOf=id=>{const i=GROUPS.findIndex(g=>g[1].includes(id));return i<0?2:i};
const REQUIRED=["s-concept","s-house","s-vf","s-chars","s-abil","s-arts","s-spells"];
const PIN_SVG='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 1.8 14.2 6l-1.4.6-2.6 2.6.3 3.1-1.2 1.2-2.8-2.8-3.4 3.4-.8-.8 3.4-3.4L2.9 7.1l1.2-1.2 3.1.3 2.6-2.6z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>';

/* ---------------------------------------------------------------- optional sections not yet started */
function started(id){
 if("s-lab"===id){const l=st.lab||{};return!!(l.name||l.traits||l.desc||(l.vf&&l.vf.length)||N(l.size)||N(l.refinement)||N(l.years))}
 if("s-fam"===id){const f=st.familiar||{};return!!(f.name||f.species||N(f.might)||f.template)}
 if("s-hedge-known"===id)return!!(st.hedgeKnown&&st.hedgeKnown.length);
 return!0;
}
const OPTIONAL=["s-lab","s-fam","s-hedge-known"];

/* ---------------------------------------------------------------- summaries */
function vfName(v){const n=String(v.n||""),d=String(v.d||"").trim();return d?(/\([^)]*\)/.test(n)?n.replace(/\([^)]*\)/,d):`${n} (${d})`):n}
function chips(id){
 const C=[],m=(t,c)=>t&&C.push([String(t),c||""]);
 try{switch(id){
  case"s-concept":{const i=st.info||{},b=budget(st);m(i.name);m([i.tribunal&&`${i.tribunal} Tribunal`,i.year].filter(Boolean).join(", "));isMagus()&&m(`Apprenticed at ${N(st.ages.apprentAt)}`);isMagus()&&N(st.ages.post)&&m(`${N(st.ages.post)} years since Gauntlet`,"muted");break}
  case"s-house":isMagus()?(m(st.house||"No House chosen",st.house?"":"muted"),st.vf.filter(v=>v&&v.house&&v.n).forEach(v=>m(`Free: ${vfName(v)}`))):m("grog"===st.type?"Grogs have no House":"Companions have no House","muted");break;
  case"s-vf":vfList(st,"V").forEach(v=>m(vfName(v)));vfList(st,"F").forEach(v=>m(vfName(v),"flaw"));break;
  case"s-chars":{const c=charEff(st);CHARS.forEach(([k])=>m(`${k} ${sgnN(N(c[k]))}`));break}
  case"s-abil":st.abil.filter(a=>a&&a.n).map(a=>[abilLabel(a),ablCalc(st,a).total]).filter(a=>a[1]>0).sort((a,b)=>b[1]-a[1]).forEach(([n,s])=>m(`${n} ${s}`));break;
  case"s-arts":{const A=arts(st);ARTS.map(([k,n])=>[n,A[k]?A[k].score:0]).filter(a=>a[1]>0).sort((a,b)=>b[1]-a[1]).forEach(([n,s])=>m(`${n} ${s}`));break}
  case"s-spells":st.spells.filter(s=>s&&s.n).forEach(s=>m(`${s.n}${s.tf?` · ${s.tf} ${s.l||""}`:""}`.trim()));break;
  case"s-hedge-known":(st.hedgeKnown||[]).forEach(h=>m(h&&(h.n||h.name)||"An effect"));break;
  case"s-fam":{const f=st.familiar||{};m([f.name,f.species].filter(Boolean).join(", "));N(f.might)&&m(`Might ${N(f.might)}`,"muted");break}
  case"s-lab":{const l=st.lab||{};m(l.name);(l.vf||[]).forEach(v=>v&&v.n&&m(v.n));break}
  case"s-combat":(st.weapons||[]).forEach(w=>w&&w.n&&m(w.n));break;
  case"s-inv":(st.inv||[]).forEach(r=>r&&r.n&&m(r.n));break;
  case"s-persona":(st.traits||[]).filter(t=>t&&t.t).forEach(t=>m(`${t.t} ${sgnN(N(t.v))}`));(st.reps||[]).filter(r=>r&&r.n).forEach(r=>m(`${r.n} ${N(r.v)}`,"muted"));break;
  case"s-bio":{const b=st.bio||{};b.concept&&m(cut(b.concept,60)+(b.concept.length>60?"…":""));["appearance","background","goals","secrets"].forEach(k=>b[k]&&m(`${k[0].toUpperCase()+k.slice(1)} written`,"muted"));break}
 }}catch(z){}
 return C;
}
const chipHtml=(L,max)=>{const s=null==max?L:L.slice(0,max),more=L.length-s.length;return s.map(([t,c])=>`<span class="f975-chip${c?" f975-"+c:""}">${esc(t)}</span>`).join("")+(more>0?`<span class="f975-chip f975-muted">+${more} more</span>`:"")};

/* ---------------------------------------------------------------- section headers */
const HELP_OPEN=new Set();
function refsOf(t){return[...new Set((String(t).match(/\b(?:pp?\.|RoP:[A-Z] pp?\.) ?\d[\d–\-, ]*\d?/g)||[]).map(s=>s.replace(/[,\s]+$/,"")))].slice(0,3).join("; ")}
function decorHeads(){
 document.querySelectorAll("#work > .folio").forEach(sec=>{
  const hd=sec.querySelector(":scope > header");if(!hd)return;const id=sec.id;
  let acts=hd.querySelector(":scope > .f975-hact");
  if(!acts){
   const ttl=hd.children[1],p=ttl&&ttl.querySelector(":scope > p");
   p&&p.classList.add("f975-desc");
   const sum=document.createElement("div");sum.className="f975-sum";hd.appendChild(sum);
   acts=document.createElement("span");acts.className="f975-hact";
   const refs=p?refsOf(p.textContent):"";
   acts.innerHTML=`${p?`<button type="button" class="f975-ib" data-f975b="help" aria-expanded="false" aria-label="Rules for this section${refs?` (${esc(refs)})`:""}" title="Rules for this section${refs?` (${esc(refs)})`:""}">i</button>`:""}${"s-calc"===id?"":`<button type="button" class="f975-ib f975-pin" data-f975b="pin" aria-pressed="false" aria-label="Pin ${esc(secName(id))} to the side panel" title="Pin to the side panel">${PIN_SVG}</button>`}<button type="button" class="btn small ghost f975-open" data-f975b="open"></button>`;
   hd.insertBefore(acts,sum);
   if(p){const hp=document.createElement("div");hp.className="f975-help";hp.hidden=!HELP_OPEN.has(id);hp.innerHTML=p.innerHTML;hd.after(hp);acts.querySelector('[data-f975b="help"]').setAttribute("aria-expanded",String(!hp.hidden))}
  }
  const shut=sec.classList.contains("shut"),opt=OPTIONAL.includes(id)&&!started(id);
  sec.classList.toggle("f975-opt",opt);
  const ob=acts.querySelector(".f975-open");ob&&(ob.textContent=shut?(opt?"Start":"Open"):"Fold");
  const pb=acts.querySelector(".f975-pin");pb&&pb.setAttribute("aria-pressed",String(PINS.includes(id)));
  const sum=hd.querySelector(".f975-sum");if(sum){const h=opt?'<span class="f975-chip f975-muted">Optional · not started</span>':chipHtml(chips(id),"s-chars"===id?8:6);sum.__h!==h&&(sum.innerHTML=h,sum.__h=h)}
 });
}
/* a rule check that fails opens its note in its section */
function checkSection(c){
 if(/Vis after Gauntlet/.test(c.t))return"s-concept";
 return{vf:"s-vf",char:"s-chars",xp:/\bArts?\b/.test(c.t)&&!/Abilit/.test(c.t)?"s-arts":"s-abil",magic:/spell/i.test(c.t)?"s-spells":/\bArts?\b/.test(c.t)?"s-arts":"s-spells",combat:"s-combat",lab:"s-lab"}[c.g]||"";
}
function decorFails(){
 const by={};try{checks(st).filter(c=>!c.ok).forEach(c=>{const s=checkSection(c);s&&(by[s]=by[s]||[]).push(c.t)})}catch(z){}
 document.querySelectorAll("#work > .folio").forEach(sec=>{
  let box=sec.querySelector(":scope > .f975-fails");const L=by[sec.id]||[];
  const h=L.length?`<ul>${L.map(t=>`<li>${esc(t)}</li>`).join("")}</ul>`:"";
  if(!h){box&&box.remove();return}
  if(!box){box=document.createElement("div");box.className="f975-fails";box.setAttribute("role","status");(sec.querySelector(":scope > .f975-help")||sec.querySelector(":scope > header")).after(box)}
  box.__h!==h&&(box.innerHTML=h,box.__h=h);
 });
}
/* long rules notes fold behind a one-line summary */
function decorNotes(){
 document.querySelectorAll("#work > .folio p.note").forEach(p=>{
  if(p.closest("details.f975-note,.f975-help,.f975-fails,.ledger,[data-o],.f975-visnotes")||p.hasAttribute("data-o")||p.querySelector("[data-o],input,select,textarea,button"))return;
  const t=p.textContent.replace(/\s+/g," ").trim();if(t.length<240)return;
  const d=document.createElement("details");d.className="f975-note";
  const first=(t.match(/^.{20,110}?[.:;](?=\s|$)/)||[t.slice(0,96)])[0],ref=refsOf(t);
  d.innerHTML=`<summary><span class="f975-ii" aria-hidden="true">i</span> ${esc(first.length<t.length&&!/[.:;]$/.test(first)?first+"…":first)}${ref?` <small>${esc(ref)}</small>`:""}</summary>`;
  p.replaceWith(d);d.appendChild(p);
 });
}

/* ---------------------------------------------------------------- folding: open one, fold the others */
function topOffset(){const t=document.querySelector(".top");return t&&"sticky"===getComputedStyle(t).position?t.getBoundingClientRect().height:0}
function scrollToSec(sec,off){if(!sec)return;const y=sec.getBoundingClientRect().top+scrollY-topOffset()-12+(off||0);scrollTo({top:Math.max(0,y),behavior:"instant"in document.documentElement.style?"instant":"auto"})}
let NO_SCROLL=!1;
{const TF=toggleFolio;toggleFolio=function(e){
 const was=!!(e&&SHUT.has(e.id));TF.apply(this,arguments);
 try{if(e&&was){OPENED.add(e.id);LAST_OPEN=e.id;LS.set(OPENED_KEY,[...OPENED]);
   if(foldOthers()){let ch=!1;document.querySelectorAll("#work > .folio").forEach(s=>{s!==e&&!SHUT.has(s.id)&&(SHUT.add(s.id),ch=!0)});ch&&(saveShut(),applyShut())}
   fitAll(e);NO_SCROLL||scrollToSec(e)}
  decorHeads();
 }catch(z){console.error(z)}
}}
function setAll(open){document.querySelectorAll("#work > .folio").forEach(s=>{open?(SHUT.delete(s.id),OPENED.add(s.id)):SHUT.add(s.id)});saveShut();applyShut();open&&LS.set(OPENED_KEY,[...OPENED]);fitAll(document);decorHeads()}
function autoFold(){let ch=!1;OPTIONAL.forEach(id=>{const s=document.getElementById(id);s&&!started(id)&&!OPENED.has(id)&&!SHUT.has(id)&&(SHUT.add(id),ch=!0)});ch&&(saveShut(),applyShut())}

/* ---------------------------------------------------------------- back to where I was */
let BACK=null,LAST_OPEN="";
function currentSec(){const off=topOffset()+24,L=[...document.querySelectorAll("#work > .folio")];for(const s of L){const r=s.getBoundingClientRect();if(r.bottom>off)return s}return L[L.length-1]||null}
function paintBack(){document.querySelectorAll("[data-f975back]").forEach(a=>{a.hidden=!BACK;BACK&&(a.querySelector("span").textContent=`Back to ${secName(BACK.id)}`)})}
function jumpTo(id){
 const sec=document.getElementById(id);if(!sec)return;
 const lo=LAST_OPEN&&!SHUT.has(LAST_OPEN)&&document.getElementById(LAST_OPEN),lr=lo&&lo.getBoundingClientRect(),cur=lr&&lr.bottom>topOffset()&&lr.top<innerHeight?lo:currentSec();cur&&cur.id!==id&&(BACK={id:cur.id,off:scrollY-(cur.getBoundingClientRect().top+scrollY)});
 SHUT.has(id)?toggleFolio(sec):scrollToSec(sec);
 paintBack();
}
function goBack(){
 if(!BACK)return;const b=BACK;BACK=null;LAST_OPEN=b.id;const sec=document.getElementById(b.id);
 if(sec){if(SHUT.has(b.id)){NO_SCROLL=!0;try{toggleFolio(sec)}finally{NO_SCROLL=!1}}scrollTo({top:Math.max(0,sec.getBoundingClientRect().top+scrollY+b.off)})}
 paintBack();
}

/* ---------------------------------------------------------------- the rail in four steps */
const sealOf=id=>{const s=document.querySelector(`#${id} > header .seal`);return s?s.textContent:""};
renderRail=function(s){
 const t=$("#rail");if(!t)return;
 const req=s.filter(e=>REQUIRED.includes(e.id)&&"st-na"!==e.cls&&(isMagus()||!["s-arts","s-spells"].includes(e.id))),ok=req.filter(e=>"st-ok"===e.cls||"st-sealed"===e.cls).length;
 let h=`<a class="f975-back" href="#" data-f975back${BACK?"":" hidden"}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M7 3 2 8l5 5M2 8h12" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><span>${BACK?`Back to ${esc(secName(BACK.id))}`:""}</span></a><p class="prog" title="Concept, House, Virtues and Flaws, Characteristics, Abilities${isMagus()?", Arts and Spells":""}: the sections a finished character needs"><b>${ok}</b> of ${req.length} required sections ready</p><div class="f975-gchips" role="navigation" aria-label="Steps">`;
 const G=GROUPS.map(([g,ids],gi)=>[g,gi,s.filter(e=>groupOf(e.id)===gi).sort((a,b)=>{const x=ids.indexOf(a.id),y=ids.indexOf(b.id);return(x<0?99:x)-(y<0?99:y)})]).filter(g=>g[2].length);
 h+=G.filter(g=>g[1]<4).map(([g,gi,it])=>`<a class="f975-gchip" href="#${it[0].id}" data-f975g="${gi}">${esc(g)}</a>`).join("")+"</div>";
 G.forEach(([g,gi,it])=>{h+=`<p class="rail-g">${esc(g)}</p>`+it.map(e=>{const o=OPTIONAL.includes(e.id)&&!started(e.id);return`<a class="step ${e.cls}${o?" f975-optstep":""}" href="#${e.id}" title="${esc(e.sv)}"><span class="seal-sm">${esc(sealOf(e.id))}</span><span class="lbl">${e.lbl}</span><span class="sv">${esc(o?"Optional":e.sv)}</span></a>`}).join("")});
 h+=`<label class="chk f975-fo"><input type="checkbox" data-f975fo${foldOthers()?" checked":""}>Fold the other sections when I open one</label>`;
 amSetHTML(t,h);scheduleMark();
};
let MC=0;
const scheduleMark=()=>{MC||(MC=requestAnimationFrame(()=>{MC=0;markCurrent()}))};
function markCurrent(){
 if(!isBuild())return;const c=currentSec(),id=c&&c.id,g=id?groupOf(id):-1;
 document.querySelectorAll("#rail .step").forEach(a=>{const on=a.getAttribute("href")==="#"+id;on?a.setAttribute("aria-current","true"):a.removeAttribute("aria-current")});
 document.querySelectorAll("#rail .f975-gchip").forEach(a=>{+a.dataset.f975g===g?a.setAttribute("aria-current","step"):a.removeAttribute("aria-current")});
}
addEventListener("scroll",scheduleMark,{passive:!0});

/* ---------------------------------------------------------------- toolbar above the sections */
function decorBar(){
 const w=document.getElementById("work");if(!w)return;
 let b=w.querySelector(":scope > .f975-bar");
 if(!b){b=document.createElement("div");b.className="f975-bar";b.innerHTML=`<a class="f975-back" href="#" data-f975back hidden><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M7 3 2 8l5 5M2 8h12" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><span></span></a><label class="chk f975-fo f975-fo2"><input type="checkbox" data-f975fo>Fold the others when I open one</label><span class="f975-sp"></span><button type="button" class="btn small ghost" data-f975b="openall">Open all</button><button type="button" class="btn small ghost" data-f975b="foldall">Fold all</button>`;w.prepend(b)}
 b.querySelectorAll("[data-f975fo]").forEach(i=>i.checked=foldOthers());paintBack();
}

/* ---------------------------------------------------------------- ledger: pinned sections; phone status strip */
const pinCard=id=>{const L=chips(id),sec=document.getElementById(id);return`<div class="f975-pcard" data-pin="${id}"><div class="f975-ph"><b>${esc(secName(id))}</b><a href="#${id}" data-f975go="${id}">Go to</a><button type="button" class="f975-x" data-f975b="unpin" data-id="${id}" aria-label="Unpin ${esc(secName(id))}">×</button></div><div class="f975-pchips${"s-chars"===id?" f975-grid":""}">${L.length?chipHtml(L):`<span class="f975-chip f975-muted">${sec?"Nothing entered yet":"Not on this character"}</span>`}</div></div>`};
function decorLedger(){
 const led=document.getElementById("ledger");if(!led||!isBuild())return;
 let box=led.querySelector(":scope > .f975-pins");
 const can=[...document.querySelectorAll("#work > .folio")].map(s=>s.id).filter(id=>"s-calc"!==id&&!PINS.includes(id));
 const h=`<h4>Pinned for reference</h4>${PINS.map(pinCard).join("")||'<p class="note">Pin a section from its header to keep it in view while you work elsewhere.</p>'}${PINS.length<4&&can.length?`<label class="f f975-pinsel"><span>Pin another section</span><select data-f975pin aria-label="Pin another section"><option value="">Choose…</option>${can.map(id=>`<option value="${id}">${esc(secName(id))}</option>`).join("")}</select></label>`:""}`;
 if(!box){box=document.createElement("div");box.className="led-box f975-pins"}
 box.parentElement!==led&&led.appendChild(box);box.__h!==h&&(box.innerHTML=h,box.__h=h);
 /* phone strip */
 const lay=document.querySelector(".layout");if(!lay)return;
 let sp=lay.querySelector(":scope > .f975-strip");
 if(!sp){sp=document.createElement("button");sp.type="button";sp.className="f975-strip";sp.dataset.f975b="strip";sp.setAttribute("aria-expanded","false");sp.setAttribute("aria-controls","ledger");lay.prepend(sp)}
 const s=stripData(),sh=`<span class="f975-sico ${s.fails?"bad":"ok"}" aria-hidden="true">${s.fails?"!":"✓"}</span><span class="f975-stxt">${esc(s.text)}</span><span class="f975-smore">${PINS.length?"Pinned":"Details"} ▾</span>`;
 sp.__h!==sh&&(sp.innerHTML=sh,sp.__h=sh);sp.setAttribute("aria-expanded",String(document.body.classList.contains("f975-led")));
}
function stripData(){
 try{const V=vfList(st,"V"),F=vfList(st,"F"),vp=V.reduce((a,v)=>a+vfCost(v),0),fp=F.reduce((a,v)=>a+vfCost(v),0),lim="grog"===st.type?3:10,b=budget(st),left=N(b.xpAvail)-N(b.ablXp)-N(b.artXp),fails=checks(st).filter(c=>!c.ok).length;
  const L=[`Flaws ${fp}/${lim}`,`Virtues ${vp}/${fp}`,left<0?`${-left} XP over`:`${left} XP left`];isMagus()&&L.push(`Spells ${N(b.levels)}/${N(b.spellAllow)}`);L.push(fails?`${fails} to fix`:"all clear");
  return{text:L.join(" · "),fails}}catch(z){return{text:"Status",fails:0}}
}
const NARROW=matchMedia("(width <= 980px)");
function placeStrip(){const sp=document.querySelector(".f975-strip");if(!sp||!NARROW.matches)return;document.documentElement.style.setProperty("--f975-top",topOffset()+"px");const r=sp.getBoundingClientRect();document.documentElement.style.setProperty("--f975-sb",Math.max(0,Math.round(r.bottom))+"px")}
addEventListener("resize",()=>{placeStrip();fitAll(document)});
addEventListener("scroll",()=>{document.body.classList.contains("f975-led")&&placeStrip()},{passive:!0});

/* ---------------------------------------------------------------- Abilities by life stage */
function decorAbil(){
 const sec=document.getElementById("s-abil");if(!sec)return;const stg=[...sec.querySelectorAll(".stages > .stage")];if(!stg.length)return;
 let tabs=sec.querySelector(":scope > .f975-tabs");
 if(!tabs){tabs=document.createElement("div");tabs.className="f975-tabs";tabs.setAttribute("role","tablist");tabs.setAttribute("aria-label","Life stage");(sec.querySelector(":scope > .facts")||sec.querySelector(":scope > .f975-help")||sec.querySelector(":scope > header")).after(tabs)}
 let cur=LS.get(ABT_KEY,"all");"all"===cur||stg.some(s=>s.id===cur)||(cur="all");
 const h=stg.map(s=>{const hh=s.querySelector(".stg-h h3"),nm=hh?String(hh.firstChild&&hh.firstChild.nodeType===3?hh.firstChild.textContent:hh.textContent).trim():s.id,ct=s.querySelector(".stg-ct"),tx=ct?ct.textContent.replace(/\s+/g," ").trim():"",done=/(^|\D)0 left/.test(tx);
   return`<button type="button" role="tab" data-f975tab="${s.id}" aria-selected="${cur===s.id}" aria-controls="${s.id}"><span class="f975-tn">${esc(nm)}${done?' <i aria-label="spent">✓</i>':""}</span>${tx?`<small>${esc(done?tx.replace(/\s*·\s*0 left$/,""):tx)}</small>`:""}</button>`}).join("")+`<button type="button" role="tab" data-f975tab="all" aria-selected="${"all"===cur}"><span class="f975-tn">All scores</span><small>one table</small></button>`;
 tabs.__h!==h&&(tabs.innerHTML=h,tabs.__h=h);sec.dataset.f975tab=cur;stg.forEach(s=>s.classList.toggle("f975-on",s.id===cur));
}

/* ---------------------------------------------------------------- particulars move to Biography */
const PART=[["gender","Gender"],["nationality","Race / nationality"],["religion","Religion"],["origin","Place of origin"],["title","Title / profession"],["height","Height"],["weight","Weight"],["hair","Hair"],["eyes","Eyes"],["hand","Handedness"]];
const PART_RE=new RegExp(`<label class="f"><span>[^<]*</span><input[^>]*data-k="info\\.(?:${PART.map(p=>p[0]).join("|")})"[^>]*></label>`,"g");
{const SC=sConcept;sConcept=function(){const t=SC.apply(this,arguments);try{return t.replace(PART_RE,"")}catch(z){return t}}}
{const SB=sBio;sBio=function(){
 let t=SB.apply(this,arguments);
 try{const i=st.info||{},f=PART.map(([k,l])=>`<label class="f"><span>${l}</span><input type="text" id="f-info-${k}" data-k="info.${k}" value="${esc(i[k]||"")}"></label>`).join("");
  t=t.replace("Name, birth name, origin, height and the like are in section I.","Name and birth name are in section I; the particulars come first here.");
  t=t.replace(/(<section class="folio[^"]*" id="s-bio">[\s\S]*?<\/header>)/,m=>m+`<h3 class="f975-parth">Particulars</h3><div class="fields f975-part">${f}</div>`)}catch(z){console.error(z)}
 return t;
}}

/* ---------------------------------------------------------------- field fixes: free text grows */
const GROW_SEL=['#s-bio [data-k="bio.concept"]','#s-bio [data-k^="bio.rel."][data-k$=".notes"]','#work [data-k^="rawvis."][data-k$=".form"]','#s-inv [data-k^="inv."][data-k$=".notes"]','#s-inv input.sp-name','#s-vf [data-k^="vf."][data-k$=".d"]'].map(s=>s+':not(textarea)').join(",");
const FS=!!(window.CSS&&CSS.supports&&CSS.supports("field-sizing","content"));
function fit(t){if(FS||!t||!t.isConnected||!t.offsetParent)return;t.style.height="auto";t.style.height=Math.ceil(t.scrollHeight+(t.offsetHeight-t.clientHeight))+"px"}
function fitAll(root){if(FS)return;const L=[...(root||document).querySelectorAll("textarea.f975-grow")].filter(t=>t.offsetParent);L.forEach(t=>t.style.height="auto");const H=L.map(t=>Math.ceil(t.scrollHeight+(t.offsetHeight-t.clientHeight)));L.forEach((t,i)=>t.style.height=H[i]+"px")}
function decorGrow(){
 const act=document.activeElement;
 document.querySelectorAll(GROW_SEL).forEach(inp=>{if("INPUT"!==inp.tagName||!/^(text|search|)$/.test(inp.type))return;
  const ta=document.createElement("textarea");for(const a of [...inp.attributes])"type"===a.name||"value"===a.name||ta.setAttribute(a.name,a.value);
  ta.value=inp.value;ta.rows=1;ta.classList.add("f975-grow");ta.dataset.f975one="";
  const foc=act===inp,s0=foc?inp.selectionStart:0,s1=foc?inp.selectionEnd:0;inp.replaceWith(ta);
  foc&&(ta.focus({preventScroll:!0}),ta.setSelectionRange(s0,s1))});
 FS||requestAnimationFrame(()=>fitAll(document.getElementById("work")));
}
document.addEventListener("input",e=>{const t=e.target;t&&t.classList&&t.classList.contains("f975-grow")&&fit(t)},!0);
document.addEventListener("keydown",e=>{const t=e.target;if("Enter"===e.key&&t&&t.classList&&t.classList.contains("f975-grow")&&void 0!==t.dataset.f975one){e.preventDefault();t.blur()}});

/* ---------------------------------------------------------------- the example banner keeps its place */
let BAN_ST=null;
{const RB=renderBanner;renderBanner=function(){
 if(st.example){BAN_ST=st;return RB.apply(this,arguments)}
 const b=document.getElementById("banner");
 if(BAN_ST&&BAN_ST===st&&isBuild()&&b&&b.querySelector(".banner")){if(!b.querySelector(".f975-ban2")){const ban=b.querySelector(".banner"),sp=ban.querySelector("span");sp&&(sp.textContent="This is your own copy of the example magus now; changes are kept in this browser.");ban.classList.add("f975-ban2")}return}
 BAN_ST=null;return RB.apply(this,arguments);
}}

/* ---------------------------------------------------------------- add buttons: keep the place, focus the new row */
let ADD=null;
const listMax=sec=>{const M={};sec&&sec.querySelectorAll("[data-k]").forEach(e=>{const m=/^(.+?)\.(\d+)\.[^.]+$/.exec(e.dataset.k);m&&(M[m[1]]=Math.max(M[m[1]]??-1,+m[2]))});return M};
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest('#work [data-act^="add"]');if(!b){ADD=null;return}const sec=b.closest(".folio");ADD={act:b.dataset.act,sid:sec&&sec.id,top:b.getBoundingClientRect().top,max:listMax(sec),s:b.dataset.s||""}},!0);
document.addEventListener("click",e=>{
 if(!ADD)return;const a=ADD;ADD=null;if(!e.target.closest||!e.target.closest('[data-act^="add"]'))return;
 requestAnimationFrame(()=>{try{
  const sec=document.getElementById(a.sid);if(!sec)return;
  const nb=sec.querySelector(`[data-act="${a.act}"]${a.s?`[data-s="${a.s}"]`:""}`);nb&&scrollBy(0,nb.getBoundingClientRect().top-a.top);
  const M=listMax(sec);let pre=null;for(const k in M)M[k]>(a.max[k]??-1)&&(pre=k);
  if(pre){const f=[...sec.querySelectorAll(`[data-k^="${pre}.${M[pre]}."]`)].find(x=>/^(INPUT|SELECT|TEXTAREA)$/.test(x.tagName)&&!x.disabled&&x.offsetParent);f&&f.focus({preventScroll:!0})}
 }catch(z){console.error(z)}});
});

/* ---------------------------------------------------------------- header: one File menu */
function fileMenu(){
 const acts=document.querySelector(".top-in > .actions");if(!acts||acts.querySelector(".f975-file"))return;
 acts.classList.add("f975-acts");
 const w=document.createElement("div");w.className="f975-filew";
 w.innerHTML=`<button type="button" class="btn f975-file" aria-haspopup="menu" aria-expanded="false" aria-controls="f975-fm"><span class="f975-fl">File</span><span class="f975-fd" aria-hidden="true">▾</span><svg class="f975-dots" viewBox="0 0 16 16" aria-hidden="true"><circle cx="3" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="13" cy="8" r="1.4"/></svg><span class="f975-sr">File: export, save, load</span></button>
 <div class="f975-fm" id="f975-fm" role="menu" hidden><button type="button" role="menuitem" data-f975m="pdf">Export PDF…</button><button type="button" role="menuitem" data-f975m="json">Save .json</button><button type="button" role="menuitem" data-f975m="load">Load .json</button><hr class="f975-ph-only"><button type="button" role="menuitem" class="f975-ph-only" data-f975m="theme">Light or dark theme</button><button type="button" role="menuitem" class="f975-ph-only" data-f975m="settings">Settings</button><button type="button" role="menuitem" class="f975-ph-only" data-f975m="credits">Credits</button></div>`;
 acts.appendChild(w);
}
function menuOpen(on){const m=document.getElementById("f975-fm"),b=document.querySelector(".f975-file");if(!m||!b)return;m.hidden=!on;b.setAttribute("aria-expanded",String(on));on&&(m.querySelector("button")||{focus(){}}).focus()}
function pdfDialog(){
 let d=document.getElementById("f975-pdf");d&&d.remove();const o=pdfOpts(),ret=document.activeElement;
 d=document.createElement("div");d.id="f975-pdf";d.className="f975-modal";
 d.innerHTML=`<div class="f975-mbox" role="dialog" aria-modal="true" aria-labelledby="f975-pdf-h"><h3 id="f975-pdf-h">Export PDF</h3>
  <label class="chk"><input type="checkbox" data-pdfopt="parchment"${o.parchment?" checked":""}>Parchment ground (off for printing)</label>
  <label class="chk"><input type="checkbox" data-pdfopt="spare"${o.spare?" checked":""}>Spare blank rows</label>
  <label class="chk"><input type="checkbox" data-pdfopt="secrets"${o.secrets?" checked":""}>Include secrets</label>
  <label class="chk"><input type="checkbox" data-k="calc.flatten"${st.calc&&st.calc.flatten?" checked":""}>Flatten (fields no longer editable)</label>
  <p class="note">Draws the Scribe and Cast’s own illustrated sheet (US Letter). Every value stays an editable form field unless flattened.</p>
  <div class="f975-macts"><button type="button" class="btn ghost" data-f975pdf="cancel">Cancel</button><button type="button" class="btn primary" data-f975pdf="go">Export PDF</button></div></div>`;
 document.body.appendChild(d);d.__ret=ret;(d.querySelector("input")||d).focus();
}
function pdfClose(){const d=document.getElementById("f975-pdf");if(!d)return;const r=d.__ret;d.remove();r&&r.focus&&r.focus({preventScroll:!0})}

/* ---------------------------------------------------------------- events */
document.addEventListener("click",e=>{
 const t=e.target;if(!t.closest)return;
 const fb=t.closest(".f975-file");if(fb){const m=document.getElementById("f975-fm");menuOpen(!!m&&m.hidden);e.preventDefault();return}
 const mi=t.closest("[data-f975m]");
 if(mi){menuOpen(!1);const k=mi.dataset.f975m,clk=s=>{const x=document.querySelector(s);x&&x.click()};
  "pdf"===k?pdfDialog():"json"===k?clk("#btn-json"):"load"===k?clk("#btn-load-json"):"theme"===k?clk(".top-in .theme-switch"):"settings"===k?clk("#btn-settings"):"credits"===k&&clk("#btn-credits");e.preventDefault();return}
 const fm=document.getElementById("f975-fm");fm&&!fm.hidden&&!t.closest("#f975-fm")&&menuOpen(!1);
 const pd=t.closest("[data-f975pdf]");if(pd){"go"===pd.dataset.f975pdf?(pdfClose(),exportPdf()):pdfClose();e.preventDefault();return}
 if(t.id==="f975-pdf"){pdfClose();return}
 const bk=t.closest("[data-f975back]");if(bk){e.preventDefault();goBack();return}
 const go=t.closest('#rail a.step,#rail a.f975-gchip,a[data-f975go]');
 if(go&&isBuild()){const id=(go.getAttribute("href")||"").slice(1);if(document.getElementById(id)){e.preventDefault();document.body.classList.remove("f975-led");jumpTo(id);decorLedger()}return}
 const b=t.closest("[data-f975b]");if(!b)return;
 const k=b.dataset.f975b,sec=b.closest(".folio");
 if("open"===k&&sec){e.preventDefault();toggleFolio(sec)}
 else if("help"===k&&sec){const hp=sec.querySelector(":scope > .f975-help");if(hp){hp.hidden=!hp.hidden;hp.hidden?HELP_OPEN.delete(sec.id):HELP_OPEN.add(sec.id);b.setAttribute("aria-expanded",String(!hp.hidden))}}
 else if("pin"===k&&sec){const i=PINS.indexOf(sec.id);i>=0?PINS.splice(i,1):(PINS.length>=4&&PINS.shift(),PINS.push(sec.id));LS.set(PIN_KEY,PINS);decorHeads();decorLedger()}
 else if("unpin"===k){PINS=PINS.filter(x=>x!==b.dataset.id);LS.set(PIN_KEY,PINS);decorHeads();decorLedger()}
 else if("openall"===k)setAll(!0);
 else if("foldall"===k)setAll(!1);
 else if("strip"===k){const on=!document.body.classList.contains("f975-led");document.body.classList.toggle("f975-led",on);b.setAttribute("aria-expanded",String(on));placeStrip()}
 else return;
 e.stopPropagation();
});
document.addEventListener("change",e=>{
 const t=e.target;if(!t||!t.dataset)return;
 if(void 0!==t.dataset.f975fo){LS.set(FOLD_KEY,!!t.checked);document.querySelectorAll("[data-f975fo]").forEach(i=>i.checked=!!t.checked);return}
 if(void 0!==t.dataset.f975pin){const id=t.value;id&&!PINS.includes(id)&&(PINS.push(id),PINS=PINS.slice(-4),LS.set(PIN_KEY,PINS));decorHeads();decorLedger()}
});
document.addEventListener("click",e=>{const tb=e.target.closest&&e.target.closest("#s-abil [data-f975tab]");if(!tb)return;LS.set(ABT_KEY,tb.dataset.f975tab);decorAbil();fitAll(document.getElementById("s-abil"))});
document.addEventListener("keydown",e=>{
 if("Escape"===e.key){if(document.getElementById("f975-pdf")){pdfClose();e.preventDefault();return}const m=document.getElementById("f975-fm");if(m&&!m.hidden){menuOpen(!1);document.querySelector(".f975-file").focus();e.preventDefault();return}document.body.classList.contains("f975-led")&&document.body.classList.remove("f975-led")}
 const m=document.getElementById("f975-fm");if(m&&!m.hidden&&/^Arrow(Up|Down)$/.test(e.key)){const L=[...m.querySelectorAll("button")].filter(b=>b.offsetParent),i=L.indexOf(document.activeElement);L.length&&(L[(i+("ArrowDown"===e.key?1:-1)+L.length)%L.length].focus(),e.preventDefault())}
 const tb=e.target.closest&&e.target.closest("#s-abil [data-f975tab]");if(tb&&/^Arrow(Left|Right)$/.test(e.key)){const L=[...tb.parentElement.children],i=L.indexOf(tb),n=L[(i+("ArrowRight"===e.key?1:-1)+L.length)%L.length];n.focus();n.click();e.preventDefault()}
});

/* ---------------------------------------------------------------- run after each draw */
function decorAll(){if(!isBuild())return;try{autoFold();decorBar();decorHeads();decorFails();decorAbil();decorNotes();decorRawVis();decorGrow();decorLedger();requestAnimationFrame(placeStrip);scheduleMark()}catch(z){console.error(z)}}
function decorLight(){if(!isBuild())return;try{decorHeads();decorFails();decorAbil();decorLedger()}catch(z){console.error(z)}}
{const RA=renderAll;renderAll=function(){const r=RA.apply(this,arguments);decorAll();return r}}
{const RF=refresh;refresh=function(){const r=RF.apply(this,arguments);decorLight();return r}}
{const RL=renderLedger;renderLedger=function(){const r=RL.apply(this,arguments);try{isBuild()&&decorLedger()}catch(z){}return r}}
/* rule checks start folded unless one fails */
checksOpen=function(){return null===CHECKS_OPEN&&(CHECKS_OPEN=(()=>{try{return checks(st).some(c=>!c.ok)}catch(z){return!1}})()),CHECKS_OPEN};
fileMenu();
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",decorAll):decorAll();
