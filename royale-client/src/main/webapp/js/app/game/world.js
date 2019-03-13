"use strict";
/* global util, shor2, td32 */

function World(data) {
  this.initial = data.initial; // ID for the first level of this world.
  
  this.levels = [];
  for(var i=0;i<data.world.length;i++) {
    this.levels.push(new Level(data.world[i]));
  }
}

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

/* ========================================================================== */

function Zone(data) {
  this.id = data.id;
  this.initial = data.initial; // shor2 starting point for this zone.
  this.color = data.color; // HTML color of the sky for this zone.
  
  this.data = data.data; // 2D Array of td32 (Copied by reference!)
  this.obj = [];
  this.warp = data.warps; // Copied by reference!
}