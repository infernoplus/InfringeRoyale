"use strict";
/* global util, vec2, squar */
/* global GameObject */
/* global NET011, NET020 */

function CoinObject(game, level, zone, pos, oid) {
  GameObject.call(this, game, level, zone, pos);
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.state = CoinObject.STATE.IDLE;
  this.sprite = this.state.SPRITE[0];
  
  /* Animation */
  this.anim = 0;
  
  /* Physics */
  this.dim = vec2.make(1., 1.);
}


/* === STATIC =============================================================== */
CoinObject.ASYNC = false;
CoinObject.ID = 0x61;
CoinObject.NAME = "COIN"; // Used by editor

CoinObject.ANIMATION_RATE = 5;

CoinObject.SPRITE = {};
CoinObject.SPRITE_LIST = [
  {NAME: "IDLE0", ID: 0x00, INDEX: 0x00F0},
  {NAME: "IDLE1", ID: 0x01, INDEX: 0x00F1},
  {NAME: "IDLE2", ID: 0x02, INDEX: 0x00F2},
  {NAME: "IDLE3", ID: 0x03, INDEX: 0x00F1}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<CoinObject.SPRITE_LIST.length;i++) {
  CoinObject.SPRITE[CoinObject.SPRITE_LIST[i].NAME] = CoinObject.SPRITE_LIST[i];
  CoinObject.SPRITE[CoinObject.SPRITE_LIST[i].ID] = CoinObject.SPRITE_LIST[i];
}

CoinObject.STATE = {};
CoinObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [CoinObject.SPRITE.IDLE0,CoinObject.SPRITE.IDLE1,CoinObject.SPRITE.IDLE2,CoinObject.SPRITE.IDLE3]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<CoinObject.STATE_LIST.length;i++) {
  CoinObject.STATE[CoinObject.STATE_LIST[i].NAME] = CoinObject.STATE_LIST[i];
  CoinObject.STATE[CoinObject.STATE_LIST[i].ID] = CoinObject.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

CoinObject.prototype.update = function(event) {
  /* Event trigger */
  switch(event) {
    case 0x00 : { this.kill(); break; }
  }
};

CoinObject.prototype.step = function() {
  /* Anim */
  this.anim++;
  this.sprite = this.state.SPRITE[parseInt(this.anim/CoinObject.ANIMATION_RATE) % this.state.SPRITE.length];
};

CoinObject.prototype.playerCollide = function(p) {
  if(this.dead || this.garbage) { return; }
  this.kill();
  this.game.out.push(NET020.encode(this.level, this.zone, this.oid, 0x00));
};

CoinObject.prototype.playerStomp = function(p) { this.playerCollide(p); };

CoinObject.prototype.playerBump = function(p) { this.playerCollide(p); };

CoinObject.prototype.kill = function() {
  this.dead = true;
  this.destroy();
};

CoinObject.prototype.destroy = function() {
  this.garbage = true;
};

CoinObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

CoinObject.prototype.draw = function(sprites) {
  sprites.push({pos: this.pos, reverse: this.reverse, index: this.sprite.INDEX, mode: 0x00});
};

/* Register object class */
GameObject.REGISTER_OBJECT(CoinObject);