"use strict";
/* global util, vec2, squar */
/* global GameObject, BulletObject */
/* global NET011, NET020 */

function LauncherObject(game, level, zone, pos, oid, delay) {
  GameObject.call(this, game, level, zone, pos);
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.setState(LauncherObject.STATE.IDLE);
  
  /* Var */
  this.fireTimer = 0;
  this.delay = isNaN(parseInt(delay))?LauncherObject.FIRE_DELAY_DEFAULT:parseInt(delay);
}


/* === STATIC =============================================================== */
LauncherObject.ASYNC = true;
LauncherObject.ID = 0x23;
LauncherObject.NAME = "LAUNCHER"; // Used by editor

LauncherObject.ANIMATION_RATE = 3;

LauncherObject.FIRE_DELAY_DEFAULT = 150;

LauncherObject.SPRITE = {};
LauncherObject.SPRITE_LIST = [
  {NAME: "IDLE", ID: 0x00, INDEX: 0x00FF}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<LauncherObject.SPRITE_LIST.length;i++) {
  LauncherObject.SPRITE[LauncherObject.SPRITE_LIST[i].NAME] = LauncherObject.SPRITE_LIST[i];
  LauncherObject.SPRITE[LauncherObject.SPRITE_LIST[i].ID] = LauncherObject.SPRITE_LIST[i];
}

LauncherObject.STATE = {};
LauncherObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [LauncherObject.SPRITE.IDLE]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<LauncherObject.STATE_LIST.length;i++) {
  LauncherObject.STATE[LauncherObject.STATE_LIST[i].NAME] = LauncherObject.STATE_LIST[i];
  LauncherObject.STATE[LauncherObject.STATE_LIST[i].ID] = LauncherObject.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

LauncherObject.prototype.update = function(event) { /* ASYNC */ };

LauncherObject.prototype.step = function() {
  if(++this.fireTimer > this.delay) { this.fire(); }
  
  this.sound();
};

LauncherObject.prototype.sound = GameObject.prototype.sound;

LauncherObject.prototype.fire = function() {
    this.fireTimer = 0;
  this.game.createObject(BulletObject.ID, this.level, this.zone, vec2.copy(this.pos), []);
  this.play("sfx/firework.wav", 1., .04);
};

LauncherObject.prototype.kill = function() { };
LauncherObject.prototype.isTangible = GameObject.prototype.isTangible;
LauncherObject.prototype.destroy = GameObject.prototype.destroy;

LauncherObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

LauncherObject.prototype.draw = function(sprites) { };

LauncherObject.prototype.play = GameObject.prototype.play;

/* Register object class */
GameObject.REGISTER_OBJECT(LauncherObject);