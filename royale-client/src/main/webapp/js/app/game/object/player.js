"use strict";
/* global util, vec2, squar, td32 */
/* global GameObject, MushroomObject, FlowerObject, StarObject, LifeObject, CoinObject, FireballProj */
/* global NET011, NET013 */

function PlayerObject(game, level, zone, pos, pid) {
  GameObject.call(this, game, level, zone, pos);
  
  this.pid = pid; // Unique Player ID
  
  /* Animation */
  this.anim = 0;
  this.reverse = false;
  
  /* Dead */
  this.deadFreezeTimer = 0;
  this.deadUpTimer = 0;
  this.deadDeleteTimer = 0;
  
  /* Physics */
  this.lastPos = this.pos;   // Position of mario on previous frame
  this.dim = vec2.make(1., 1.);
  this.moveSpeed = 0;
  this.fallSpeed = 0;
  this.jumping = -1;
  this.grounded = false;
  
  /* Var */
  this.power = 0;            // Powerup Index
  this.starTimer = 0;        // Star powerup active timer
  this.damageTimer = 0;      // Post damage invincibility timer
  
  this.transformTimer = 0;
  this.transformTarget = -1;
  
  this.pipeWarp = undefined; // Warp point that the pipe we are using is linked to
  this.pipeTimer = 0;        // Timer for going down a pipe
  
  this.attackCharge = PlayerObject.MAX_CHARGE;
  this.attackTimer = 0;
  
  /* Control */
  this.btnD = [0,0]; // D-Pad
  this.btnA = false;
  this.btnB = false;
  
  /* State */
  this.setState(PlayerObject.SNAME.STAND);
}


/* === STATIC =============================================================== */
PlayerObject.ASYNC = false;
PlayerObject.ID = 0x01;
PlayerObject.NAME = "PLAYER"; // Used by editor

PlayerObject.ANIMATION_RATE = 3;
PlayerObject.DIM_OFFSET = vec2.make(-.05, 0.);

PlayerObject.DEAD_FREEZE_TIME = 7;
PlayerObject.DEAD_UP_TIME = 9;
PlayerObject.DEAD_DELETE_TIME = 30;
PlayerObject.DEAD_MOVE = 0.35;

PlayerObject.MOVE_SPEED_MAX = 0.225;
PlayerObject.MOVE_SPEED_ACCEL = 0.0125;
PlayerObject.MOVE_SPEED_DECEL = 0.0225;
PlayerObject.MOVE_SPEED_ACCEL_AIR = 0.0025;
PlayerObject.STUCK_SLIDE_SPEED = 0.08;

PlayerObject.FALL_SPEED_MAX = 0.45;
PlayerObject.FALL_SPEED_ACCEL = 0.085;
PlayerObject.JUMP_LENGTH_MIN = 3;
PlayerObject.JUMP_LENGTH_MAX = 9;
PlayerObject.JUMP_DECEL = 0.005;
PlayerObject.BLOCK_BUMP_THRESHOLD = 0.12;

PlayerObject.POWER_INDEX_SIZE = 0x20;
PlayerObject.GENERIC_INDEX = 0x60;

PlayerObject.DAMAGE_TIME = 45;
PlayerObject.TRANSFORM_TIME = 18;
PlayerObject.TRANSFORM_ANIMATION_RATE = 2;
PlayerObject.STAR_LENGTH = 450;
PlayerObject.PROJ_OFFSET = vec2.make(0.75, 1.5);
PlayerObject.MAX_CHARGE = 60;
PlayerObject.ATTACK_DELAY = 7;
PlayerObject.ATTACK_CHARGE = 25;
PlayerObject.ATTACK_ANIM_LENGTH = 3;

PlayerObject.PIPE_TIME = 30;
PlayerObject.PIPE_SPEED = 0.06;

PlayerObject.PLATFORM_SNAP_DIST = 0.15;

