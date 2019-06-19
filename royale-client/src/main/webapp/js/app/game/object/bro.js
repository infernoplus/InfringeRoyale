"use strict";
/* global util, vec2, squar */
/* global GameObject, HammerProj, CheepCheepObject */
/* global NET011, NET020 */

function HammerObject(game, level, zone, pos, oid, reverse) {
  GameObject.call(this, game, level, zone, pos);
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.setState(HammerObject.STATE.IDLE);
  
  /* Animation */
  this.anim = 0;
  
  /* Dead */
  this.bonkTimer = 0;
  
  /* Physics */
  this.dim = vec2.make(1., 1.5);
  this.moveSpeed = 0;
  this.fallSpeed = 0;
  this.grounded = false;
  
  /* Var */
  this.disabled = false;
  this.disabledTimer = 0;
  this.proxHit = false;    // So we don't send an enable event every single frame while waiting for server response.
  
  this.hammer = undefined;  // last hammer obj we threw
  
  /* Control */
  this.loc = parseInt(reverse)===1?
    [this.pos.x + HammerObject.MOVE_AREA, this.pos.x]:
    [this.pos.x, this.pos.x - HammerObject.MOVE_AREA];
  this.attackTimer = 0;
  this.attackAnimTimer = 0;
  this.double = 0;
  this.groundTimer = 0;
  this.jumpTimer = -1;
  this.reverse = false; /* direction bro is moving */
  this.dir = true;
  
  this.disable();
}

/* === STATIC =============================================================== */
HammerObject.ASYNC = false;
HammerObject.ID = 0x31;
HammerObject.NAME = "HAMMER BRO"; // Used by editor

HammerObject.ANIMATION_RATE = 5;

HammerObject.ENABLE_FADE_TIME = 15;
HammerObject.ENABLE_DIST = 33;          // Distance to player needed for proximity to trigger and the enemy to be enabled

HammerObject.BONK_TIME = 90;
HammerObject.BONK_IMP = vec2.make(0.25, 0.4);
HammerObject.BONK_DECEL = 0.925;
HammerObject.BONK_FALL_SPEED = 0.5;

HammerObject.MOVE_SPEED_MAX = 0.095;
HammerObject.JUMP_DELAY = 55;        // Time between jumps
HammerObject.MOVE_AREA = 4;          // 4 Blocks horizontal area
HammerObject.JUMP_LENGTH = 8;        // Length of jump
HammerObject.JUMP_DECEL = 0.009;     // Jump deceleration
HammerObject.ATTACK_DELAY = 75;      // Time between attacks
HammerObject.DOUBLE_RATE = 5;        // How many attacks till a double attack
HammerObject.ATTACK_ANIM_LENGTH = 13;
HammerObject.PROJ_OFFSET = vec2.make(.5, 1.25);
    
HammerObject.FALL_SPEED_MAX = 0.3;
HammerObject.FALL_SPEED_ACCEL = 0.085;

HammerObject.SPRITE = {};
HammerObject.SPRITE_LIST = [
  {NAME: "IDLE0", ID: 0x00, INDEX: [[0x006E],[0x005E]]},
  {NAME: "IDLE1", ID: 0x01, INDEX: [[0x006D],[0x005D]]},
  {NAME: "ATTACK", ID: 0x02, INDEX: [[0x006C],[0x005C]]}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<HammerObject.SPRITE_LIST.length;i++) {
  HammerObject.SPRITE[HammerObject.SPRITE_LIST[i].NAME] = HammerObject.SPRITE_LIST[i];
  HammerObject.SPRITE[HammerObject.SPRITE_LIST[i].ID] = HammerObject.SPRITE_LIST[i];
}

HammerObject.STATE = {};
HammerObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [HammerObject.SPRITE.IDLE0,HammerObject.SPRITE.IDLE1]},
  {NAME: "FALL", ID: 0x01, SPRITE: [HammerObject.SPRITE.IDLE1]},
  {NAME: "ATTACK", ID: 0x02, SPRITE: [HammerObject.SPRITE.ATTACK]},
  {NAME: "BONK", ID: 0x51, SPRITE: []}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<HammerObject.STATE_LIST.length;i++) {
  HammerObject.STATE[HammerObject.STATE_LIST[i].NAME] = HammerObject.STATE_LIST[i];
  HammerObject.STATE[HammerObject.STATE_LIST[i].ID] = HammerObject.STATE_LIST[i];
}

/* === INSTANCE ============================================================= */

HammerObject.prototype.update = function(event) {
  /* Event trigger */
  switch(event) {
    case 0x01 : { this.bonk(); break; }
    case 0xA0 : { this.enable(); break; }
  }
};

