"use strict";
/* global util, vec2, squar */
/* global GameObject, PlayerObject */
/* global NET011, NET020 */

/* Player Fireball Projectile Object */
function FireballProj(game, level, zone, pos, dir, owner) {
  GameObject.call(this, game, level, zone, pos);
  
  this.owner = owner;   // PID of the PlayerObject that created this fireball
  
  this.state = FireballProj.STATE.IDLE;
  this.sprite = this.state.SPRITE[0];
  
  /* Animation */
  this.anim = 0;
  
  /* Var */
  this.deadTimer = 0;
  
  /* Physics */
  this.dim = vec2.make(.5, .5);
  this.fallSpeed = -FireballProj.FALL_SPEED_MAX;
  this.dir = dir;
}


/* === STATIC =============================================================== */
FireballProj.ASYNC = true;
FireballProj.ID = 0xA1;
FireballProj.NAME = "FIREBALL PROJECTILE"; // Used by editor

FireballProj.ANIMATION_RATE = 2;
FireballProj.SOFFSET = vec2.make(-.25, -.25); // Difference between position of sprite and hitbox.

FireballProj.DEAD_ANIM_LENGTH = 3;

FireballProj.SPEED = 0.475;
FireballProj.BOUNCE_SPEED = 0.375;
FireballProj.FALL_SPEED_MAX = 0.425;
FireballProj.FALL_SPEED_ACCEL = 0.065;

FireballProj.SPRITE = {};
FireballProj.SPRITE_LIST = [
  {NAME: "IDLE0", ID: 0x00, INDEX: 0x00BC},
  {NAME: "IDLE1", ID: 0x01, INDEX: 0x00BD},
  {NAME: "IDLE2", ID: 0x02, INDEX: 0x00BE},
  {NAME: "IDLE3", ID: 0x03, INDEX: 0x00BF},
  {NAME: "DEAD0", ID: 0x04, INDEX: 0x00D4},
  {NAME: "DEAD1", ID: 0x05, INDEX: 0x00D5},
  {NAME: "DEAD2", ID: 0x06, INDEX: 0x00D6}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<FireballProj.SPRITE_LIST.length;i++) {
  FireballProj.SPRITE[FireballProj.SPRITE_LIST[i].NAME] = FireballProj.SPRITE_LIST[i];
  FireballProj.SPRITE[FireballProj.SPRITE_LIST[i].ID] = FireballProj.SPRITE_LIST[i];
}

FireballProj.STATE = {};
FireballProj.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [FireballProj.SPRITE.IDLE0, FireballProj.SPRITE.IDLE1, FireballProj.SPRITE.IDLE2, FireballProj.SPRITE.IDLE3]},
  {NAME: "DEAD", ID: 0x50, SPRITE: [FireballProj.SPRITE.DEAD0, FireballProj.SPRITE.DEAD1, FireballProj.SPRITE.DEAD2]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<FireballProj.STATE_LIST.length;i++) {
  FireballProj.STATE[FireballProj.STATE_LIST[i].NAME] = FireballProj.STATE_LIST[i];
  FireballProj.STATE[FireballProj.STATE_LIST[i].ID] = FireballProj.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

FireballProj.prototype.update = function(event) { /* ASYNC */ };

FireballProj.prototype.step = function() {
  /* Dead */
  if(this.state === FireballProj.STATE.DEAD) {
    if(this.deadTimer < FireballProj.DEAD_ANIM_LENGTH) { this.sprite = this.state.SPRITE[this.deadTimer++]; }
    else { this.destroy(); }
    return;
  }
  
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/FireballProj.ANIMATION_RATE) % this.state.SPRITE.length];
  
  /* Normal Gameplay */
  this.control();
  this.physics();
  this.interaction();
  this.sound();
  
  if(this.pos.y < 0.) { this.kill(); }
};

FireballProj.prototype.control = function() { };

