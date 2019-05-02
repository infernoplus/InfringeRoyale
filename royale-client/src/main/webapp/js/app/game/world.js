"use strict";
/* global util, vec2, shor2, td32 */

function World(data) {
  this.initial = data.initial; // ID for the first level of this world.
  
  this.levels = [];
  for(var i=0;i<data.world.length;i++) {
    this.levels.push(new Level(data.world[i]));
  }
}

World.prototype.step = function() {
  for(var i=0;i<this.levels.length;i++) {
    this.levels[i].step();
  }
};

World.prototype.getInitial = function() {
  return this.levels[this.initial];
};

World.prototype.getZone = function(level, zone) {
  return this.levels[level].zones[zone];
};

/* ========================================================================== */

function Level(data) {
  this.id = data.id;
  this.name = data.name;
  this.initial = data.initial; // ID for the stating zone of this level.
  
  this.zones = [];
  for(var i=0;i<data.zone.length;i++) {
    this.zones.push(new Zone(data.zone[i]));
  }
}

Level.prototype.step = function() {
  for(var i=0;i<this.zones.length;i++) {
    this.zones[i].step();
  }
};

Level.prototype.getInitial = function() {
  return this.zones[this.initial];
};

/* ========================================================================== */

function Zone(data) {
  this.id = data.id;
  this.initial = data.initial; // shor2 starting point for this zone.
  this.color = data.color; // HTML color of the sky for this zone.
  
  this.data = data.data; // 2D Array of td32 (Copied by reference!)
  this.obj = data.obj; // Copied by reference!
  this.warp = data.warp; // Copied by reference!
  
  this.bumped = [];
}

Zone.prototype.update = function(game, pid, level, zone, x, y, type) {
  var yo = this.dimensions().y-1-y;
  var td = td32.decode(this.data[yo][x]);
  td.definition.TRIGGER(game, pid, td, level, zone, x, y, type);
};

Zone.prototype.step = function() {
  for(var i=0;i<this.bumped.length;i++) {
    var e = this.bumped[i];
    var td = td32.decode(this.data[e.y][e.x]);
    if(td.bump > 0) {
      this.data[e.y][e.x] = td32.bump(this.data[e.y][e.x], td.bump-1);
    }
    else {
      this.bumped.splice(i--,1);
    }
  }
};

Zone.prototype.bump = function(x,y) {
  var yo = this.dimensions().y-1-y;
  this.data[yo][x] = td32.bump(this.data[yo][x], 15);
  this.bumped.push({x: x, y: yo});
};

/* Returns width and height of the zone in tiles. */
Zone.prototype.dimensions = function() {
  return vec2.make(this.data[0].length, this.data.length);
};

/* Returns an array of all tiles in an area with position <vec2 pos> width/height <vec2 dim> */
Zone.prototype.getTiles = function(pos, dim) {
  var zd = this.dimensions();
  var cpos = vec2.copy(pos);
  cpos.y = zd.y - 1 - cpos.y;
  
  var x1 = parseInt(Math.max(Math.min(Math.floor(cpos.x), zd.x), 0.));
  var x2 = parseInt(Math.max(Math.min(Math.ceil(cpos.x+dim.x), zd.x), 0.));
  var y1 = parseInt(Math.max(Math.min(Math.floor(cpos.y), zd.y), 0.));
  var y2 = parseInt(Math.max(Math.min(Math.ceil(cpos.y+dim.y), zd.y), 0.));
  
  var tiles = [];
  
  for(var i=y1;i<y2;i++) {
    for(var j=x1;j<x2;j++) {
      var td = td32.decode(this.data[i][j]);
      td.pos = vec2.make(j,zd.y-1.-i);
      td.ind = [i,j];
      tiles.push(td);
    }
  }
  
  return tiles;
};