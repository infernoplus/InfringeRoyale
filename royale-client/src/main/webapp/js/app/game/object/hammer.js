"use strict";
/* global util, vec2, squar */
/* global GameObject, PlayerObject */
/* global NET011, NET020 */

/* Hammer Bros Hammer Projectile Object */
function HammerProj(game, level, zone, pos, oid) {
  GameObject.call(this, game, level, zone, pos);
  
  this.owner = oid;  // OID of owner
  
  this.setState(HammerProj.STATE.IDLE);
  
  /* Animation */
  this.anim = 0;
  
  /* Var */
  this.throwTimer = HammerProj.THROW_DELAY;
  
  /* Physics */
  this.dim = vec2.make(.5, .5);
}


/* === STATIC =============================================================== */
HammerProj.ASYNC = true;
HammerProj.ID = 0xA3;
HammerProj.NAME = "HAMMER PROJECTILE"; // Used by editor

HammerProj.ANIMATION_RATE = 2;
HammerProj.SOFFSET = vec2.make(-.25, -.25); // Difference between position of sprite and hitbox.

HammerProj.THROW_DELAY = 13;

HammerProj.IMPULSE = vec2.make(.42, 0.875);
HammerProj.DRAG = .965;
HammerProj.FALL_SPEED_MAX = 0.65;
HammerProj.FALL_SPEED_ACCEL = 0.095;

HammerProj.SPRITE = {};
HammerProj.SPRITE_LIST = [
  {NAME: "IDLE0", ID: 0x00, INDEX: 0x00DD},
  {NAME: "IDLE1", ID: 0x01, INDEX: 0x00DC},
  {NAME: "IDLE2", ID: 0x02, INDEX: 0x00DF},
  {NAME: "IDLE3", ID: 0x03, INDEX: 0x00DE}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<HammerProj.SPRITE_LIST.length;i++) {
  HammerProj.SPRITE[HammerProj.SPRITE_LIST[i].NAME] = HammerProj.SPRITE_LIST[i];
  HammerProj.SPRITE[HammerProj.SPRITE_LIST[i].ID] = HammerProj.SPRITE_LIST[i];
}

HammerProj.STATE = {};
HammerProj.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [HammerProj.SPRITE.IDLE0]},
  {NAME: "THROW", ID: 0x01, SPRITE: [HammerProj.SPRITE.IDLE0, HammerProj.SPRITE.IDLE1, HammerProj.SPRITE.IDLE2, HammerProj.SPRITE.IDLE3]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<HammerProj.STATE_LIST.length;i++) {
  HammerProj.STATE[HammerProj.STATE_LIST[i].NAME] = HammerProj.STATE_LIST[i];
  HammerProj.STATE[HammerProj.STATE_LIST[i].ID] = HammerProj.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

HammerProj.prototype.update = function(event) { /* ASYNC */ };

HammerProj.prototype.step = function() {
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/HammerProj.ANIMATION_RATE) % this.state.SPRITE.length];
  
  if(this.throwTimer > 0) { this.throwTimer--; return; }
  else if(this.state === HammerProj.STATE.IDLE) { this.throw(); }
  
  /* Normal Gameplay */
  this.physics();
  this.interaction();
  
  if(this.pos.y < 0) { this.destroy(); }
};

HammerProj.prototype.physics = function() {
  this.moveSpeed *= HammerProj.DRAG;
  this.fallSpeed = Math.max(this.fallSpeed-HammerProj.FALL_SPEED_ACCEL, -HammerProj.FALL_SPEED_MAX);
  this.pos = vec2.add(this.pos, vec2.make(this.moveSpeed, this.fallSpeed));
};

HammerProj.prototype.interaction = function() {
  if(this.state !== HammerProj.STATE.THROW) { return; }
  for(var i=0;i<this.game.objects.length;i++) {
    var obj = this.game.objects[i];
    if(!(obj instanceof PlayerObject) || obj.dead) { continue; }  // Skip everything thats not a living player
    if(obj.level === this.level && obj.zone === this.zone) {
      var hit = squar.intersection(obj.pos, obj.dim, this.pos, this.dim);
      if(hit) {
        obj.damage(this);
        return;
      }
    }
  }
};

HammerProj.prototype.throw = function() {
  var obj = this.game.getObject(this.owner);
  
  this.moveSpeed = obj&&obj.dir?HammerProj.IMPULSE.x:-HammerProj.IMPULSE.x;
  this.fallSpeed = HammerProj.IMPULSE.y;
  
  this.setState(HammerProj.STATE.THROW);
};

HammerProj.prototype.playerCollide = function(p) { };

HammerProj.prototype.playerStomp = function(p) { };

HammerProj.prototype.playerBump = function(p) { };

HammerProj.prototype.kill = function() { };

HammerProj.prototype.destroy = function() {
  this.garbage = true;
};

HammerProj.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

HammerProj.prototype.draw = function(sprites) {
  if(this.sprite.INDEX instanceof Array) {
    var s = this.sprite.INDEX;
    for(var i=0;i<s.length;i++) {
      for(var j=0;j<s[i].length;j++) {
        sprites.push({pos: vec2.add(vec2.add(this.pos, HammerProj.SOFFSET), vec2.make(j,i)), reverse: false, index: s[i][j]});
      }
    }
  }
  else { sprites.push({pos: vec2.add(this.pos, HammerProj.SOFFSET), reverse: false, index: this.sprite.INDEX, mode: 0x00}); }
};

/* Register object class */
GameObject.REGISTER_OBJECT(HammerProj);