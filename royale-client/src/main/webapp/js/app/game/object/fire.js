"use strict";
/* global util, vec2, squar */
/* global GameObject */
/* global NET011, NET020 */

function FireObject(game, level, zone, pos, oid) {
  GameObject.call(this, game, level, zone, pos);
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.state = FireObject.STATE.IDLE;
  this.sprite = this.state.SPRITE[0];
  
  /* Animation */
  this.anim = 0;
  
  /* Physics */
  this.dim = vec2.make(1., 1.);
}


/* === STATIC =============================================================== */
FireObject.ASYNC = false;
FireObject.ID = 0x21;
FireObject.NAME = "FIRE TRAP"; // Used by editor

FireObject.ANIMATION_RATE = 3;

FireObject.SPRITE = {};
FireObject.SPRITE_LIST = [
  {NAME: "IDLE0", ID: 0x00, INDEX: 0x00D0},
  {NAME: "IDLE1", ID: 0x01, INDEX: 0x00D1},
  {NAME: "IDLE2", ID: 0x02, INDEX: 0x00D2},
  {NAME: "IDLE3", ID: 0x03, INDEX: 0x00D3}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<FireObject.SPRITE_LIST.length;i++) {
  FireObject.SPRITE[FireObject.SPRITE_LIST[i].NAME] = FireObject.SPRITE_LIST[i];
  FireObject.SPRITE[FireObject.SPRITE_LIST[i].ID] = FireObject.SPRITE_LIST[i];
}

FireObject.STATE = {};
FireObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [FireObject.SPRITE.IDLE0, FireObject.SPRITE.IDLE1, FireObject.SPRITE.IDLE2, FireObject.SPRITE.IDLE3]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<FireObject.STATE_LIST.length;i++) {
  FireObject.STATE[FireObject.STATE_LIST[i].NAME] = FireObject.STATE_LIST[i];
  FireObject.STATE[FireObject.STATE_LIST[i].ID] = FireObject.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

FireObject.prototype.update = function() {
  
};

FireObject.prototype.step = function() {
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/FireObject.ANIMATION_RATE) % this.state.SPRITE.length];
  
  /* Normal Gameplay */
  this.control();
  this.physics();
};

FireObject.prototype.control = function() {
  
};

FireObject.prototype.physics = function() {
  
};

FireObject.prototype.playerCollide = function(p) {
  if(this.garbage) { return; }
  p.kill();
};

FireObject.prototype.playerStomp = function(p) {
  if(this.garbage) { return; }
  p.kill();
};

FireObject.prototype.playerBump = function(p) {
  if(this.garbage) { return; }
  p.kill();
};

FireObject.prototype.kill = function() {
  
};

FireObject.prototype.destroy = function() {
  this.garbage = true;
};

FireObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

FireObject.prototype.draw = function(sprites) {
  sprites.push({pos: this.pos, reverse: this.reverse, index: this.sprite.INDEX});
};

/* Register object class */
GameObject.REGISTER_OBJECT(FireObject);