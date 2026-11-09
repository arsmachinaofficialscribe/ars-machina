/* ================================================================
   Optional rules (Settings › Optional rules)
   Defaults follow the Definitive Edition first, then the author's rulings, then the recommended readings.
   Sub rules: optional or variant rules printed in the books, and the author's rulings.
   Homebrew rules: readings where the books are silent or unclear; each defaults to the recommended reading.
   Stored in this browser only.
   ================================================================ */
const OPT_KEY="am-optrules";
const OPT_RULES=[
 {id:"saintSecret",grp:"sub",def:!0,by:"book",l:"Saints: the storyguide rolls the saint’s die in secret",
  x:"Invoking a saint is Communication + Charm + modifiers + a simple die against 15 + a simple die that the storyguide rolls hidden. Off: the app rolls the saint’s die openly.",ref:"RoP:D p. 87"},
 {id:"savFull",grp:"sub",def:!0,by:"author",l:"Savantism: offer buying the favoured Ability at full rate",
  x:"An optional rule chosen per character in Build: the favoured Ability’s experience counts half against the halved pools. Off: the choice is hidden and not applied.",ref:"DE p. 143"},
 {id:"holyDie",grp:"sub",def:!0,by:"author",l:"Holy magi cast on the Divine die",
  x:"A holy magus’s spellcasting rolls the Divine die unless cast as Hermetic magic. Off: his spells use the Form’s die like any magus.",ref:"RoP:D pp. 67–69"},
 {id:"faeMagicBotch",grp:"home",def:!0,by:"ours",l:"Faerie Magic still rolls foreign-aura botch dice in a Faerie aura",
  x:"Faerie Magic gives full benefit from Faerie auras; the book does not say whether the extra botch dice remain. On: they remain (the normal rule). Off: none.",ref:"DE pp. 236, 411"},
 {id:"holyForeignBotch",grp:"home",def:!0,by:"ours",l:"Holy magic rolls foreign-aura botch dice in Faerie and Infernal auras",
  x:"Holy magic takes half a Faerie aura and no Infernal penalty; the book says nothing of botch dice. On: the normal foreign-aura botch dice. Off: none.",ref:"RoP:D p. 69"},
 {id:"warpDefault",grp:"home",def:!0,by:"ours",l:"Assume Warping Points when none are recorded",
  x:"When a magus’s Warping Points are left blank, count about 2 a year after Gauntlet (DE p. 32 describes this as typical). Off: blank means none.",ref:"DE p. 32"},
 {id:"mirHope",grp:"home",def:!1,by:"ours",l:"Hope also doubles the extra Faith Points spent on a miracle",
  x:"Each extra Faith Point spent on a miracle adds +3 (RoP:D p. 60); Hope makes Faith Points spent like Confidence add +6 (p. 62). Recommended: +3 on miracles. On: +6 with True Faith 3 or more.",ref:"RoP:D pp. 60, 62"},
 {id:"notoAL",grp:"home",def:!1,by:"ours",l:"The Ars Notoria 50 experience may also buy Artes Liberales",
  x:"Recommended: the pool buys the four languages only. On: Artes Liberales too, since the Virtue also requires it at 4.",ref:"RoP:D p. 92"},
 {id:"ascPresence",grp:"home",def:!0,by:"ours",l:"Divine Ascension uses Presence",
  x:"The rule box says Presence + Concentration; the book’s worked example adds Intelligence. On (recommended): Presence. Off: Intelligence.",ref:"RoP:D p. 63"},
 {id:"relicMRAdds",grp:"home",def:!1,by:"ours",l:"A relic’s Magic Resistance adds to other Magic Resistance",
  x:"The book adds it to an invested ruler’s commanding aura. Recommended: otherwise the higher Magic Resistance applies, as for other sources. On: it always adds.",ref:"RoP:D p. 43; DE p. 55"},
 {id:"goeticHigher",grp:"home",def:!0,by:"ours",l:"Goetic magic swaps in Rego and Vim only where they are higher",
  x:"A magus may substitute Rego for a Goetic Art and Vim for the Lore. On (recommended): only where that helps. Off: always, when chosen.",ref:"RoP:I p. 124"},
 {id:"sacrGoetic",grp:"home",def:!1,by:"ours",l:"Sacrifice also adds to Goetic Art totals",
  x:"Sacrifice adds to an infernalist’s effect total. Recommended: maleficia only. On: Goetic Art totals as well.",ref:"RoP:I p. 95"}
];
const OPT_BY={};OPT_RULES.forEach(o=>OPT_BY[o.id]=o);
function optStore(){try{const v=JSON.parse(localStorage.getItem(OPT_KEY)||"{}");return v&&"object"==typeof v?v:{}}catch(z){return{}}}
window.amOpt=function(id){const o=OPT_BY[id];if(!o)return!1;const v=optStore()[id];return"boolean"==typeof v?v:o.def};
function optSet(id,v){const s=optStore();OPT_BY[id]&&(v===OPT_BY[id].def?delete s[id]:s[id]=!!v);try{localStorage.setItem(OPT_KEY,JSON.stringify(s))}catch(z){}}
const BY_LABEL={book:"Default: the book",author:"Default: the author’s ruling",ours:"Default: the recommended reading"};
function optList(grp){return OPT_RULES.filter(o=>o.grp===grp).map(o=>{const on=amOpt(o.id),changed=on!==o.def;
 return`<div class="opt-rule${changed?" opt-changed":""}"><label class="chk"><input type="checkbox" data-optrule="${o.id}"${on?" checked":""}> ${esc(o.l)}</label><p class="note">${esc(o.x)} <span class="opt-meta">${esc(o.ref)} · ${BY_LABEL[o.by]} (${o.def?"on":"off"})${changed?" · changed":""}</span></p></div>`}).join("")}
