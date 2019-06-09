"use strict";
/* global util, vec2, squar */
/* global GameObject */
/* global NET011, NET020 */

function GoombaObject(game, level, zone, pos, oid, variant) {
  GameObject.call(this, game, level, zone, pos);
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.variant = isNaN(parseInt(variant))?0:parseInt(variant);
  this.setState(GoombaObject.STATE.RUN);
  
  /* Animation */
  this.anim = 0;
  
  /* Dead */
  this.deadTimer = 0;
  this.bonkTimer = 0;
  
  /* Physics */
  this.dim = vec2.make(1., 1.);
  this.moveSpeed = 0;
  this.fallSpeed = 0;
  this.grounded = false;
  
  /* Var */
  this.disabled = false;
  this.disabledTimer = 0;
  this.proxHit = false;    // So we don't send an enable event every single frame while waiting for server response.
  
  /* Control */
  this.dir = true; /* false = right, true = left */
  
  this.disable();
}


/* === STATIC =============================================================== */
GoombaObject.ASYNC = false;
GoombaObject.ID = 0x11;
GoombaObject.NAME = "GOOMBA"; // Used by editor

GoombaObject.ANIMATION_RATE = 3;
GoombaObject.VARIANT_OFFSET = 0x50;   //5 rows down in the sprite sheet

GoombaObject.ENABLE_FADE_TIME = 15;
GoombaObject.ENABLE_DIST = 26;          // Distance to player needed for proximity to trigger and the enemy to be enabled

GoombaObject.DEAD_TIME = 60;
GoombaObject.BONK_TIME = 90;
GoombaObject.BONK_IMP = vec2.make(0.25, 0.4);
GoombaObject.BONK_DECEL = 0.925;
GoombaObject.BONK_FALL_SPEED = 0.5;

GoombaObject.MOVE_SPEED_MAX = 0.075;

GoombaObject.FALL_SPEED_MAX = 0.35;
GoombaObject.FALL_SPEED_ACCEL = 0.085;

GoombaObject.SPRITE = {};
GoombaObject.SPRITE_LIST = [
  {NAME: "RUN0", ID: 0x00, INDEX: 0x000F},
  {NAME: "RUN1", ID: 0x01, INDEX: 0x001F},
  {NAME: "DEAD", ID: 0x02, INDEX: 0x002F}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<GoombaObject.SPRITE_LIST.length;i++) {
  GoombaObject.SPRITE[GoombaObject.SPRITE_LIST[i].NAME] = GoombaObject.SPRITE_LIST[i];
  GoombaObject.SPRITE[GoombaObject.SPRITE_LIST[i].ID] = GoombaObject.SPRITE_LIST[i];
}

GoombaObject.STATE = {};
GoombaObject.STATE_LIST = [
  {NAME: "RUN", ID: 0x00, SPRITE: [GoombaObject.SPRITE.RUN0,GoombaObject.SPRITE.RUN1]},
  {NAME: "DEAD", ID: 0x50, SPRITE: [GoombaObject.SPRITE.DEAD]},
  {NAME: "BONK", ID: 0x51, SPRITE: []}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<GoombaObject.STATE_LIST.length;i++) {
  GoombaObject.STATE[GoombaObject.STATE_LIST[i].NAME] = GoombaObject.STATE_LIST[i];
  GoombaObject.STATE[GoombaObject.STATE_LIST[i].ID] = GoombaObject.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

GoombaObject.prototype.update = function(event) {
  /* Event trigger */
  switch(event) {
    case 0x00 : { this.kill(); break; }
    case 0x01 : { this.bonk(); break; }
    case 0xA0 : { this.enable(); break; }
  }
};

GoombaObject.prototype.step = function() {
  /* Disabled */
  if(this.disabled) { this.proximity(); return; }
  else if(this.disabledTimer > 0) { this.disabledTimer--; }
  
  /* Bonked */
  if(this.state === GoombaObject.STATE.BONK) {
    if(this.bonkTimer++ > GoombaObject.BONK_TIME || this.pos.y+this.dim.y < 0) { this.destroy(); return; }
    
    this.pos = vec2.add(this.pos, vec2.make(this.moveSpeed, this.fallSpeed));
    this.moveSpeed *= GoombaObject.BONK_DECEL;
    this.fallSpeed = Math.max(this.fallSpeed - GoombaObject.FALL_SPEED_ACCEL, -GoombaObject.BONK_FALL_SPEED);
    return;
  }
  
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/GoombaObject.ANIMATION_RATE) % this.state.SPRITE.length];
  
  /* Dead */
  if(this.state === GoombaObject.STATE.DEAD) {
    if(this.deadTimer++ < GoombaObject.DEAD_TIME) { }
    else { this.destroy(); }
    return;
  }
  
  /* Normal Gameplay */
  this.control();
  this.physics();
  this.sound();
  
  if(this.pos.y < 0.) { this.destroy(); }
};

