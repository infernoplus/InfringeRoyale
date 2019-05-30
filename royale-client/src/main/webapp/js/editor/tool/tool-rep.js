"use strict";
/* global app, Display */
/* global vec2, td32 */

function ToolRep(editor) {
  this.editor = editor;
  
  this.element = document.getElementById("editor-tool-rep");

  this.valTarget = document.getElementById("editor-tool-rep-target");
  this.valReplace = document.getElementById("editor-tool-rep-replace");
  
  var tmp = this;
  this.btnApply = document.getElementById("editor-tool-rep-apply");
  this.btnApply.onclick = function() { tmp.apply(); };
}

ToolRep.prototype.apply = function() {
  var t = parseInt(this.valTarget.value);
  var r = parseInt(this.valReplace.value);
  
  if(isNaN(t) || isNaN(r)) { app.menu.warn.show("Replace failed. Invalid values."); return; }
  
  var data = this.editor.getZone().data;
  
  for(var i=0;i<data.length;i++) {
    for(var j=0;j<data[i].length;j++) {
      if(data[i][j] === t) { data[i][j] = r; }
    }
  }
};

ToolRep.prototype.reload = function() {
  this.save();
  this.load();
};

ToolRep.prototype.load = function() {
  this.zone = this.editor.currentZone;
  
  this.element.style.display = "block";
};

ToolRep.prototype.save = function() {
  
};

ToolRep.prototype.destroy = function() {
  this.element.style.display = "none";
  this.save();
};