"use strict";
/* global app */

function StateLogin() {
  
};

StateLogin.prototype.handlePacket = function(packet) {
  switch(packet.type) {
    case "l01" : { this.loggedIn(packet); return true; }
    default : { return false; }
  }
};

StateLogin.prototype.handleBinary = function(packet) {
  app.menu.warn.show("Recieved unexpected binary data!");
};

StateLogin.prototype.ready = function() {
  this.send({type: "l00", name: app.net.prefName, team: app.net.prefTeam});
  app.menu.warn.show("LoginState Ready");
};

// L01
StateLogin.prototype.loggedIn = function(p) {
  app.net.name = p.name;
  app.net.sid = p.sid;
  app.menu.warn.show("Logged in: " + p.name + " :: " + p.team + " // " + p.sid);
};

StateLogin.prototype.send = function(data) {
  app.net.send(data);
};

StateLogin.prototype.type = function() {
  return "l";
};

StateLogin.prototype.destroy = function() {
  
};