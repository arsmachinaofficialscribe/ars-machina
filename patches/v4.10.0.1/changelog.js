const CLG=window.CHANGELOG&&window.CHANGELOG[0];
CLG&&CLG.items.unshift(["4.10.0.1","Typing in Play fields",[
 "Fixed: typing a number such as 25 could come out as 52, because the cursor jumped back to the start after each digit. In Build this hit fields that redraw their section as you type, such as Years since Gauntlet; in Play, Fatigue levels, time lost in Seasons, the language cap, an opposing Trait and others. Text fields in Play no longer jump to the end while you edit in the middle."]]);
