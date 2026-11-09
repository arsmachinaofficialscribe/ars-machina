/* ---------------------------------------------------------------- realm dice: Divine, Infernal, Faerie */
/* __DICE__ is replaced at patch time by the asset manifest that tools/dice/pack_dice.py writes. */
const RD=__DICE__;
const RD_NAME={div:"alabaster (Divine)",inf:"charred iron (Infernal)",fae:"dragonfly glass (Faerie)"};
for(const k in RD){const d=RD[k];
 DIE_ART[k]={h:d.h,t:d.t,p:d.p,pt:d.pt};
 window.DIE_FACE_DATA&&(DIE_FACE_DATA.art[k]={ink:d.ink,shade:d.shade});
 window.DIE_RETRO_FACES&&(DIE_RETRO_FACES[k]={p:d.rp,pc:d.rc,p10:d.rp10,pc10:d.rc10});
 DIE_NAME[k]=RD_NAME[k];}
Object.assign(DIE_MAT,{div:["#fbf6ea","#e2d6bf","#a8956c","#ffffff","rgba(60,45,15,.3)"],inf:["#5a4a42","#2a2320","#0e0b0a","#7a3a20","rgba(0,0,0,.5)"],fae:["#e6f6ff","#b9a8ec","#6f8fb8","#ffffff","rgba(30,40,70,.3)"]});
/* which rolls take which die (RoP:D, RoP:I, RoP:F; Holy Magic casting RoP:D pp. 67-69) */
const RD_DIV=new Set(["r:holy","r:prayer","r:influence"]),RD_INF=new Set(["r:mal","r:goetic","r:scour","r49:tarnish"]),RD_FAE=new Set(["r:rite","r:curse"]);
const rdHolyCast=id=>/^spell:|^spont$|^fastcast$/.test(id)&&holyMagus(st)&&!("function"==typeof XP&&XP().holyHermetic);
const rdOf=e=>{const t=e&&e.id||"";
 if(RD_DIV.has(t)||/^r49:(miracle|aid|temper|noto)/.test(t)||rdHolyCast(t))return"div";
 if(RD_INF.has(t))return"inf";if(RD_FAE.has(t))return"fae";
 /* a Might-based being's own rolls take its realm's die (none exist yet; ready for them) */
 if(/^m49:/.test(t)&&st.being&&st.being.on)return{Divine:"div",Infernal:"inf",Faerie:"fae"}[st.being.realm]||null;
 return null};
{const D0=dieMat0;dieMat0=function(e){return rdOf(e)||D0.apply(this,arguments)}}
{const DA=dieArtKey;dieArtKey=function(e){const r=rdOf(e);return r||DA.apply(this,arguments)}}
{const DF=dieForm;dieForm=function(e){return rdOf(e)?"":DF.apply(this,arguments)}}
/* chip colours, numeral contrast and the plain roll-log chips, as for every other die */
{const css=document.createElement("style");css.id="v4.9.6.0-dice-css";
 const ink={div:["#5a3d0c","rgba(255,246,226,.9)"],inf:["#f0a060","rgba(10,4,2,.92)"],fae:["#2a2160","rgba(246,244,255,.9)"]};
 css.textContent=Object.keys(RD).map(k=>{const m=DIE_MAT[k],[i,o]=ink[k];
  return`.dm-${k} .die:not(.ex):not(.zero):not(.z){color:${i};background:linear-gradient(160deg,${m[0]},${m[1]} 55%,${m[2]})}
.fx[data-die=${k}] .fx-face{color:${i}}
.dm-${k}{--die-c:url(${RD[k].c});--die-pc:url(${RD[k].pc});--die-ink:${i};--die-sh:${o};--die-out:${o};--die-ink-r:${i};--die-out-r:${o}}
.fx-die:has(.fx-die-art[data-art=${k}]){--die-ink:${i};--die-sh:${o};--die-out:${o};--die-ink-r:${i};--die-out-r:${o}}`}).join("\n");
 document.head.appendChild(css);}
