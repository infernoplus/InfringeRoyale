"use strict";
/* global util, vec2, squar */
/* global GameObject, ItemObject */
/* global NET011, NET020 */

function PoisonObject(game, level, zone, pos, oid) {
  ItemObject.call(this, game, level, zone, pos, oid);
  
  this.state = PoisonObject.STATE.IDLE;
  this.sprite = this.state.SPRITE[0];
}

/* === STATIC =============================================================== */
PoisonObject.ASYNC = false;
PoisonObject.ID = 0x56;
PoisonObject.NAME = "POISON MUSHROOM"; // Used by editor

PoisonObject.SPRITE = {};
PoisonObject.SPRITE_LIST = [
  {NAME: "IDLE", ID: 0x00, INDEX: 0x00EA}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<PoisonObject.SPRITE_LIST.length;i++) {
  PoisonObject.SPRITE[PoisonObject.SPRITE_LIST[i].NAME] = PoisonObject.SPRITE_LIST[i];
  PoisonObject.SPRITE[PoisonObject.SPRITE_LIST[i].ID] = PoisonObject.SPRITE_LIST[i];
}

PoisonObject.STATE = {};
PoisonObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [PoisonObject.SPRITE.IDLE]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<PoisonObject.STATE_LIST.length;i++) {
  PoisonObject.STATE[PoisonObject.STATE_LIST[i].NAME] = PoisonObject.STATE_LIST[i];
  PoisonObject.STATE[PoisonObject.STATE_LIST[i].ID] = PoisonObject.STATE_LIST[i];
}

/* === INSTANCE ============================================================= */

PoisonObject.prototype.update = ItemObject.prototype.update;
PoisonObject.prototype.step = ItemObject.prototype.step;

PoisonObject.prototype.control = function() {
  ItemObject.prototype.control.call(this);
  this.moveSpeed = this.dir ? -ItemObject.MOVE_SPEED_MAX : ItemObject.MOVE_SPEED_MAX;
};

PoisonObject.prototype.physics = ItemObject.prototype.physics;

PoisonObject.prototype.bounce = ItemObject.prototype.bounce;

PoisonObject.prototype.playerCollide = ItemObject.prototype.playerCollide;
PoisonObject.prototype.playerStomp = ItemObject.prototype.playerStomp;
PoisonObject.prototype.playerBump = ItemObject.prototype.playerBump;

PoisonObject.prototype.kill = ItemObject.prototype.kill;
PoisonObject.prototype.destroy = GameObject.prototype.destroy;
PoisonObject.prototype.isTangible = GameObject.prototype.isTangible;

PoisonObject.prototype.setState = ItemObject.prototype.setState;
PoisonObject.prototype.draw = ItemObject.prototype.draw;

/* Register object class */
GameObject.REGISTER_OBJECT(PoisonObject);