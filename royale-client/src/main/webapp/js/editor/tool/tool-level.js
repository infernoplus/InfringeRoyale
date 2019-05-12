"use strict";
/* global app */

function ToolLevel(editor) {
  this.editor = editor;
  
  this.element = document.getElementById("editor-tool-level");
  
  this.valId = document.getElementById("editor-tool-level-id");
  this.valName = document.getElementById("editor-tool-level-name");
  this.valInitial = document.getElementById("editor-tool-level-initial");
}

ToolLevel.prototype.reload = function() {
  this.save();
  this.load();
};

ToolLevel.prototype.load = function() {
  this.level = this.editor.world.getLevel(this.editor.currentZone.level);
  this.valId.value = this.level.id;
  this.valName.value = this.level.name;
  this.valInitial.value = this.level.initial;
  
  this.element.style.display = "block";
};

ToolLevel.prototype.save = function() {
  try {
    var i = parseInt(this.valId.value);
    var j = parseInt(this.valInitial.value);
    if(i === undefined || j === undefined) { throw "oof"; }
    this.level.id = i;
    this.level.initial = j;
    this.level.name = this.valName.value;
  }
  catch(ex) { app.menu.warn.show("Failed to parse value. Changes not applied."); }
  
  app.menu.list.generate();
};

ToolLevel.prototype.destroy = function() {
  this.element.style.display = "none";
  this.save();
};