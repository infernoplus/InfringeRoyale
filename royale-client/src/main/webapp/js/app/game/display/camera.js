"use strict";
/* global util, vec2 */
/* global Display */

function Camera(display) {
  this.display = display;
  
  /* Camera position is considered to be in game world units NOT PIXELS */
  this.pos = vec2.make(0,0);  // Camera position
  this.scale = 3.;            // How large we draw each tile. At 1.0 we draw tiles at their native resolution defined by Display.TEXRES.
}

Camera.MOVE_MULT = 0.075;
Camera.ZOOM_MULT = 0.075;

Camera.prototype.move = function(mov) {
  this.pos = vec2.add(this.pos, vec2.scale(mov, Camera.MOVE_MULT*(1./this.scale)));
};

Camera.prototype.zoom = function(zm) {
  this.scale += Camera.ZOOM_MULT*zm;
};

Camera.prototype.position = function(pos) {
  this.pos = pos;
};

/* Takes the position of the mouse and returns a position in game world units */
Camera.prototype.unproject = function(pos) {
  var unp = vec2.add(pos, vec2.make(-this.display.canvas.width*.5, -this.display.canvas.height*.5));
  unp = vec2.scale(unp, 1./this.scale);
  unp = vec2.add(unp, vec2.make(this.pos.x*Display.TEXRES, this.pos.y*Display.TEXRES));
  return vec2.scale(unp, 1./16);
};