function optPane(seg){return`<p class="note">Defaults follow the Definitive Edition first, then the author’s rulings, then the recommended readings. Choices are kept in this browser and apply to every character.</p>
 <nav class="opt-seg" role="tablist"><button type="button" role="tab" data-optseg="sub" aria-selected="${"sub"===seg}">Sub rules</button><button type="button" role="tab" data-optseg="home" aria-selected="${"home"===seg}">Homebrew rules</button></nav>
 <div class="opt-list" data-optlist="sub"${"sub"===seg?"":" hidden"}><p class="note">Optional and variant rules printed in the books, and the author’s rulings.</p>${optList("sub")}</div>
 <div class="opt-list" data-optlist="home"${"home"===seg?"":" hidden"}><p class="note">Readings where the books are silent or unclear. Each starts on the recommended reading.</p>${optList("home")}</div>
 <div class="opt-acts"><button type="button" class="btn small ghost" data-optreset>Reset optional rules</button></div>`}
const optCss=document.createElement("style");
optCss.textContent=".set-tabs,.opt-seg{display:flex;gap:0;border-bottom:1px solid var(--rule);margin:4px 0 12px}.set-tabs button,.opt-seg button{cursor:pointer;font:600 13px var(--caps);letter-spacing:.08em;color:var(--muted);background:0 0;border:0;border-bottom:2px solid transparent;padding:8px 12px}.set-tabs button[aria-selected=true],.opt-seg button[aria-selected=true]{color:inherit;border-bottom-color:#c39532}.opt-rule{padding:6px 0;border-bottom:1px dashed var(--rule)}.opt-rule .note{margin:2px 0 0 26px}.opt-meta{opacity:.8;font-style:italic}.opt-changed>label{font-weight:700}.opt-acts{margin-top:10px}";
document.head.appendChild(optCss);
{const O=openSettings;openSettings=function(){
 O.apply(this,arguments);
 try{
  const box=document.querySelector(".pmodal .set-box");if(!box||box.querySelector("[data-settabs]"))return;
  const h3=box.querySelector("h3"),gen=document.createElement("div"),rules=document.createElement("div"),tabs=document.createElement("nav");
  gen.dataset.setpane="general";rules.dataset.setpane="rules";rules.hidden=!0;
  const acts=box.querySelector(":scope > .pm-acts");[...box.children].forEach(c=>{c!==h3&&c!==acts&&gen.appendChild(c)});
  tabs.className="set-tabs";tabs.setAttribute("role","tablist");tabs.dataset.settabs="";
  tabs.innerHTML='<button type="button" role="tab" data-settab="general" aria-selected="true">General</button><button type="button" role="tab" data-settab="rules" aria-selected="false">Optional rules</button>';
  rules.innerHTML=optPane("sub");
  h3.after(tabs);tabs.after(gen);gen.after(rules);acts&&rules.after(acts);
 }catch(z){console.error(z)}
}}
const optRedraw=()=>{try{"play"===MODE?renderPlay():renderAll()}catch(z){console.error(z)}};
document.addEventListener("click",e=>{
 const t=e.target.closest&&e.target.closest("[data-settab],[data-optseg],[data-optreset]");if(!t||!t.closest(".set-box"))return;
 const box=t.closest(".set-box");
 if(t.dataset.settab){box.querySelectorAll("[data-settab]").forEach(b=>b.setAttribute("aria-selected",String(b===t)));box.querySelectorAll("[data-setpane]").forEach(p=>p.hidden=p.dataset.setpane!==t.dataset.settab)}
 else if(t.dataset.optseg){box.querySelectorAll("[data-optseg]").forEach(b=>b.setAttribute("aria-selected",String(b===t)));box.querySelectorAll("[data-optlist]").forEach(p=>p.hidden=p.dataset.optlist!==t.dataset.optseg)}
 else if(t.hasAttribute("data-optreset")){try{localStorage.removeItem(OPT_KEY)}catch(z){}const p=box.querySelector('[data-setpane="rules"]'),seg=(box.querySelector('[data-optseg][aria-selected="true"]')||{dataset:{optseg:"sub"}}).dataset.optseg;p&&(p.innerHTML=optPane(seg));optRedraw()}
 e.preventDefault();
});
document.addEventListener("change",e=>{
 const i=e.target;if(!i||!i.dataset||!i.dataset.optrule||!i.closest(".set-box"))return;
 optSet(i.dataset.optrule,!!i.checked);
 const p=i.closest('[data-setpane="rules"]'),seg=(p.querySelector('[data-optseg][aria-selected="true"]')||{dataset:{optseg:"sub"}}).dataset.optseg;p.innerHTML=optPane(seg);
 optRedraw();
});
