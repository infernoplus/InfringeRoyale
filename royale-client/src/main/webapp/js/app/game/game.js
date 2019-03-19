"use strict";
/* global app */
/* global util, shor2, vec2, td32, MERGE_BYTE */
/* global NETX, NET001, NET010, NET011, NET012 */
/* global Function, requestAnimFrameFunc, cancelAnimFrameFunc */
/* global GameObject, PlayerObject */

// Air 30 00000000000000000000000000011110
// Block 98306 00000000000000011000000000000010

function Game(data) {  
  this.container = document.getElementById("game");
  this.canvas = document.getElementById("game-canvas");
  
  this.input = new Input(this, this.canvas);
  this.display = new Display(this, this.container, this.canvas, data.resource);

  this.load(data);
  
  this.objects = [];
  this.pid = undefined; /* Unique player id for this client. Assigned during init packet. */
  
  this.frame = 0;
  this.delta = util.time.now();
  this.buffer = [[],[]];  // Frame Delay Lag Compensation Buffer. 3 Blank frames to start.
  
  this.out = []; // Outgoing packets.
  
  this.ready = false;
  
  var that = this;
  this.frameReq = requestAnimFrameFunc.call(window, function() { that.draw(); }); // Javascript 🙄
};

Game.TICK_RATE = 33;
Game.FDLC_TARGET = 3;
Game.FDLC_MAX = Game.FDLC_TARGET+2;

Game.prototype.load = function(data) {
  app.menu.load.show();
  this.world = new World(data);
};

/* Returns false if the packet is not of a type that we know how to handle */
Game.prototype.handlePacket = function(packet) {
  /* Parse packet and apply */
  switch(packet.type) {
    /* Ingame Type Packets gxx */
    case "g12" : { this.updatePlayerList(packet); return true; }
    /* Input Type Packets ixx */
    default : { return false; }
  }
};

/* G12 */
Game.prototype.updatePlayerList = function(packet) {
  console.log(packet.players);
};

Game.prototype.handleBinary = function(data) {
  var de = NETX.decode(data);
  
  if(!this.ready) { this.doUpdate(de); return; }  
  this.updatePacket(de);
};

Game.prototype.updatePacket = function(data) { 
  this.buffer.push(data);
  while(this.buffer.length > Game.FDLC_MAX) {
    var d = this.buffer.shift();
    this.doUpdate(d);
  }
};

Game.prototype.doUpdate = function(data) {  
  for(var i=0;i<data.length;i++) {
    var n = data[i];
    switch(n.designation) {
      case 0x01 : { this.doNET001(n); break; }
      case 0x10 : { this.doNET010(n); break; }
      case 0x11 : { this.doNET011(n); break; }
      case 0x12 : { this.doNET012(n); break; }
    }
  }
};

/* ASSIGN_PID [0x01] */
Game.prototype.doNET001 = function(n) {
  this.pid = n.pid;
  this.ready = true;
  app.menu.game.show();
};

/* CREATE_PLAYER_OBJECT [0x10] */
Game.prototype.doNET010 = function(n) {
  if(n.pid === this.pid) { return; }
  var obj = this.createObject(PlayerObject.ID, n.level, n.zone, shor2.decode(n.pos), [n.pid]);
  obj.state = PlayerObject.STATE.GHOST.ID;
};

/* KILL_PLAYER_OBJECT [0x11] */
Game.prototype.doNET011 = function(n) {
  if(n.pid === this.pid) { return; }
  var obj = this.getGhost(n.pid);
  if(obj) { obj.kill(); }
};

/* UPDATE_PLAYER_OBJECT [0x12] */
Game.prototype.doNET012 = function(n) {
  if(n.pid === this.pid) { return; }
  var obj = this.getGhost(n.pid);
  if(!obj) { return; }
  
  obj.level = n.level;
  obj.zone = n.zone;
  obj.pos = n.pos;
  obj.sprite = n.sprite;
};

