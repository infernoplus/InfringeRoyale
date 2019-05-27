"use strict";
/* global util, vec2, squar */
/* global GameObject */
/* global NET011, NET020 */

function PlantObject(game, level, zone, pos, oid, variant) {
  GameObject.call(this, game, level, zone, vec2.add(pos, vec2.make(.5,0.)));
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.variant = !variant?0:variant;
  this.setState(PlantObject.STATE.IDLE);
  
  /* Animation */
  this.anim = 0;
  
  /* Dead */
  this.deadTimer = 0;
  
  /* Physics */
  this.loc = [vec2.copy(this.pos), vec2.add(this.pos, vec2.make(0., -1.5))];
  this.dim = vec2.make(1., 1.);
  
  /* Control */
  this.dir = 0;
}


/* === STATIC =============================================================== */
PlantObject.ASYNC = false;
PlantObject.ID = 0x16;
PlantObject.NAME = "UNSPELLABLE PLANT"; // Used by editor

PlantObject.WAIT_TIME = 25;
PlantObject.TRAVEL_SPEED = 0.05;

PlantObject.ANIMATION_RATE = 3;

PlantObject.SPRITE = {};
PlantObject.SPRITE_LIST = [
  {NAME: "IDLE0", ID: 0x00, INDEX: [[0x006A],[0x005A]]},
  {NAME: "IDLE1", ID: 0x01, INDEX: [[0x006B],[0x005B]]}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<PlantObject.SPRITE_LIST.length;i++) {
  PlantObject.SPRITE[PlantObject.SPRITE_LIST[i].NAME] = PlantObject.SPRITE_LIST[i];
  PlantObject.SPRITE[PlantObject.SPRITE_LIST[i].ID] = PlantObject.SPRITE_LIST[i];
}

PlantObject.STATE = {};
PlantObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [PlantObject.SPRITE.IDLE0,PlantObject.SPRITE.IDLE1]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<PlantObject.STATE_LIST.length;i++) {
  PlantObject.STATE[PlantObject.STATE_LIST[i].NAME] = PlantObject.STATE_LIST[i];
  PlantObject.STATE[PlantObject.STATE_LIST[i].ID] = PlantObject.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

PlantObject.prototype.update = function(event) {
  /* Event trigger */
  switch(event) {
    case 0x00 : { this.kill(); break; }
  }
};

PlantObject.prototype.step = function() {
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/PlantObject.ANIMATION_RATE) % this.state.SPRITE.length];
  
  if(--this.waitTimer > 0) { return; }
  
  /* Normal Gameplay */
  this.control();
  this.physics();
};

PlantObject.prototype.control = function() {
  
};

PlantObject.prototype.physics = function() {
  var dest = this.loc[this.dir?0:1];
  var dist = vec2.distance(this.pos, dest);
  
  if(dist <= PlantObject.TRAVEL_SPEED) {
    this.pos = dest;
    this.dir = !this.dir;
    this.waitTimer = PlantObject.WAIT_TIME;
  }
  else {
    this.pos = vec2.add(this.pos, vec2.scale(vec2.normalize(vec2.subtract(dest, this.pos)), PlantObject.TRAVEL_SPEED));
  }
};

PlantObject.prototype.playerCollide = function(p) {
  if(this.dead || this.garbage) { return; }
  p.damage();
};

PlantObject.prototype.playerStomp = function(p) {
  if(this.dead || this.garbage) { return; }
  p.damage();
};

PlantObject.prototype.playerBump = function(p) {
  if(this.dead || this.garbage) { return; }
  p.damage();
};

PlantObject.prototype.kill = function() { };

PlantObject.prototype.destroy = function() {
  this.garbage = true;
};

PlantObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

PlantObject.prototype.draw = function(sprites) {
  if(this.sprite.INDEX instanceof Array) {
    var s = this.sprite.INDEX;
    for(var i=0;i<s.length;i++) {
      for(var j=0;j<s[i].length;j++) {
        sprites.push({pos: vec2.add(this.pos, vec2.make(j,i)), reverse: !this.dir, index: s[i][j]});
      }
    }
  }
  else { sprites.push({pos: this.pos, reverse: !this.dir, index: this.sprite.INDEX}); }
};

/* Register object class */
GameObject.REGISTER_OBJECT(PlantObject);