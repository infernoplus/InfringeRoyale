"use strict";
/* global app, Display */
/* global vec2, td32 */

function ToolCopy(editor) {
  this.editor = editor;
  
  this.element = document.getElementById("editor-tool-copy");
  
  this.valRaw = document.getElementById("editor-tool-copy-raw");
  
  this.valWidth = document.getElementById("editor-tool-copy-width");
  this.valHeight = document.getElementById("editor-tool-copy-height");
  this.valOver = document.getElementById("editor-tool-copy-over");
  
  var tmp = this;
  this.valWidth.onchange = function() { tmp.update(); };
  this.valHeight.onchange = function() { tmp.update(); };
  this.valOver.onchange = function() { tmp.update(); };
  
  this.copyData = undefined;
  this.dim = vec2.make(2,2);
  this.overwrite = undefined;
}

ToolCopy.prototype.input = function(imp, mous, keys) {
  
  /* If no buttons pressed then skip */
  if(!mous.lmb && !mous.mmb) { return; }
  
  /* See if we are clicking on a map tile */
  var data = this.zone.data;
  
  var g = vec2.chop(this.editor.display.camera.unproject(mous.pos));
  if(g.x < 0 || g.x > data[0].length-1 || g.y < 0 || g.y > data.length-1) { return; }
  
  if(mous.lmb) { this.doPaste(g); }
  else if(mous.mmb) { this.doCopy(g); }
};

ToolCopy.prototype.doCopy = function(g) {
  var data = this.zone.data;
  
  var cpd = [];
  for(var i=0;i<this.dim.y&&i+g.y<data.length;i++) {
    cpd.push([]);
    for(var j=0;j<this.dim.x&&j+g.x<data[0].length;j++) {
      cpd[i].push(data[g.y+i][g.x+j]);
    }
  }
  
  this.copyData = cpd;
  this.valRaw.innerHTML = "[" + cpd.length*cpd[0].length + "]";
};

ToolCopy.prototype.doPaste = function(g) {
  if(!this.copyData) { return; }
  
  var data = this.zone.data;
  
  for(var i=0;i<this.copyData.length&&i+g.y<data.length;i++) {
    for(var j=0;j<this.copyData[0].length&&j+g.x<data[0].length;j++) {
      if(data[g.y+i][g.x+j] === this.overwrite) {
        data[g.y+i][g.x+j] = this.copyData[i][j];
      }
    }
  }
};

ToolCopy.prototype.update = function() {
  try {
    var w = Math.max(0, Math.min(16, parseInt(this.valWidth.value)));
    var h = Math.max(0, Math.min(16, parseInt(this.valHeight.value)));
    var over = parseInt(this.valOver.value);
    
    if(isNaN(w) || isNaN(h)) { throw "oof"; }
    
    this.dim = vec2.make(w, h);
    this.overwrite = isNaN(over)?undefined:over;
  }
  catch(ex) { return; }
};

ToolCopy.prototype.reload = function() {
  this.save();
  this.load();
};

ToolCopy.prototype.load = function() {
  this.zone = this.editor.currentZone;
  
  this.valWidth.value = this.dim.x;
  this.valHeight.value = this.dim.y;
  
  this.update();
  
  this.element.style.display = "block";
};

ToolCopy.prototype.save = function() {
  
};

ToolCopy.prototype.destroy = function() {
  this.element.style.display = "none";
  this.save();
  
  this.valWidth.onchange = undefined;
  this.valHeight.onchange = undefined;
  this.valOver.onchange = undefined;
};