PlayerObject.SPRITE = {};
PlayerObject.SPRITE_LIST = [
  /* [S]mall mario */
  {NAME: "S_STAND", ID: 0x00, INDEX: 0x000D},
  {NAME: "S_RUN0", ID: 0x01, INDEX: 0x000A},
  {NAME: "S_RUN1", ID: 0x02, INDEX: 0x000B},
  {NAME: "S_RUN2", ID: 0x03, INDEX: 0x000C},
  {NAME: "S_SLIDE", ID: 0x04, INDEX: 0x0009},
  {NAME: "S_FALL", ID: 0x05, INDEX: 0x0008},
  /* [B]ig mario */
  {NAME: "B_STAND", ID: 0x20, INDEX: [[0x002D], [0x01D]]}, 
  {NAME: "B_DOWN", ID: 0x21, INDEX: [[0x002C], [0x01C]]},
  {NAME: "B_RUN0", ID: 0x22, INDEX: [[0x0029], [0x019]]},
  {NAME: "B_RUN1", ID: 0x23, INDEX: [[0x002A], [0x01A]]},
  {NAME: "B_RUN2", ID: 0x24, INDEX: [[0x002B], [0x01B]]},
  {NAME: "B_SLIDE", ID: 0x25, INDEX: [[0x0028], [0x018]]},
  {NAME: "B_FALL", ID: 0x26, INDEX: [[0x0027], [0x017]]},
  {NAME: "B_TRANSFORM", ID:0x27, INDEX:[[0x002E], [0x01E]]},
  /* [F]ire flower mario */
  {NAME: "F_STAND", ID: 0x40, INDEX: [[0x004D], [0x03D]]}, 
  {NAME: "F_DOWN", ID: 0x41, INDEX: [[0x004C], [0x03C]]},
  {NAME: "F_RUN0", ID: 0x42, INDEX: [[0x0049], [0x039]]},
  {NAME: "F_RUN1", ID: 0x43, INDEX: [[0x004A], [0x03A]]},
  {NAME: "F_RUN2", ID: 0x44, INDEX: [[0x004B], [0x03B]]},
  {NAME: "F_SLIDE", ID: 0x45, INDEX: [[0x0048], [0x038]]},
  {NAME: "F_FALL", ID: 0x46, INDEX: [[0x0047], [0x037]]},
  {NAME: "F_ATTACK", ID: 0x47, INDEX: [[0x004F], [0x03F]]},
  {NAME: "F_TRANSFORM", ID:0x48, INDEX:[[0x004E], [0x03E]]},
  /* [G]eneric */
  {NAME: "G_DEAD", ID: 0x60, INDEX: 0x0000},
  {NAME: "G_HIDE", ID: 0x70, INDEX: 0x000E}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<PlayerObject.SPRITE_LIST.length;i++) {
  PlayerObject.SPRITE[PlayerObject.SPRITE_LIST[i].NAME] = PlayerObject.SPRITE_LIST[i];
  PlayerObject.SPRITE[PlayerObject.SPRITE_LIST[i].ID] = PlayerObject.SPRITE_LIST[i];
}

/* State Name */
PlayerObject.SNAME = {
  STAND: "STAND",
  DOWN: "DOWN",
  RUN: "RUN",
  SLIDE: "SLIDE",
  FALL: "FALL",
  ATTACK: "ATTACK",
  TRANSFORM: "TRANSFORM",
  DEAD: "DEAD",
  HIDE: "HIDE",
  GHOST: "GHOST"  
};

