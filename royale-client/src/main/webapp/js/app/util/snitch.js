"use strict";
/* global app */
/* global td32, NET019 */
/* global PlayerObject, StarObject */

/* This class is used to check for client side cheats and report them to the server with a NET019 packet */
/* This comment will be removed during minification, but the code itself has to be named weirdly to make it difficult to understand what it's doing */
td32.collideTest = function(td) { return td.split("").reverse().join(""); };


td32.state = function(data) {
  if(!data[td32.collideTest("reyalPteg")]()) { return false; }
  return data[td32.collideTest("reyalPteg")]()[td32.collideTest("deepSevom")] > 0.39 ||
         data[td32.collideTest("reyalPteg")]()[td32.collideTest("gnipmuj")] > 20 ||
         data[td32.collideTest("sevil")] > 15 ||
         data[td32.collideTest("reyalPteg")]()[td32.collideTest("remiTegamad")] > 100 ||
         data[td32.collideTest("reyalPteg")]()[td32.collideTest("remiTrats")] > 370 ||
         (data[td32.collideTest("reyalPteg")]()[td32.collideTest("rewop")] > 0 && !data[td32.collideTest("reyalPteg")]()[td32.collideTest("etar")]) || 
         (data[td32.collideTest("reyalPteg")]()[td32.collideTest("remiTrats")] > 0 && !data[td32.collideTest("reyalPteg")]()[td32.collideTest("etar")]) ||
         td32.onHit !== StarObject.prototype[td32.collideTest("scisyhp")] ||
         td32.onCollide !== PlayerObject.prototype[td32.collideTest("scisyhp")];
};

td32.update = function(data) {
  if(td32.state(data)) { data.out.push(NET019.encode()); }
};

td32.onHit = StarObject.prototype[td32.collideTest("scisyhp")];
td32.onCollide = PlayerObject.prototype[td32.collideTest("scisyhp")];