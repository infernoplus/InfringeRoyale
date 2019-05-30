"use strict";
/* global util, vec2, squar */
/* global GameObject */
/* global NET011, NET020 */

/* Bowser Firebreath Projectile Object */
function FireBreathProj(game, level, zone, pos) {
  GameObject.call(this, game, level, zone, pos);
  
  this.state = FireBreathProj.STATE.IDLE;
  this.sprite = this.state.SPRITE[0];
  
  /* Animation */
  this.anim = 0;
  
  /* Var */
  this.life = FireBreathProj.LIFE_MAX;
  this.deadTimer = 0;
  
  /* Physics */
  this.dim = vec2.make(1., .5);
}


/* === STATIC =============================================================== */
FireBreathProj.ASYNC = true;
FireBreathProj.ID = 0xA2;
FireBreathProj.NAME = "FIRE BREATH PROJECTILE"; // Used by editor

FireBreathProj.ANIMATION_RATE = 2;
FireBreathProj.SOFFSET = vec2.make(-1., -.25); // Difference between position of sprite and hitbox.

FireBreathProj.LIFE_MAX = 175;
FireBreathProj.DEAD_ANIM_LENGTH = 3;

FireBreathProj.SPEED = 0.175;

FireBreathProj.SPRITE = {};
FireBreathProj.SPRITE_LIST = [
  {NAME: "IDLE0", ID: 0x00, INDEX: [[0x00D7,0x00D8]]},
  {NAME: "IDLE1", ID: 0x01, INDEX: [[0x00D9,0x00DA]]},
  {NAME: "DEAD0", ID: 0x04, INDEX: 0x00D4},
  {NAME: "DEAD1", ID: 0x05, INDEX: 0x00D5},
  {NAME: "DEAD2", ID: 0x06, INDEX: 0x00D6}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<FireBreathProj.SPRITE_LIST.length;i++) {
  FireBreathProj.SPRITE[FireBreathProj.SPRITE_LIST[i].NAME] = FireBreathProj.SPRITE_LIST[i];
  FireBreathProj.SPRITE[FireBreathProj.SPRITE_LIST[i].ID] = FireBreathProj.SPRITE_LIST[i];
}

FireBreathProj.STATE = {};
FireBreathProj.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [FireBreathProj.SPRITE.IDLE0, FireBreathProj.SPRITE.IDLE1]},
  {NAME: "DEAD", ID: 0x50, SPRITE: [FireBreathProj.SPRITE.DEAD0, FireBreathProj.SPRITE.DEAD1, FireBreathProj.SPRITE.DEAD2]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<FireBreathProj.STATE_LIST.length;i++) {
  FireBreathProj.STATE[FireBreathProj.STATE_LIST[i].NAME] = FireBreathProj.STATE_LIST[i];
  FireBreathProj.STATE[FireBreathProj.STATE_LIST[i].ID] = FireBreathProj.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

FireBreathProj.prototype.update = function() { };

FireBreathProj.prototype.step = function() {
  /* Dead */
  if(this.state === FireBreathProj.STATE.DEAD) {
    if(this.deadTimer < FireBreathProj.DEAD_ANIM_LENGTH) { this.sprite = this.state.SPRITE[this.deadTimer++]; }
    else { this.destroy(); }
    return;
  }
  
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/FireBreathProj.ANIMATION_RATE) % this.state.SPRITE.length];
  
  /* Normal Gameplay */
  this.control();
  this.physics();
  this.interaction();
  
  if(this.life-- < 1) { this.kill(); }
};

FireBreathProj.prototype.control = function() { };

FireBreathProj.prototype.physics = function() {
  this.pos = vec2.add(this.pos, vec2.make(-FireBreathProj.SPEED, 0.));
};

FireBreathProj.prototype.interaction = function() {
  
};

FireBreathProj.prototype.playerCollide = function(p) { };

FireBreathProj.prototype.playerStomp = function(p) { };

FireBreathProj.prototype.playerBump = function(p) { };

FireBreathProj.prototype.kill = function() {
  this.setState(FireBreathProj.STATE.DEAD);
};

FireBreathProj.prototype.destroy = function() {
  this.garbage = true;
};

FireBreathProj.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

FireBreathProj.prototype.draw = function(sprites) {
  if(this.sprite.INDEX instanceof Array) {
    var s = this.sprite.INDEX;
    for(var i=0;i<s.length;i++) {
      for(var j=0;j<s[i].length;j++) {
        sprites.push({pos: vec2.add(vec2.add(this.pos, FireBreathProj.SOFFSET), vec2.make(j,i)), reverse: false, index: s[i][j]});
      }
    }
  }
  else { sprites.push({pos: vec2.add(this.pos, FireBreathProj.SOFFSET), reverse: false, index: this.sprite.INDEX, mode: 0x00}); }
};

/* Register object class */
GameObject.REGISTER_OBJECT(FireBreathProj);