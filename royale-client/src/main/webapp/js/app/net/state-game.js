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
    case "g01" : { this.load(packet); return true; }
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
StateGame.prototype.load = function(p) {
  if(app.ingame()) { app.menu.error.show("State error while loading game."); return; }
  
  var address = window.location.host;
  var that = this;
  
  app.menu.warn.show("Downloading map file...");
  $.ajax({
    url: "http://" + address + "/royale/game/" + p.game,
    type: 'GET',
    timeout: 5000,
    success: function(data) {
      app.menu.warn.show("Loading game...");
      app.game = new Game(data);
      app.menu.warn.show("Load done...");
      that.send({type: "g03"});
    },
    error: function() {
      app.menu.error.show("Server returned FNF(404) for game file: " + p.game);
    }
  });
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