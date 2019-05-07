"use strict";
/* global app */
/* global util, vec2 */

/* Abstract parent class, don't instance. I'll know if you do. */
function Effect(pos) {  
  this.pos = pos;          // Vec2 position
  
  this.garbage = false;    // Destroyed state, this effect is ready to be deleted.
};

Effect.prototype.step = function() {
  /* Extend */
  
  if(this.life-- < 1) { this.destroy(); }
};

Effect.prototype.destroy = function() {
  this.garbage = true;
};

Effect.prototype.draw = function(fxs) { /* Abstract */ };