"use strict";
/* global app */
/* global util */

function StateGame() {
  this.pingOut = false;
  this.pingLast = 0;
  this.pingFrame = 90;
};

StateGame.prototype.handlePacket = function(packet) {
  switch(packet.type) {
    case "g01" : { this.loadMap(packet); return true; }
    case "g06" : { this.globalWarn(packet); return true; }
    case "g21" : { this.recievePing(packet); return true; }
    default : { return app.ingame() ? app.game.handlePacket(packet) : false; }
  }
};

StateGame.prototype.ready = function() {
  app.menu.warn.show("GameState Ready");
  this.send({type: "g00"});
};

// G01
StateGame.prototype.loadMap = function(p) {
  app.menu.warn.show("Do loading...");
  app.game = new Game(p.map);
  this.send({type: "g03"});
};

// G06
StateGame.prototype.globalWarn = function(p) {
  app.menu.warn.show(p.message);
};

StateGame.prototype.sendPing = function() {
  var now = util.time.now();
  
  if(this.pingOut && this.pingLast - now < 999) { return; }
  else if(this.pingOut) { app.net.ping = 999; }
  
  this.send({type: "g21", delta: now});
  
  this.pingOut = now;
  this.pingOut = true;
};

// G21
StateGame.prototype.recievePing = function(p) {
  var now = util.time.now();
  app.net.ping = now - p.delta;
  this.pingOut = false;
};

StateGame.prototype.send = function(data) {
  app.net.send(data);
};

StateGame.prototype.type = function() {
  return "g";
};

StateGame.prototype.destroy = function() {
  
};