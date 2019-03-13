"use strict";
/* global util, vec2 */

var shor2 = {}; // Two Shorts 32bit // Stored as an int32
/* ======================================================================================== */

shor2.encode = function(/* short */ a, /* short */ b) {
  return 0 | (a & 0x0000FFFF) | ((b << 16) & 0xFFFF0000);
};

/* returns <vec2> */
shor2.decode = function(/* shor2 */ a) {
  return vec2.make(a & 0xFFFF, (a >> 16) & 0xFFFF);
};

/* returns [x,y] */
shor2.asArray = function(/* shor2 */ a) {
  return [a & 0xFFFF, (a >> 16) & 0xFFFF];
};











var td32 = {}; // Tile Data 32bit // Stored as an int32
/* ======================================================================================== */

td32.decode16 = function(/* td32 */ a) {
  return {index: a & 0x7FF, bump: (a >> 11) & 0xF, depth: ((a >> 15) & 0x1) === 1};
};

td32.decode = function(/* td32 */ a) {
  var i = (a >> 16) & 0xFF;
  var def = !td32.TILE_DEF[i]?td32.TILE_DEF[30]:td32.TILE_DEF[i];
  return {index: a & 0x7FF, bump: (a >> 11) & 0xF, depth: ((a >> 15) & 0x1) === 1, definition: def, data: (a >> 24) & 0xFF};
};

td32.asArray = function(/* td32 */ a) {
  return [a & 0x7FF, (a >> 11) & 0xF, ((a >> 15) & 0x1) === 1, (a >> 16) & 0xFF, (a >> 24) & 0xFF];
};

td32.TILE_PROPERTIES = {
  /* Nothing */
  0: {
    COLLIDE: false,
    WATER: false,
    CLIMB: false,
    KILL: false,
    BUMP: false,
    BREAK: false,
    PIPE: false,
    WARP: false,
    ASYNC: true,
    TRIGGER: function(player, map, x, y) {}
  },
  /* Solid Standard */
  1: {
    COLLIDE: true,
    WATER: false,
    CLIMB: false,
    KILL: false,
    BUMP: false,
    BREAK: false,
    PIPE: false,
    WARP: false,
    ASYNC: true,
    TRIGGER: function(player, map, x, y) {}
  }
};