/* Handle player input */
Game.prototype.doInput = function() {
  var imp = this.input.pop();
  
  if(!this.inx27 && this.input.keyboard.keys[27]) { /* MENU */ } this.inx27 = this.input.keyboard.keys[27]; // ESC
  
  var obj = this.getPlayer();
  if(!obj) { return; }
  
  var keys = this.input.keyboard.keys;
  var dir = [0,0];
  if(keys[87] || keys[38]) { dir[1]++; } // W or UP
  if(keys[83] || keys[40]) { dir[1]--; } // S or DOWN
  if(keys[65] || keys[37]) { dir[0]--; } // A or LEFT
  if(keys[68] || keys[39]) { dir[0]++; } // D or RIGHT
  var a = keys[32] || keys[17]; // SPACE or RIGHT CONTROL
  var b = keys[16] || keys[45]; // LEFT SHIFT or NUMPAD 0
  
  obj.input(dir, a, b);
};

/* Step game world */
Game.prototype.doStep = function() {
  var obj = this.getPlayer(); // Our player object
  
  /* Create a player object if we don't have one. */
  if(!obj) {
    var level = this.world.initial;
    var zone = this.world.getInitial().initial;
    var pos = this.world.getInitial().getInitial().initial; // shor2
    this.createObject(PlayerObject.ID, level, zone, shor2.decode(pos), [this.pid]);
    this.out.push(NET010.encode(level, zone, pos));
    return;
  }
  
  /* Step & delete garbage */
  for(var i=0;i<this.objects.length;i++) {
    var obj = this.objects[i];
    obj.step();
    if(obj.garbage) { this.objects.splice(i--, 1); }
  }
  
};

/* Push players state to the server */
Game.prototype.doPush = function() {
  var obj = this.getPlayer(); // Our player object
  if(obj) {
    this.out.push(NET012.encode(obj.level, obj.zone, obj.pos, obj.sprite));
  }
  
  var merge = MERGE_BYTE(this.out); // Merge all binary messages into a single Uint8Array
  this.out = [];
  
  app.net.sendBinary(merge);
};

Game.prototype.createObject = function(id, level, zone, pos, param) {
  var pgen = [undefined, this, level, zone, pos];
  for(var i=0;i<param.length;i++) { pgen.push(param[i]); }
  var obj = new (Function.prototype.bind.apply(GameObject.OBJECT(id), pgen));
  
  this.objects.push(obj);
  return obj;
};

Game.prototype.getGhost = function(pid) {
  for(var i=0;i<this.objects.length;i++) {
    var p = this.objects[i];
    if(p.pid !== undefined && p.pid === pid) {
      return p;
    }
  }
  return undefined;
};

/* Returns the player object that this client controls. Or undefined if one doesnt exist. */
Game.prototype.getPlayer = function() {
  for(var i=0;i<this.objects.length;i++) {
    var obj = this.objects[i];
    if(obj.pid !== undefined && obj.pid === this.pid) {
      return obj;
    }
  }
  return undefined;
};

/* Returns the zone our character is in, or the last one we were in when we died, or the starting point. */
Game.prototype.getZone = function() {
  /* Where are character is */
  var player = this.getPlayer();
  if(player) {
    // Do stuff
  }
  
  /* Last valid location */
  if(this.lastZone) { return this.world.levels[this.lastZone[0]].zones[this.lastZone[1]]; }
  
  /* Starting location */
  var level = this.world.getInitial();
  this.lastZone = [this.world.initial, level.initial];
  return level.getInitial();
};

Game.prototype.draw = function() {
  if(this.ready) {
    var now = util.time.now();
    if((now - this.delta) / Game.TICK_RATE > 0.75) {
      var initial = true;
      while(this.buffer.length > Game.FDLC_TARGET || (initial && this.buffer.length > 0)) {
          var data = this.buffer.shift();
          this.doUpdate(data);
          initial = false;
      }
      
      this.doInput();
      this.doStep();
      this.display.draw();
      this.doPush();
      
      this.frame++;
      this.delta = now;
    }
  }
  
  var that = this;
  this.frameReq = requestAnimFrameFunc.call(window, function() { that.draw(); }); // Javascript 🙄
};

Game.prototype.destroy = function() {
  cancelAnimFrameFunc.call(window, this.frameReq);
};