/* v4.9.7.6 — portraits are upright (100 × 130), not square */
const PT_AR=1.3,PT_W=540,PT_H=702;
FR_OUT.splice(0,4,4,4,92,122);FR_IN.splice(0,4,9,9,82,112);
const ptIsUpright=(w,h)=>Math.abs(h/w-PT_AR)<.01;

hermeticFrameSvg=function(t,e){const a=e||{},r="ptc"+ ++PT_UID,o=(("magus"===st.type?st.house:"companion"===st.type?"Companion":"Grog")||"?")[0],
 n=t?`<image data-portrait-image href="${esc(t)}" x="0" y="0" width="100" height="130" preserveAspectRatio="xMidYMid slice" clip-path="url(#${r})"/>`:'<rect x="9" y="9" width="82" height="112" style="fill:var(--fr-win,#1a2336)"/>'+("magus"===st.type&&"undefined"!=typeof HOUSE_SYM&&HOUSE_SYM[st.house]?`<g transform="translate(26 41) scale(.48)" opacity=".55" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--fr-line,#e1be63);stroke:var(--fr-line,#e1be63)">${HOUSE_SYM[st.house]}</g>`:`<text x="50" y="77" text-anchor="middle" style="fill:var(--fr-line,#e1be63)" font-family="Grenze Gotisch, Georgia, serif" font-size="34" opacity=".55">${esc(o)}</text>`),
 i=(t,e,a)=>`<g transform="translate(${t} ${e})"><circle r="${a}" style="fill:var(--fr-ros,#121a2b);stroke:var(--fr-line,#e1be63)" stroke-width=".8"/><rect x="${.55*-a}" y="${.55*-a}" width="${1.1*a}" height="${1.1*a}" fill="none" style="stroke:var(--fr-line,#e1be63)" stroke-width=".6"/><rect x="${.55*-a}" y="${.55*-a}" width="${1.1*a}" height="${1.1*a}" fill="none" style="stroke:var(--fr-line,#e1be63)" stroke-width=".6" transform="rotate(45)"/><circle r="${.22*a}" style="fill:var(--fr-line,#e1be63)"/></g>`,
 l=(t,e)=>`<path d="M${t},${e-2.6} L${t+1.8},${e} L${t},${e+2.6} L${t-1.8},${e} Z" style="fill:var(--fr-line,#e1be63);stroke:var(--fr-ros,#121a2b)" stroke-width=".5"/>`;
 return`<svg class="hframe${a.cls?" "+a.cls:""}" viewBox="0 0 100 130" role="img" aria-label="${esc(a.label||"Portrait")}"><defs><clipPath id="${r}"><path d="${frRect(FR_IN)}"/></clipPath></defs>
    <path d="${frRect(FR_OUT)} ${frRect(FR_IN)}" fill-rule="evenodd" style="fill:var(--fr-bg,#0d1220)"/>${n}
    <path d="${frRect(FR_OUT)}" fill="none" style="stroke:var(--fr-line,#e1be63)" stroke-width="1.4"/><path d="${frRect([6.5,6.5,87,117])}" fill="none" style="stroke:var(--fr-line,#e1be63)" stroke-width=".5" stroke-dasharray=".6 2.2" opacity=".7"/>
    <path d="${frRect(FR_IN)}" fill="none" style="stroke:var(--fr-line,#e1be63)" stroke-width=".6" opacity=".85"/>
    ${l(50,4)}${l(50,126)}${l(4,65)}${l(96,65)}${i(4,4,3.6)}${i(96,4,3.6)}${i(4,126,3.6)}${i(96,126,3.6)}</svg>`};

/* t, e: natural size; a: frame width in px (its height is a × 1.3); r, o: centre; n: zoom */
cropGeo=function(t,e,a,r,o,n){const H=a*PT_AR,x0=a*FR_IN[0]/100,x1=a*(FR_IN[0]+FR_IN[2])/100,y0=a*FR_IN[1]/100,y1=a*(FR_IN[1]+FR_IN[3])/100,
 c=Math.max((x1-x0)/t,(y1-y0)/e)*n,d=t*c,h=e*c,p=Math.min(x0,Math.max(x1-d,a/2-r*d)),f=Math.min(y0,Math.max(y1-h,H/2-o*h));return{s:c,w:d,h,ox:p,oy:f,cx:(a/2-p)/d,cy:(H/2-f)/h}};

ptRender=function(t,e,a,r,o){const n=cropGeo(t.naturalWidth,t.naturalHeight,PT_W,e,a,r),i=document.createElement("canvas");i.width=PT_W,i.height=PT_H;const l=i.getContext("2d");
 return o||(l.fillStyle="#0d1220",l.fillRect(0,0,i.width,i.height)),l.imageSmoothingQuality="high",l.drawImage(t,n.ox,n.oy,n.w,n.h),o?i.toDataURL("image/png"):i.toDataURL("image/jpeg",.9)};

