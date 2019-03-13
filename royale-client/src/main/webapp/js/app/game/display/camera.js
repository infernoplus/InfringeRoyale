"use strict";
/* global util, vec2 */

function Camera() {
  this.pos = vec2.make(0,0);  // Camera position
  this.zoom = 1.0;            // How large we draw each tile. At 1.0 we draw tiles at their native resolution defined by Display.TEXRES.
}