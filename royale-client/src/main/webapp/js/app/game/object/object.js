"use strict";
/* global app */
/* global util, vec2 */

/* Abstract parent class, don't instance. I'll know if you do. */
function GameObject(game, level, zone, pos) {
  this.game = game;
  
  this.level = level;      // Level ID
  this.zone = zone;        // Zone ID
  this.pos = pos;          // Vec2 position
  
  this.state = undefined;  // Object state, usage varies.                   [ Reference to static object ]
  this.sprite = undefined; // Sprite currently being drawn for this object. [ Reference to static object ]
  this.reverse = false;    // If true we flip the sprite on the horizontal axis.
  this.dead = false;       // Object is dead.
  this.garbage = false;    // Destroyed state, this object is ready to be deleted.
  
  /* Sound */
  this.sounds = [];
};

/* ASYNC objects do not send or recieve updates to/from the server. */
GameObject.ASYNC = true;
GameObject.ID = 0x00;

/* Processes update data from server */
GameObject.prototype.update = function(data) { };

/* Game step update */
GameObject.prototype.step = function() { };

/* Sound update */
GameObject.prototype.sound = function() {
  for(var i=0;i<this.sounds.length;i++) {
    var snd = this.sounds[i];
    if(snd.done()) { this.sounds.splice(i--, 1); }
    else { snd.position(this.pos); }
  }
};

/* Sets object kill state, this will genearlly lead to destroy(); */
GameObject.prototype.kill = function() {
  this.dead = true;
  this.destroy();
};

/* Flags object for deletion. */
GameObject.prototype.destroy = function() {
  this.dead = true;
  this.garbage = true;
};

GameObject.prototype.isTangible = function() {
  return !this.dead && !this.disabled && this.dim;
};

/* Returns data needed to draw this object. */
GameObject.prototype.draw = function() { };

/* Play a sound with gain and shift */
GameObject.prototype.play = function(path, gain, shift) {
  var zon = this.game.getZone();
  if(this.zone !== zon.id || this.level !== zon.level) { return; }
  var sfx = this.game.audio.getSpatialAudio(path, gain, shift, "effect");
  sfx.play(this.pos);
  this.sounds.push(sfx);
  return sfx;
};

/* Static. All object classes are registered here so we can spawn thems using their IDs. */
GameObject.OBJECT_LIST = [];
GameObject.REGISTER_OBJECT = function(object) {
  GameObject.OBJECT_LIST.push(object);
};

GameObject.OBJECT = function(id) {
  for(var i=0;i<GameObject.OBJECT_LIST.length;i++) {
    var obj = GameObject.OBJECT_LIST[i];
    if(obj.ID === id) { return obj; }
  }
  app.menu.warn.show("Invalid Object Class ID: " + id);
  return undefined;
};