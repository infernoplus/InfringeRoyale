"use strict";
/* global vec2 */

var squar = {};

squar.intersection = function(pos1, dim1, pos2, dim2) {
  return pos2.x < pos1.x + dim1.x &&
         pos2.x + dim2.x > pos1.x &&
         pos2.y < pos1.y + dim1.y &&
         pos2.y + dim2.y > pos1.y;
};