"use strict";
/* global app, Display */
/* global vec2, td32, shor2, GameObject */

function ToolWarp(editor) {
  this.editor = editor;
  
  this.element = document.getElementById("editor-tool-warp");
  
  this.valId = document.getElementById("editor-tool-warp-id");
  this.valPos = document.getElementById("editor-tool-warp-pos");
  
  this.valData = document.getElementById("editor-tool-warp-data");
  
  var tmp = this;
  this.valId.onchange = function() { tmp.update(); };
  this.valData.onchange = function() { tmp.update(); };
  
  this.moveTimer = 0;
  this.mmbx = false;
  
  this.vore = "yes"; // Literally
}

ToolWarp.prototype.input = function(imp, mous, keys) {
  
  /* Move selected object if we have one and press wasd/arrowkeys. */
  if(this.selected && this.moveTimer-- < 1) {
    if(keys[87] || keys[38]) { this.move(0,1); return; } // W or UP
    if(keys[83] || keys[40]) { this.move(0,-1); return; } // S or DOWN
    if(keys[65] || keys[37]) { this.move(-1,0); return; } // A or LEFT
    if(keys[68] || keys[39]) { this.move(1,0); return; } // D or RIGHT
    if(keys[46]) { this.delete(); return; } // Delete
  }

  /* See if we are clicking on a object to select it. */
  var data = this.zone.data;
  
  var g = vec2.chop(this.editor.display.camera.unproject(mous.pos));
  g.y = data.length-g.y-1;
  if(g.x < 0 || g.x > data[0].length-1 || g.y < 0 || g.y > data.length-1) { return; }
  
  if(mous.lmb) {
    for(var i=0;i<this.zone.warp.length;i++) {
      var wrp = this.zone.warp[i];
      if(vec2.distance(g, shor2.decode(wrp.pos)) < 0.6) {
        this.select(wrp);
        return;
      }
    }
  }
  
  /* See if we middle clicked to place an object */
  if(mous.mmb && !this.mmbx) {
    this.mmbx = true;
    var pos = shor2.encode(g.x, g.y);
    var wrp = {id: parseInt(Math.random()*255), pos: pos, data: 0};
    this.zone.warp.push(wrp);
    this.select(wrp);
    return;
  }
  else if(!mous.mmb) { this.mmbx = false; }
};

ToolWarp.prototype.update = function() {
  try {
    var id = Math.max(0, Math.min(255, parseInt(this.valId.value)));
    var data = Math.max(0, Math.min(255, parseInt(this.valData.value)));
    
    if(isNaN(id) || isNaN(data)) { throw "oof"; }
    
    if(this.selected) { this.selected.id = id; this.selected.data = data; }
  }
  catch(ex) { return; }
};

ToolWarp.prototype.select = function(warp) {
  this.selected = warp;
  
  this.valId.value = warp.id;
  this.valPos.innerHTML = warp.pos;
  this.valData.value = warp.data;
};

ToolWarp.prototype.move = function(x,y) {
  var pos = shor2.decode(this.selected.pos);
  pos = vec2.add(pos, vec2.make(x,y));
  if(pos.x < 0 || pos.x > this.zone.data[0].length-1 || pos.y < 0 || pos.y > this.zone.data.length-1) { return; }
  this.selected.pos = shor2.encode(pos.x, pos.y);
  this.moveTimer=4;
};

ToolWarp.prototype.delete = function() {
  for(var i=0;i<this.zone.warp.length;i++) {
    var wrp = this.zone.warp[i];
    if(wrp === this.selected) {
      this.zone.warp.splice(i, 1);
      return;
    }
  }
};

ToolWarp.prototype.reload = function() {
  this.save();
  this.load();
};

ToolWarp.prototype.load = function() {
  this.zone = this.editor.currentZone;
  this.selected = undefined;
  this.element.style.display = "block";
};

ToolWarp.prototype.save = function() {
  
};

ToolWarp.prototype.destroy = function() {
  this.element.style.display = "none";
  this.save();
  
  this.valId.onchange = undefined;
};