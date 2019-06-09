"use strict";
/* global util, vec2, squar */
/* global GameObject */
/* global NET011, NET020 */

function CheckObject(game, level, zone, pos, oid) {
  GameObject.call(this, game, level, zone, pos);
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.setState(CheckObject.STATE.IDLE);
  
  /* Animation */
  this.anim = 0;
  
  /* Physics */
}


/* === STATIC =============================================================== */
CheckObject.ASYNC = true;
CheckObject.ID = 0xFE;
CheckObject.NAME = "CHECKMARK"; // Used by editor

CheckObject.ANIMATION_RATE = 3;

CheckObject.SPRITE = {};
CheckObject.SPRITE_LIST = [
  {NAME: "IDLE", ID: 0x00, INDEX: 0x00FE}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<CheckObject.SPRITE_LIST.length;i++) {
  CheckObject.SPRITE[CheckObject.SPRITE_LIST[i].NAME] = CheckObject.SPRITE_LIST[i];
  CheckObject.SPRITE[CheckObject.SPRITE_LIST[i].ID] = CheckObject.SPRITE_LIST[i];
}

CheckObject.STATE = {};
CheckObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [CheckObject.SPRITE.IDLE]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<CheckObject.STATE_LIST.length;i++) {
  CheckObject.STATE[CheckObject.STATE_LIST[i].NAME] = CheckObject.STATE_LIST[i];
  CheckObject.STATE[CheckObject.STATE_LIST[i].ID] = CheckObject.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

CheckObject.prototype.update = function(event) { /* ASYNC */ };

CheckObject.prototype.step = function() {
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/CheckObject.ANIMATION_RATE) % this.state.SPRITE.length];
};

CheckObject.prototype.kill = function() { };
CheckObject.prototype.isTangible = GameObject.prototype.isTangible;
CheckObject.prototype.destroy = GameObject.prototype.destroy;

CheckObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

CheckObject.prototype.draw = function(sprites) {
  sprites.push({pos: this.pos, reverse: false, index: this.sprite.INDEX, mode: 0x00});
};

/* Register object class */
GameObject.REGISTER_OBJECT(CheckObject);