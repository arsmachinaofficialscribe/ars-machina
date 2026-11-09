/* 4.9.8.0 motion: which overlay covers the page (Retro pixel sigils behind it stop redrawing) */
window.amTopLayer=function(){const f=document.querySelector(".fx");if(f)return f;
 const m=document.body&&document.body.classList.contains("menu-open")&&document.getElementById("menu");return m&&!m.hidden?m:null};
/* 4.9.8.0 rendering: hold off-screen sections during a whole-page restyle (theme, skin, fonts) */
{const CV_SEL="#work>section.folio,.psec",ok=!(!window.CSS||!CSS.supports||!CSS.supports("content-visibility","auto"));
 let held=[],relT=0,on=!1;
 const release=()=>{relT=0;on=!1;const q=held;held=[];const step=()=>{const el=q.shift();el&&el.isConnected&&(el.classList.remove("am-cv"),el.style.containIntrinsicSize="");q.length&&idle(step,800)};q.length&&idle(step,800)};
 window.amCvHold=function(ms){if(!ok)return;if(!on){on=!0;const vh=innerHeight,m=vh*.6;
  document.querySelectorAll(CV_SEL).forEach(el=>{const r=el.getBoundingClientRect();if(!r.height||!(r.bottom<-m||r.top>vh+m))return;
   el.style.containIntrinsicSize=Math.round(r.width)+"px "+Math.round(r.height)+"px";el.classList.add("am-cv");held.push(el)})}
  clearTimeout(relT);relT=setTimeout(release,ms||700)};
 const wrapHold=n=>{const f=window[n];"function"==typeof f&&(window[n]=function(){amCvHold();return f.apply(this,arguments)})};
 const AT=applyTheme;applyTheme=function(){amCvHold();return AT.apply(this,arguments)};
 wrapHold("applySkin");
 const AF=applyFonts;applyFonts=function(){amCvHold();return AF.apply(this,arguments)};
}
