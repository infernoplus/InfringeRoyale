"use strict";
/* global util, vec2, squar */
/* global GameObject, ItemObject */
/* global NET011, NET020 */

function StarObject(game, level, zone, pos, oid) {
  ItemObject.call(this, game, level, zone, pos, oid);
  
  this.state = StarObject.STATE.IDLE;
  this.sprite = this.state.SPRITE[0];
  
  this.groundTimer = 0;
}

/* === STATIC =============================================================== */
StarObject.ASYNC = false;
StarObject.ID = 0x54;
StarObject.NAME = "STAR"; // Used by editor

StarObject.JUMP_LENGTH = 6;
StarObject.MOVE_SPEED_MAX = 0.125;
StarObject.JUMP_DELAY = 2;

StarObject.SPRITE = {};
StarObject.SPRITE_LIST = [
  {NAME: "IDLE0", ID: 0x00, INDEX: 0x00E0},
  {NAME: "IDLE1", ID: 0x01, INDEX: 0x00E1},
  {NAME: "IDLE2", ID: 0x02, INDEX: 0x00E2},
  {NAME: "IDLE3", ID: 0x03, INDEX: 0x00E3}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<StarObject.SPRITE_LIST.length;i++) {
  StarObject.SPRITE[StarObject.SPRITE_LIST[i].NAME] = StarObject.SPRITE_LIST[i];
  StarObject.SPRITE[StarObject.SPRITE_LIST[i].ID] = StarObject.SPRITE_LIST[i];
}

StarObject.STATE = {};
StarObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [StarObject.SPRITE.IDLE0, StarObject.SPRITE.IDLE1, StarObject.SPRITE.IDLE2, StarObject.SPRITE.IDLE3]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<StarObject.STATE_LIST.length;i++) {
  StarObject.STATE[StarObject.STATE_LIST[i].NAME] = StarObject.STATE_LIST[i];
  StarObject.STATE[StarObject.STATE_LIST[i].ID] = StarObject.STATE_LIST[i];
}

/* === INSTANCE ============================================================= */

StarObject.prototype.update = ItemObject.prototype.update;
StarObject.prototype.step = ItemObject.prototype.step;

StarObject.prototype.control = function() {
  this.moveSpeed = this.dir ? -StarObject.MOVE_SPEED_MAX : StarObject.MOVE_SPEED_MAX;
  if(this.grounded && ++this.groundTimer >= StarObject.JUMP_DELAY) { this.jump = 0; }
  else if(this.jump > StarObject.JUMP_LENGTH) { this.jump = -1; this.groundTimer = 0; }
};

StarObject.prototype.physics = ItemObject.prototype.physics;

StarObject.prototype.bounce = ItemObject.prototype.bounce;

StarObject.prototype.playerCollide = ItemObject.prototype.playerCollide;
StarObject.prototype.playerStomp = ItemObject.prototype.playerStomp;
StarObject.prototype.playerBump = ItemObject.prototype.playerBump;

StarObject.prototype.kill = ItemObject.prototype.kill;
StarObject.prototype.destroy = ItemObject.prototype.destroy;

StarObject.prototype.setState = ItemObject.prototype.setState;
StarObject.prototype.draw = ItemObject.prototype.draw;

/* Register object class */
GameObject.REGISTER_OBJECT(StarObject);