GoombaObject.prototype.control = function() {
  this.moveSpeed = this.dir ? -GoombaObject.MOVE_SPEED_MAX : GoombaObject.MOVE_SPEED_MAX;
};

GoombaObject.prototype.physics = function() {
  if(this.grounded) {
    this.fallSpeed = 0;
  }
  this.fallSpeed = Math.max(this.fallSpeed - GoombaObject.FALL_SPEED_ACCEL, -GoombaObject.FALL_SPEED_MAX);
  
  var movx = vec2.add(this.pos, vec2.make(this.moveSpeed, 0.));
  var movy = vec2.add(this.pos, vec2.make(this.moveSpeed, this.fallSpeed));
  
  var ext1 = vec2.make(this.moveSpeed>=0?this.pos.x:this.pos.x+this.moveSpeed, this.fallSpeed<=0?this.pos.y:this.pos.y+this.fallSpeed);
  var ext2 = vec2.make(this.dim.y+Math.abs(this.moveSpeed), this.dim.y+Math.abs(this.fallSpeed));
  var tiles = this.game.world.getZone(this.level, this.zone).getTiles(ext1, ext2);
  var tdim = vec2.make(1., 1.);
  
  var changeDir = false;
  this.grounded = false;
  for(var i=0;i<tiles.length;i++) {
    var tile = tiles[i];
    if(!tile.definition.COLLIDE) { continue; }
    
    var hitx = squar.intersection(tile.pos, tdim, movx, this.dim);
    
    if(hitx) {
      if(this.pos.x <= movx.x && movx.x + this.dim.x > tile.pos.x) {
        movx.x = tile.pos.x - this.dim.x;
        movy.x = movx.x;
        this.moveSpeed = 0;
        changeDir = true;
      }
      else if(this.pos.x >= movx.x && movx.x < tile.pos.x + tdim.x) {
        movx.x = tile.pos.x + tdim.x;
        movy.x = movx.x;
        this.moveSpeed = 0;
        changeDir = true;
      }
    }
  }
    
  for(var i=0;i<tiles.length;i++) {
    var tile = tiles[i];
    if(!tile.definition.COLLIDE) { continue; }
    
    var hity = squar.intersection(tile.pos, tdim, movy, this.dim);
    
    if(hity) {
      if(this.pos.y >= movy.y && movy.y < tile.pos.y + tdim.y) {
        movy.y = tile.pos.y + tdim.y;
        this.fallSpeed = 0;
        this.grounded = true;
      }
      else if(this.pos.y <= movy.y && movy.y + this.dim.y > tile.pos.y) {
        movy.y = tile.pos.y - this.dim.y;
        this.fallSpeed = 0;
      }
    }
  }
  this.pos = vec2.make(movx.x, movy.y);
  if(changeDir) { this.dir = !this.dir; }
};

GoombaObject.prototype.sound = GameObject.prototype.sound;

