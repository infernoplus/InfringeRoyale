"use strict";
/* global util, vec2, squar */
/* global GameObject, FireBreathProj */
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
  this.dim = vec2.make(2., 2.);
  this.moveSpeed = 0;
  this.fallSpeed = 0;
  this.grounded = false;
  
  /* Control */
  this.loc = [this.pos.x, this.pos.x - BowserObject.MOVE_AREA];
  this.attackTimer = 0;
  this.attackAnimTimer = 0;
  this.groundTimer = 0;
  this.jumpTimer = -1;
  this.reverse = false; /* direction bowser is moving */
  this.dir = true; /* false = facing left, true = facing right */
}

/* === STATIC =============================================================== */
BowserObject.ASYNC = false;
BowserObject.ID = 0x19;
BowserObject.NAME = "BOWSER"; // Used by editor

BowserObject.ANIMATION_RATE = 5;

BowserObject.DEAD_TIME = 60;

BowserObject.MOVE_SPEED_MAX = 0.095;
BowserObject.JUMP_DELAY = 45;        // Time between jumps
BowserObject.MOVE_AREA = 5;          // 7 Blocks horizontal area
BowserObject.JUMP_LENGTH = 6;        // Length of jump
BowserObject.JUMP_DECEL = 0.009;     // Jump deceleration
BowserObject.ATTACK_DELAY = 75;      // Time between attacks
BowserObject.ATTACK_ANIM_LENGTH = 15;
BowserObject.PROJ_OFFSET = vec2.make(-.25, 1.1);
    
BowserObject.FALL_SPEED_MAX = 0.3;
BowserObject.FALL_SPEED_ACCEL = 0.085;

BowserObject.SPRITE = {};
BowserObject.SPRITE_LIST = [
  {NAME: "RUN0", ID: 0x00, INDEX: [[0x00C4,0x00C5],[0x00B4,0x00B5]]},
  {NAME: "RUN1", ID: 0x01, INDEX: [[0x00C6,0x00C7],[0x00B6,0x00B7]]},
  {NAME: "ATTACK0", ID: 0x02, INDEX: [[0x00C0,0x00C1],[0x00B0,0x00B1]]},
  {NAME: "ATTACK1", ID: 0x03, INDEX: [[0x00C2,0x00C3],[0x00B2,0x00B3]]}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<BowserObject.SPRITE_LIST.length;i++) {
  BowserObject.SPRITE[BowserObject.SPRITE_LIST[i].NAME] = BowserObject.SPRITE_LIST[i];
  BowserObject.SPRITE[BowserObject.SPRITE_LIST[i].ID] = BowserObject.SPRITE_LIST[i];
}

BowserObject.STATE = {};
BowserObject.STATE_LIST = [
  {NAME: "RUN", ID: 0x00, SPRITE: [BowserObject.SPRITE.RUN0,BowserObject.SPRITE.RUN1]},
  {NAME: "ATTACK", ID: 0x01, SPRITE: [BowserObject.SPRITE.ATTACK0,BowserObject.SPRITE.ATTACK1]}
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
  
  if(this.attackTimer++ > BowserObject.ATTACK_DELAY) { this.attack(); }
  if(this.attackAnimTimer > 0) { this.setState(BowserObject.STATE.ATTACK); this.attackAnimTimer--; }
  else { this.setState(BowserObject.STATE.RUN); }
  
  if(this.pos.y < 0.) { this.destroy(); }
};

BowserObject.prototype.control = function() {
  if(this.grounded) {
    if(BowserObject.JUMP_DELAY < this.groundTimer++) { this.jumpTimer = 0; this.groundTimer = 0; }
    if(this.pos.x > this.loc[0]) { this.reverse = true; }
    else if(this.pos.x < this.loc[1]) { this.reverse = false; }
  }
  else if(this.jumpTimer > BowserObject.JUMP_LENGTH) {
    this.jumpTimer = -1;
  }

  this.moveSpeed = (this.moveSpeed * .75) + ((this.reverse ? -BowserObject.MOVE_SPEED_MAX : BowserObject.MOVE_SPEED_MAX) * .25);  // Rirp
};

BowserObject.prototype.physics = function() {
  if(this.jumpTimer !== -1) {
    this.fallSpeed = BowserObject.FALL_SPEED_MAX - (this.jumpTimer*BowserObject.JUMP_DECEL);
    this.jumpTimer++;
    this.grounded = false;
  }
  else {
    if(this.grounded) { this.fallSpeed = 0; }
    this.fallSpeed = Math.max(this.fallSpeed - BowserObject.FALL_SPEED_ACCEL, -BowserObject.FALL_SPEED_MAX);
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

BowserObject.prototype.attack = function() {
  this.attackAnimTimer = BowserObject.ATTACK_ANIM_LENGTH;
  this.attackTimer = 0;
  this.game.createObject(FireBreathProj.ID, this.level, this.zone, vec2.add(this.pos, BowserObject.PROJ_OFFSET), []);
};

BowserObject.prototype.playerCollide = function(p) {
  if(this.dead || this.garbage) { return; }
  p.kill();
};

BowserObject.prototype.playerStomp = BowserObject.prototype.playerCollide;

BowserObject.prototype.playerBump = BowserObject.prototype.playerCollide;

BowserObject.prototype.kill = function() { };

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
  if(this.sprite.INDEX instanceof Array) {
    var s = this.sprite.INDEX;
    for(var i=0;i<s.length;i++) {
      for(var j=0;j<s[i].length;j++) {
        sprites.push({pos: vec2.add(this.pos, vec2.make(j,i)), reverse: !this.dir, index: s[i][j]});
      }
    }
  }
  else { sprites.push({pos: this.pos, reverse: !this.dir, index: this.sprite.INDEX, mode: 0x00}); }
};

/* Register object class */
GameObject.REGISTER_OBJECT(BowserObject);