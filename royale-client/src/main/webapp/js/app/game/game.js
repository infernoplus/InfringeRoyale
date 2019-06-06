"use strict";
/* global app */
/* global util, shor2, vec2, td32, MERGE_BYTE */
/* global NETX, NET001, NET010, NET011, NET012 */
/* global Function, requestAnimFrameFunc, cancelAnimFrameFunc */
/* global Display, GameObject, PlayerObject, GoombaObject, PlatformObject, BusObject, FlagObject, TextObject */

// Air 30 00000000000000000000000000011110
// Block 98306 00000000000000011000000000000010

function Game(data) {
  this.container = document.getElementById("game");
  this.canvas = document.getElementById("game-canvas");
  
  this.input = new Input(this, this.canvas);
  this.display = new Display(this, this.container, this.canvas, data.resource);
  
  this.objects = [];
  this.pid = undefined; /* Unique player id for this client. Assigned during init packet. */
  this.players = []; /* List of player names and associated pids */
  
  this.load(data);
  
  this.frame = 0;
  this.lastDraw = 0;
  this.delta = util.time.now();
  this.buffer = [[],[]];  // Frame Delay Lag Compensation Buffer. 3 Blank frames to start.
  
  this.out = []; // Outgoing packets.
  
  this.ready = false;
  this.startTimer = -1;          // If > 0 we draw a timer to the screen in display
  this.startDelta = undefined;   // Millisecond time of the first frame of the game.
  
  this.remain = 0;               // Number of players still alive
  
  this.coins = 0;
  
  this.victory = 0;
  this.gameOverTimer = 0;
  this.gameOver = false;
  
  /* Set inital camera position */
  var dim = this.getZone().dimensions();
  this.display.camera.position(vec2.scale(dim, .5));
  
  /* Level Warp */
  this.levelWarpTimer = 0;      // How long to show level name/lives screen.
  this.levelWarpId = undefined; // Level to warp too
  
  var that = this;
  this.frameReq = requestAnimFrameFunc.call(window, function() { that.draw(); }); // Javascript 🙄
  this.loopReq = setTimeout(function( ){ that.loop(); }, 2);
};

Game.TICK_RATE = 33;
Game.FDLC_TARGET = 3;
Game.FDLC_MAX = Game.FDLC_TARGET+2;

Game.LEVEL_WARP_TIME = 60;

Game.prototype.load = function(data) {
  app.menu.load.show();
  
  /* Load world data */
  this.world = new World(data);
  
  /* Spawn objects from world obj params */
  for(var i=0;i<this.world.levels.length;i++) {
    var lvl = this.world.levels[i];
    for(var j=0;j<lvl.zones.length;j++) {
      var zn = lvl.zones[j];
      for(var k=0;k<zn.obj.length;k++) {
        var obj = zn.obj[k];
        var pgen = [obj.pos]; // obj.pos here is a shor2, we use it as the oid for this object
        for(var l=0;l<obj.param.length;l++) { pgen.push(obj.param[l]); }
        this.createObject(obj.type, lvl.id, zn.id, shor2.decode(obj.pos), pgen);
      }
    }
  }
};

/* Immiedately sends a json packet */
Game.prototype.send = function(packet) {
  app.net.send(packet);
};

/* Returns false if the packet is not of a type that we know how to handle */
Game.prototype.handlePacket = function(packet) {
  /* Parse packet and apply */
  switch(packet.type) {
    /* Ingame Type Packets gxx */
    case "g12" : { this.updatePlayerList(packet); return true; }
    case "g13" : { this.gameStartTimer(packet); return true; }
    /* Input Type Packets ixx */
    default : { return false; }
  }
};

/* G12 */
Game.prototype.updatePlayerList = function(packet) {
  this.players = packet.players;
};

/* G13*/
Game.prototype.gameStartTimer = function(packet) {
  if(packet.time > 0) { this.startTimer = packet.time; this.remain = this.players.length; }
  else { this.doStart(); }
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
      case 0x13 : { this.doNET013(n); break; }
      case 0x18 : { this.doNET018(n); break; }
      case 0x20 : { this.doNET020(n); break; }
      case 0x30 : { this.doNET030(n); break; }
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
  obj.setState(PlayerObject.SNAME.GHOST);
};

/* KILL_PLAYER_OBJECT [0x11] */
Game.prototype.doNET011 = function(n) {
  if(n.pid === this.pid) { return; }
  var obj = this.getGhost(n.pid);
  if(obj) { obj.kill(); }
  this.remain = this.getRemain();
};

/* UPDATE_PLAYER_OBJECT [0x12] */
Game.prototype.doNET012 = function(n) {
  if(n.pid === this.pid) { return; }
  var obj = this.getGhost(n.pid);
  if(!obj) { return; }
 
  obj.update(n);
};

