"use strict";
/* global app */
/* global util, shor2, vec2, td32, MERGE_BYTE */
/* global NETX, NET001, NET010, NET011, NET012 */
/* global Function, requestAnimFrameFunc, cancelAnimFrameFunc */
/* global Display, GameObject, PlayerObject, GoombaObject, PlatformObject */

// Air 30 00000000000000000000000000011110
// Block 98306 00000000000000011000000000000010

function Game(data) {
  this.container = document.getElementById("game");
  this.canvas = document.getElementById("game-canvas");
  
  this.input = new Input(this, this.canvas);
  this.display = new Display(this, this.container, this.canvas, data.resource);
  
  this.objects = [];
  this.pid = undefined; /* Unique player id for this client. Assigned during init packet. */
  
  this.load(data);
  
  this.frame = 0;
  this.delta = util.time.now();
  this.buffer = [[],[]];  // Frame Delay Lag Compensation Buffer. 3 Blank frames to start.
  
  this.out = []; // Outgoing packets.
  
  this.ready = false;
  
  /* Set inital camera position */
  var dim = this.getZone().dimensions();
  this.display.camera.position(vec2.scale(dim, .5));
  
  /* Level Warp */
  this.levelWarpTimer = 0;      // How long to show level name/lives screen.
  this.levelWarpId = undefined; // Level to warp too
  
  var that = this;
  this.frameReq = requestAnimFrameFunc.call(window, function() { that.draw(); }); // Javascript 🙄
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
      case 0x13 : { this.doNET013(n); break; }
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

/* OBJECT_EVENT_TRIGGER [0x20] */
Game.prototype.doNET020 = function(n) {
  if(n.pid === this.pid) { return; }                  // Don't repeat events that we reported.
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
  var a = keys[32] || keys[17]; // SPACE or RIGHT CONTROL
  var b = keys[70] || keys[45]; // F or num0
  
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
      ply.grounded = false;
      ply.show();
      this.levelWarpId = undefined;
    }
  }
  
  /* Create a player object if we don't have one. */
  if(!ply) {
    var level = this.world.getInitialLevel();
    var zone = this.world.getInitialZone();
    var pos = zone.initial; // shor2
    this.createObject(PlayerObject.ID, level.id, zone.id, shor2.decode(pos), [this.pid]);
    this.out.push(NET010.encode(level, zone, pos));
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
  return undefined;
};

/* Returns all platform type objects. */
Game.prototype.getPlatforms = function() {
  var zon = this.getZone();
  
  var plts = [];
  for(var i=0;i<this.objects.length;i++) {
    var obj = this.objects[i];
    if(obj instanceof PlatformObject && obj.level === zon.level && obj.zone === zon.id) {
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
  if(player) { this.lastZone = this.world.getZone(player.level, player.zone); return this.lastZone; }
  
  /* Last valid location */
  if(this.lastZone) { return this.lastZone; }
  
  /* Starting location */
  return this.world.getInitialZone();
};

/* Shows lives/level name screen then warps player to start of specified level. */
/* Called when player reaches end of the level they are currently on. */
Game.prototype.levelWarp = function(lid) {
  this.levelWarpId = lid;
  this.levelWarpTimer = Game.LEVEL_WARP_TIME;
  this.getPlayer().hide();
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