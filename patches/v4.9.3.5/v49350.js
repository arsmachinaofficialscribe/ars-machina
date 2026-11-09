!function(){
  var SEL='#menu [data-mn="storyguide"]',wrapped=!1;
  // Storyguide replaces drawMenu and, for its own view, does not call the
  // functions it wraps. Loaded on demand it sits outside the v4.8.6.2 menu
  // history wrapper, so record history for that view here.
  function wrapHistory(){
    if(wrapped||"function"!=typeof drawMenu)return;
    wrapped=!0;
    var inner=drawMenu;
    drawMenu=function(){
      if("undefined"!=typeof MN&&"storyguide"===MN.view&&MN.hist){
        var t=MN.view;
        MN.goingBack?MN.goingBack=!1:MN.shown&&MN.shown!==t&&(MN.hist.push(MN.shown),MN.hist.length>30&&MN.hist.shift());
        MN.shown=t
      }
      return inner.apply(this,arguments)
    }
  }
  function loadStoryguide(){
    return window.amLoadLazy("storyguide").then(function(){
      if(!window.ArsMachinaSaga)throw new Error("Storyguide did not start");
      wrapHistory()
    })
  }
  window.amLoadStoryguide=loadStoryguide;
  document.addEventListener("click",function(e){
    if(window.ArsMachinaSaga)return;
    var b=e.target.closest&&e.target.closest(SEL);
    if(!b)return;
    e.preventDefault();e.stopImmediatePropagation();
    loadStoryguide().then(function(){
      MN.view="storyguide";MN.pick=null;MN.err="";drawMenu()
    },function(x){
      console.error(x);
      "function"==typeof toast&&toast("Storyguide could not be loaded. Check the connection and try again.","bad")
    })
  },!0);
  var warm=function(e){
    !window.ArsMachinaSaga&&e.target.closest&&e.target.closest(SEL)&&window.amPrefetchLazy("storyguide")
  };
  document.addEventListener("pointerover",warm,{passive:!0});
  document.addEventListener("focusin",warm);
  try{"1"===localStorage.getItem("arm5-sg-open")&&loadStoryguide().catch(function(x){console.error(x)})}catch(x){}
  var C=window.CHANGELOG&&window.CHANGELOG[0];
  C&&[
    ["4.9.3.1","Spell sources checked",["The 125 spells that were missing a Range, Duration or Target were checked against their books. 65 now have all three; 55 that the books do not give in full, and five that are enchanted-item effects rather than spells, were taken out of the spell picker.","The picker names each spell's source note instead of “partial source stats”."]],
    ["4.9.3.2","Quieter browser diagnostics",["Firefox and Floorp no longer show a “Blocked script” notice for anonymous code injected by browser extensions. Blocked scripts that come from the app are still reported."]],
    ["4.9.3.3","PDF export restored",["Exporting a PDF sheet works again on the hosted site: the security policy now admits the two bundled PDF libraries by their exact fingerprints.","Credits, menus and saved character files give the same version number."]],
    ["4.9.3.4","Storyguide loads when requested",["Storyguide's code waits until you open Storyguide, so the app starts with less to do. An active Storyguide session still restores after a reload."]],
    ["4.9.3.5","Storyguide opens first time; spell Targets cleaned",["Storyguide opens on the first click instead of needing a second, the menu click sound plays once, and Back and Escape return to the right screen from Storyguide.","39 spells checked in 4.9.3.1 had part of their description in the Target field (e.g. “Ind The spell removes all pain…”). Each Target was checked against its book and corrected; Remain Within Those Walls now reads Arcane Circle, as printed.","Faster loading on the hosted site: the fonts, the PDF libraries and the Storyguide are separate files that the browser keeps between visits and fetches only when needed. The PDF libraries load when you first export a sheet.","About no longer loads the Storyguide, and the newest releases appear first in this changelog again."]]
  ].forEach(function(e){C.items.unshift(e)})
}();
