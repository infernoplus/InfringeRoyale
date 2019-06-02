"use strict";
/* global util, vec2, squar */
/* global GameObject */
/* global NET011, NET020 */

function FlagObject(game, level, zone, pos, oid) {
  GameObject.call(this, game, level, zone, pos);
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.setState(FlagObject.STATE.IDLE);
  
  /* Animation */
  this.anim = 0;
  
  /* Physics */
}


/* === STATIC =============================================================== */
FlagObject.ASYNC = true;
FlagObject.ID = 0xB1;
FlagObject.NAME = "FLAG"; // Used by editor

FlagObject.ANIMATION_RATE = 3;

FlagObject.OFFSET = vec2.make(-.5, 0.);

FlagObject.SPRITE = {};
FlagObject.SPRITE_LIST = [
  {NAME: "IDLE", ID: 0x00, INDEX: 0x0090}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<FlagObject.SPRITE_LIST.length;i++) {
  FlagObject.SPRITE[FlagObject.SPRITE_LIST[i].NAME] = FlagObject.SPRITE_LIST[i];
  FlagObject.SPRITE[FlagObject.SPRITE_LIST[i].ID] = FlagObject.SPRITE_LIST[i];
}

FlagObject.STATE = {};
FlagObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [FlagObject.SPRITE.IDLE]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<FlagObject.STATE_LIST.length;i++) {
  FlagObject.STATE[FlagObject.STATE_LIST[i].NAME] = FlagObject.STATE_LIST[i];
  FlagObject.STATE[FlagObject.STATE_LIST[i].ID] = FlagObject.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

FlagObject.prototype.update = function(event) { /* ASYNC */ };

FlagObject.prototype.step = function() {
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/FlagObject.ANIMATION_RATE) % this.state.SPRITE.length];
};

FlagObject.prototype.kill = function() { };

FlagObject.prototype.destroy = function() {
  this.garbage = true;
};

FlagObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

FlagObject.prototype.draw = function(sprites) {
  sprites.push({pos: vec2.add(this.pos, FlagObject.OFFSET), reverse: false, index: this.sprite.INDEX, mode: 0x00});
};

/* Register object class */
GameObject.REGISTER_OBJECT(FlagObject);