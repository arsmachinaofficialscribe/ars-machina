/* 4.9.9.9 fixes: names for unlabeled fields, the sound button in the header, arrow keys on the console tabs */
/* fields without a name take one from their row and column (screen readers and voice control) */
function l99(root){
 (root||document).querySelectorAll("#work input:not([type=hidden]),#work select,#work textarea").forEach(e=>{
  if(e.getAttribute("aria-label")||e.closest("label")||(e.labels&&e.labels.length)||e.getAttribute("aria-labelledby"))return;
  const tr=e.closest("tr");if(!tr)return;const td=e.closest("td,th");const tb=tr.closest("table");
  const idx=td?[...tr.children].indexOf(td):-1;let col="";
  if(tb&&idx>=0){const hr=tb.querySelector("thead tr")||tb.querySelector("tr");const th=hr&&hr.children[idx];col=th&&th!==td?th.textContent.trim():""}
  const first=tr.children[0];let row=first&&first!==td?(first.querySelector("input,select")?(first.querySelector("input,select").value||""):first.textContent):"";
  row=String(row).replace(/\s+/g," ").trim().slice(0,60);
  const name=[col,row].filter(Boolean).join(": ");name&&e.setAttribute("aria-label",name);
 });
}
{const R=renderAll;renderAll=function(){const r=R.apply(this,arguments);try{l99()}catch(z){}return r}}
/* the speaker button sits in the header's tools while a character is open, and floats only over the main menu */
let s99q=0;const s99later=()=>{clearTimeout(s99q);s99q=setTimeout(s99,60)};
function s99(){
 const t=document.querySelector("[data-global-sound-toggle]");if(!t)return;
 const menu=document.body.classList.contains("menu-open")||document.querySelector(".amx-start:not([hidden])");
 const slot=document.querySelector(".hdr-tools"),fm=document.querySelector(".f975-fm");
 const host=slot&&slot.offsetParent?slot:fm||null;
 if(!menu&&host){if(t.parentElement!==host){host===slot?host.insertBefore(t,host.firstChild):host.appendChild(t)}t.classList.toggle("s99-hdr",host===slot);t.classList.toggle("s99-fm",host!==slot)}
 else if(t.parentElement!==document.body){document.body.appendChild(t);t.classList.remove("s99-hdr","s99-fm")}
}
new MutationObserver(()=>{s99();s99later()}).observe(document.body,{attributes:!0,attributeFilter:["class"]});
new MutationObserver(s99later).observe(document.body,{childList:!0,subtree:!0});
addEventListener("resize",()=>s99());for(const f of ["renderAll","renderPlay","setMode"]){const R=window[f];if("function"==typeof R)window[f]=function(){const r=R.apply(this,arguments);try{s99();s99later()}catch(z){}return r}}
setTimeout(s99,0);
/* arrow keys move between the console tabs */
document.addEventListener("keydown",e=>{
 const t=e.target;if(!t||!t.matches||!t.matches('[role=tab][data-pact="ctab"]')||!/^Arrow(Left|Right)$|^Home$|^End$/.test(e.key))return;
 const all=[...t.parentElement.querySelectorAll('[role=tab]')],i=all.indexOf(t);
 const n="Home"===e.key?0:"End"===e.key?all.length-1:(i+("ArrowRight"===e.key?1:-1)+all.length)%all.length;
 e.preventDefault();const id=all[n].dataset.t;all[n].click();const f=()=>{const k=document.querySelector(`[role=tab][data-pact="ctab"][data-t="${id}"]`);k&&document.activeElement!==k&&k.focus()};setTimeout(f,0);setTimeout(f,80);
});