/* Tests against client player to see if they are near enough that we should enable this enemy. */
/* On a successful test we send a object event 0xA0 to the server to trigger this enemy being enabled for all players */
GoombaObject.prototype.proximity = function() {
  var ply = this.game.getPlayer();
  if(ply && !ply.dead && ply.level === this.level && ply.zone === this.zone && !this.proxHit && vec2.distance(ply.pos, this.pos) < GoombaObject.ENABLE_DIST) {
    this.game.out.push(NET020.encode(this.level, this.zone, this.oid, 0xA0));
    this.proxHit = true;
  }
};

GoombaObject.prototype.enable = function() {
  this.disabled = false;
  this.disabledTimer = GoombaObject.ENABLE_FADE_TIME;
};

GoombaObject.prototype.disable = function() {
  this.disabled = true;
};

GoombaObject.prototype.damage = function(p) { if(!this.dead) { this.bonk(); this.game.out.push(NET020.encode(this.level, this.zone, this.oid, 0x01)); } };

/* 'Bonked' is the type of death where an enemy flips upside down and falls off screen */
/* Generally triggred by shells, fireballs, etc */
GoombaObject.prototype.bonk = function() {
  if(this.dead) { return; }
  this.setState(GoombaObject.STATE.BONK);
  this.moveSpeed = GoombaObject.BONK_IMP.x;
  this.fallSpeed = GoombaObject.BONK_IMP.y;
  this.dead = true;
  this.play("sfx/kick.wav", 1., .04);
};

GoombaObject.prototype.playerCollide = function(p) {
  if(this.dead || this.garbage) { return; }
  p.damage(this);
};

GoombaObject.prototype.playerStomp = function(p) {
  if(this.dead || this.garbage) { return; }
  this.kill();
  p.bounce();
  this.game.out.push(NET020.encode(this.level, this.zone, this.oid, 0x00));
};

GoombaObject.prototype.playerBump = function(p) {
  if(this.dead || this.garbage) { return; }
  p.damage(this);
};

GoombaObject.prototype.kill = function() {
  this.dead = true;
  this.setState(GoombaObject.STATE.DEAD);
  this.play("sfx/stomp.wav", 1., .04);
};

GoombaObject.prototype.destroy = GameObject.prototype.destroy;
GoombaObject.prototype.isTangible = GameObject.prototype.isTangible;

GoombaObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  if(STATE.SPRITE.length > 0) { this.sprite = STATE.SPRITE[0]; }
  this.anim = 0;
};

GoombaObject.prototype.draw = function(sprites) {
  /* Disabled */
  if(this.disabled) { return; }

  var mod;
  if(this.state === GoombaObject.STATE.BONK) { mod = 0x03; }
  else if(this.disabledTimer > 0) { mod = 0xA0 + parseInt((1.-(this.disabledTimer/GoombaObject.ENABLE_FADE_TIME))*32.); }
  else { mod = 0x00; }
  
  if(this.sprite.INDEX instanceof Array) {
    var s = this.sprite.INDEX;
    for(var i=0;i<s.length;i++) {
      for(var j=0;j<s[i].length;j++) {
        var sp = s[!mod?i:(s.length-1-i)][j];
        switch(this.variant) {
          case 1 : { sp += GoombaObject.VARIANT_OFFSET; break; }
          default : { break; }
        }
        sprites.push({pos: vec2.add(this.pos, vec2.make(j,i)), reverse: !this.dir, index: sp, mode: mod});
      }
    }
  }
  else {
    var sp = this.sprite.INDEX;
    switch(this.variant) {
      case 1 : { sp += GoombaObject.VARIANT_OFFSET; break; }
      default : { break; }
    }
    sprites.push({pos: this.pos, reverse: !this.dir, index: sp, mode: mod});
  }
};

GoombaObject.prototype.play = GameObject.prototype.play;

/* Register object class */
GameObject.REGISTER_OBJECT(GoombaObject);