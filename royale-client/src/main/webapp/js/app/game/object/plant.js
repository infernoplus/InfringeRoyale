"use strict";
/* global util, vec2, squar */
/* global GameObject */
/* global NET011, NET020 */

function PlantObject(game, level, zone, pos, oid, variant) {
  GameObject.call(this, game, level, zone, vec2.add(pos, vec2.make(.6,0.)));
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.variant = isNaN(parseInt(variant))?0:parseInt(variant);
  this.setState(PlantObject.STATE.IDLE);
  
  /* Animation */
  this.anim = 0;
  
  /* Dead */
  this.bonkTimer = 0;
  
  /* Physics */
  this.loc = [vec2.copy(this.pos), vec2.add(this.pos, vec2.make(0., -1.5))];
  this.dim = vec2.make(.8, 1.);
  this.moveSpeed = 0;  // These are only used during a bonk.
  this.fallSpeed = 0; 
  
  /* Control */
  this.dir = 0;
}


/* === STATIC =============================================================== */
PlantObject.ASYNC = false;
PlantObject.ID = 0x16;
PlantObject.NAME = "UNSPELLABLE PLANT"; // Used by editor

PlantObject.ANIMATION_RATE = 3;
PlantObject.VARIANT_OFFSET = 0x20; //2 rows down in the sprite sheet
PlantObject.SOFFSET = vec2.make(-.1, 0.);

PlantObject.BONK_TIME = 90;
PlantObject.BONK_IMP = vec2.make(0.25, 0.4);
PlantObject.BONK_DECEL = 0.925;
PlantObject.BONK_FALL_SPEED = 0.5;

PlantObject.FALL_SPEED_ACCEL = 0.085;

PlantObject.WAIT_TIME = 25;
PlantObject.TRAVEL_SPEED = 0.05;

PlantObject.SPRITE = {};
PlantObject.SPRITE_LIST = [
  {NAME: "IDLE0", ID: 0x00, INDEX: [[0x006A],[0x005A]]},
  {NAME: "IDLE1", ID: 0x01, INDEX: [[0x006B],[0x005B]]}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<PlantObject.SPRITE_LIST.length;i++) {
  PlantObject.SPRITE[PlantObject.SPRITE_LIST[i].NAME] = PlantObject.SPRITE_LIST[i];
  PlantObject.SPRITE[PlantObject.SPRITE_LIST[i].ID] = PlantObject.SPRITE_LIST[i];
}

PlantObject.STATE = {};
PlantObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [PlantObject.SPRITE.IDLE0,PlantObject.SPRITE.IDLE1]},
  {NAME: "BONK", ID: 0x51, SPRITE: []}
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
    case 0x01 : { this.bonk(); break; }
  }
};

PlantObject.prototype.step = function() {
  /* Bonked */
  if(this.state === PlantObject.STATE.BONK) {
    if(this.bonkTimer++ > PlantObject.BONK_TIME || this.pos.y+this.dim.y < 0) { this.destroy(); return; }
    
    this.pos = vec2.add(this.pos, vec2.make(this.moveSpeed, this.fallSpeed));
    this.moveSpeed *= PlantObject.BONK_DECEL;
    this.fallSpeed = Math.max(this.fallSpeed - PlantObject.FALL_SPEED_ACCEL, -PlantObject.BONK_FALL_SPEED);
    return;
  }
  
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/PlantObject.ANIMATION_RATE) % this.state.SPRITE.length];
  
  if(--this.waitTimer > 0) { return; }
  
  /* Normal Gameplay */
  this.control();
  this.physics();
  this.sound();
};

PlantObject.prototype.control = function() {
  
};

PlantObject.prototype.physics = function() {
  var dest = this.loc[this.dir?0:1];
  var dist = vec2.distance(this.pos, dest);
  
  if(dist <= PlantObject.TRAVEL_SPEED) {
    this.pos = dest;
    this.dir = !this.dir;
    this.waitTimer = PlantObject.WAIT_TIME;
  }
  else {
    this.pos = vec2.add(this.pos, vec2.scale(vec2.normalize(vec2.subtract(dest, this.pos)), PlantObject.TRAVEL_SPEED));
  }
};

PlantObject.prototype.sound = GameObject.prototype.sound;

PlantObject.prototype.damage = function(p) { if(!this.dead) { this.bonk(); this.game.out.push(NET020.encode(this.level, this.zone, this.oid, 0x01)); } };

/* 'Bonked' is the type of death where an enemy flips upside down and falls off screen */
/* Generally triggred by shells, fireballs, etc */
PlantObject.prototype.bonk = function() {
  if(this.dead) { return; }
  this.setState(PlantObject.STATE.BONK);
  this.moveSpeed = PlantObject.BONK_IMP.x;
  this.fallSpeed = PlantObject.BONK_IMP.y;
  this.dead = true;
  this.play("sfx/kick.wav", 1., .04);
};

PlantObject.prototype.playerCollide = function(p) {
  if(this.dead || this.garbage) { return; }
  p.damage(this);
};

PlantObject.prototype.playerStomp = function(p) {
  if(this.dead || this.garbage) { return; }
  p.damage(this);
};

PlantObject.prototype.playerBump = function(p) {
  if(this.dead || this.garbage) { return; }
  p.damage(this);
};

PlantObject.prototype.kill = function() { };
PlantObject.prototype.destroy = GameObject.prototype.destroy;
PlantObject.prototype.isTangible = GameObject.prototype.isTangible;

PlantObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  if(STATE.SPRITE.length > 0) { this.sprite = STATE.SPRITE[0]; }
  this.anim = 0;
};

PlantObject.prototype.draw = function(sprites) {
  var mod;
  if(this.state === PlantObject.STATE.BONK) { mod = 0x03; }
  else { mod = 0x00; }
  
  if(this.sprite.INDEX instanceof Array) {
    var s = this.sprite.INDEX;
    for(var i=0;i<s.length;i++) {
      for(var j=0;j<s[i].length;j++) {
        var sp = s[!mod?i:(s.length-1-i)][j];
        switch(this.variant) {
          case 1 : { sp += PlantObject.VARIANT_OFFSET; break; }
          default : { break; }
        }
        sprites.push({pos: vec2.add(vec2.add(this.pos, vec2.make(j,i)), PlantObject.SOFFSET), reverse: !this.dir, index: sp, mode: mod});
      }
    }
  }
  else {
    var sp = this.sprite.INDEX;
    switch(this.variant) {
      case 1 : { sp += PlantObject.VARIANT_OFFSET; break; }
      default : { break; }
    }
    sprites.push({pos: vec2.add(this.pos, PlantObject.SOFFSET), reverse: !this.dir, index: sp, mode: mod});
  }
};

PlantObject.prototype.play = GameObject.prototype.play;

/* Register object class */
GameObject.REGISTER_OBJECT(PlantObject);