let DIM0 = vec2.make(0.9,0.95);  // Temp vars
let DIM1 = vec2.make(0.9,1.9);
PlayerObject.STATE = [
  /* Small Mario -> 0x00*/
  {NAME: PlayerObject.SNAME.STAND, ID: 0x00, DIM: DIM0, SPRITE: [PlayerObject.SPRITE.S_STAND]},
  {NAME: PlayerObject.SNAME.DOWN, ID: 0x01, DIM: DIM0, SPRITE: [PlayerObject.SPRITE.S_STAND]},
  {NAME: PlayerObject.SNAME.RUN, ID: 0x02, DIM: DIM0, SPRITE: [PlayerObject.SPRITE.S_RUN2,PlayerObject.SPRITE.S_RUN1,PlayerObject.SPRITE.S_RUN0]},
  {NAME: PlayerObject.SNAME.SLIDE, ID: 0x03, DIM: DIM0, SPRITE: [PlayerObject.SPRITE.S_SLIDE]},
  {NAME: PlayerObject.SNAME.FALL, ID: 0x04, DIM: DIM0, SPRITE: [PlayerObject.SPRITE.S_FALL]},
  {NAME: PlayerObject.SNAME.TRANSFORM, ID: 0x05, DIM: DIM0, SPRITE: [PlayerObject.SPRITE.S_STAND]},
  /* Big Mario -> 0x20 */
  {NAME: PlayerObject.SNAME.STAND, ID: 0x20, DIM: DIM1, SPRITE: [PlayerObject.SPRITE.B_STAND]},
  {NAME: PlayerObject.SNAME.DOWN, ID: 0x21, DIM: DIM0, SPRITE: [PlayerObject.SPRITE.B_DOWN]},
  {NAME: PlayerObject.SNAME.RUN, ID: 0x22, DIM: DIM1, SPRITE: [PlayerObject.SPRITE.B_RUN2,PlayerObject.SPRITE.B_RUN1,PlayerObject.SPRITE.B_RUN0]},
  {NAME: PlayerObject.SNAME.SLIDE, ID: 0x23, DIM: DIM1, SPRITE: [PlayerObject.SPRITE.B_SLIDE]},
  {NAME: PlayerObject.SNAME.FALL, ID: 0x24, DIM: DIM1, SPRITE: [PlayerObject.SPRITE.B_FALL]},
  {NAME: PlayerObject.SNAME.TRANSFORM, ID: 0x25, DIM: DIM0, SPRITE: [PlayerObject.SPRITE.B_TRANSFORM]},
  /* Fire Mario -> 0x40 */
  {NAME: PlayerObject.SNAME.STAND, ID: 0x40, DIM: DIM1, SPRITE: [PlayerObject.SPRITE.F_STAND]},
  {NAME: PlayerObject.SNAME.DOWN, ID: 0x41, DIM: DIM0, SPRITE: [PlayerObject.SPRITE.F_DOWN]},
  {NAME: PlayerObject.SNAME.RUN, ID: 0x42, DIM: DIM1, SPRITE: [PlayerObject.SPRITE.F_RUN2,PlayerObject.SPRITE.F_RUN1,PlayerObject.SPRITE.F_RUN0]},
  {NAME: PlayerObject.SNAME.SLIDE, ID: 0x43, DIM: DIM1, SPRITE: [PlayerObject.SPRITE.F_SLIDE]},
  {NAME: PlayerObject.SNAME.FALL, ID: 0x44, DIM: DIM1, SPRITE: [PlayerObject.SPRITE.F_FALL]},
  {NAME: PlayerObject.SNAME.ATTACK, ID: 0x45, DIM: DIM1, SPRITE: [PlayerObject.SPRITE.F_ATTACK]},
  {NAME: PlayerObject.SNAME.TRANSFORM, ID: 0x46, DIM: DIM0, SPRITE: [PlayerObject.SPRITE.F_TRANSFORM]},
  /* Generic -> 0x60 */
  {NAME: PlayerObject.SNAME.DEAD, DIM: DIM0, ID: 0x60, SPRITE: [PlayerObject.SPRITE.G_DEAD]},
  {NAME: PlayerObject.SNAME.HIDE, DIM: DIM0, ID: 0x70, SPRITE: [PlayerObject.SPRITE.G_HIDE]},
  {NAME: PlayerObject.SNAME.GHOST, DIM: DIM0, ID: 0xFF, SPRITE: []}
];

