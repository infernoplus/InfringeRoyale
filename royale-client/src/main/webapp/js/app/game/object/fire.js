"use strict";
/* global util, vec2, squar */
/* global GameObject */
/* global NET011, NET020 */

function FireObject(game, level, zone, pos, oid, start) {
  GameObject.call(this, game, level, zone, pos);
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.state = FireObject.STATE.IDLE;
  this.sprite = this.state.SPRITE[0];
  
  /* Animation */
  this.anim = parseInt(start)===1?(FireObject.SPIN_RATE*2):0;  // Also used to calculate rotation of fire
  
  /* Physics */
  this.dim = vec2.make(.5, .5);
}


/* === STATIC =============================================================== */
FireObject.ASYNC = true;
FireObject.ID = 0x21;
FireObject.NAME = "FIRE TRAP"; // Used by editor

FireObject.ANIMATION_RATE = 2;
FireObject.OFFSET = vec2.make(0.25, 0.25); // Difference between position of sprite and hitbox.

FireObject.PARTS = 6;          // Number of fireballs to calculate
FireObject.SPACING = 0.5;      // Space between each ball
FireObject.SPIN_RATE = 23;     // Number of frames per quarter rotation

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

FireObject.prototype.update = function() { };

FireObject.prototype.step = function() {
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/FireObject.ANIMATION_RATE) % this.state.SPRITE.length];
  
  /* Normal Gameplay */
  this.control();
  this.physics();
};

FireObject.prototype.control = function() {
  this.rot += FireObject.SPIN_RATE;
};

FireObject.prototype.physics = function() {
  var vec = vec2.normalize(vec2.make(Math.sin(-this.anim/FireObject.SPIN_RATE), Math.cos(-this.anim/FireObject.SPIN_RATE)));
  
  /* Hacky but... whatever */
  var plyr = this.game.getPlayer();
  if(plyr.level === this.level && plyr.zone === this.zone)
  for(var i=0;i<FireObject.PARTS;i++) {
    var pos = vec2.add(vec2.add(this.pos, FireObject.OFFSET), vec2.scale(vec, FireObject.SPACING*i));
    var hit = squar.intersection(plyr.pos, plyr.dim, pos, this.dim);
    if(hit) { this.playerCollide(plyr); }
  }
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
  var vec = vec2.normalize(vec2.make(Math.sin(-this.anim/FireObject.SPIN_RATE), Math.cos(-this.anim/FireObject.SPIN_RATE)));
  for(var i=0;i<FireObject.PARTS;i++) {
    sprites.push({pos: vec2.add(this.pos, vec2.scale(vec, FireObject.SPACING*i)), reverse: this.reverse, index: this.sprite.INDEX});
  }
};

/* Register object class */
GameObject.REGISTER_OBJECT(FireObject);