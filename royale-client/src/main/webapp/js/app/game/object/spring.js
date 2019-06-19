"use strict";
/* global util, vec2, squar */
/* global GameObject, PlayerObject */
/* global NET011, NET020 */

function SpringObject(game, level, zone, pos, oid) {
  GameObject.call(this, game, level, zone, pos);
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.setState(SpringObject.STATE.EXTEND);
  
  /* Animation */
  this.anim = 0;
  
  /* Physics */
  this.pos = vec2.add(this.pos, SpringObject.SOFFSET);
  this.dim = vec2.make(0.8,2.);
}


/* === STATIC =============================================================== */
SpringObject.ASYNC = true;
SpringObject.ID = 0x95;
SpringObject.NAME = "SPRING"; // Used by editor

SpringObject.ANIMATION_RATE = 3;
SpringObject.SOFFSET = vec2.make(0.1, 0.);

SpringObject.THRESHOLD = [1., 0.5];
SpringObject.POWER = 0.45;

SpringObject.SPRITE = {};
SpringObject.SPRITE_LIST = [
  {NAME: "STAGE0", ID: 0x00, INDEX: [[0x00A1],[0x0091]]},
  {NAME: "STAGE1", ID: 0x01, INDEX: 0x00A2},
  {NAME: "STAGE2", ID: 0x02, INDEX: 0x00A3}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<SpringObject.SPRITE_LIST.length;i++) {
  SpringObject.SPRITE[SpringObject.SPRITE_LIST[i].NAME] = SpringObject.SPRITE_LIST[i];
  SpringObject.SPRITE[SpringObject.SPRITE_LIST[i].ID] = SpringObject.SPRITE_LIST[i];
}

SpringObject.STATE = {};
SpringObject.STATE_LIST = [
  {NAME: "EXTEND", ID: 0x00, SPRITE: [SpringObject.SPRITE.STAGE0]},
  {NAME: "HALF", ID: 0x01, SPRITE: [SpringObject.SPRITE.STAGE1]},
  {NAME: "COMPRESS", ID: 0x02, SPRITE: [SpringObject.SPRITE.STAGE2]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<SpringObject.STATE_LIST.length;i++) {
  SpringObject.STATE[SpringObject.STATE_LIST[i].NAME] = SpringObject.STATE_LIST[i];
  SpringObject.STATE[SpringObject.STATE_LIST[i].ID] = SpringObject.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

SpringObject.prototype.update = function(event) { /* ASYNC */ };

SpringObject.prototype.step = function() {
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/SpringObject.ANIMATION_RATE) % this.state.SPRITE.length];
  
  this.interaction();
};

SpringObject.prototype.interaction = function() {
  var ply = this.game.getPlayer();
  if(ply && ply.level === this.level && ply.zone === this.zone && ply.isTangible()) {
    if(squar.intersection(this.pos, this.dim, ply.pos, ply.dim)) {
      var cmp = Math.pow(1.-(Math.min(Math.max(0, ply.pos.y - this.pos.y), 2.)*.5),2.);
      if(ply.fallSpeed >= PlayerObject.FALL_SPEED_MAX*.75 && ply.btnA) { ply.jumping = 0; ply.isSpring = true; } /* hacky but works */
      ply.fallSpeed += cmp*SpringObject.POWER;
      ply.grounded = false;
    }
  }
  
  var min = 2.;
  for(var i=0;i<this.game.objects.length;i++) {
    var obj = this.game.objects[i];
    if(obj instanceof PlayerObject && obj.level === this.level && obj.zone === this.zone && obj.isTangible()) {
      if(squar.intersection(this.pos, this.dim, obj.pos, obj.dim)) {
        var h = Math.min(Math.max(0, obj.pos.y - this.pos.y), 2.);
        if(h < min) { min = h; }
      }
    }
  }
  if(min < SpringObject.THRESHOLD[1]) { this.setState(SpringObject.STATE.COMPRESS); }
  else if(min < SpringObject.THRESHOLD[0]) { this.setState(SpringObject.STATE.HALF); }
  else { this.setState(SpringObject.STATE.EXTEND); }
};

SpringObject.prototype.kill = function() { };
SpringObject.prototype.destroy = GameObject.prototype.destroy;
SpringObject.prototype.isTangible = GameObject.prototype.isTangible;

SpringObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

SpringObject.prototype.draw = function(sprites) {
  if(this.sprite.INDEX instanceof Array) {
    var s = this.sprite.INDEX;
    for(var i=0;i<s.length;i++) {
      for(var j=0;j<s[i].length;j++) {
        sprites.push({pos: vec2.subtract(vec2.add(this.pos, vec2.make(j,i)), SpringObject.SOFFSET), reverse: false, index: s[i][j]});
      }
    }
  }
  else { sprites.push({pos: vec2.subtract(this.pos, SpringObject.SOFFSET), reverse: false, index: this.sprite.INDEX, mode: 0x00}); }
};

/* Register object class */
GameObject.REGISTER_OBJECT(SpringObject);