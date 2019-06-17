"use strict";
/* global util, vec2, squar */
/* global GameObject */
/* global NET011, NET020 */

/* Big fireballs that shoot up from lava */
function BulletObject(game, level, zone, pos, oid) {
  GameObject.call(this, game, level, zone, pos);
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.setState(BulletObject.STATE.IDLE);
  
  /* Animation */
  this.anim = 0;
  
  /* Var */
  this.bonkTimer = 0;
  
  /* Physics */
  this.dim = vec2.make(.8,.8);
  this.moveSpeed = 0;
  this.fallSpeed = 0;
}


/* === STATIC =============================================================== */
BulletObject.ASYNC = true;
BulletObject.ID = 0x24;
BulletObject.NAME = "BULLET"; // Used by editor

BulletObject.ANIMATION_RATE = 3;

BulletObject.SPEED = 0.215;

BulletObject.BONK_TIME = 90;
BulletObject.BONK_IMP = vec2.make(0.25, 0.4);
BulletObject.BONK_DECEL = 0.925;
BulletObject.BONK_FALL_SPEED = 0.5;
BulletObject.BONK_FALL_ACCEL = 0.085;

BulletObject.DELAY_DEFAULT = 275;
BulletObject.IMPULSE = vec2.make(0.225, 0.335);
BulletObject.DRAG = .996;
BulletObject.FALL_SPEED_ACCEL = .0055;
BulletObject.SOFFSET = vec2.make(.15,.15);

BulletObject.SPRITE = {};
BulletObject.SPRITE_LIST = [
  {NAME: "IDLE", ID: 0x00, INDEX: 0x00CD}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<BulletObject.SPRITE_LIST.length;i++) {
  BulletObject.SPRITE[BulletObject.SPRITE_LIST[i].NAME] = BulletObject.SPRITE_LIST[i];
  BulletObject.SPRITE[BulletObject.SPRITE_LIST[i].ID] = BulletObject.SPRITE_LIST[i];
}

BulletObject.STATE = {};
BulletObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [BulletObject.SPRITE.IDLE]},
  {NAME: "BONK", ID: 0x51, SPRITE: []}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<BulletObject.STATE_LIST.length;i++) {
  BulletObject.STATE[BulletObject.STATE_LIST[i].NAME] = BulletObject.STATE_LIST[i];
  BulletObject.STATE[BulletObject.STATE_LIST[i].ID] = BulletObject.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

BulletObject.prototype.update = function(event) {
  /* Event trigger */
  switch(event) { /* ASYNC */ }
};

BulletObject.prototype.step = function() {
  /* Bonked */
  if(this.state === BulletObject.STATE.BONK) {
    if(this.bonkTimer++ > BulletObject.BONK_TIME || this.pos.y+this.dim.y < 0) { this.destroy(); return; }
    
    this.pos = vec2.add(this.pos, vec2.make(this.moveSpeed, this.fallSpeed));
    this.moveSpeed *= BulletObject.BONK_DECEL;
    this.fallSpeed = Math.max(this.fallSpeed - BulletObject.BONK_FALL_ACCEL, -BulletObject.BONK_FALL_SPEED);
    return;
  }
  
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/BulletObject.ANIMATION_RATE) % this.state.SPRITE.length];
  
  /* Normal Gameplay */
  this.physics();
  this.sound();
};

BulletObject.prototype.physics = function() {
  if(this.pos.x > 0) { this.pos.x -= BulletObject.SPEED; }
  else { this.destroy(); }
};

BulletObject.prototype.sound = GameObject.prototype.sound;

BulletObject.prototype.disable = function() { this.disabled = true; };
BulletObject.prototype.enable = function() { this.disabled = false; };

BulletObject.prototype.damage = function(p) { };

/* 'Bonked' is the type of death where an enemy flips upside down and falls off screen */
/* Generally triggred by shells, fireballs, etc */
BulletObject.prototype.bonk = function() {
  if(this.dead) { return; }
  this.setState(BulletObject.STATE.BONK);
  this.moveSpeed = BulletObject.BONK_IMP.x;
  this.fallSpeed = BulletObject.BONK_IMP.y;
  this.dead = true;
  this.play("sfx/kick.wav", 1., .04);
};


BulletObject.prototype.playerCollide = function(p) {
  if(this.dead || this.garbage) { return; }
  p.damage(this);
};

BulletObject.prototype.playerStomp = function(p) {
  if(this.dead || this.garbage) { return; }
  p.bounce();
  this.play("sfx/stomp.wav", 1., .04);
  this.game.out.push(NET020.encode(this.level, this.zone, this.oid, 0x01));
};

BulletObject.prototype.playerBump = function(p) {
  this.playerCollide(p);
};

BulletObject.prototype.kill = function() { };
BulletObject.prototype.isTangible = GameObject.prototype.isTangible;
BulletObject.prototype.destroy = GameObject.prototype.destroy;

BulletObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  if(STATE.SPRITE.length > 0) { this.sprite = STATE.SPRITE[0]; }
  this.anim = 0;
};

BulletObject.prototype.draw = function(sprites) {
  var mod;
  if(this.state === BulletObject.STATE.BONK) { mod = 0x03; }
  else { mod = 0x00; }
  sprites.push({pos: vec2.subtract(this.pos, BulletObject.SOFFSET), reverse: false, index: this.sprite.INDEX, mode: mod});
};

BulletObject.prototype.play = GameObject.prototype.play;

/* Register object class */
GameObject.REGISTER_OBJECT(BulletObject);