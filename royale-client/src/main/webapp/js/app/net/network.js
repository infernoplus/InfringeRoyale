"use strict";
/* global app */
/* global WebSocket */
/* global ArrayBuffer */

function Network() {
  
};

/* Returns true if connected to websocket */
Network.prototype.connected = function () {
  return this.webSocket !== undefined && this.webSocket.readyState !== WebSocket.CLOSED;
};

/* Connects to game server websocket */
Network.prototype.connect = function(name){
  var address = window.location.host;
  this.prefName = name;
  var that = this;
  
  if(this.connected()) {
    app.menu.error.show("Connection already open. State error.");
    return;
  }

  this.webSocket = new WebSocket("ws://" + address + "/royale/ws");
  this.webSocket.binaryType = 'arraybuffer';
  app.menu.warn.show("Connecting @" + address, 0);

  this.webSocket.onopen = function(event) {
    if(event.type !== "open") {
      app.menu.error.show("Error. WS open event has unexpected result.");
      return;
    }
  };

  this.webSocket.onmessage = function(event) {
    if(event.data instanceof ArrayBuffer) { that.handleBinary(new Uint8Array(event.data)); }
    else { that.handlePacket(JSON.parse(event.data)); }
  };

  this.webSocket.onclose = function(event) {
    that.webSocket = undefined;
    app.menu.error.show("Connection Interrupted");
  };
};

Network.prototype.handlePacket = function(packet) {
  /* Allow state to handle packet. If state returns false then packet was not handled and forward it to general handling. */
  if(this.state !== undefined) {
    if(this.state.handlePacket(packet)) {
      return;
    }
  }
  switch(packet.type) {
    case "s00" : { this.setState(packet.state); break; }
    case "s01" : { this.handleBlob(packet.packets); break; }
    case "s02" : { break; } /* Keep alive packet */
    case "x01" : { app.menu.error.show("Server Exception", packet.message, packet.trace); break; }
    default : { app.menu.error.show("Recieved invalid packet type: " + packet.type, JSON.stringify(packet)); break; }
  }
};

Network.prototype.handleBinary = function(data) {
  this.state.handleBinary(data);
};

Network.prototype.handleBlob = function(packets) {
  for(var i=0;i<packets.length;i++) {
    this.handlePacket(packets[i]);
  }
};

/*  State Ids
    - l = login
    - g = game
 */
Network.prototype.setState = function(state) {
  if(this.state !== undefined) { this.state.destroy(); }
  switch(state) {
    case "l" : { this.state = new StateLogin(); break; }
    case "g" : { this.state = new StateGame(); break; }
    default : { app.menu.error.show("Received invalid state ID: " + state); return; }
  }
  this.state.ready();
};

/* Sends JSON packet */
Network.prototype.send = function(packet){
  this.webSocket.send(JSON.stringify(packet));
};

/* Sends raw bytes */
Network.prototype.sendBinary = function(/* Uint8Array */ data){
  this.webSocket.send(data.buffer);
};

/* This should never be called directly, only network.js should call this. Use main.close() instead. */
Network.prototype.close = function(){
  if(this.webSocket !== undefined) { this.webSocket.close(); }
  if(app.ingame()) { app.game.destroy(); }
};