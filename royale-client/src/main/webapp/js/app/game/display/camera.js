"use strict";
/* global util, vec2 */

function Camera() {
  this.pos = vec2.make(0,0);  // Camera position
  this.scale = 1.0;            // How large we draw each tile. At 1.0 we draw tiles at their native resolution defined by Display.TEXRES.
}

Camera.ZOOM_MULT = 0.075;

Camera.prototype.move = function(mov) {
  this.pos = vec2.add(this.pos, mov);
};

Camera.prototype.zoom = function(zm) {
  this.scale += Camera.ZOOM_MULT*zm;
};