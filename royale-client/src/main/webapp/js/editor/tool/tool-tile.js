"use strict";
/* global app, Display */
/* global vec2, td32 */

function ToolTile(editor) {
  this.editor = editor;
  
  this.element = document.getElementById("editor-tool-tile");
  
  this.valRaw = document.getElementById("editor-tool-tile-raw");
  this.valName = document.getElementById("editor-tool-tile-name");
  
  this.valIndex = document.getElementById("editor-tool-tile-index");
  this.valBump = document.getElementById("editor-tool-tile-bump");
  this.valDepth = document.getElementById("editor-tool-tile-depth");
  this.valDef = document.getElementById("editor-tool-tile-def");
  this.valData = document.getElementById("editor-tool-tile-data");
  
  var tmp = this;
  this.valIndex.onchange = function() { tmp.update(); };
  this.valBump.onchange = function() { tmp.update(); };
  this.valDepth.onchange = function() { tmp.update(); };
  this.valDef.onchange = function() { tmp.update(); };
  this.valData.onchange = function() { tmp.update(); };
  
  this.brush = 30;
}

ToolTile.prototype.input = function(imp, mous, keys) {
  
  /* If no buttons pressed then skip */
  if(!mous.lmb && !mous.mmb) { return; }
  
  /* See if we are clicking on the tile pallete */
  var tex = this.editor.display.resource.getTexture("map");
  var W = Display.TEXRES*parseInt((this.editor.canvas.width)/Display.TEXRES);
  var H = this.editor.canvas.height;
  var num = (tex.width/Display.TEXRES)*(tex.height/Display.TEXRES);
  
  var g = vec2.make(parseInt(mous.pos.x/Display.TEXRES), parseInt((H-mous.pos.y)/Display.TEXRES));
  
  var r = (g.y * (W/Display.TEXRES)) + g.x;
  
  if(r < num) {
    if(mous.lmb) { this.valIndex.value = r; this.update(); }
    return;
  }
  
  /* See if we are clicking on a map tile */
  var data = this.zone.data;
  
  var g = vec2.chop(this.editor.display.camera.unproject(mous.pos));
  if(g.x < 0 || g.x > data[0].length-1 || g.y < 0 || g.y > data.length-1) { return; }
  
  if(mous.lmb) { data[g.y][g.x] = this.brush; }
  else if(mous.mmb) { this.setBrush(data[g.y][g.x]); }
};

ToolTile.prototype.update = function() {
  try {
    var index = Math.max(0, Math.min(2047, parseInt(this.valIndex.value)));
    var bump = Math.max(0, Math.min(15, parseInt(this.valBump.value)));
    var depth = Math.max(0, Math.min(1, parseInt(this.valDepth.value)));
    var def = Math.max(0, Math.min(255, parseInt(this.valDef.value)));
    var data = Math.max(0, Math.min(255, parseInt(this.valData.value)));
    
    if(isNaN(index) || isNaN(bump) || isNaN(depth) || isNaN(def) || isNaN(data)) { throw "oof"; }
    
    this.setBrush(td32.encode(index, bump, depth, def, data));
  }
  catch(ex) { this.valRaw.classList.add("red"); return; }
};

ToolTile.prototype.setBrush = function(brush) {
  this.brush = brush;
  
  var td = td32.asArray(this.brush);
  
  this.valIndex.value = td[0];
  this.valBump.value = td[1];
  this.valDepth.value = td[2]?1:0;
  this.valDef.value = td[3];
  this.valData.value = td[4];
  
  this.valRaw.innerHTML = this.brush;
  this.valName.innerHTML = td32.decode(this.brush).definition.NAME;
  this.valRaw.classList.remove("red");
};

ToolTile.prototype.reload = function() {
  this.save();
  this.load();
};

ToolTile.prototype.load = function() {
  this.zone = this.editor.currentZone;
  
  this.setBrush(this.brush);
  
  this.element.style.display = "block";
};

ToolTile.prototype.save = function() {
  
};

ToolTile.prototype.destroy = function() {
  this.element.style.display = "none";
  this.save();
  
  this.valIndex.onchange = undefined;
  this.valBump.onchange = undefined;
  this.valDepth.onchange = undefined;
  this.valDef.onchange = undefined;
  this.valData.onchange = undefined;
};