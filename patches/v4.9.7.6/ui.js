/* v4.9.7.6 — Build: group dividers, sections that need a Virtue, Title Case headers */
const inBuild=()=>"play"!==MODE;
const G976=[["Who",["s-concept","s-house","s-chars"]],["Gifts and Flaws",["s-vf"]],["Skills and Magic",["s-abil","s-arts","s-spells","s-being","s-hedge-known","s-lab","s-fam"]],["Gear and Story",["s-combat","s-inv","s-persona","s-bio"]],["Tools",["s-calc"]]];
const g976=id=>{const i=G976.findIndex(g=>g[1].includes(id));return i<0?2:i};

/* Hedge Magic: Known Effects needs a tradition's Virtue (HMRE pp. 18-20, 34, 56-57, 80, 122) */
const HEDGE_VIRT=["Folk Witch","Gruagach","Gruagach Master","Mathematicus of Bologna","Vitki","Elementalist Air","Elementalist Earth","Elementalist Fire","Elementalist Water","Elemental Magic (HMRE)","Elemental Medicine","Elemental Philosophiae","Elemental Theurgy","(Type) Controlling","(Type) Divining","(Type) Refining","(Type) Summoning"];
const hedgeOK=()=>{try{return HEDGE_VIRT.some(n=>has(st,n))||(!isMagus()&&has(st,"Elemental Magic"))}catch(z){return!0}};
window.amHedgeOK=hedgeOK;
const NA976=()=>{const L=[];if(!isMagus()){L.push(["s-arts","Arts","Magi only"],["s-spells","Spells","Magi only"],["s-lab","Laboratory","Magi only"],["s-fam","Familiar","Magi only"])}
 hedgeOK()||L.push(["s-hedge-known","Hedge Magic","Needs a hedge tradition Virtue: Folk Witch, Gruagach, Mathematicus of Bologna, Vitki or an elementalist Virtue (HMRE)","Needs its Virtue"]);return L};
const cutSection=(out,id)=>{const k=out.indexOf(`id="${id}"`);if(k<0)return out;const a=out.lastIndexOf("<section",k),b=out.indexOf("</section>",k);return a<0||b<0?out:out.slice(0,a)+out.slice(b+10)};
{const w=sSpells;sSpells=function(){const out=w.apply(this,arguments);return hedgeOK()?out:cutSection(String(out||""),"s-hedge-known")}}

/* roman seals in the order the sections now stand */
const toRoman=n=>{let s="";for(const[v,r]of[[1e3,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]])for(;n>=v;n-=v)s+=r;return s};
let SEALS={};
function decorGroups(){
 const w=document.getElementById("work");if(!w||!inBuild())return;
 hedgeOK()||w.querySelectorAll(":scope > #s-hedge-known").forEach(e=>e.remove());
 const secs=[...w.querySelectorAll(":scope > section.folio")];if(!secs.length)return;
 w.querySelectorAll(":scope > .f976-gdiv").forEach(e=>e.remove());
 const by=G976.map(()=>[]);secs.forEach(s=>by[g976(s.id)].push(s));
 by.forEach((L,gi)=>L.sort((a,b)=>{const x=G976[gi][1].indexOf(a.id),y=G976[gi][1].indexOf(b.id);return(x<0?99:x)-(y<0?99:y)}));
 const frag=document.createDocumentFragment();let n=0;SEALS={};
 by.forEach((L,gi)=>{if(!L.length)return;const d=document.createElement("p");d.className="f976-gdiv"+(frag.childNodes.length?"":" first");d.dataset.f976g=gi;d.innerHTML=`<span>${esc(G976[gi][0])}</span>`;frag.appendChild(d);
  L.forEach(s=>{frag.appendChild(s);if(s.hidden)return;const r=toRoman(++n);SEALS[s.id]=r;const z=s.querySelector(":scope > header .seal");z&&z.textContent!==r&&(z.textContent=r)})});
 w.appendChild(frag);fixRail();
}
function fixRail(){
 const t=document.getElementById("rail");if(!t)return;
 t.querySelectorAll(".f976-na").forEach(e=>e.remove());
 t.querySelectorAll("a.step").forEach(a=>{const id=(a.getAttribute("href")||"").slice(1),z=a.querySelector(".seal-sm");z&&SEALS[id]&&z.textContent!==SEALS[id]&&(z.textContent=SEALS[id])});
 const na=NA976();if(!na.length)return;const NA=new Map(na.map(e=>[e[0],e]));
 NA.forEach((e,id)=>{const a=t.querySelector(`a.step[href="#${id}"]`);a&&a.remove()});
 let prev=t.querySelector('a.step[href="#s-abil"]');if(!prev)return;
 for(const id of G976[2][1]){const a=t.querySelector(`a.step[href="#${id}"]`);if(a){prev=a;continue}const e=NA.get(id);if(!e)continue;
  const s=document.createElement("span");s.className="step f976-na";s.setAttribute("aria-disabled","true");s.title=e[2];s.innerHTML=`<span class="seal-sm" aria-hidden="true"></span><span class="lbl">${esc(e[1])}</span><span class="sv">${esc(e[3]||e[2])}</span>`;prev.after(s);prev=s}
}
{const RR=renderRail;renderRail=function(){const r=RR.apply(this,arguments);try{fixRail()}catch(z){console.error(z)}return r}}
{const RA=renderAll;renderAll=function(){const r=RA.apply(this,arguments);try{decorGroups()}catch(z){console.error(z)}return r}}
document.addEventListener("click",e=>{const s=e.target.closest&&e.target.closest("#rail .f976-na");s&&(e.preventDefault(),toast(s.title))},!0);

