"use strict";
/* global util, vec2, squar */
/* global GameObject */
/* global NET011, NET020 */

function PlantObject(game, level, zone, pos, oid, variant) {
  GameObject.call(this, game, level, zone, pos);
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.variant = !variant?0:variant;
  this.state = PlantObject.STATE.IDLE;
  this.sprite = this.state.SPRITE[0];
  
  /* Animation */
  this.anim = 0;
  
  /* Dead */
  this.deadTimer = 0;
  
  /* Physics */
  this.dim = vec2.make(1., 1.);
}


/* === STATIC =============================================================== */
PlantObject.ASYNC = false;
PlantObject.ID = 0x16;
PlantObject.NAME = "UNSPELLABLE PLANT"; // Used by editor

PlantObject.ANIMATION_RATE = 3;

PlantObject.DEAD_TIME = 60;

PlantObject.SPRITE = {};
PlantObject.SPRITE_LIST = [
  {NAME: "IDLE0", ID: 0x00, INDEX: 0x000F},
  {NAME: "IDLE1", ID: 0x01, INDEX: 0x001F},
  {NAME: "DEAD", ID: 0x02, INDEX: 0x002F}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<PlantObject.SPRITE_LIST.length;i++) {
  PlantObject.SPRITE[PlantObject.SPRITE_LIST[i].NAME] = PlantObject.SPRITE_LIST[i];
  PlantObject.SPRITE[PlantObject.SPRITE_LIST[i].ID] = PlantObject.SPRITE_LIST[i];
}

PlantObject.STATE = {};
PlantObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [PlantObject.SPRITE.IDLE0,PlantObject.SPRITE.IDLE1]},
  {NAME: "DEAD", ID: 0x50, SPRITE: [PlantObject.SPRITE.DEAD]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<PlantObject.STATE_LIST.length;i++) {
  PlantObject.STATE[PlantObject.STATE_LIST[i].NAME] = PlantObject.STATE_LIST[i];
  PlantObject.STATE[PlantObject.STATE_LIST[i].ID] = PlantObject.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

PlantObject.prototype.update = function(event) {
  /* Event trigger */
  switch(event) {
    case 0x00 : { this.kill(); break; }
  }
};

PlantObject.prototype.step = function() {
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/PlantObject.ANIMATION_RATE) % this.state.SPRITE.length];
  
  /* Dead */
  if(this.state === PlantObject.STATE.DEAD) {
    if(this.deadTimer++ < PlantObject.DEAD_TIME) { }
    else { this.destroy(); }
    return;
  }
  
  /* Normal Gameplay */
  this.control();
  this.physics();
};

PlantObject.prototype.control = function() {

};

PlantObject.prototype.physics = function() {

};

PlantObject.prototype.playerCollide = function(p) {
  if(this.dead || this.garbage) { return; }
  //p.kill();
};

PlantObject.prototype.playerStomp = function(p) {
  if(this.dead || this.garbage) { return; }
  //p.kill();
};

PlantObject.prototype.playerBump = function(p) {
  if(this.dead || this.garbage) { return; }
  //p.kill();
};

PlantObject.prototype.kill = function() {
  this.dead = true;
  this.setState(PlantObject.STATE.DEAD);
};

PlantObject.prototype.destroy = function() {
  this.garbage = true;
};

PlantObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

PlantObject.prototype.draw = function(sprites) {
  sprites.push({pos: this.pos, reverse: this.reverse, index: this.sprite.INDEX});
};

/* Register object class */
GameObject.REGISTER_OBJECT(PlantObject);