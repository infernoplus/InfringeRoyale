"use strict";
/* global util, vec2, squar */
/* global GameObject */
/* global NET011, NET020 */

function KoopaObject(game, level, zone, pos, oid, variant) {
  GameObject.call(this, game, level, zone, pos);
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.variant = !variant?0:variant;
  this.state = KoopaObject.STATE.RUN;
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
KoopaObject.ASYNC = false;
KoopaObject.ID = 0x12;
KoopaObject.NAME = "KOOPA"; // Used by editor

KoopaObject.ANIMATION_RATE = 3;

KoopaObject.DEAD_TIME = 60;

KoopaObject.MOVE_SPEED_MAX = 0.125;

KoopaObject.FALL_SPEED_MAX = 0.35;
KoopaObject.FALL_SPEED_ACCEL = 0.085;

KoopaObject.SPRITE = {};
KoopaObject.SPRITE_LIST = [
  {NAME: "RUN0", ID: 0x00, INDEX: 0x0047},
  {NAME: "RUN1", ID: 0x01, INDEX: 0x0048},
  {NAME: "DEAD", ID: 0x02, INDEX: 0x0047}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<KoopaObject.SPRITE_LIST.length;i++) {
  KoopaObject.SPRITE[KoopaObject.SPRITE_LIST[i].NAME] = KoopaObject.SPRITE_LIST[i];
  KoopaObject.SPRITE[KoopaObject.SPRITE_LIST[i].ID] = KoopaObject.SPRITE_LIST[i];
}

KoopaObject.STATE = {};
KoopaObject.STATE_LIST = [
  {NAME: "RUN", ID: 0x00, SPRITE: [KoopaObject.SPRITE.RUN0,KoopaObject.SPRITE.RUN1]},
  {NAME: "DEAD", ID: 0x50, SPRITE: [KoopaObject.SPRITE.DEAD]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<KoopaObject.STATE_LIST.length;i++) {
  KoopaObject.STATE[KoopaObject.STATE_LIST[i].NAME] = KoopaObject.STATE_LIST[i];
  KoopaObject.STATE[KoopaObject.STATE_LIST[i].ID] = KoopaObject.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

KoopaObject.prototype.update = function(event) {
  /* Event trigger */
  switch(event) {
    case 0x00 : { this.kill(); break; }
  }
};

KoopaObject.prototype.step = function() {
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/KoopaObject.ANIMATION_RATE) % this.state.SPRITE.length];
  
  /* Dead */
  if(this.state === KoopaObject.STATE.DEAD) {
    if(this.deadTimer++ < KoopaObject.DEAD_TIME) { }
    else { this.destroy(); }
    return;
  }
  
  /* Normal Gameplay */
  this.control();
  this.physics();
  
  if(this.pos.y < 0.) { this.destroy(); }
};

KoopaObject.prototype.control = function() {
  this.moveSpeed = this.dir ? -KoopaObject.MOVE_SPEED_MAX : KoopaObject.MOVE_SPEED_MAX;
};

KoopaObject.prototype.physics = function() {
  if(this.grounded) {
    this.fallSpeed = 0;
  }
  this.fallSpeed = Math.max(this.fallSpeed - KoopaObject.FALL_SPEED_ACCEL, -KoopaObject.FALL_SPEED_MAX);
  
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

KoopaObject.prototype.playerCollide = function(p) {
  if(this.dead || this.garbage) { return; }
  p.kill();
};

KoopaObject.prototype.playerStomp = function(p) {
  if(this.dead || this.garbage) { return; }
  this.kill();
  this.game.out.push(NET020.encode(this.level, this.zone, this.oid, 0x00));
};

KoopaObject.prototype.playerBump = function(p) {
  if(this.dead || this.garbage) { return; }
  p.kill();
};

KoopaObject.prototype.kill = function() {
  this.dead = true;
  this.setState(KoopaObject.STATE.DEAD);
};

KoopaObject.prototype.destroy = function() {
  this.garbage = true;
};

KoopaObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

KoopaObject.prototype.draw = function(sprites) {
  sprites.push({pos: this.pos, reverse: this.reverse, index: this.sprite.INDEX});
};

/* Register object class */
GameObject.REGISTER_OBJECT(KoopaObject);