HammerObject.prototype.step = function() {
  /* Disabled */
  if(this.disabled) { this.proximity(); return; }
  else if(this.disabledTimer > 0) { this.disabledTimer--; }
  
  /* Bonked */
  if(this.state === HammerObject.STATE.BONK) {
    if(this.bonkTimer++ > HammerObject.BONK_TIME || this.pos.y+this.dim.y < 0) { this.destroy(); return; }
    
    this.pos = vec2.add(this.pos, vec2.make(this.moveSpeed, this.fallSpeed));
    this.moveSpeed *= HammerObject.BONK_DECEL;
    this.fallSpeed = Math.max(this.fallSpeed - HammerObject.FALL_SPEED_ACCEL, -HammerObject.BONK_FALL_SPEED);
    return;
  }

  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/HammerObject.ANIMATION_RATE) % this.state.SPRITE.length];
  
  /* Normal Gameplay */
  this.face();
  this.control();
  this.physics();
  this.sound();
  
  if(this.attackAnimTimer > 0) { this.setState(HammerObject.STATE.ATTACK); this.attach(); this.attackAnimTimer--; }
  else if(this.attackTimer++ > HammerObject.ATTACK_DELAY) { this.attack(); }
  else { this.hammer = undefined; }
  
  if(this.pos.y < 0.) { this.destroy(); }
};

HammerObject.prototype.control = function() {
  if(this.grounded) {
    if(HammerObject.JUMP_DELAY < this.groundTimer++) { this.jumpTimer = 0; this.groundTimer = 0; }
    if(this.pos.x > this.loc[0]) { this.reverse = true; }
    else if(this.pos.x < this.loc[1]) { this.reverse = false; }
  }
  else if(this.jumpTimer > HammerObject.JUMP_LENGTH) {
    this.jumpTimer = -1;
  }
  
  if(!this.grounded) { this.setState(HammerObject.STATE.FALL); }
  else { this.setState(HammerObject.STATE.IDLE); }

  this.moveSpeed = (this.moveSpeed * .75) + ((this.reverse ? -HammerObject.MOVE_SPEED_MAX : HammerObject.MOVE_SPEED_MAX) * .25);  // Rirp
};

HammerObject.prototype.physics = function() {
  if(this.jumpTimer !== -1) {
    this.fallSpeed = HammerObject.FALL_SPEED_MAX - (this.jumpTimer*HammerObject.JUMP_DECEL);
    this.jumpTimer++;
    this.grounded = false;
  }
  else {
    if(this.grounded) { this.fallSpeed = 0; }
    this.fallSpeed = Math.max(this.fallSpeed - HammerObject.FALL_SPEED_ACCEL, -HammerObject.FALL_SPEED_MAX);
  }
  
  var movx = vec2.add(this.pos, vec2.make(this.moveSpeed, 0.));
  var movy = vec2.add(this.pos, vec2.make(this.moveSpeed, this.fallSpeed));
  
  var ext1 = vec2.make(this.moveSpeed>=0?this.pos.x:this.pos.x+this.moveSpeed, this.fallSpeed<=0?this.pos.y:this.pos.y+this.fallSpeed);
  var ext2 = vec2.make(this.dim.y+Math.abs(this.moveSpeed), this.dim.y+Math.abs(this.fallSpeed));
  var tiles = this.game.world.getZone(this.level, this.zone).getTiles(ext1, ext2);
  var tdim = vec2.make(1., 1.);
  
  this.grounded = false;
  for(var i=0;i<tiles.length;i++) {
    var tile = tiles[i];
    if(!tile.definition.COLLIDE) { continue; }
    
    var hitx = squar.intersection(tile.pos, tdim, movx, this.dim);
    
    if(hitx) {
      if(this.pos.x + this.dim.x <= tile.pos.x && movx.x + this.dim.x > tile.pos.x) {
        movx.x = tile.pos.x - this.dim.x;
        movy.x = movx.x;
        this.moveSpeed = 0;
      }
      else if(this.pos.x >= tile.pos.x + tdim.x && movx.x < tile.pos.x + tdim.x) {
        movx.x = tile.pos.x + tdim.x;
        movy.x = movx.x;
        this.moveSpeed = 0;
      }
    }
  }
    
  for(var i=0;i<tiles.length;i++) {
    var tile = tiles[i];
    if(!tile.definition.COLLIDE) { continue; }
    
    var hity = squar.intersection(tile.pos, tdim, movy, this.dim);
    
    if(hity) {
      if(this.pos.y >= tile.pos.y + tdim.y && movy.y < tile.pos.y + tdim.y) {
        movy.y = tile.pos.y + tdim.y;
        this.fallSpeed = 0;
        this.grounded = true;
      }
      else if(this.pos.y + this.dim.y <= tile.pos.y && movy.y + this.dim.y > tile.pos.y) {
        movy.y = tile.pos.y - this.dim.y;
        this.jumpTimer = -1;
        this.fallSpeed = 0;
      }
    }
  }
  this.pos = vec2.make(movx.x, movy.y);
};

