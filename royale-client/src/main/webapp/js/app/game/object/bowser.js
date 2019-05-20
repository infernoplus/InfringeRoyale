"use strict";
/* global util, vec2, squar */
/* global GameObject */
/* global NET011, NET020 */

function BowserObject(game, level, zone, pos, oid) {
  GameObject.call(this, game, level, zone, pos);
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.state = BowserObject.STATE.RUN;
  this.sprite = this.state.SPRITE[0];
  
  /* Animation */
  this.anim = 0;
  
  /* Dead */
  this.deadTimer = 0;
  
  /* Physics */
  this.dim = vec2.make(1., 1.);
  this.moveSpeed = 0;
  this.fallSpeed = 0;
  this.grounded = false;
  
  /* Control */
  this.dir = false; /* false = left, true = right */
}


/* === STATIC =============================================================== */
BowserObject.ASYNC = false;
BowserObject.ID = 0x19;
BowserObject.NAME = "BOWSER"; // Used by editor

BowserObject.ANIMATION_RATE = 3;

BowserObject.DEAD_TIME = 60;

BowserObject.MOVE_SPEED_MAX = 0.125;

BowserObject.FALL_SPEED_MAX = 0.35;
BowserObject.FALL_SPEED_ACCEL = 0.085;

BowserObject.SPRITE = {};
BowserObject.SPRITE_LIST = [
  {NAME: "RUN0", ID: 0x00, INDEX: 0x000F},
  {NAME: "RUN1", ID: 0x01, INDEX: 0x001F},
  {NAME: "DEAD", ID: 0x02, INDEX: 0x002F}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<BowserObject.SPRITE_LIST.length;i++) {
  BowserObject.SPRITE[BowserObject.SPRITE_LIST[i].NAME] = BowserObject.SPRITE_LIST[i];
  BowserObject.SPRITE[BowserObject.SPRITE_LIST[i].ID] = BowserObject.SPRITE_LIST[i];
}

BowserObject.STATE = {};
BowserObject.STATE_LIST = [
  {NAME: "RUN", ID: 0x00, SPRITE: [BowserObject.SPRITE.RUN0,BowserObject.SPRITE.RUN1]},
  {NAME: "DEAD", ID: 0x50, SPRITE: [BowserObject.SPRITE.DEAD]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<BowserObject.STATE_LIST.length;i++) {
  BowserObject.STATE[BowserObject.STATE_LIST[i].NAME] = BowserObject.STATE_LIST[i];
  BowserObject.STATE[BowserObject.STATE_LIST[i].ID] = BowserObject.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

BowserObject.prototype.update = function(event) {
  /* Event trigger */
  switch(event) {
    case 0x00 : { this.kill(); break; }
  }
};

BowserObject.prototype.step = function() {
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/BowserObject.ANIMATION_RATE) % this.state.SPRITE.length];
  
  /* Dead */
  if(this.state === BowserObject.STATE.DEAD) {
    if(this.deadTimer++ < BowserObject.DEAD_TIME) { }
    else { this.destroy(); }
    return;
  }
  
  /* Normal Gameplay */
  this.control();
  this.physics();
  
  if(this.pos.y < 0.) { this.destroy(); }
};

BowserObject.prototype.control = function() {
  this.moveSpeed = this.dir ? -BowserObject.MOVE_SPEED_MAX : BowserObject.MOVE_SPEED_MAX;
};

BowserObject.prototype.physics = function() {
  if(this.grounded) {
    this.fallSpeed = 0;
  }
  this.fallSpeed = Math.max(this.fallSpeed - BowserObject.FALL_SPEED_ACCEL, -BowserObject.FALL_SPEED_MAX);
  
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
      if(this.pos.x + this.dim.x <= tile.pos.x && movx.x + this.dim.x > tile.pos.x) {
        movx.x = tile.pos.x - this.dim.x;
        movy.x = movx.x;
        this.moveSpeed = 0;
        changeDir = true;
      }
      else if(this.pos.x >= tile.pos.x + tdim.x && movx.x < tile.pos.x + tdim.x) {
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
      if(this.pos.y >= tile.pos.y + tdim.y && movy.y < tile.pos.y + tdim.y) {
        movy.y = tile.pos.y + tdim.y;
        this.grounded = true;
      }
      else if(this.pos.y + this.dim.y <= tile.pos.y && movy.y + this.dim.y > tile.pos.y) {
        movy.y = tile.pos.y - this.dim.y;
        this.jumping = -1;
        this.fallSpeed = 0;
      }
    }
  }
  this.pos = vec2.make(movx.x, movy.y);
  if(changeDir) { this.dir = !this.dir; }
};

BowserObject.prototype.playerCollide = function(p) {
  if(this.dead || this.garbage) { return; }
  p.kill();
};

BowserObject.prototype.playerStomp = function(p) {
  if(this.dead || this.garbage) { return; }
  this.kill();
  this.game.out.push(NET020.encode(this.level, this.zone, this.oid, 0x00));
};

BowserObject.prototype.playerBump = function(p) {
  if(this.dead || this.garbage) { return; }
  p.kill();
};

BowserObject.prototype.kill = function() {
  this.dead = true;
  this.setState(BowserObject.STATE.DEAD);
};

BowserObject.prototype.destroy = function() {
  this.garbage = true;
};

BowserObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

BowserObject.prototype.draw = function(sprites) {
  sprites.push({pos: this.pos, reverse: this.reverse, index: this.sprite.INDEX});
};

/* Register object class */
GameObject.REGISTER_OBJECT(BowserObject);