/* PLAYER_OBJECT_EVENT [0x13] */
Game.prototype.doNET013 = function(n) {
  if(n.pid === this.pid) { return; }
  var obj = this.getGhost(n.pid);
  obj.trigger(n.type);
};

/* PLAYER_RESULT_REQUEST [0x18] */
Game.prototype.doNET018 = function(n) {
  if(n.pid !== this.pid || n.result <= 0x00) { return; }
  var ply = this.getPlayer();
  if(ply) { ply.axe(n.result); }
  this.victory = n.result;
};

/* OBJECT_EVENT_TRIGGER [0x20] */
Game.prototype.doNET020 = function(n) {
  if(n.pid === this.pid && n.type < 0xA0) { return; }                  // Don't repeat events that we reported, unless they fall into the 'explicit sync' category.
  var obj = this.getObject(n.level, n.zone, n.oid);
  if(obj) {
    obj.update(n.type);
  }
};

/* TILE_EVENT_TRIGGER [0x30] */
Game.prototype.doNET030 = function(n) {
  if(n.pid === this.pid) { return; } // Toss out event if we were the ones who created it originally
  this.world.getZone(n.level, n.zone).update(this, n.pid, n.level, n.zone, n.pos.x, n.pos.y, n.type);
};

/* Starts the game */
Game.prototype.doStart = function() {
  this.startTimer = -1;
  this.startDelta = util.time.now();
  this.doSpawn();
};

/* Handle player input */
Game.prototype.doInput = function() {
  var imp = this.input.pop();
  
  var mous = this.input.mouse;
  var keys = this.input.keyboard.keys;
  
  if(!this.inx27 && keys[27]) { /* MENU */ } this.inx27 = keys[27]; // ESC
  
  var obj = this.getPlayer();
  if(!obj) { return; }

  var dir = [0,0];
  if(keys[87] || keys[38]) { dir[1]++; } // W or UP
  if(keys[83] || keys[40]) { dir[1]--; } // S or DOWN
  if(keys[65] || keys[37]) { dir[0]--; } // A or LEFT
  if(keys[68] || keys[39]) { dir[0]++; } // D or RIGHT
  var a = keys[32]; // SPACE
  var b = keys[16] || keys[45]; // Shift or num0
  
  if(mous.spin) { this.display.camera.zoom(mous.spin); } // Mouse wheel -> Camera zoom
  
  obj.input(dir, a, b);
};

/* Step game world */
Game.prototype.doStep = function() {
  var ply = this.getPlayer(); // Our player object
  
  /* Level Warp */
  if(ply && this.levelWarpId !== undefined && this.levelWarpTimer > 0) {
    if(--this.levelWarpTimer < 1) {
      var z = this.world.getLevel(this.levelWarpId).getInitial();
      ply.level = z.level;
      ply.zone = z.id;
      ply.pos = shor2.decode(z.initial);
      ply.autoTarget = undefined;
      ply.grounded = false;
      ply.show();
      this.levelWarpId = undefined;
    }
  }
  
  /* Step & delete garbage */
  for(var i=0;i<this.objects.length;i++) {
    var obj = this.objects[i];
    obj.step();
    if(obj.garbage) { this.objects.splice(i--, 1); }
  }
  
  /* Update Camera Position */
  var zone = this.getZone();
  if(ply && !ply.dead) { this.display.camera.position(vec2.make(ply.pos.x, zone.dimensions().y*.5)); }
  
  /* Step world to update bumps & effects & etc */
  this.world.step();
  
  /* Triggers game over if player is dead for 15 frames. */
  if(this.startDelta !== undefined && !this.gameOver && !ply) { if(++this.gameOverTimer > 15) { this.gameOver = true; this.gameOverTimer = 0; } }
  /* Triggers page refresh after 5 seconds of a game over. */
  else if(this.gameOver) { if(++this.gameOverTimer > 150) { app.close(); } }
  else { this.gameOverTimer = 0; }
  
  this.lastDraw = this.frame;
  this.frame++;
};

/* Create a player object for this client to control */
Game.prototype.doSpawn = function() {
  var ply = this.getPlayer();
  
  if(!ply) {
    var level = this.world.getInitialLevel();
    var zone = this.world.getInitialZone();
    var pos = zone.initial; // shor2
    this.createObject(PlayerObject.ID, level.id, zone.id, shor2.decode(pos), [this.pid]);
    this.out.push(NET010.encode(level, zone, pos));
  }
};

/* Push players state to the server */
Game.prototype.doPush = function() {
  var obj = this.getPlayer(); // Our player object
  if(obj && !obj.dead) {
    this.out.push(NET012.encode(obj.level, obj.zone, obj.pos, obj.sprite.ID, obj.reverse));
  }
  
  var merge = MERGE_BYTE(this.out); // Merge all binary messages into a single Uint8Array
  this.out = [];
  
  app.net.sendBinary(merge);
};

