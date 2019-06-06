"use strict";
/* global util, vec2, squar */
/* global GameObject */
/* global NET011, NET020 */

function PlatformObject(game, level, zone, pos, oid, width, movx, movy, speed, loop, delay, reverse) {
  GameObject.call(this, game, level, zone, pos);
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.setState(PlatformObject.STATE.IDLE);
  
  this.loc = parseInt(reverse)===0?                                 // Locations   
    [pos, vec2.add(pos, vec2.make(parseInt(movx), parseInt(movy)))]:
    [vec2.add(pos, vec2.make(parseInt(movx), parseInt(movy))), pos];
  
  /* Animation */
  this.anim = 0;
  
  /* Physics */
  this.dim = vec2.make(parseInt(width), .5);
  this.speed = parseFloat(speed);
  this.riders = [];
  
  /* Control */
  this.dir = false; // false = loc[0]->loc[1], true = loc[0]<-loc[1]
  this.loop = parseInt(loop)===0?false:true; // false, returns to start location instantly. true, reverses direction and slides back to start
  this.delay = parseInt(delay);
}


/* === STATIC =============================================================== */
PlatformObject.ASYNC = true;
PlatformObject.ID = 0x91;
PlatformObject.NAME = "PLATFORM"; // Used by editor

PlatformObject.ANIMATION_RATE = 3;

PlatformObject.SPRITE = {};
PlatformObject.SPRITE_LIST = [
  {NAME: "IDLE", ID: 0x00, INDEX: 0x00A0}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<PlatformObject.SPRITE_LIST.length;i++) {
  PlatformObject.SPRITE[PlatformObject.SPRITE_LIST[i].NAME] = PlatformObject.SPRITE_LIST[i];
  PlatformObject.SPRITE[PlatformObject.SPRITE_LIST[i].ID] = PlatformObject.SPRITE_LIST[i];
}

PlatformObject.STATE = {};
PlatformObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [PlatformObject.SPRITE.IDLE]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<PlatformObject.STATE_LIST.length;i++) {
  PlatformObject.STATE[PlatformObject.STATE_LIST[i].NAME] = PlatformObject.STATE_LIST[i];
  PlatformObject.STATE[PlatformObject.STATE_LIST[i].ID] = PlatformObject.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

PlatformObject.prototype.update = function(event) { /* ASYNC */ };

PlatformObject.prototype.step = function() {
  /* Delay */
  if(this.delay-->0) { return; }
  
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/PlatformObject.ANIMATION_RATE) % this.state.SPRITE.length];
  
  /* Normal Gameplay */
  this.physics();
};

PlatformObject.prototype.physics = function() {
  var dir = vec2.normalize(vec2.subtract(this.loc[this.dir?0:1], this.pos));
  var dist = vec2.distance(this.pos, this.loc[this.dir?0:1]);
  
  if(dist<this.speed) {
    if(this.loop) {
      this.dir = !this.dir;
    }
    else {
      this.pos = this.loc[0];
      this.riders = [];
      return;
    }
  }
  
  var vel = vec2.scale(dir, Math.min(this.speed, dist));
  this.pos = vec2.add(this.pos, vel);
  for(var i=0;i<this.riders.length;i++) {
    var rdr = this.riders[0];
    rdr.pos = vec2.add(rdr.pos, vel);
  }
  this.riders = [];
};

PlatformObject.prototype.riding = function(obj) {
  this.riders.push(obj);
};

PlatformObject.prototype.kill = function() { };

PlatformObject.prototype.destroy = function() {
  this.garbage = true;
};

PlatformObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

PlatformObject.prototype.draw = function(sprites) {
  if(this.delay>0) { return; }
  for(var i=0;i<this.dim.x;i++) {
    sprites.push({pos: vec2.add(this.pos, vec2.make(i, 0)), reverse: this.reverse, index: this.sprite.INDEX, mode: 0x00});
  }
};

/* Register object class */
GameObject.REGISTER_OBJECT(PlatformObject);