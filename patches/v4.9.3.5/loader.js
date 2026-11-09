window.amFetchLazy=function(e){
  var F=window.__amLazyF||(window.__amLazyF={}),u=e.dataset.src;
  return F[u]||(F[u]=fetch(u,{integrity:e.dataset.sri,credentials:"same-origin"}).then(function(r){
    if(!r.ok)throw new Error("HTTP "+r.status+" loading "+u);
    return r.text()
  }).catch(function(x){delete F[u];throw x}))
},
window.amPrefetchLazy=function(k){
  document.querySelectorAll('script[type="text/plain"][data-am-lazy="'+k+'"][data-src]').forEach(function(e){window.amFetchLazy(e).catch(function(){})})
},
window.amLoadLazy=function(k){
  var P=window.__amLazyP||(window.__amLazyP={});
  if(P[k])return P[k];
  var els=Array.prototype.slice.call(document.querySelectorAll('script[type="text/plain"][data-am-lazy="'+k+'"]')),
      run=function(e,t){e.removeAttribute("data-am-lazy");var s=document.createElement("script");s.textContent=t;document.head.appendChild(s)},
      inl=function(e){return e.dataset.z?amInflate(e.textContent.trim()):e.textContent};
  if(!els.some(function(e){return e.dataset.src})){
    els.forEach(function(e){run(e,inl(e))});
    return P[k]=Promise.resolve()
  }
  return P[k]=Promise.all(els.map(function(e){return e.dataset.src?window.amFetchLazy(e):Promise.resolve(inl(e))})).then(function(a){
    a.forEach(function(t,i){run(els[i],t)})
  },function(x){delete P[k];throw x})
}
