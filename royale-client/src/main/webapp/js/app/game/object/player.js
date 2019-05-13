"use strict";
/* global util, vec2, squar, td32 */
/* global GameObject */
/* global NET011 */

function PlayerObject(game, level, zone, pos, pid) {
  GameObject.call(this, game, level, zone, pos);
  
  this.pid = pid; // Unique Player ID
  
  this.state = PlayerObject.STATE.STAND;
  this.sprite = this.state.SPRITE[0];
  
  /* Animation */
  this.anim = 0;
  
  /* Dead */
  this.deadFreezeTimer = 0;
  this.deadUpTimer = 0;
  this.deadDeleteTimer = 0;
  
  /* Physics */
  this.dim = vec2.make(1., 1.);
  this.moveSpeed = 0;
  this.fallSpeed = 0;
  this.jumping = -1;
  this.grounded = false;
  
  this.pipeWarp = undefined; // Warp point the pipe we are using is linked to
  this.pipeTimer = 0;        // Timer for going down a pipe
  
  /* Control */
  this.btnD = [0,0]; // D-Pad
  this.btnA = false;
  this.btnB = false;
}


/* === STATIC =============================================================== */
PlayerObject.ASYNC = false;
PlayerObject.ID = 0x01;
PlayerObject.NAME = "PLAYER"; // Used by editor

PlayerObject.ANIMATION_RATE = 3;

PlayerObject.DEAD_FREEZE_TIME = 5;
PlayerObject.DEAD_UP_TIME = 9;
PlayerObject.DEAD_DELETE_TIME = 30;
PlayerObject.DEAD_MOVE = 0.35;

PlayerObject.MOVE_SPEED_MAX = 0.225;
PlayerObject.MOVE_SPEED_ACCEL = 0.0125;
PlayerObject.MOVE_SPEED_DECEL = 0.0225;
PlayerObject.MOVE_SPEED_ACCEL_AIR = 0.0025;

PlayerObject.FALL_SPEED_MAX = 0.35;
PlayerObject.FALL_SPEED_ACCEL = 0.085;
PlayerObject.JUMP_LENGTH_MIN = 2;
PlayerObject.JUMP_LENGTH_MAX = 8;
PlayerObject.JUMP_DECEL = 0.005;

PlayerObject.PIPE_TIME = 30;
PlayerObject.PIPE_SPEED = 0.06;

PlayerObject.SPRITE = {};
PlayerObject.SPRITE_LIST = [
  {NAME: "STAND", ID: 0x00, INDEX: 0x002D},
  {NAME: "DOWN", ID: 0x00, INDEX: 0x002D},
  {NAME: "RUN0", ID: 0x01, INDEX: 0x002A},
  {NAME: "RUN1", ID: 0x02, INDEX: 0x002B},
  {NAME: "RUN2", ID: 0x03, INDEX: 0x002C},
  {NAME: "SLIDE", ID: 0x04, INDEX: 0x0029},
  {NAME: "FALL", ID: 0x05, INDEX: 0x0028},
  {NAME: "DEAD", ID: 0x06, INDEX: 0x0020},
  {NAME: "HIDE", ID: 0x07, INDEX: 0x002E}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<PlayerObject.SPRITE_LIST.length;i++) {
  PlayerObject.SPRITE[PlayerObject.SPRITE_LIST[i].NAME] = PlayerObject.SPRITE_LIST[i];
  PlayerObject.SPRITE[PlayerObject.SPRITE_LIST[i].ID] = PlayerObject.SPRITE_LIST[i];
}