/* Title Case for the app's own headings */
const MINOR=new Set("a an the and but or nor for so yet as at by in of off on per to up via vs from with into onto upon over than".split(" "));
const ABBR=/^(yr|yrs|p|pp|xp|ff|e\.g|i\.e|etc|vs|cf)\.?$/i;
function titleCase(s,first,last){
 const T=s.split(/(\s+)/);let wi=-1;const words=T.map((x,i)=>/\S/.test(x)?i:-1).filter(i=>i>=0),lastI=words[words.length-1];let start=!!first;
 for(const i of words){const tok=T[i];const m=/^([^\p{L}]*)(\p{L}[\p{L}\p{M}'’.\-]*)(.*)$/u.exec(tok);wi++;
  if(!m){start=/[:·—–|]$/.test(tok)||(start&&/^[(\[“"‘]+$/.test(tok));continue}
  const[,pre,w,post]=m;let o=w;
  if(/\p{Lu}/u.test(w.slice(1))||ABBR.test(w)) o=w;
  else if(!start&&!(last&&i===lastI)&&MINOR.has(w.toLowerCase())&&!/^\(/.test(pre)) o=w.toLowerCase();
  else o=w.replace(/(^|-)(\p{Ll})/gu,(q,a,b)=>a+b.toUpperCase());
  T[i]=pre+o+post;start=/[:·—–|]$/.test(post||w)||/[:·—–|]$/.test(tok);}
 return T.join("");
}
window.amTitleCase=titleCase;
const TC_SEL="h1,h2,h3,h4,h5,legend,.rail-g,.f976-gdiv span,#rail .step .lbl,.chk-gn";
const TC_SKIP=".hero h2,.hx h2,.hero-id,.who,[contenteditable],input,textarea,select,option,small,output,kbd,code,.tag,.pill,.chk-gc,[data-o],[data-notc],.sv,.seal,.seal-sm,.am-name,.lib-name";
function tcEl(el){
 if(!el||el.closest(TC_SKIP))return;
 const tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:n=>/\S/.test(n.data)&&!(n.parentElement&&n.parentElement!==el&&n.parentElement.closest(TC_SKIP))?1:2});
 const L=[];for(let n;n=tw.nextNode();)L.push(n);
 L.forEach((n,i)=>{const v=titleCase(n.data,i===0,i===L.length-1);v!==n.data&&(n.data=v)});
}
function tcIn(root){if(!root||1!==root.nodeType)return;root.matches(TC_SEL)&&tcEl(root);root.querySelectorAll&&root.querySelectorAll(TC_SEL).forEach(tcEl)}
let TC_Q=new Set,TC_T=0;
const tcFlush=()=>{TC_T=0;const Q=TC_Q;TC_Q=new Set;Q.forEach(e=>e.isConnected&&tcIn(e))};
new MutationObserver(M=>{for(const m of M){if("characterData"===m.type){const p=m.target.parentElement,h=p&&p.closest(TC_SEL);h&&TC_Q.add(h);continue}
  m.addedNodes.forEach(n=>{if(1===n.nodeType)TC_Q.add(n);else if(3===n.nodeType&&n.parentElement){const h=n.parentElement.closest(TC_SEL);h&&TC_Q.add(h)}})}
 TC_Q.size&&!TC_T&&(TC_T=1,queueMicrotask(tcFlush))}).observe(document.documentElement,{childList:!0,subtree:!0,characterData:!0});
tcIn(document.body);
