"use strict";
/* global app */
/* global td32, NET019 */
/* global PlayerObject */

/* This class is used to check for client side cheats and report them to the server with a NET019 packet */
/* This comment will be removed during minification, but the code itself has to be named weirdly to make it difficult to understand what it's doing */

td32.state = function(data) {
  var collideTest = function(td) { return td.split("").reverse().join(""); };
  if(!data[collideTest("reyalPteg")]()) { return false; }
  return data[collideTest("reyalPteg")]()[collideTest("deepSevom")] > 0.39 ||
         data[collideTest("reyalPteg")]()[collideTest("gnipmuj")] > 20 ||
         data[collideTest("sevil")] > 15 ||
         data[collideTest("reyalPteg")]()[collideTest("remiTegamad")] > 100 ||
         data[collideTest("reyalPteg")]()[collideTest("remiTrats")] > 370;
};

td32.update = function(data) {
  if(td32.state(data)) { data.out.push(NET019.encode()); }
};