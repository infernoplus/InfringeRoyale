"use strict";
/* global util, vec2, squar */
/* global GameObject */
/* global NET011, NET020 */

/* Big fireballs that shoot up from lava */
function BlastObject(game, level, zone, pos, oid, delay, impulse) {
  GameObject.call(this, game, level, zone, pos);
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.setState(BlastObject.STATE.IDLE);
  
  this.delay = isNaN(parseInt(delay))?BlastObject.DELAY_DEFAULT:parseInt(delay);
  this.impulse = isNaN(parseFloat(impulse))?1.:parseFloat(impulse);
  
  /* Animation */
  this.anim = 0;
  
  /* Var */
  this.delayTimer = this.delay;
  
  /* Physics */
  this.pos.x += BlastObject.SOFFSET.x;
  this.loc = vec2.copy(this.pos);
  this.fallSpeed = 0;
  this.dim = vec2.make(.7,.7);
}


/* === STATIC =============================================================== */
BlastObject.ASYNC = true;
BlastObject.ID = 0x22;
BlastObject.NAME = "FIRE BLAST"; // Used by editor

BlastObject.ANIMATION_RATE = 3;

BlastObject.DELAY_DEFAULT = 90;
BlastObject.IMPULSE = 1.35;
BlastObject.DRAG = .95;
BlastObject.FALL_SPEED_ACCEL = .055;
BlastObject.SOFFSET = vec2.make(.15,.15);

BlastObject.SPRITE = {};
BlastObject.SPRITE_LIST = [
  {NAME: "IDLE", ID: 0x00, INDEX: 0x00DB}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<BlastObject.SPRITE_LIST.length;i++) {
  BlastObject.SPRITE[BlastObject.SPRITE_LIST[i].NAME] = BlastObject.SPRITE_LIST[i];
  BlastObject.SPRITE[BlastObject.SPRITE_LIST[i].ID] = BlastObject.SPRITE_LIST[i];
}

BlastObject.STATE = {};
BlastObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [BlastObject.SPRITE.IDLE]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<BlastObject.STATE_LIST.length;i++) {
  BlastObject.STATE[BlastObject.STATE_LIST[i].NAME] = BlastObject.STATE_LIST[i];
  BlastObject.STATE[BlastObject.STATE_LIST[i].ID] = BlastObject.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

BlastObject.prototype.update = function(event) { /* ASYNC */ };

BlastObject.prototype.step = function() {
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/BlastObject.ANIMATION_RATE) % this.state.SPRITE.length];
  
  if(this.delayTimer > 0) { this.delayTimer--; }
  else { this.blast(); }
  
  this.physics();
};

BlastObject.prototype.physics = function() {
  if(this.pos.y > this.loc.y || this.fallSpeed > 0.) {
    this.fallSpeed = (this.fallSpeed-BlastObject.FALL_SPEED_ACCEL)*BlastObject.DRAG;
    this.pos.y += this.fallSpeed;
  }
};

BlastObject.prototype.blast = function() {
  this.pos = vec2.copy(this.loc);
  this.fallSpeed = BlastObject.IMPULSE*this.impulse;
  this.delayTimer = this.delay;
};

BlastObject.prototype.playerCollide = function(p) {
  if(this.dead || this.garbage) { return; }
  p.damage(this);
};

BlastObject.prototype.playerStomp = function(p) {
  this.playerCollide(p);
};

BlastObject.prototype.playerBump = function(p) {
  this.playerCollide(p);
};

BlastObject.prototype.kill = function() { };
BlastObject.prototype.isTangible = GameObject.prototype.isTangible;
BlastObject.prototype.destroy = GameObject.prototype.destroy;

BlastObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

BlastObject.prototype.draw = function(sprites) {
  var mod = this.fallSpeed>=0.?0x00:0x03;
  sprites.push({pos: vec2.subtract(this.pos, BlastObject.SOFFSET), reverse: false, index: this.sprite.INDEX, mode: mod});
};

/* Register object class */
GameObject.REGISTER_OBJECT(BlastObject);