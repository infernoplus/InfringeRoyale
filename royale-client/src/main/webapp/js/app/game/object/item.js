"use strict";
/* global util, vec2, squar */
/* global GameObject */
/* global NET011, NET020 */

/* Abstract parent class, don't instance. I'll know if you do. */
function ItemObject(game, level, zone, pos, oid) {
  GameObject.call(this, game, level, zone, pos);
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  /* Animation */
  this.anim = 0;
  
  /* Physics */
  this.dim = vec2.make(1., 1.);
  this.moveSpeed = 0;
  this.fallSpeed = 0;
  this.grounded = false;
  this.rise = false;     // If this item spawned inside a solid tile it will rise up out of it.
  
  var tdim = vec2.make(1., 1.);
  var tiles = this.game.world.getZone(this.level, this.zone).getTiles(this.pos, this.dim);
  for(var i=0;i<tiles.length;i++) {
    var tile = tiles[i];
    if(squar.intersection(tile.pos, tdim, this.pos, this.dim)) { this.rise = true; break; }
  }
  
  /* Control */
  this.dir = false; /* false = left, true = right */
  this.jump = -1;
}


/* === STATIC =============================================================== */
ItemObject.ASYNC = true;
ItemObject.ID = 0x50;

ItemObject.ANIMATION_RATE = 3;

ItemObject.MOVE_SPEED_MAX = 0.075;

ItemObject.FALL_SPEED_MAX = 0.45;
ItemObject.FALL_SPEED_ACCEL = 0.075;
ItemObject.JUMP_DECEL = 0.015;

ItemObject.RISE_RATE = 0.15;

/* === INSTANCE ============================================================= */

ItemObject.prototype.update = function(event) {
  /* Event trigger */
  switch(event) {
    case 0x00 : { this.kill(); break; }
  }
};

ItemObject.prototype.step = function() {
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/ItemObject.ANIMATION_RATE) % this.state.SPRITE.length];
  
  /* Normal Gameplay */
  this.control();
  this.physics();
  
  if(this.pos.y < 0.) { this.kill(); }
};

ItemObject.prototype.control = function() { };

ItemObject.prototype.physics = function() {
  if(this.rise) {
    this.rise = false;
    
    var tdim = vec2.make(1., 1.);
    var tiles = this.game.world.getZone(this.level, this.zone).getTiles(this.pos, this.dim);
    for(var i=0;i<tiles.length;i++) {
      var tile = tiles[i];
      if(!tile.definition.COLLIDE) { continue; }
      if(squar.intersection(tile.pos, tdim, this.pos, this.dim)) { this.rise = true; break; }
    }
    
    if(!this.rise) { return; }
    
    this.pos.y += ItemObject.RISE_RATE;
    
    return;
  }
  
  if(this.jump !== -1) {
    this.fallSpeed = ItemObject.FALL_SPEED_MAX - (this.jump*ItemObject.JUMP_DECEL);
    this.jump++;
  }
  else {
    if(this.grounded) {
      this.fallSpeed = 0;
    }
    this.fallSpeed = Math.max(this.fallSpeed - ItemObject.FALL_SPEED_ACCEL, -ItemObject.FALL_SPEED_MAX);
  }
  
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
        this.grounded = true;
      }
      else if(this.pos.y <= movy.y && movy.y + this.dim.y > tile.pos.y) {
        movy.y = tile.pos.y - this.dim.y;
        this.jumping = -1;
        this.fallSpeed = 0;
      }
    }
  }
  this.pos = vec2.make(movx.x, movy.y);
  if(changeDir) { this.dir = !this.dir; }
};

ItemObject.prototype.playerCollide = function(p) {
  if(this.dead || this.garbage) { return; }
  p.powerup(this);
  this.kill();
  this.game.out.push(NET020.encode(this.level, this.zone, this.oid, 0x00));
};

ItemObject.prototype.playerStomp = function(p) {
  this.playerCollide(p);
};

ItemObject.prototype.playerBump = function(p) {
  this.playerCollide(p);
};

ItemObject.prototype.kill = function() {
  this.dead = true;
  this.destroy();
};

ItemObject.prototype.destroy = function() {
  this.garbage = true;
};

ItemObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

ItemObject.prototype.draw = function(sprites) {
  sprites.push({pos: this.pos, reverse: this.reverse, index: this.sprite.INDEX});
};