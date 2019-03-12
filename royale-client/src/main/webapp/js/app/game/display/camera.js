"use strict";
/* global util */

function Camera() {
  this.pos = util.vec2.create();  // Camera position
  this.zoom = 32;                 // The exact amount of pixels we devote to each tile
}