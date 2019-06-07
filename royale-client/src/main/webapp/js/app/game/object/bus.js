"use strict";
/* global util, vec2, squar */
/* global GameObject */
/* global NET011, NET020 */

/* Very similar to PlatformObject. The only difference is it doesn't move till someone stands on it */
function BusObject(game, level, zone, pos, oid, width, movx, movy, speed) {
  GameObject.call(this, game, level, zone, pos);
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.setState(BusObject.STATE.IDLE);
  
  this.loc = [pos, vec2.add(pos, vec2.make(parseInt(movx), parseInt(movy)))];   // Locations
  
  /* Animation */
  this.anim = 0;
  
  /* Physics */
  this.dim = vec2.make(parseInt(width), .5);
  this.speed = parseFloat(speed);
  this.riders = [];
  
  /* Control */
  this.go = false;  // When true we start the platform moving. 
  this.dir = false; // false = loc[0]->loc[1], true = loc[0]<-loc[1]
}


/* === STATIC =============================================================== */
BusObject.ASYNC = false;
BusObject.ID = 0x92;
BusObject.NAME = "BUS PLATFORM"; // Used by editor

BusObject.ANIMATION_RATE = 3;

BusObject.SPRITE = {};
BusObject.SPRITE_LIST = [
  {NAME: "IDLE", ID: 0x00, INDEX: 0x00A0}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<BusObject.SPRITE_LIST.length;i++) {
  BusObject.SPRITE[BusObject.SPRITE_LIST[i].NAME] = BusObject.SPRITE_LIST[i];
  BusObject.SPRITE[BusObject.SPRITE_LIST[i].ID] = BusObject.SPRITE_LIST[i];
}

BusObject.STATE = {};
BusObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [BusObject.SPRITE.IDLE]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<BusObject.STATE_LIST.length;i++) {
  BusObject.STATE[BusObject.STATE_LIST[i].NAME] = BusObject.STATE_LIST[i];
  BusObject.STATE[BusObject.STATE_LIST[i].ID] = BusObject.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

BusObject.prototype.update = function(event) {
  switch(event) {
    case 0xA1 : { this.start(); break; }
  }
};

BusObject.prototype.step = function() {
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/BusObject.ANIMATION_RATE) % this.state.SPRITE.length];
  
  /* Normal Gameplay */
  this.physics();
};

BusObject.prototype.physics = function() {
  if(this.go) {
    var dir = vec2.normalize(vec2.subtract(this.loc[this.dir?0:1], this.pos));
    var dist = vec2.distance(this.pos, this.loc[this.dir?0:1]);

    var vel = vec2.scale(dir, Math.min(this.speed, dist));
    this.pos = vec2.add(this.pos, vel);
    for(var i=0;i<this.riders.length;i++) {
      var rdr = this.riders[0];
      rdr.pos = vec2.add(rdr.pos, vel);
    }
  }
  this.riders = [];
};

/* Starts the platform moving, triggered by an explicit event to sync it */
BusObject.prototype.start = function() {
  this.go = true;
};

BusObject.prototype.riding = function(obj) {
  if(obj.pid === this.game.pid && !this.go) { this.game.out.push(NET020.encode(this.level, this.zone, this.oid, 0xA1)); }
  this.riders.push(obj);
};

BusObject.prototype.kill = function() { };
BusObject.prototype.isTangible = GameObject.prototype.isTangible;
BusObject.prototype.destroy = GameObject.prototype.destroy;

BusObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

BusObject.prototype.draw = function(sprites) {
  if(this.delay>0) { return; }
  for(var i=0;i<this.dim.x;i++) {
    sprites.push({pos: vec2.add(this.pos, vec2.make(i, 0)), reverse: this.reverse, index: this.sprite.INDEX, mode: 0x00});
  }
};

/* Register object class */
GameObject.REGISTER_OBJECT(BusObject);