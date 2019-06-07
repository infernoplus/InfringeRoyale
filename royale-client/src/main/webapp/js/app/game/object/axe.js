"use strict";
/* global util, vec2, squar */
/* global GameObject, ItemObject, BowserObject */
/* global NET011, NET020 */

function AxeObject(game, level, zone, pos, oid) {
  ItemObject.call(this, game, level, zone, pos, oid);
  
  this.state = AxeObject.STATE.IDLE;
  this.sprite = this.state.SPRITE[0];
  
  this.used = false;
  
  this.dim = vec2.make(1.,3.);
}

/* === STATIC =============================================================== */
AxeObject.ASYNC = true;
AxeObject.ID = 0x55;
AxeObject.NAME = "AXE"; // Used by editor

AxeObject.SPRITE = {};
AxeObject.SPRITE_LIST = [
  {NAME: "IDLE0", ID: 0x00, INDEX: 0x00EC},
  {NAME: "IDLE1", ID: 0x01, INDEX: 0x00ED},
  {NAME: "IDLE2", ID: 0x02, INDEX: 0x00EE},
  {NAME: "IDLE3", ID: 0x03, INDEX: 0x00EF}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<AxeObject.SPRITE_LIST.length;i++) {
  AxeObject.SPRITE[AxeObject.SPRITE_LIST[i].NAME] = AxeObject.SPRITE_LIST[i];
  AxeObject.SPRITE[AxeObject.SPRITE_LIST[i].ID] = AxeObject.SPRITE_LIST[i];
}

AxeObject.STATE = {};
AxeObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [AxeObject.SPRITE.IDLE0, AxeObject.SPRITE.IDLE1, AxeObject.SPRITE.IDLE2, AxeObject.SPRITE.IDLE3]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<AxeObject.STATE_LIST.length;i++) {
  AxeObject.STATE[AxeObject.STATE_LIST[i].NAME] = AxeObject.STATE_LIST[i];
  AxeObject.STATE[AxeObject.STATE_LIST[i].ID] = AxeObject.STATE_LIST[i];
}

/* === INSTANCE ============================================================= */

AxeObject.prototype.update = function(event) { /* ASYNC */ };
AxeObject.prototype.step = ItemObject.prototype.step;

AxeObject.prototype.control = function() { };

AxeObject.prototype.physics = ItemObject.prototype.physics;

AxeObject.prototype.playerCollide = function(p) {
  if(this.dead || this.garbage || this.used) { return; }
  p.powerup(this);
  this.used = true;
  
  /* Find bowser in this zone, and end him rightly */
  for(var i=0;i<this.game.objects.length;i++) {
    var obj = this.game.objects[i];
    if(obj instanceof BowserObject && obj.level === this.level && obj.zone === obj.zone && !obj.dead) { obj.bonk(); return; }
  }
};

AxeObject.prototype.playerStomp = ItemObject.prototype.playerStomp;
AxeObject.prototype.playerBump = ItemObject.prototype.playerBump;

AxeObject.prototype.kill = ItemObject.prototype.kill;
AxeObject.prototype.isTangible = GameObject.prototype.isTangible;
AxeObject.prototype.destroy = GameObject.prototype.destroy;

AxeObject.prototype.setState = ItemObject.prototype.setState;
AxeObject.prototype.draw = ItemObject.prototype.draw;

/* Register object class */
GameObject.REGISTER_OBJECT(AxeObject);