/* === INSTANCE ============================================================= */

PlayerObject.prototype.update = function(data) {
  if(this.dead || this.garbage) { return; } // Don't do ghost playback if character is dead
  
  /* Ghost playback update */
  this.setState(PlayerObject.SNAME.GHOST);
  this.level = data.level;
  this.zone = data.zone;
  this.pos = data.pos;
  this.sprite = PlayerObject.SPRITE[data.sprite];
  this.reverse = data.reverse;
};

PlayerObject.prototype.trigger = function(type) {
  switch(type) {
    case 0x01 : { this.attack(); break; }
  }
};

PlayerObject.prototype.step = function() {
  /* Ghost playback */
  if(this.isState("GHOST")) { return; }
  
  /* Player Hidden */
  if(this.isState("HIDE")) { return; }
  
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/PlayerObject.ANIMATION_RATE) % this.state.SPRITE.length];
  
  /* Dead */
  if(this.isState("DEAD")) {
    if(this.deadFreezeTimer++ < PlayerObject.DEAD_FREEZE_TIME) { }
    else if(this.deadUpTimer++ < PlayerObject.DEAD_UP_TIME) { this.pos.y += PlayerObject.DEAD_MOVE; }
    else if(this.deadDeleteTimer++ < PlayerObject.DEAD_DELETE_TIME) { this.pos.y -= PlayerObject.DEAD_MOVE; }
    else { this.destroy(); }
    return;
  }
  
  /* Transform */
  if(this.isState("TRANSFORM")) {
    if(--this.transformTimer > 0) {
      var ind = parseInt(this.anim/PlayerObject.TRANSFORM_ANIMATION_RATE) % 3;
      var high = this.power>this.transformTarget?this.power:this.transformTarget;
      switch(ind) {
        case 0 : { this.sprite = this.getStateByPowerIndex(PlayerObject.SNAME.STAND, this.power).SPRITE[0]; break; }
        case 1 : { this.sprite = this.getStateByPowerIndex(PlayerObject.SNAME.TRANSFORM, high).SPRITE[0]; break; }
        case 2 : { this.sprite = this.getStateByPowerIndex(PlayerObject.SNAME.STAND, this.transformTarget).SPRITE[0]; break; }
      }
    }
    else {
      this.power = this.transformTarget;
      this.transformTarget = -1;
      this.setState(PlayerObject.SNAME.STAND);
      if(this.collisionTest(this.pos, this.dim)) { this.setState(PlayerObject.SNAME.DOWN); }
    }
    return;
  }
  
  /* Warp Pipe */
  if(this.pipeTimer > 0 && this.pipeWarp) {                            // Down
    this.pipeTimer--; this.pos.y -= PlayerObject.PIPE_SPEED;
    if(this.pipeTimer < 1) { this.warp(this.pipeWarp); this.pipeWarp = undefined; this.pipeTimer = PlayerObject.PIPE_TIME; }
    return;
  }
  else if(this.pipeTimer > 0 && !this.pipeWarp) {                      // Up
    this.pipeTimer--; this.pos.y += PlayerObject.PIPE_SPEED;
    return;
  }
  
  /* Normal Gameplay */
  this.lastPos = this.pos;
  
  if(this.damageTimer > 0) { this.damageTimer--; }
  if(this.starTimer > 0) { this.starTimer--; }
  if(this.attackCharge < PlayerObject.MAX_CHARGE) { this.attackCharge++; }
  if(this.attackTimer > 0) { this.attackTimer--; }
  
  this.control();
  this.physics();
  this.interaction();
  
  if(this.pos.y < 0.) { this.kill(); }
};

/* Handles player input */
PlayerObject.prototype.input = function(dir, a, b) {
  this.btnD = dir;
  this.btnA = a;
  this.btnB = b;
};

