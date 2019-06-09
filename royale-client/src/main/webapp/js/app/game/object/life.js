"use strict";
/* global util, vec2, squar */
/* global GameObject, ItemObject */
/* global NET011, NET020 */

function LifeObject(game, level, zone, pos, oid) {
  ItemObject.call(this, game, level, zone, pos, oid);
  
  this.state = LifeObject.STATE.IDLE;
  this.sprite = this.state.SPRITE[0];
}

/* === STATIC =============================================================== */
LifeObject.ASYNC = false;
LifeObject.ID = 0x53;
LifeObject.NAME = "ONEUP"; // Used by editor

LifeObject.SPRITE = {};
LifeObject.SPRITE_LIST = [
  {NAME: "IDLE", ID: 0x00, INDEX: 0x00E8}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<LifeObject.SPRITE_LIST.length;i++) {
  LifeObject.SPRITE[LifeObject.SPRITE_LIST[i].NAME] = LifeObject.SPRITE_LIST[i];
  LifeObject.SPRITE[LifeObject.SPRITE_LIST[i].ID] = LifeObject.SPRITE_LIST[i];
}

LifeObject.STATE = {};
LifeObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [LifeObject.SPRITE.IDLE]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<LifeObject.STATE_LIST.length;i++) {
  LifeObject.STATE[LifeObject.STATE_LIST[i].NAME] = LifeObject.STATE_LIST[i];
  LifeObject.STATE[LifeObject.STATE_LIST[i].ID] = LifeObject.STATE_LIST[i];
}

/* === INSTANCE ============================================================= */

LifeObject.prototype.update = ItemObject.prototype.update;
LifeObject.prototype.step = ItemObject.prototype.step;

LifeObject.prototype.control = function() {
  ItemObject.prototype.control.call(this);
  this.moveSpeed = this.dir ? -ItemObject.MOVE_SPEED_MAX : ItemObject.MOVE_SPEED_MAX;
};

LifeObject.prototype.physics = ItemObject.prototype.physics;

LifeObject.prototype.bounce = ItemObject.prototype.bounce;

LifeObject.prototype.playerCollide = ItemObject.prototype.playerCollide;
LifeObject.prototype.playerStomp = ItemObject.prototype.playerStomp;
LifeObject.prototype.playerBump = ItemObject.prototype.playerBump;

LifeObject.prototype.kill = ItemObject.prototype.kill;
LifeObject.prototype.destroy = GameObject.prototype.destroy;
LifeObject.prototype.isTangible = GameObject.prototype.isTangible;

LifeObject.prototype.setState = ItemObject.prototype.setState;
LifeObject.prototype.draw = ItemObject.prototype.draw;

/* Register object class */
GameObject.REGISTER_OBJECT(LifeObject);