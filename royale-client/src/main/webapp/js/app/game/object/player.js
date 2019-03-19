"use strict";
/* global util, vec2 */
/* global GameObject */
/* global NET011 */

function PlayerObject(game, level, zone, pos, pid) {
  GameObject.call(this, game, level, zone, pos);
  
  this.pid = pid; // Unique Player ID
  
  this.state = PlayerObject.STATE.STAND.ID;
  this.sprite = PlayerObject.STATE[this.state].SPRITE[0];
}


/* === STATIC =============================================================== */
PlayerObject.ASYNC = false;
PlayerObject.ID = 0x01;

PlayerObject.STATE = {};
PlayerObject.STATE_LIST = [
  {NAME: "STAND", ID: 0x00, SPRITE: [0x2D]},
  {NAME: "GHOST", ID: 0xFF, SPRITE: []}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<PlayerObject.STATE_LIST.length;i++) {
  PlayerObject.STATE[PlayerObject.STATE_LIST[i].NAME] = PlayerObject.STATE_LIST[i];
  PlayerObject.STATE[PlayerObject.STATE_LIST[i].ID] = PlayerObject.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

PlayerObject.prototype.update = function(data) {
  this.state = PlayerObject.STATE.GHOST.ID;
};

PlayerObject.prototype.step = function() {
  if(this.state === PlayerObject.STATE.GHOST) { return; }
  
  this.control();
  this.physics();
};

/* Handles player input */
PlayerObject.prototype.input = function(dir, a, b) {
  if(dir[0] > 0) { this.pos.x += 0.05; }
  if(dir[0] < 0) { this.pos.x -= 0.05; }
  if(dir[1] > 0) { this.pos.y += 0.05; }
  if(dir[1] < 0) { this.pos.y -= 0.05; }
};

PlayerObject.prototype.control = function() {
  
};

PlayerObject.prototype.physics = function() {
  
};

PlayerObject.prototype.kill = function() {
  this.dead = true;
  
  if(this.game.getPlayer() === this) {
    this.game.out.push(NET011.encode());
  }
  
  this.destroy();
};

PlayerObject.prototype.destroy = function() {
  this.garbage = true;
};

PlayerObject.prototype.draw = function(sprites) {
  sprites.push({pos: this.pos, reverse: this.reverse, index: this.sprite});
};

/* Register object class */
GameObject.REGISTER_OBJECT(PlayerObject);