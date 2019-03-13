"use strict";
/* global app */
/* global util */
/* global requestAnimFrameFunc, cancelAnimFrameFunc */

// Air 30 00000000000000000000000000011110
// Block 98306 00000000000000011000000000000010

function Game(data) {  
  this.container = document.getElementById("game");
  this.canvas = document.getElementById("game-canvas");
  
  this.input = new Input(this, this.canvas);
  this.display = new Display(this, this.container, this.canvas, data.resource);

  this.load(data);
  
  this.frame = 0;
  this.delta = util.time.now();
  this.buffer = ["","",""];  // Frame Delay Lag Compensation Buffer. 3 Blank frames to start.
  
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
    case "g10" : { this.initialPacket(packet); return true; }
    case "g11" : { this.updatePacket(packet); return true; }
    case "g12" : { this.updatePlayerList(packet); return true; }
    /* Input Type Packets ixx */
    default : { return false; }
  }
};

/* G10 */
Game.prototype.initialPacket = function(packet) {
  app.menu.warn.show("Init packet");
  app.menu.game.show();
  this.ready = true;
};

/* G11 */
Game.prototype.updatePacket = function(packet) {
  this.buffer.push(packet.data);
  while(this.buffer.length > Game.FDLC_MAX) {
    var data = this.buffer.shift();
    this.doUpdate(data);
  }
};

/* G12 */
Game.prototype.updatePlayerList = function(packet) {
  console.log(packet.players);
};

Game.prototype.doUpdate = function(data) {
  
};

/* Handle player input */
Game.prototype.doInput = function() {
  var imp = this.input.pop();
};

/* Step game world */
Game.prototype.doStep = function() {
  
};

/* Push players state to the server */
Game.prototype.doPush = function() {
  
};

/* Returns the player object that this client controls. Or undefined if one doesnt exist. */
Game.prototype.getPlayer = function() {
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
  var level = this.world.levels[this.world.initial];
  this.lastZone = [this.world.initial, level.initial];
  return level.zones[level.initial];
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