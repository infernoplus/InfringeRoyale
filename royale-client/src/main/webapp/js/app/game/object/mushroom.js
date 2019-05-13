"use strict";
/* global util, vec2, squar */
/* global GameObject, ItemObject */
/* global NET011, NET020 */

function MushroomObject(game, level, zone, pos, oid) {
  ItemObject.call(this, game, level, zone, pos, oid);
  
  this.state = MushroomObject.STATE.IDLE;
  this.sprite = this.state.SPRITE[0];
}

/* === STATIC =============================================================== */
MushroomObject.ASYNC = false;
MushroomObject.ID = 0x51;
MushroomObject.NAME = "MUSHROOM"; // Used by editor

MushroomObject.SPRITE = {};
MushroomObject.SPRITE_LIST = [
  {NAME: "IDLE", ID: 0x00, INDEX: 0x00E9}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<MushroomObject.SPRITE_LIST.length;i++) {
  MushroomObject.SPRITE[MushroomObject.SPRITE_LIST[i].NAME] = MushroomObject.SPRITE_LIST[i];
  MushroomObject.SPRITE[MushroomObject.SPRITE_LIST[i].ID] = MushroomObject.SPRITE_LIST[i];
}

MushroomObject.STATE = {};
MushroomObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [MushroomObject.SPRITE.IDLE]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<MushroomObject.STATE_LIST.length;i++) {
  MushroomObject.STATE[MushroomObject.STATE_LIST[i].NAME] = MushroomObject.STATE_LIST[i];
  MushroomObject.STATE[MushroomObject.STATE_LIST[i].ID] = MushroomObject.STATE_LIST[i];
}

/* === INSTANCE ============================================================= */

MushroomObject.prototype.update = ItemObject.prototype.update;
MushroomObject.prototype.step = ItemObject.prototype.step;

MushroomObject.prototype.control = function() {
  this.moveSpeed = this.dir ? -ItemObject.MOVE_SPEED_MAX : ItemObject.MOVE_SPEED_MAX;
};

MushroomObject.prototype.physics = ItemObject.prototype.physics;

MushroomObject.prototype.playerCollide = ItemObject.prototype.playerCollide;
MushroomObject.prototype.playerStomp = ItemObject.prototype.playerStomp;
MushroomObject.prototype.playerBump = ItemObject.prototype.playerBump;

MushroomObject.prototype.kill = ItemObject.prototype.kill;
MushroomObject.prototype.destroy = ItemObject.prototype.destroy;

MushroomObject.prototype.setState = ItemObject.prototype.setState;
MushroomObject.prototype.draw = ItemObject.prototype.draw;

/* Register object class */
GameObject.REGISTER_OBJECT(MushroomObject);