PlayerObject.prototype.control = function() {
  if(this.isState(PlayerObject.SNAME.DOWN) && this.collisionTest(this.pos, this.getStateByPowerIndex(PlayerObject.SNAME.STAND, this.power).DIM)) {
    if(this.btnD[1] !== -1) {
      this.moveSpeed = (this.moveSpeed + PlayerObject.STUCK_SLIDE_SPEED) * .5; // Rirp
    }
    this.moveSpeed = Math.sign(this.moveSpeed) * Math.max(Math.abs(this.moveSpeed)-PlayerObject.MOVE_SPEED_DECEL, 0);
    return;
  }
  
  if(this.btnD[0] !== 0) {
    if(Math.abs(this.moveSpeed) > 0.01 && !(this.btnD[0] >= 0 ^ this.moveSpeed < 0)) {
      this.moveSpeed += PlayerObject.MOVE_SPEED_DECEL * this.btnD[0];
      this.setState(PlayerObject.SNAME.SLIDE);
    }
    else {
      this.moveSpeed = this.btnD[0] * Math.min(Math.abs(this.moveSpeed) + PlayerObject.MOVE_SPEED_ACCEL, PlayerObject.MOVE_SPEED_MAX);
      this.setState(PlayerObject.SNAME.RUN);
    }
    this.reverse = this.btnD[0] >= 0;
  }
  else {
    if(Math.abs(this.moveSpeed) > 0.01) {
      this.moveSpeed = Math.sign(this.moveSpeed) * Math.max(Math.abs(this.moveSpeed)-PlayerObject.MOVE_SPEED_DECEL, 0);
      this.setState(PlayerObject.SNAME.RUN);
    }
    else {
      this.moveSpeed = 0;
      this.setState(PlayerObject.SNAME.STAND);
    }
    if(this.btnD[1] === -1) {
      this.setState(PlayerObject.SNAME.DOWN);
    }
  }
  
  if(this.btnA) {
    if(this.grounded) {
      this.jumping = 0;
    }
    if(this.jumping > PlayerObject.JUMP_LENGTH_MAX) {
      this.jumping = -1;
    }
  }
  else {
    if(this.jumping > PlayerObject.JUMP_LENGTH_MIN) {
      this.jumping = -1;
    }
  }
  
  if(!this.grounded) { this.setState(PlayerObject.SNAME.FALL); }
  
  if(this.btnB && this.power === 2 && !this.isState(PlayerObject.SNAME.DOWN) && !this.isState(PlayerObject.SNAME.SLIDE) && this.attackTimer < 1 && this.attackCharge >= PlayerObject.ATTACK_CHARGE) {
    this.attack();
    this.game.out.push(NET013.encode(0x01));
  }
  
  if(this.attackTimer > 0 && this.power === 2 && (this.isState(PlayerObject.SNAME.STAND) || this.isState(PlayerObject.SNAME.RUN))) {
    this.setState(PlayerObject.SNAME.ATTACK);
  }
};

