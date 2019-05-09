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
};

/* ASYNC objects do not send or recieve updates to/from the server. */
GameObject.ASYNC = true;
GameObject.ID = 0x00;

/* Processes update data from server */
GameObject.prototype.update = function(data) { };

/* Game step update */
GameObject.prototype.step = function() { };

/* Sets object kill state, this will genearlly lead to destroy(); */
GameObject.prototype.kill = function() {
  this.dead = true;
  this.destroy();
};

/* Flags object for deletion. */
GameObject.prototype.destroy = function() {
  this.garbage = true;
};

/* Returns data needed to draw this object. */
GameObject.prototype.draw = function() { };

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
  app.menu.warn("Invalid Object Class ID: " + id);
  return undefined;
};