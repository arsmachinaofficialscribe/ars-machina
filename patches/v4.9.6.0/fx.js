/* ---------------------------------------------------------------- realm roll effects: wings, flames, sparks */
/* Built into the roll circle like the Form effects: transform and opacity only, at most 30 elements,
   none when the reader prefers reduced motion; Retro steps the motion and draws with crisp edges. */
const RDX_WING="M2 18C4 11 9 5 17 2c-1 3-2 5-4 7 2-1 4-1 5 0-2 2-4 3-6 3 2 0 3 1 4 2-3 1-6 1-8 0 1 1 1 2 1 3-3 0-6-1-7 1z";
const RDX_FLAME="M10 1c3 5 7 8 7 13a7 7 0 0 1-14 0c0-3 2-5 3-8 1 2 2 3 3 3 0-3-1-5 1-8z";
const RDX_SPARK="M10 0l1.6 8.4L20 10l-8.4 1.6L10 20l-1.6-8.4L0 10l8.4-1.6z";
const rdxSvg=(d,cls)=>`<svg class="${cls}" viewBox="0 0 20 20" aria-hidden="true"><path d="${d}"/></svg>`;
function rdxDecor(fx,r){
 const w=fx.querySelector(".fx-wheel");if(!w)return;
 fx.dataset.rd=r;delete fx.dataset.fx;delete fx.dataset.fxt;
 w.querySelectorAll(".fx-parts").forEach(n=>n.remove());
 if(fxReduced())return;
 const lite="function"==typeof FX_LITE&&FX_LITE(),R=Math.random,out=[];
 if("div"===r){
  out.push('<div class="rdx-halo"></div>');
  for(let i=0;i<6;i++){const a=i*60+30;out.push(`<span class="rdx-arm" style="--a:${a}deg"><span class="rdx-wing${i<3?"":" rdx-flip"}" style="--d:${(i*.09).toFixed(2)}s">${rdxSvg(RDX_WING,"")}</span></span>`)}
  for(let i=0,n=lite?6:12;i<n;i++)out.push(`<span class="rdx-mote" style="--x:${(18+64*R()).toFixed(0)}%;--y:${(30+50*R()).toFixed(0)}%;--d:${(2.4*R()).toFixed(2)}s"></span>`);
 }else if("inf"===r){
  for(let i=0,n=lite?10:16;i<n;i++){const a=i/n*360;out.push(`<span class="rdx-arm" style="--a:${a.toFixed(0)}deg"><span class="rdx-flame" style="--d:${(.9*R()).toFixed(2)}s;--h:${(.75+.5*R()).toFixed(2)}">${rdxSvg(RDX_FLAME,"")}</span></span>`)}
  for(let i=0,n=lite?5:10;i<n;i++)out.push(`<span class="rdx-ember" style="--x:${(20+60*R()).toFixed(0)}%;--d:${(2*R()).toFixed(2)}s;--rx:${(40*R()-20).toFixed(0)}px"></span>`);
 }else if("fae"===r){
  out.push('<div class="rdx-orbit">');
  for(let i=0,n=lite?14:26;i<n;i++){const a=R()*360,rad=22+24*R();
   out.push(`<span class="rdx-spark" style="--x:${(50+rad*Math.cos(a*Math.PI/180)).toFixed(1)}%;--y:${(50+rad*Math.sin(a*Math.PI/180)).toFixed(1)}%;--d:${(1.8*R()).toFixed(2)}s;--c:${["#9fe8d8","#c8b0ff","#ffc4e0","#fff6c0"][i%4]};--s:${(.6+.8*R()).toFixed(2)}">${rdxSvg(RDX_SPARK,"")}</span>`)}
  out.push('</div>');
 }
 w.insertAdjacentHTML("beforeend",`<div class="rdx rdx-${r}" aria-hidden="true">${out.join("")}</div>`);
}
{const FD=fxArtDecor;fxArtDecor=function(e,t){const r=rdOf(t);if(!r)return FD.apply(this,arguments);try{FD.apply(this,arguments)}catch(z){}try{rdxDecor(e,r)}catch(z){console.error(z)}}}
{const css=document.createElement("style");css.id="v4.9.6.0-rdx-css";css.textContent=`
.fx[data-rd=div]{--fx-c:#fff0c0;--fx-g:#ffe9a099}.fx[data-rd=inf]{--fx-c:#b3121e;--fx-g:#8a0a1299}.fx[data-rd=fae]{--fx-c:#b8f0e4;--fx-g:#c8b0ff99}
.fx[data-rd=div] .fx-circle{filter:sepia(.35) brightness(1.18) drop-shadow(0 0 8px #ffe9a080)}
.fx[data-rd=inf] .fx-circle{filter:sepia(1) saturate(8) hue-rotate(-58deg) brightness(.72) drop-shadow(0 0 10px #a0081488)}
.fx[data-rd=fae] .fx-circle{filter:sepia(.6) saturate(2.2) hue-rotate(115deg) drop-shadow(0 0 8px #c8b0ff66)}
:root[data-skin=retro] .fx[data-rd] .fx-circle{filter:none}:root[data-skin=retro] .fx[data-rd=div] .fx-circle .rx-img{filter:sepia(.35) brightness(1.3)}:root[data-skin=retro] .fx[data-rd=inf] .fx-circle .rx-img{filter:sepia(1) saturate(9) hue-rotate(-60deg) brightness(.6) contrast(1.15)}:root[data-skin=retro] .fx[data-rd=fae] .fx-circle .rx-img{filter:sepia(.6) saturate(2.2) hue-rotate(115deg)}
.rdx{position:absolute;inset:0;pointer-events:none}
.rdx>*,.rdx-orbit>*,.rdx-wing,.rdx-flame{position:absolute}
.rdx svg{width:100%;height:100%;display:block;overflow:visible}
.rdx-halo{inset:4%;border-radius:50%;background:repeating-conic-gradient(#fff3c8 0 1.6deg,transparent 1.6deg 12deg);-webkit-mask:radial-gradient(circle,transparent 58%,#000 63%,#000 70%,transparent 76%);mask:radial-gradient(circle,transparent 58%,#000 63%,#000 70%,transparent 76%);opacity:.8}
.rdx-arm{inset:0;transform:rotate(var(--a))}
.rdx-wing{left:50%;top:-3%;width:20%;height:20%;margin-left:-10%;transform-origin:50% 100%;transform:scale(.2);opacity:0}
.rdx-flip svg{transform:scaleX(-1)}
.rdx-wing path{fill:#fff1c6;stroke:#c9a24a;stroke-width:.7;filter:drop-shadow(0 0 3px #ffe9a0)}
.rdx-mote{left:var(--x);top:var(--y);width:4px;height:4px;border-radius:50%;background:#fff6d0;box-shadow:0 0 6px #ffe39a;opacity:0}
.rdx-flame{left:50%;top:-4%;width:13%;height:19%;margin-left:-6.5%;transform:scaleY(var(--h));transform-origin:50% 100%}
.rdx-flame path{fill:#9a0c16;filter:drop-shadow(0 0 6px #6a0008) drop-shadow(0 0 2px #e0283a)}
.rdx-arm:nth-child(3n) .rdx-flame path{fill:#c8182a}.rdx-arm:nth-child(4n) .rdx-flame path{fill:#5e050c}
.rdx-ember{left:var(--x);bottom:24%;width:3px;height:3px;background:#e02a36;box-shadow:0 0 5px #8a0a12;opacity:0}
.rdx-orbit{inset:0}
.rdx-inf:before{content:"";position:absolute;inset:6%;border-radius:50%;background:radial-gradient(circle,transparent 52%,#5a040a55 66%,#8a0a1240 74%,transparent 80%)}
.rdx-spark{left:var(--x);top:var(--y);width:7%;height:7%;margin:-3.5% 0 0 -3.5%;opacity:0}
.rdx-spark path{fill:var(--c);filter:drop-shadow(0 0 4px var(--c))}
@media (prefers-reduced-motion:no-preference){
 .rdx-halo{animation:rdxSpin 16s linear infinite,rdxPulse 2.4s ease-in-out infinite}
 .rdx-wing{animation:rdxUnfurl .7s var(--d) cubic-bezier(.2,.8,.3,1.2) forwards,rdxBeat 1.6s calc(var(--d) + .7s) ease-in-out infinite}
 .rdx-mote{animation:rdxRise 2.6s var(--d) ease-out infinite}
 .rdx-flame{animation:rdxLick .55s var(--d) ease-in-out infinite alternate}
 .rdx-ember{animation:rdxEmber 2.2s var(--d) ease-out infinite}
 .rdx-orbit{animation:rdxSpin 22s linear infinite}
 .rdx-spark{animation:rdxTwinkle 1.4s var(--d) ease-in-out infinite}
}
@keyframes rdxSpin{to{rotate:360deg}}
@keyframes rdxPulse{50%{opacity:1}}
@keyframes rdxUnfurl{to{opacity:1;transform:scale(1)}}
@keyframes rdxBeat{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.07) rotate(-8deg)}}
@keyframes rdxRise{0%{opacity:0;transform:translateY(0)}20%{opacity:1}100%{opacity:0;transform:translateY(-70px)}}
@keyframes rdxLick{0%{transform:scaleY(calc(var(--h)*.7)) scaleX(1.08) rotate(-3deg)}100%{transform:scaleY(calc(var(--h)*1.15)) scaleX(.9) rotate(3deg)}}
@keyframes rdxEmber{0%{opacity:0;transform:translate(0,0)}15%{opacity:1}100%{opacity:0;transform:translate(var(--rx),-140px)}}
@keyframes rdxTwinkle{0%,100%{opacity:0;transform:scale(0) rotate(0)}50%{opacity:1;transform:scale(var(--s)) rotate(45deg)}}
:root[data-skin=retro] .rdx svg{shape-rendering:crispEdges}
:root[data-skin=retro] .rdx-mote,:root[data-skin=retro] .rdx-ember{border-radius:0;box-shadow:none}
:root[data-skin=retro] .rdx-wing path,:root[data-skin=retro] .rdx-flame path,:root[data-skin=retro] .rdx-spark path{filter:none}
:root[data-skin=retro] .rdx-halo{background:repeating-conic-gradient(#fff3c8 0 3deg,transparent 3deg 15deg)}
@media (prefers-reduced-motion:no-preference){
 :root[data-skin=retro] .rdx-halo{animation:rdxSpin 16s steps(48) infinite}
 :root[data-skin=retro] .rdx-wing{animation:rdxUnfurl .7s var(--d) steps(5) forwards,rdxBeat 1.6s calc(var(--d) + .7s) steps(4) infinite}
 :root[data-skin=retro] .rdx-mote{animation:rdxRise 2.6s var(--d) steps(8) infinite}
 :root[data-skin=retro] .rdx-flame{animation:rdxLick .55s var(--d) steps(3) infinite alternate}
 :root[data-skin=retro] .rdx-ember{animation:rdxEmber 2.2s var(--d) steps(8) infinite}
 :root[data-skin=retro] .rdx-orbit{animation:rdxSpin 22s steps(60) infinite}
 :root[data-skin=retro] .rdx-spark{animation:rdxTwinkle 1.4s var(--d) steps(4) infinite}
}`;document.head.appendChild(css)}