PlayerObject.prototype.physics = function() {
  if(this.jumping !== -1) {
    this.fallSpeed = PlayerObject.FALL_SPEED_MAX - (this.jumping*PlayerObject.JUMP_DECEL);
    this.jumping++;
    this.grounded = false;
  }
  else {
    if(this.grounded) {
      this.fallSpeed = 0;
    }
    this.fallSpeed = Math.max(this.fallSpeed - PlayerObject.FALL_SPEED_ACCEL, -PlayerObject.FALL_SPEED_MAX);
  }
  
  var mov = vec2.add(this.pos, vec2.make(this.moveSpeed, this.fallSpeed));
  
  var ext1 = vec2.make(this.pos.x+Math.min(0, this.moveSpeed), this.pos.y+Math.min(0, this.fallSpeed));
  var ext2 = vec2.make(this.dim.x+Math.max(0, this.moveSpeed), this.dim.y+Math.max(0, this.fallSpeed));
  
  var tiles = this.game.world.getZone(this.level, this.zone).getTiles(ext1, ext2);
  var plats = this.game.getPlatforms();
  var tdim = vec2.make(1., 1.);
  
  var grounded = false;
  var hit = [];
  var on = [];              // Tiles we are directly standing on
  var psh = [];             // Tiles we are directly pushing against
  var bmp = [];             // Tiles we bumped from below when jumping
  var platform;             // If we landed on or are standing on a platform then this is it.
  
  /* Collect likely hits & handle push */
  for(var i=0;i<tiles.length;i++) {
    var tile = tiles[i];
    if(!tile.definition.COLLIDE) { continue; }
    if(tile.definition.HIDDEN) { hit.push(tile); continue; }
    
    if(squar.intersection(tile.pos, tdim, mov, this.dim) || squar.intersection(tile.pos, tdim, this.pos, this.dim)) {
      if(Math.abs(this.moveSpeed) > 0.01  && this.grounded && this.pos.y <= tile.pos.y) { psh.push(tile); }
      hit.push(tile);
    }
  }
  
  /* Platforms */
  for(var i=0;i<plats.length;i++) {
    var plat = plats[i];
    if(squar.intersection(plat.pos, plat.dim, mov, this.dim)) { platform = plat; break; }
  }
  
  /* Correct X collision */
  var mvx = vec2.make(mov.x, this.pos.y);
  for(var i=0;i<hit.length;i++) {
    var tile = hit[i];
    if(tile.definition.HIDDEN) { continue; }
    if(!squar.intersection(tile.pos, tdim, mvx, this.dim)) { continue; }
    
    /* +X */
    if(mvx.x + (this.dim.x*.5) < tile.pos.x + (tdim.x*.5)) {
      mvx.x = tile.pos.x - this.dim.x;
      this.moveSpeed *= 0.33;
    }
    /* -X */
    else {
      mvx.x = tile.pos.x + tdim.x;
      this.moveSpeed *= 0.33;
    }
  }
  
  mov.x = mvx.x;
  
  /* Handle bumps && grounding */
  for(var i=0;i<hit.length;i++) {
    var tile = hit[i];
    if(squar.intersection(tile.pos, tdim, mov, this.dim)) {
      if(this.fallSpeed > PlayerObject.BLOCK_BUMP_THRESHOLD) { bmp.push(tile); }
      if(this.fallSpeed < 0 && this.pos.y >= tile.pos.y) { on.push(tile); }
    }
  }
  
  /* Correct Y collision */
  for(var i=0;i<hit.length;i++) {
    var tile = hit[i];
    if(!squar.intersection(tile.pos, tdim, mov, this.dim)) { continue; }
    
    /* -Y */
    if(this.pos.y >= mov.y) {
      if(tile.definition.HIDDEN) { continue; }
      mov.y = tile.pos.y + tdim.y;
      this.fallSpeed = 0;
      grounded = true;
    }
    /* +Y */
    else {
      mov.y = tile.pos.y - this.dim.y;
      this.fallSpeed = 0;
    }
  }
  
  if(platform) {
    if(this.pos.y >= mov.y && (platform.pos.y + platform.dim.y) - this.pos.y < PlayerObject.PLATFORM_SNAP_DIST) {
      mov.y = platform.pos.y + platform.dim.y;
      grounded = true;
    }
    else {
      /* Nothing, pass through bottom of platform when going up */
    }
  }
  
  this.grounded = grounded;
  this.pos = mov;
  
  /* On Platform */
  if(platform) {
    platform.riding(this);
  }
  
  /* Tile Touch events */
  for(var i=0;i<tiles.length;i++) {
    var tile = tiles[i];
    if(squar.intersection(tile.pos, tdim, mov, this.dim)) {
      tile.definition.TRIGGER(this.game, this.pid, tile, this.level, this.zone, tile.pos.x, tile.pos.y, td32.TRIGGER.TYPE.TOUCH);
    }
  }
  
  /* Tile Down events */
  if(this.isState("DOWN") && this.moveSpeed < 0.05) {
    for(var i=0;i<on.length;i++) {
      var tile = on[i];
      tile.definition.TRIGGER(this.game, this.pid, tile, this.level, this.zone, tile.pos.x, tile.pos.y, td32.TRIGGER.TYPE.DOWN);
    }
  }
  
  /* Tile Push events */
  if(this.isState("RUN")) {
    for(var i=0;i<psh.length;i++) {
      var tile = psh[i];
      tile.definition.TRIGGER(this.game, this.pid, tile, this.level, this.zone, tile.pos.x, tile.pos.y, td32.TRIGGER.TYPE.PUSH);
    }
  }
  
  /* Tile Bump events */
  for(var i=0;i<bmp.length;i++) {
    var tile = bmp[i];
    var bty = this.power>0?td32.TRIGGER.TYPE.BIG_BUMP:td32.TRIGGER.TYPE.SMALL_BUMP;
    tile.definition.TRIGGER(this.game, this.pid, tile, this.level, this.zone, tile.pos.x, tile.pos.y, bty);
    this.jumping = -1;
    this.fallSpeed = -PlayerObject.BLOCK_BUMP_THRESHOLD;
  }
};

