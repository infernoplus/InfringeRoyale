"use strict";
/* global util, vec2, squar */
/* global GameObject, ItemObject */
/* global NET011, NET020 */

function FlowerObject(game, level, zone, pos, oid) {
  ItemObject.call(this, game, level, zone, pos, oid);
  
  this.state = FlowerObject.STATE.IDLE;
  this.sprite = this.state.SPRITE[0];
}

/* === STATIC =============================================================== */
FlowerObject.ASYNC = false;
FlowerObject.ID = 0x52;
FlowerObject.NAME = "FIRE FLOWER"; // Used by editor

FlowerObject.SPRITE = {};
FlowerObject.SPRITE_LIST = [
  {NAME: "IDLE0", ID: 0x00, INDEX: 0x00E4},
  {NAME: "IDLE1", ID: 0x01, INDEX: 0x00E5},
  {NAME: "IDLE2", ID: 0x02, INDEX: 0x00E6},
  {NAME: "IDLE3", ID: 0x03, INDEX: 0x00E7}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<FlowerObject.SPRITE_LIST.length;i++) {
  FlowerObject.SPRITE[FlowerObject.SPRITE_LIST[i].NAME] = FlowerObject.SPRITE_LIST[i];
  FlowerObject.SPRITE[FlowerObject.SPRITE_LIST[i].ID] = FlowerObject.SPRITE_LIST[i];
}

FlowerObject.STATE = {};
FlowerObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [FlowerObject.SPRITE.IDLE0, FlowerObject.SPRITE.IDLE1, FlowerObject.SPRITE.IDLE2, FlowerObject.SPRITE.IDLE3]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<FlowerObject.STATE_LIST.length;i++) {
  FlowerObject.STATE[FlowerObject.STATE_LIST[i].NAME] = FlowerObject.STATE_LIST[i];
  FlowerObject.STATE[FlowerObject.STATE_LIST[i].ID] = FlowerObject.STATE_LIST[i];
}

/* === INSTANCE ============================================================= */

FlowerObject.prototype.update = ItemObject.prototype.update;
FlowerObject.prototype.step = ItemObject.prototype.step;

FlowerObject.prototype.control = function() { };

FlowerObject.prototype.physics = ItemObject.prototype.physics;

FlowerObject.prototype.playerCollide = ItemObject.prototype.playerCollide;
FlowerObject.prototype.playerStomp = ItemObject.prototype.playerStomp;
FlowerObject.prototype.playerBump = ItemObject.prototype.playerBump;

FlowerObject.prototype.kill = ItemObject.prototype.kill;
FlowerObject.prototype.destroy = GameObject.prototype.destroy;
FlowerObject.prototype.isTangible = GameObject.prototype.isTangible;

FlowerObject.prototype.setState = ItemObject.prototype.setState;
FlowerObject.prototype.draw = ItemObject.prototype.draw;

/* Register object class */
GameObject.REGISTER_OBJECT(FlowerObject);