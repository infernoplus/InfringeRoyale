"use strict";
/* global app */
/* global util, shor2, vec2, td32, MERGE_BYTE */
/* global Game */

function Jail(data) {
  Game.call(this, data);
  
  this.lobbyTimer = 90;
};

Jail.prototype.load = Game.prototype.load;

Jail.prototype.send = Game.prototype.send;
Jail.prototype.handlePacket = Game.prototype.handlePacket;
Jail.prototype.updatePlayerList = Game.prototype.updatePlayerList;
Jail.prototype.gameStartTimer = function() { /* Null for lobby */ };
Jail.prototype.updateTeam = Game.prototype.updateTeam;
Jail.prototype.handleBinary = Game.prototype.handleBinary;
Jail.prototype.updatePacket = Game.prototype.updatePacket;

Jail.prototype.doUpdate = Game.prototype.doUpdate;

Jail.prototype.doNET001 = Game.prototype.doNET001;
Jail.prototype.doNET010 = Game.prototype.doNET010;
Jail.prototype.doNET011 = Game.prototype.doNET011;
Jail.prototype.doNET012 = Game.prototype.doNET012;
Jail.prototype.doNET013 = Game.prototype.doNET013;
Jail.prototype.doNET020 = Game.prototype.doNET020;
Jail.prototype.doNET030 = Game.prototype.doNET030;

Jail.prototype.doStart = Game.prototype.doStart;
Jail.prototype.doDetermine = Game.prototype.doDetermine;
Jail.prototype.doInput = Game.prototype.doInput;
Jail.prototype.doTouch = Game.prototype.doTouch;
Jail.prototype.doStep = function() {
  Game.prototype.doStep.call(this);
};
Jail.prototype.doSpawn = function() { };
Jail.prototype.doMusic = Game.prototype.doMusic;
Jail.prototype.doPush = Game.prototype.doPush;

Jail.prototype.createObject = Game.prototype.createObject;

Jail.prototype.getObject = Game.prototype.getObject;
Jail.prototype.getFlag = Game.prototype.getFlag;
Jail.prototype.getPlatforms = Game.prototype.getPlatforms;
Jail.prototype.getGhost = Game.prototype.getGhost;
Jail.prototype.getPlayer = Game.prototype.getPlayer;
Jail.prototype.getZone = Game.prototype.getZone;
Jail.prototype.getPlayerInfo = Game.prototype.getPlayerInfo;
Jail.prototype.getRemain = Game.prototype.getRemain;

Jail.prototype.play = Game.prototype.play;
Jail.prototype.levelWarp = Game.prototype.levelWarp;

Jail.prototype.coinage = Game.prototype.coinage;
Jail.prototype.lifeage = Game.prototype.lifeage;

Jail.prototype.loop = function() {
  if(this.lobbyTimer > 0) { this.lobbyTimer--; }
  else if(this.startDelta === undefined) { this.doStart(); }
  Game.prototype.loop.call(this);
};

Jail.prototype.draw = Game.prototype.draw;

Jail.prototype.destroy = Game.prototype.destroy;