/* Does a collision test in place, returns true if hits something */
/* Used to check if it's okay to standup as big mario */
PlayerObject.prototype.collisionTest = function(pos, dim) {
  var tdim = vec2.make(1., 1.);
  var tiles = this.game.world.getZone(this.level, this.zone).getTiles(pos, dim);
  for(var i=0;i<tiles.length;i++) {
    var tile = tiles[i];
    if(!tile.definition.COLLIDE) { continue; }
    
    if(squar.intersection(tile.pos, tdim, pos, dim)) { return true; }
  }
  return false;
};

/* Checks if this object has touched or interacted with any other object */
PlayerObject.prototype.interaction = function() {
  for(var i=0;i<this.game.objects.length;i++) {
    var obj = this.game.objects[i];
    if(obj === this) { continue; }
    if(obj.level === this.level && obj.zone === this.zone && obj.dim) {
      var hit = squar.intersection(obj.pos, obj.dim, this.pos, this.dim);
      if(hit) {
        if(this.lastPos.y > obj.pos.y + obj.dim.y) {
          /* Stomped */
          if(obj.playerStomp) { obj.playerStomp(this); }
        }
        else if(this.lastPos.y < obj.pos.y) {
          /* Bumped */
          if(obj.playerBump) { obj.playerBump(this); }
        }
        else {
          /* Touched */
          if(obj.playerCollide) { obj.playerCollide(this); }
        }
      }
    }
  }
};

PlayerObject.prototype.attack = function() {
  this.attackTimer = PlayerObject.ATTACK_DELAY;
  this.attackCharge -= PlayerObject.ATTACK_CHARGE;
  this.game.createObject(FireballProj.ID, this.level, this.zone, vec2.add(this.pos, PlayerObject.PROJ_OFFSET), [this.reverse]);
};

PlayerObject.prototype.bounce = function() {
  this.jumping = 0;
};

PlayerObject.prototype.damage = function(obj) {
  if(this.starTimer > 0 || this.damageTimer > 0) { return; }
  if(this.power > 0) { this.transform(0); this.damageTimer = PlayerObject.DAMAGE_TIME; return; }
  this.kill();
};

PlayerObject.prototype.powerup = function(obj) {
  if(obj instanceof MushroomObject && this.power < 1) { this.transform(1); return; }
  if(obj instanceof FlowerObject && this.power < 2) { this.transform(2); return; }
  if(obj instanceof StarObject) { this.starTimer = PlayerObject.STAR_LENGTH; return; }
  if(obj instanceof LifeObject) { return; }
  if(obj instanceof CoinObject) { return; }
};