PlayerObject.STATE = {};
PlayerObject.STATE_LIST = [
  {NAME: "STAND", ID: 0x00, SPRITE: [PlayerObject.SPRITE.STAND]},
  {NAME: "DOWN", ID: 0x01, SPRITE: [PlayerObject.SPRITE.DOWN]},
  {NAME: "RUN", ID: 0x02, SPRITE: [PlayerObject.SPRITE.RUN0,PlayerObject.SPRITE.RUN1,PlayerObject.SPRITE.RUN2]},
  {NAME: "SLIDE", ID: 0x03, SPRITE: [PlayerObject.SPRITE.SLIDE]},
  {NAME: "FALL", ID: 0x10, SPRITE: [PlayerObject.SPRITE.FALL]},
  {NAME: "DEAD", ID: 0x50, SPRITE: [PlayerObject.SPRITE.DEAD]},
  {NAME: "HIDE", ID: 0x60, SPRITE: [PlayerObject.SPRITE.HIDE]},
  {NAME: "GHOST", ID: 0xFF, SPRITE: []}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<PlayerObject.STATE_LIST.length;i++) {
  PlayerObject.STATE[PlayerObject.STATE_LIST[i].NAME] = PlayerObject.STATE_LIST[i];
  PlayerObject.STATE[PlayerObject.STATE_LIST[i].ID] = PlayerObject.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

PlayerObject.prototype.update = function(data) {
  if(this.dead || this.garbage) { return; } // Don't do ghost playback if character is dead
  
  /* Ghost playback update */
  this.state = PlayerObject.STATE.GHOST;
  this.level = data.level;
  this.zone = data.zone;
  this.pos = data.pos;
  this.sprite = PlayerObject.SPRITE[data.sprite];
  this.reverse = data.reverse;
};

PlayerObject.prototype.step = function() {
  /* Ghost playback */
  if(this.state === PlayerObject.STATE.GHOST) { return; }
  
  /* Player Hidden */
  if(this.state === PlayerObject.STATE.HIDE) { return; }
  
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/PlayerObject.ANIMATION_RATE) % this.state.SPRITE.length];
  
  /* Dead */
  if(this.state === PlayerObject.STATE.DEAD) {
    if(this.deadFreezeTimer++ < PlayerObject.DEAD_FREEZE_TIME) { }
    else if(this.deadUpTimer++ < PlayerObject.DEAD_UP_TIME) { this.pos.y += PlayerObject.DEAD_MOVE; }
    else if(this.deadDeleteTimer++ < PlayerObject.DEAD_DELETE_TIME) { this.pos.y -= PlayerObject.DEAD_MOVE; }
    else { this.destroy(); }
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
  if(this.btnD[0] !== 0) {
    if(Math.abs(this.moveSpeed) > 0.01 && !(this.btnD[0] >= 0 ^ this.moveSpeed < 0)) {
      this.moveSpeed += PlayerObject.MOVE_SPEED_DECEL * this.btnD[0];
      this.setState(PlayerObject.STATE.SLIDE);
    }
    else {
      this.moveSpeed = this.btnD[0] * Math.min(Math.abs(this.moveSpeed) + PlayerObject.MOVE_SPEED_ACCEL, PlayerObject.MOVE_SPEED_MAX);
      this.setState(PlayerObject.STATE.RUN);
    }
    this.reverse = this.btnD[0] >= 0;
  }
  else {
    if(Math.abs(this.moveSpeed) > 0.01) {
      this.moveSpeed = Math.sign(this.moveSpeed) * Math.max(Math.abs(this.moveSpeed)-PlayerObject.MOVE_SPEED_DECEL, 0);
      this.setState(PlayerObject.STATE.RUN);
    }
    else {
      this.moveSpeed = 0;
      this.setState(PlayerObject.STATE.STAND);
    }
    if(this.btnD[1] === -1) {
      this.setState(PlayerObject.STATE.DOWN);
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
  
  if(!this.grounded) { this.setState(PlayerObject.STATE.FALL); }
};

PlayerObject.prototype.physics = function() {
  if(this.jumping !== -1) {
    this.fallSpeed = PlayerObject.FALL_SPEED_MAX - (this.jumping*PlayerObject.JUMP_DECEL);
    this.jumping++;
  }
  else {
    if(this.grounded) {
      this.fallSpeed = 0;
    }
    this.fallSpeed = Math.max(this.fallSpeed - PlayerObject.FALL_SPEED_ACCEL, -PlayerObject.FALL_SPEED_MAX);
  }
  
  var movx = vec2.add(this.pos, vec2.make(this.moveSpeed, 0.));
  var movy = vec2.add(this.pos, vec2.make(this.moveSpeed, this.fallSpeed));
  
  var ext1 = vec2.make(this.moveSpeed>=0?this.pos.x:this.pos.x+this.moveSpeed, this.fallSpeed<=0?this.pos.y:this.pos.y+this.fallSpeed);
  var ext2 = vec2.make(this.dim.y+Math.abs(this.moveSpeed), this.dim.y+Math.abs(this.fallSpeed));
  var tiles = this.game.world.getZone(this.level, this.zone).getTiles(ext1, ext2);
  var tdim = vec2.make(1., 1.);
  
  this.grounded = false;
  var on = [];              // Tiles we are directly standing on, if applicable
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
        this.grounded = true;
        on.push(tile);
      }
      else if(this.pos.y + this.dim.y <= tile.pos.y && movy.y + this.dim.y > tile.pos.y) {
        movy.y = tile.pos.y - this.dim.y;
        this.jumping = -1;
        this.fallSpeed = 0;
        tile.definition.TRIGGER(this.game, this.pid, tile, this.level, this.zone, tile.pos.x, tile.pos.y, td32.TRIGGER.TYPE.SMALL_BUMP);
      }
    }
  }
  this.pos = vec2.make(movx.x, movy.y);
  
  /* Tile Touch events */
  for(var i=0;i<tiles.length;i++) {
    var tile = tiles[i];
    var hit = squar.intersection(tile.pos, tdim, this.pos, this.dim);
    if(hit) {
      tile.definition.TRIGGER(this.game, this.pid, tile, this.level, this.zone, tile.pos.x, tile.pos.y, td32.TRIGGER.TYPE.TOUCH);
    }
  }
  /* Tile Down events */
  if(this.state === PlayerObject.STATE.DOWN && this.moveSpeed < 0.01) {
    for(var i=0;i<on.length;i++) {
      var tile = on[i];
      tile.definition.TRIGGER(this.game, this.pid, tile, this.level, this.zone, tile.pos.x, tile.pos.y, td32.TRIGGER.TYPE.DOWN);
    }
  }
};