/* Tests against client player to see if they are near enough that we should enable this enemy. */
/* On a successful test we send a object event 0xA0 to the server to trigger this enemy being enabled for all players */
HammerObject.prototype.proximity = function() {
  var ply = this.game.getPlayer();
  if(ply && !ply.dead && ply.level === this.level && ply.zone === this.zone && !this.proxHit && vec2.distance(ply.pos, this.pos) < HammerObject.ENABLE_DIST) {
    this.game.out.push(NET020.encode(this.level, this.zone, this.oid, 0xA0));
    this.proxHit = true;
  }
};

/* Face nearest player */
HammerObject.prototype.face = function() {
  var nearest;
  for(var i=0;i<this.game.objects.length;i++) {
     var obj = this.game.objects[i];
     if(obj instanceof CheepCheepObject && obj.level === this.level && obj.zone === this.zone && obj.isTangible()) {
       if(!nearest || Math.abs(nearest) > vec2.distance(obj.pos, this.pos)) { nearest = obj.pos.x - this.pos.x; }
     }
  }
  if(!nearest) { this.dir = true; }
  else { this.dir = nearest<0; }
};

HammerObject.prototype.sound = GameObject.prototype.sound;

HammerObject.prototype.enable = function() {
  this.disabled = false;
  this.disabledTimer = HammerObject.ENABLE_FADE_TIME;
};

HammerObject.prototype.disable = function() {
  this.disabled = true;
};

HammerObject.prototype.attack = function() {
  this.attackAnimTimer = HammerObject.ATTACK_ANIM_LENGTH;
  this.attackTimer = 0;
  this.hammer = this.game.createObject(HammerProj.ID, this.level, this.zone, vec2.add(this.pos, HammerObject.PROJ_OFFSET), [this]);
  if(++this.double > HammerObject.DOUBLE_RATE) { this.double = 0; this.attackTimer = HammerObject.ATTACK_DELAY; }
};

/* Keeps the hammer we are throwing attached to us until it's time to actually throw it */
HammerObject.prototype.attach = function() {
  if(this.hammer) { this.hammer.pos = vec2.add(this.pos, HammerObject.PROJ_OFFSET); this.hammer.dir = !this.dir; }
};

HammerObject.prototype.playerCollide = function(p) {
  if(this.dead || this.garbage) { return; }
  p.damage(this);
};

HammerObject.prototype.playerStomp = function(p) {
  if(this.dead || this.garbage) { return; }
  this.bonk();
  p.bounce();
  this.game.out.push(NET020.encode(this.level, this.zone, this.oid, 0x01));
};

HammerObject.prototype.playerBump = HammerObject.prototype.playerCollide;

HammerObject.prototype.damage = function(p) { if(!this.dead) { this.bonk(); NET020.encode(this.level, this.zone, this.oid, 0x01); } };

/* 'Bonked' is the type of death where an enemy flips upside down and falls off screen */
/* Generally triggred by shells, fireballs, etc */
HammerObject.prototype.bonk = function() {
  if(this.dead) { return; }
  this.setState(HammerObject.STATE.BONK);
  this.moveSpeed = HammerObject.BONK_IMP.x;
  this.fallSpeed = HammerObject.BONK_IMP.y;
  this.dead = true;
  this.play("sfx/kick.wav", 1., .04);
};

HammerObject.prototype.kill = function() { /* No standard killstate */ };
HammerObject.prototype.isTangible = GameObject.prototype.isTangible;
HammerObject.prototype.destroy = GameObject.prototype.destroy;

HammerObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  if(STATE.SPRITE.length > 0) { this.sprite = STATE.SPRITE[0]; }
  this.anim = 0;
};

HammerObject.prototype.draw = function(sprites) {
  /* Disabled */
  if(this.disabled) { return; }
  
  var mod;
  if(this.state === HammerObject.STATE.BONK) { mod = 0x03; }
  else if(this.disabledTimer > 0) { mod = 0xA0 + parseInt((1.-(this.disabledTimer/HammerObject.ENABLE_FADE_TIME))*32.); }
  else { mod = 0x00; }
  
  if(this.sprite.INDEX instanceof Array) {
    var s = this.sprite.INDEX;
    for(var i=0;i<s.length;i++) {
      for(var j=0;j<s[i].length;j++) {
        sprites.push({pos: vec2.add(this.pos, vec2.make(j,i)), reverse: !this.dir, index: s[mod!==0x03?i:(s.length-1-i)][j], mode: mod});
      }
    }
  }
  else { sprites.push({pos: this.pos, reverse: !this.dir, index: this.sprite.INDEX, mode: mod}); }
};

HammerObject.prototype.play = GameObject.prototype.play;

/* Register object class */
GameObject.REGISTER_OBJECT(HammerObject);