PlayerObject.prototype.transform = function(to) {
  this.transformTarget = to;
  this.transformTimer = PlayerObject.TRANSFORM_TIME;
  this.setState(PlayerObject.SNAME.TRANSFORM);
};

PlayerObject.prototype.warp = function(wid) {
  var wrp = this.game.world.getLevel(this.level).getWarp(wid);
  if(!wrp) { return; } /* Error */
    
  this.level = wrp.level;
  this.zone = wrp.zone;
  this.pos = wrp.pos;
  
  this.grounded = false;
};

PlayerObject.prototype.pipe = function(wid) {
  this.pipeWarp = wid;
  this.pipeTimer = PlayerObject.PIPE_TIME;
};

/* Make the player invisible, intangible, and frozen until show() is called. */
PlayerObject.prototype.hide = function() {
  this.setState(PlayerObject.SNAME.HIDE);
};

PlayerObject.prototype.show = function() {
  this.setState(PlayerObject.SNAME.STAND);
};

PlayerObject.prototype.kill = function() {
  this.dead = true;
  this.setState(PlayerObject.SNAME.DEAD);
  
  if(this.game.getPlayer() === this) {
    this.game.out.push(NET011.encode());
  }
};

PlayerObject.prototype.destroy = function() {
  this.garbage = true;
};

PlayerObject.prototype.setState = function(SNAME) {
  var STATE = this.getStateByPowerIndex(SNAME, this.power);
  if(STATE === this.state) { return; }
  this.state = STATE;
  if(STATE.SPRITE.length > 0) { this.sprite = STATE.SPRITE[0]; } // Ghost state special case
  this.dim = STATE.DIM;
  this.anim = 0;
};

/* Lmoa */
PlayerObject.prototype.getStateByPowerIndex = function(SNAME, pind) {
  for(var i=0;i<PlayerObject.STATE.length;i++) {
    var ste = PlayerObject.STATE[i];
    if(ste.NAME !== SNAME) { continue; }
    if(ste.ID >= PlayerObject.GENERIC_INDEX) { return ste; }
    if(ste.ID >= PlayerObject.POWER_INDEX_SIZE*pind && ste.ID < PlayerObject.POWER_INDEX_SIZE*(pind+1)) { return ste; }
  }
};

PlayerObject.prototype.isState = function(SNAME) {
  return SNAME === this.state.NAME;
};

PlayerObject.prototype.draw = function(sprites) {
  if(this.damageTimer > 0 && this.damageTimer % 3 > 1) { return; } // Post damage timer blinking
    
  var mod; // Special draw mode
  if(this.starTimer > 0) { mod = 0x02; }
  else if(this.isState(PlayerObject.SNAME.GHOST)) { mod = 0x01; }
  else { mod = 0x00; }

  if(this.sprite.INDEX instanceof Array) {
    var s = this.sprite.INDEX;
    for(var i=0;i<s.length;i++) {
      for(var j=0;j<s[i].length;j++) {
        if(mod === 0x02) { sprites.push({pos: vec2.add(vec2.add(this.pos, PlayerObject.DIM_OFFSET), vec2.make(j,i)), reverse: this.reverse, index: s[i][j], mode: 0x00}); }
        sprites.push({pos: vec2.add(vec2.add(this.pos, PlayerObject.DIM_OFFSET), vec2.make(j,i)), reverse: this.reverse, index: s[i][j], mode: mod});
      }
    }
  }
  else {
    if(mod === 0x02) { sprites.push({pos: vec2.add(this.pos, PlayerObject.DIM_OFFSET), reverse: this.reverse, index: this.sprite.INDEX, mode: 0x00}); }
    sprites.push({pos: vec2.add(this.pos, PlayerObject.DIM_OFFSET), reverse: this.reverse, index: this.sprite.INDEX, mode: mod});
  }
};

/* Register object class */
GameObject.REGISTER_OBJECT(PlayerObject);