ptPixelSource=async function(t,e){let a;if(t.orig){const e=await ptImage(t.orig),r=t.crop||{cx:.5,cy:.4,z:1};a=ptRender(e,r.cx,r.cy||.4,r.z||1,ptIsAlpha(t.orig))}
 else PT_PIXEL_OWNER!==t&&(PT_PIXEL_OWNER=t,PT_PIXEL_BASE=t.src),a=t.baseSrc||PT_PIXEL_BASE||t.src;if(!e)return a;
 const r=await ptImage(a),W=r.naturalWidth||PT_W,H=r.naturalHeight||PT_H,o=ptBlockSize(e),l=document.createElement("canvas");l.width=Math.max(1,Math.ceil(W/o)),l.height=Math.max(1,Math.ceil(H/o));
 const s=l.getContext("2d");s.imageSmoothingEnabled=!0,s.drawImage(r,0,0,l.width,l.height);const c=document.createElement("canvas");c.width=W,c.height=H;const d=c.getContext("2d");
 return d.imageSmoothingEnabled=!1,d.drawImage(l,0,0,W,H),ptIsAlpha(a)?c.toDataURL("image/png"):c.toDataURL("image/jpeg",.92)};

/* a square portrait from an older file: re-cut from the original with its crop, or trim the sides of the picture itself */
const ptUprightCut=(img,alpha)=>{const w=img.naturalWidth,h=img.naturalHeight;let sw=w,sh=h;h/w>PT_AR?sh=w*PT_AR:sw=h/PT_AR;const c=document.createElement("canvas");c.width=PT_W,c.height=PT_H;const x=c.getContext("2d");
 alpha||(x.fillStyle="#0d1220",x.fillRect(0,0,PT_W,PT_H)),x.imageSmoothingQuality="high",x.drawImage(img,(w-sw)/2,(h-sh)/2,sw,sh,0,0,PT_W,PT_H);return alpha?c.toDataURL("image/png"):c.toDataURL("image/jpeg",.9)};
const ptLoad=src=>new Promise((y,n)=>{const i=new Image;i.onload=()=>y(i),i.onerror=n,i.src=src});
let PT_UP=null;
ptSquareUp=function(){const t=st&&st.portrait;if(!t||!t.src||PT_UP===t)return;PT_UP=t;
 (async()=>{try{const e=await ptLoad(t.src);if(ptIsUpright(e.naturalWidth,e.naturalHeight))return;
  if(t.orig){const a=await ptLoad(t.orig),c=t.crop||{cx:.5,cy:.4,z:1};if(st.portrait!==t)return;t.src=ptRender(a,c.cx,c.cy,c.z||1,ptIsAlpha(t.orig))}
  else{if(t.baseSrc){const b=await ptLoad(t.baseSrc);if(st.portrait!==t)return;t.baseSrc=ptUprightCut(b,ptIsAlpha(t.baseSrc))}
   if(st.portrait!==t)return;t.src=t.pixel&&t.baseSrc?t.baseSrc:ptUprightCut(e,ptIsAlpha(t.src))}
  PT_PIXEL_OWNER=null;if(t.pixel>0){await ptSetPixel(t.pixel,!1)}st.portrait===t&&(persist(),renderAll())}catch(z){}finally{PT_UP===t&&(PT_UP=null)}})()};

{const C=ptCropUI;ptCropUI=function(t,e,a,r){C.apply(this,arguments);const m=document.querySelector(".pmodal");if(!m)return;
 const g=m.querySelector(".crop-stage");if(!g)return;g.style.height=Math.round(300*PT_AR)+"px";
 const s=g.querySelector(".crop-mask");s&&(s.setAttribute("viewBox","0 0 100 130"),s.innerHTML=`<path d="M0,0 H100 V130 H0 Z ${frRect(FR_IN)}" fill="rgba(8,10,18,.62)" fill-rule="evenodd"/><path d="${frRect(FR_IN)}" fill="none" stroke="#e1be63" stroke-width=".7"/>`)}}

/* the PDF sheet: the picture inside the window only */
window.ptWindow=async function(src){try{const i=await ptLoad(src),W=i.naturalWidth,H=i.naturalHeight,x=W*FR_IN[0]/100,y=W*FR_IN[1]/100,w=W*FR_IN[2]/100,h=Math.min(H-y,W*FR_IN[3]/100),c=document.createElement("canvas");
 c.width=Math.round(w),c.height=Math.round(h);c.getContext("2d").drawImage(i,x,y,w,h,0,0,c.width,c.height);return ptIsAlpha(src)?c.toDataURL("image/png"):c.toDataURL("image/jpeg",.92)}catch(z){return src}};