/* Checks if this object has touched or interacted with any other object */
PlayerObject.prototype.interaction = function() {
  for(var i=0;i<this.game.objects.length;i++) {
    var obj = this.game.objects[i];
    if(obj === this) { continue; }
    if(obj.level === this.level && obj.zone === this.zone && obj.dim) {
      var hit = squar.intersection(obj.pos, obj.dim, this.pos, this.dim);
      if(hit) {
        if(Math.abs(obj.pos.x - this.pos.x) > Math.abs(obj.pos.y - this.pos.y)) {
          /* Horizontal Collision */
          if(obj.playerCollide) { obj.playerCollide(this); }
        }
        else {
          if(obj.pos.y - this.pos.y) {
            /* Stomped */
            if(obj.playerStomp) { obj.playerStomp(this); }
          }
          else {
            /* Bumped */
            if(obj.playerBump) { obj.playerBump(this); }
          }
        }
      }
    }
  }
};

PlayerObject.prototype.warp = function(wid) {
  var wrp = this.game.world.getLevel(this.level).getWarp(wid);
  if(!wrp) { return; } /* Error */
    
  this.level = wrp.level;
  this.zone = wrp.zone;
  this.pos = wrp.pos;
};

PlayerObject.prototype.pipe = function(wid) {
  this.pipeWarp = wid;
  this.pipeTimer = PlayerObject.PIPE_TIME;
};

/* Make the player invisible, intangible, and frozen until show() is called. */
PlayerObject.prototype.hide = function() {
  this.setState(PlayerObject.STATE.HIDE);
};

PlayerObject.prototype.show = function() {
  this.setState(PlayerObject.STATE.STAND);
};

PlayerObject.prototype.kill = function() {
  this.dead = true;
  this.setState(PlayerObject.STATE.DEAD);
  
  if(this.game.getPlayer() === this) {
    this.game.out.push(NET011.encode());
  }
};

PlayerObject.prototype.destroy = function() {
  this.garbage = true;
};

PlayerObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

PlayerObject.prototype.draw = function(sprites) {
  sprites.push({pos: this.pos, reverse: this.reverse, index: this.sprite.INDEX});
};

/* Register object class */
GameObject.REGISTER_OBJECT(PlayerObject);