FireballProj.prototype.physics = function() {
  var speed = this.dir?FireballProj.SPEED:-FireballProj.SPEED;
  this.fallSpeed = Math.max(this.fallSpeed - FireballProj.FALL_SPEED_ACCEL, -FireballProj.FALL_SPEED_MAX);
  
  var mov = vec2.add(this.pos, vec2.make(speed, this.fallSpeed));
  
  var ext1 = vec2.make(this.pos.x+Math.min(0, speed), this.pos.y+Math.min(0, this.fallSpeed));
  var ext2 = vec2.make(this.dim.x+Math.max(0, speed), this.dim.y+Math.max(0, this.fallSpeed));
  
  var tiles = this.game.world.getZone(this.level, this.zone).getTiles(ext1, ext2);
  var tdim = vec2.make(1., 1.);
  
  var hit = [];
  
  /* Collect likely hits */
  for(var i=0;i<tiles.length;i++) {
    var tile = tiles[i];
    if(!tile.definition.COLLIDE) { continue; }
    
    if(squar.intersection(tile.pos, tdim, mov, this.dim) || squar.intersection(tile.pos, tdim, this.pos, this.dim)) {
      hit.push(tile);
    }
  }
  
  /* Correct X collision */
  var mvx = vec2.make(mov.x, this.pos.y);
  for(var i=0;i<hit.length;i++) {
    var tile = hit[i];
    if(!squar.intersection(tile.pos, tdim, mvx, this.dim)) { continue; }
    
    /* +X */
    if(mvx.x + (this.dim.x*.5) < tile.pos.x + (tdim.x*.5)) {
      mvx.x = tile.pos.x - this.dim.x;
      this.kill();
    }
    /* -X */
    else {
      mvx.x = tile.pos.x + tdim.x;
      this.kill();
    }
  }
  
  mov.x = mvx.x;
  
  /* Correct Y collision */
  for(var i=0;i<hit.length;i++) {
    var tile = hit[i];
    if(!squar.intersection(tile.pos, tdim, mov, this.dim)) { continue; }
    
    /* -Y */
    if(this.pos.y >= mov.y) {
      mov.y = tile.pos.y + tdim.y;
      this.fallSpeed = FireballProj.BOUNCE_SPEED;
    }
    /* +Y */
    else {
      mov.y = tile.pos.y - this.dim.y;
      this.fallSpeed = -FireballProj.BOUNCE_SPEED;
    }
  }

  this.pos = mov;
};

FireballProj.prototype.interaction = function() {
  for(var i=0;i<this.game.objects.length;i++) {
    var obj = this.game.objects[i];
    if(obj === this || obj.pid === this.owner || !obj.isTangible() || obj instanceof PlayerObject || !obj.damage) { continue; }  // Fireballs skip objects that lack a damage function to call, and their owners
    if(obj.level === this.level && obj.zone === this.zone) {
      if(squar.intersection(obj.pos, obj.dim, this.pos, this.dim)) {
        if(this.owner === this.game.pid) { obj.damage(this); }             // Fireballs created by other players don't do damage. They are just ghosts.
        this.kill(); return;
      }
    }
  }
};

FireballProj.prototype.sound = GameObject.prototype.sound;

FireballProj.prototype.playerCollide = function(p) { };
FireballProj.prototype.playerStomp = function(p) { };
FireballProj.prototype.playerBump = function(p) { };

FireballProj.prototype.kill = function() {
  this.setState(FireballProj.STATE.DEAD);
  this.play("sfx/firework.wav", 0.7, .04);
  this.dead = true;
};

FireballProj.prototype.isTangible = GameObject.prototype.isTangible;
FireballProj.prototype.destroy = GameObject.prototype.destroy;

FireballProj.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

FireballProj.prototype.draw = function(sprites) {
  sprites.push({pos: vec2.add(this.pos, FireballProj.SOFFSET), reverse: false, index: this.sprite.INDEX, mode: 0x00});
};

FireballProj.prototype.play = GameObject.prototype.play;

/* Register object class */
GameObject.REGISTER_OBJECT(FireballProj);