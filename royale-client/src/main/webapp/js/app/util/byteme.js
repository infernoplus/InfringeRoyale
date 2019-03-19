"use strict";
/* global util, vec2 */

var shor2 = {}; // Two Shorts 32bits // Stored as an int32
/* ======================================================================================== */

shor2.encode = function(/* short */ a, /* short */ b) {
  return 0 | (parseInt(a) & 0x0000FFFF) | ((parseInt(b) << 16) & 0xFFFF0000);
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


var NETX = {}; // Main
/* ======================================================================================== */

NETX.decode = function(/* Uint8Array */ data) {
  var de = [];
  var i = 0;
  while(i<data.length) {
    var desig = data.slice(i++, i)[0];
    switch(desig) {
      case 0x01 : { de.push(NET001.decode(data.slice(i, i+=NET001.BYTES-1))); break; }
      case 0x10 : { de.push(NET010.decode(data.slice(i, i+=NET010.BYTES-1))); break; }
      case 0x11 : { de.push(NET011.decode(data.slice(i, i+=NET011.BYTES-1))); break; }
      case 0x12 : { de.push(NET012.decode(data.slice(i, i+=NET012.BYTES-1))); break; }
      default : { if(app) { app.menu.warn.show("Error decoding binary data!"); } return de; }
    }
  }
  return de;
};











var NET001 = {}; // ASSIGN_PID [0x1] // As Uint8Array
/* ======================================================================================== */
NET001.DESIGNATION = 0x01;
NET001.BYTES = 3;

/* Server->Client */
NET001.decode = function(/* NET001_SERV */ a) {
  return {designation: NET001.DESIGNATION, pid: (a[1] & 0x00FF) | ((a[0] << 8) & 0xFF00)};
};












var NET010 = {}; // CREATE_PLAYER_OBJECT [0x10] // As Uint8Array
/* ======================================================================================== */
NET010.DESIGNATION = 0x10;
NET010.BYTES = 9;

/* Client->Server */
NET010.encode = function(/* byte */ levelID, /* byte */ zoneID, /* shor2 */ pos) {
  return new Uint8Array([NET010.DESIGNATION, levelID, zoneID, (pos >> 24) & 0xFF, (pos >> 16) & 0xFF, (pos >> 8) & 0xFF, pos & 0xFF]);
};

/* Server->>>Client */
NET010.decode = function(/* NET010_SERV */ a) {
  return {
    designation: NET010.DESIGNATION,
    pid: (a[1] & 0x00FF) | ((a[0] << 8) & 0xFF00),
    level: a[2],
    zone: a[3],
    pos: (a[7] & 0xFF) | ((a[6] << 8) & 0xFF00) | ((a[5] << 16) & 0xFF0000) | ((a[4] << 24) & 0xFF0000)
  };
};










var NET011 = {}; // KILL_PLAYER_OBJECT [0x11] // As Uint8Array
/* ======================================================================================== */
NET011.DESIGNATION = 0x11;
NET011.BYTES = 3;

/* Client->Server */
NET011.encode = function() {
  return new Uint8Array([NET011.DESIGNATION]);
};

/* Server->>>Client */
NET011.decode = function(/* NET011_SERV */ a) {
  return {
    designation: NET011.DESIGNATION, pid: (a[1] & 0x00FF) | ((a[0] << 8) & 0xFF00)
  };
};









var NET012 = {}; // UPDATE_PLAYER_OBJECT [0x12] // As Uint8Array
/* ======================================================================================== */
NET012.DESIGNATION = 0x12;
NET012.BYTES = 14;

/* Client->Server */
NET012.encode = function(/* byte */ levelID, /* byte */ zoneID, /* vec2 */ pos, /* byte */ spriteID) {
  var farr = new Float32Array([pos.x, pos.y]);
  var barr = new Uint8Array(farr.buffer);
  return new Uint8Array([
    NET012.DESIGNATION, levelID, zoneID,
    barr[3], barr[2], barr[1], barr[0],
    barr[7], barr[6], barr[5], barr[4],
    spriteID
  ]);
};

/* Server->>Client */
NET012.decode = function(/* NET012_SERV */ a) {
  var b1 = new Uint8Array([a[4], a[5], a[6], a[7]]);
  var b2 = new Uint8Array([a[8], a[9], a[10], a[11]]);
  var v1 = new DataView(b1.buffer);
  var v2 = new DataView(b2.buffer);
  
  return {
    designation: NET012.DESIGNATION,
    pid: (a[1] & 0x00FF) | ((a[0] << 8) & 0xFF00),
    level: a[2],
    zone: a[3],
    pos: vec2.make(v1.getFloat32(0), v2.getFloat32(0)),
    sprite: a[12]
  };
};







/* Merges all Uint8Arrays into one */
var MERGE_BYTE = function(/* Uint8Array[] */ a) {
  var data = [];
  for(var i=0;i<a.length;i++) {
    for(var j=0;j<a[i].length;j++) {
      data.push(a[i][j]);
    }
  }
  return new Uint8Array(data);
};