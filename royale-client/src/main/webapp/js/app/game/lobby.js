"use strict";
/* global app */
/* global util, shor2, vec2, td32, MERGE_BYTE */
/* global Game */

function Lobby(data) {
  Game.call(this, data);
  
  this.lobbyTimer = 90;
};

Lobby.prototype.load = Game.prototype.load;

Lobby.prototype.send = Game.prototype.send;
Lobby.prototype.handlePacket = Game.prototype.handlePacket;
Lobby.prototype.updatePlayerList = Game.prototype.updatePlayerList;
Lobby.prototype.gameStartTimer = function() { /* Null for lobby */ };
Lobby.prototype.handleBinary = Game.prototype.handleBinary;
Lobby.prototype.updatePacket = Game.prototype.updatePacket;

Lobby.prototype.doUpdate = Game.prototype.doUpdate;

Lobby.prototype.doNET001 = Game.prototype.doNET001;
Lobby.prototype.doNET010 = Game.prototype.doNET010;
Lobby.prototype.doNET011 = Game.prototype.doNET011;
Lobby.prototype.doNET012 = Game.prototype.doNET012;
Lobby.prototype.doNET013 = Game.prototype.doNET013;
Lobby.prototype.doNET020 = Game.prototype.doNET020;
Lobby.prototype.doNET030 = Game.prototype.doNET030;

Lobby.prototype.doStart = Game.prototype.doStart;
Lobby.prototype.doInput = Game.prototype.doInput;
Lobby.prototype.doStep = function() {
  this.doSpawn(); // If we die in the lobby, just immiedately respawn.
  Game.prototype.doStep.call(this);
};
Lobby.prototype.doSpawn = Game.prototype.doSpawn;
Lobby.prototype.doPush = Game.prototype.doPush;

Lobby.prototype.createObject = Game.prototype.createObject;

Lobby.prototype.getObject = Game.prototype.getObject;
Lobby.prototype.getFlag = Game.prototype.getFlag;
Lobby.prototype.getPlatforms = Game.prototype.getPlatforms;
Lobby.prototype.getGhost = Game.prototype.getGhost;
Lobby.prototype.getPlayer = Game.prototype.getPlayer;
Lobby.prototype.getZone = Game.prototype.getZone;
Lobby.prototype.getPlayerInfo = Game.prototype.getPlayerInfo;
Lobby.prototype.getRemain = Game.prototype.getRemain;

Lobby.prototype.levelWarp = Game.prototype.levelWarp;

Lobby.prototype.draw = function() {
  if(this.lobbyTimer > 0) { this.lobbyTimer--; }
  else { this.doStart(); }
  Game.prototype.draw.call(this);
};

Lobby.prototype.destroy = Game.prototype.destroy;