Game.prototype.createObject = function(id, level, zone, pos, param) {
  var pgen = [undefined, this, level, zone, pos];
  for(var i=0;i<param.length;i++) { pgen.push(param[i]); }
  
  var type = GameObject.OBJECT(id);
  if(!type) { type = GoombaObject; }
  var obj = new (Function.prototype.bind.apply(GameObject.OBJECT(id), pgen));
  
  this.objects.push(obj);
  return obj;
};

Game.prototype.getObject = function(level, zone, oid) {
  for(var i=0;i<this.objects.length;i++) {
    var obj = this.objects[i];
    if(obj.oid !== undefined && obj.level === level && obj.zone === zone && obj.oid === oid) {
      return obj;
    }
  }
};

/* Returns first flag object found in the specific zone. Or undefined. */
Game.prototype.getFlag = function(level, zone) {
  for(var i=0;i<this.objects.length;i++) {
    var obj = this.objects[i];
    if(obj.level === level && obj.zone === zone && obj instanceof FlagObject) {
      return obj;
    }
  }
};

/* Returns first textobject in the given zone with the given text */
Game.prototype.getText = function(level, zone, text) {
  for(var i=0;i<this.objects.length;i++) {
    var obj = this.objects[i];
    if(obj && obj.level === level && obj.zone === zone && obj instanceof TextObject && obj.text === text.toString()) { return obj; }
  }
};

/* Returns all platform type objects. */
Game.prototype.getPlatforms = function() {
  var zon = this.getZone();
  
  var plts = [];
  for(var i=0;i<this.objects.length;i++) {
    var obj = this.objects[i];
    if((obj instanceof PlatformObject || obj instanceof BusObject) && obj.level === zon.level && obj.zone === zon.id) {
      plts.push(obj);
    }
  }
  
  return plts;
};

Game.prototype.getGhost = function(pid) {
  for(var i=0;i<this.objects.length;i++) {
    var p = this.objects[i];
    if(p.pid !== undefined && p.pid === pid) {
      return p;
    }
  }
};

/* Returns the player object that this client controls. Or undefined if one doesnt exist. */
Game.prototype.getPlayer = function() {
  for(var i=0;i<this.objects.length;i++) {
    var obj = this.objects[i];
    if(obj.pid !== undefined && obj.pid === this.pid) {
      return obj;
    }
  }
};

/* Returns the zone our character is in, or the last one we were in when we died, or the starting point. */
Game.prototype.getZone = function() {
  /* Where are character is */
  var player = this.getPlayer();
  if(player) { this.lastZone = this.world.getZone(player.level, player.zone); return this.lastZone; }
  
  /* Last valid location */
  if(this.lastZone) { return this.lastZone; }
  
  /* Starting location */
  return this.world.getInitialZone();
};

/* Return player info by given pid */
Game.prototype.getPlayerInfo = function(pid) {
  for(var i=0;i<this.players.length;i++) {
    var ply = this.players[i];
    if(ply.id === pid) { return ply; }
  }
};

/* Get number of players who are still alive */
Game.prototype.getRemain = function() {
  var rm = 0;
  for(var i=0;i<this.players.length;i++) {
    var ply = this.players[i];
    var obj = this.getGhost(ply.id);
    if(obj && !obj.dead) { rm++; }
  }
  return rm;
};

/* Shows lives/level name screen then warps player to start of specified level. */
/* Called when player reaches end of the level they are currently on. */
Game.prototype.levelWarp = function(lid) {
  this.levelWarpId = lid;
  this.levelWarpTimer = Game.LEVEL_WARP_TIME;
  this.getPlayer().hide();
};

/* When this client player collects a coin */
Game.prototype.coinage = function() {
  this.coins = Math.min(99, this.coins+1);
};

Game.prototype.loop = function() {
  if(this.ready && this.startDelta !== undefined) {
    var now = util.time.now();
    var target = parseInt((now-this.startDelta)/Game.TICK_RATE);  // Frame we should be on
    
    if(target > this.frame) {
      var initial = true;
      while(this.buffer.length > Game.FDLC_TARGET || (initial && this.buffer.length > 0)) {
        var data = this.buffer.shift();
        this.doUpdate(data);
        initial = false;
      }
      
      this.doInput();
      while(target > this.frame) { this.doStep(); }
      this.doPush();
      
      this.delta = now;
    }
  }
  
  var that = this;
  this.loopReq = setTimeout(function( ){ that.loop(); }, 2);
};

Game.prototype.draw = function() {
  if(this.lastDraw !== this.frame || this.startDelta === undefined) { this.display.draw(); }
  
  var that = this;
  this.frameReq = requestAnimFrameFunc.call(window, function() { that.draw(); }); // Javascript 🙄
};

Game.prototype.destroy = function() {
  cancelAnimFrameFunc.call(window, this.frameReq);
  clearTimeout(this.loopReq);
  this.input.destroy();
  this.display.destroy();
};