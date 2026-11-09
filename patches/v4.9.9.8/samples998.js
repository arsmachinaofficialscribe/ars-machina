/* Sample companions and grogs for New Character: the Definitive Edition's character templates (DE pp. 32–34),
   as the book gives them. Ability experience is the score's cost, assigned to the creation stages it came from. */
const S98x=n=>5*n*(n+1)/2;
const S98=[
 {id:"knight",name:"The Knight",type:"companion",label:"The knight",small:"A mounted warrior bound by an oath of fealty",ref:"DE p. 34",
  age:25,chars:{Int:0,Per:0,Pre:1,Com:1,Str:1,Sta:1,Dex:2,Qik:2},
  vf:[["Knight","V"],["Wealthy","V"],["Improved Characteristics","V"],["Puissant (Ability)","V",{d:"Single Weapon"}],["Relic","V"],["Oath of Fealty","F"],["Proud","F",{sz:"Ma"}],["Overconfident","F",{sz:"Mi"}]],
  abil:[["Animal Handling","",2,"Falconry",{later:15}],["Area Lore","",3,"Nobles",{child:30}],["Athletics","",2,"Running",{child:15}],["Awareness","",3,"Battle",{later:30}],["Brawl","",2,"Punching",{later:15}],["Chirurgy","",1,"Sword wounds",{later:5}],["Etiquette","",3,"Noble",{later:30}],["Great Weapon","",5,"Great sword",{later:75}],["Hunt","",2,"Deer",{later:15}],["Intrigue","",1,"Noble courts",{later:5}],["Leadership","",4,"Soldiers",{later:50}],["Music","",1,"Singing",{later:5}],["Ride","",5,"In combat",{later:75}],["Single Weapon","",5,"Heater shield",{later:75}],["Survival","",1,"Forests",{later:5}]],
  native:"Giving orders",traits:[["Brave",3],["Overconfident",3],["Proud",6]],reps:[],conf:3,
  weapons:["Sword, Long","Shield, Heater","Sword, Great"],armor:["Chain Mail","full"],
  notes:"Full chain mail, long sword, heater shield, great sword (DE p. 34). His Relic Virtue gives a relic of True Faith 1.",
  custom:"The knight’s Wealthy Virtue gives him a lot of experience points, so it cannot be changed without recreating him. Oath of Fealty can be swapped for True Love, and the troupe may allow both. He regards himself as superior to almost anyone unless you change his Major Personality Flaw (DE p. 34)."},
 {id:"scholar",name:"The Female Scholar",type:"companion",label:"The female scholar",small:"A learned clerk who means to outdo any man",ref:"DE p. 33",
  age:20,chars:{Int:5,Per:1,Pre:1,Com:2,Str:-1,Sta:-1,Dex:0,Qik:1},
  vf:[["Clerk","V"],["Apt Student","V"],["Book Learner","V"],["Good Teacher","V"],["Great (Characteristic)","V",{d:"Intelligence"}],["Great (Characteristic)","V",{d:"Intelligence"}],["Improved Characteristics","V"],["Black Sheep","F"],["Driven","F",{sz:"Ma",d:"Prove herself a greater scholar than any man"}],["Social Handicap","F",{d:"Outspoken advocate of the abilities of women"}]],
  abil:[["Living Language","Arabic",1,"Medical terms",{later:5}],["Area Lore","",2,"Nunneries",{child:15}],["Artes Liberales","",3,"Rhetoric",{later:30}],["Charm","",2,"Scholars",{child:15}],["Organization Lore","Church Lore",2,"Scholars",{later:15}],["Civil and Canon Law","",1,"Rights of women",{later:5}],["Folk Ken","",2,"Scholars",{child:15}],["Guile","",2,"Lying to authority figures",{later:15}],["Dead Language","Latin",5,"Academic debate",{later:75}],["Medicine","",1,"Women’s illnesses",{later:5}],["Philosophiae","",3,"Moral philosophy",{later:30}],["Teaching","",3,"Artes Liberales",{later:30}],["Theology","",2,"Status of women",{later:15}]],
  native:"Debate",traits:[["Scholarly",3],["Independent",1],["Trusting",-2]],reps:[["Selfish shrew",2,"Local"]],conf:3,
  weapons:[],armor:null,notes:"Clothes, a slate or wax tablet for writing on (DE p. 33).",
  custom:"A scholar of the Artes Liberales who teaches as well as she studies; Good Teacher and Apt Student carry her in play (DE p. 33)."},
 {id:"hunter",name:"The Hunter",type:"grog",label:"The hunter",small:"A woodsman who guides the party and shoots from cover",ref:"DE p. 32",
  age:20,chars:{Int:0,Per:3,Pre:-2,Com:-2,Str:0,Sta:1,Dex:2,Qik:2},
  vf:[["Covenfolk","V"],["Warrior","V"],["Pessimistic","F",{sz:"Mi"}]],
  abil:[["Area Lore","",4,"Game trails",{child:45,later:5}],["Athletics","",1,"Climbing",{later:5}],["Awareness","",5,"Woodlands",{later:75}],["Bows","",4,"Shooting from cover",{"b:Warrior":50}],["Hunt","",5,"Deer",{later:75}],["Stealth","",2,"Hunting",{later:15}],["Survival","",4,"Woodlands",{later:50}]],
  native:"Talking about forests",traits:[["Brave",3],["Loyal",1],["Pessimistic",3]],reps:[],conf:0,
  weapons:["Bow, Short"],armor:["Heavy Leather","partial"],notes:"Partial heavy leather, short bow, arrows, survival kit (DE p. 32).",
  custom:"His Bows score uses Warrior’s bonus experience, so it cannot go below 4; his other Abilities apart from his native language can be swapped freely (DE p. 32)."},
 {id:"soldier",name:"The Standard Soldier",type:"grog",label:"The standard soldier",small:"A covenant shield-bearer, steady in a fight",ref:"DE p. 32",
  age:25,chars:{Int:-1,Per:0,Pre:0,Com:0,Str:1,Sta:1,Dex:2,Qik:2},
  vf:[["Covenfolk","V"],["Warrior","V"],["Weakness","F",{sz:"Mi",d:""}]],
  abil:[["Area Lore","",3,"Taverns",{child:30}],["Athletics","",3,"Running",{child:15,later:15}],["Awareness","",3,"In combat",{later:30}],["Bows","",4,"Short bow",{"b:Warrior":50}],["Brawl","",4,"Punching",{later:50}],["Carouse","",3,"Drinking",{later:30}],["Charm","",2,"Opposite sex",{later:15}],["Etiquette","",2,"Magi",{later:15}],["Great Weapon","",4,"Pole axe",{later:50}],["Guile","",2,"Avoiding duties",{later:15}],["Single Weapon","",5,"Heater shield",{later:75}],["Survival","",1,"For a short period",{later:5}]],
  native:"Rude words",traits:[["Brave",3],["Loyal",2],["Garrulous",1]],reps:[],conf:0,
  weapons:["Axe","Shield, Heater","Pole Axe"],armor:["Metal Scale","full"],notes:"Axe, heater shield, full metal scale armor, and a pack of gear to care for weapons and armor and make camp (DE p. 32).",
  custom:"The book leaves his Weakness for you to choose; he makes a good base for a slightly unusual grog (DE p. 32)."}
];
const S98_BY=Object.create(null);S98.forEach(s=>S98_BY["s:"+s.id]=s);
function s98make(id){
 const s=S98_BY[id];if(!s)return null;const e=blankState(s.type);
 e.info.name=s.name;e.ages.age=s.age;
 Object.assign(e.chars,s.chars);
 e.vf=s.vf.map(([n,kind,x])=>Object.assign({n,kind},x||{}));
 const nat=e.abil.find(a=>a.native);nat&&(nat.sp=s.native);
 e.abil=e.abil.concat(s.abil.map(([n,prm,sc,sp,xps])=>{const xp=S98x(sc),sum=Object.values(xps).reduce((a,b)=>a+b,0);if(sum!==xp)console.warn("sample xp",n,sum,xp);return{n,prm,sp,xp,free:0,xps:Object.assign({},xps)}}));
 e.traits=s.traits.map(([t,v])=>({t,v}));e.reps=s.reps.map(([t,v,k])=>({t,v,type:k}));
 e.weapons=[{n:"Dodge"},{n:"Fist"}].concat(s.weapons.map(n=>({n})));
 e.inv=s.weapons.map(w=>invMake("w:"+w));s.armor&&(e.armor={mat:s.armor[0],cov:s.armor[1]},e.inv.push(invMake("a:"+s.armor[0]+"|"+s.armor[1])));
 typeof invSyncGrants=="function"&&invSyncGrants(e);
 e.bio.concept=s.small+".";e.bio.notes=`${s.custom}\n\nEquipment: ${s.notes}`;
 return e;
}
window.AMSAMPLE={
 is:f=>!!S98_BY[f],
 chips(type,from){
  const own=S98.filter(s=>s.type===type);
  return own.map(s=>`<button type="button" data-mn-from="s:${s.id}" aria-pressed="${from==="s:"+s.id}"><b>${s.label}</b><small>${s.small} (${s.ref})</small></button>`).join("");
 },
 note(type,from){const s=S98_BY[from];return s&&s.type===type?`<p class="mn-note">${s.name} is the Definitive Edition’s template (${s.ref}), ready to play or change.</p>`:""},
 make(from,type){const s=S98_BY[from];return s&&s.type===type?s98make(from):null},
 list:()=>S98.map(s=>s.id)
};
/* switching the kind of character keeps the "Start from" choice valid for it */
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-mn-type]");if(!b)return;setTimeout(()=>{try{const t=MN.newType,f=MN.newFrom,ok="blank"===f||"example"===f&&"magus"===t||S98_BY[f]&&S98_BY[f].type===t;ok||(MN.newFrom="blank",drawMenu())}catch(z){}},0)});
