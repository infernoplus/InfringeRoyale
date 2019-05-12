"use strict";
/* global app */

function ToolWorld(editor) {
  this.editor = editor;
  
  this.element = document.getElementById("editor-tool-world");
  
  this.valInitial = document.getElementById("editor-tool-world-initial");
}

ToolWorld.prototype.reload = function() {
  this.save();
  this.load();
};

ToolWorld.prototype.load = function() {
  this.valInitial.value = this.editor.world.initial;
  this.element.style.display = "block";
};

ToolWorld.prototype.save = function() {
  try {
    var i = parseInt(this.valInitial.value);
    if(i === undefined) { throw "oof"; }
    this.editor.world.initial = i;
  }
  catch(ex) { app.menu.warn.show("Failed to parse value. Changes not applied."); }
  
  app.menu.list.generate();
};

ToolWorld.prototype.destroy = function() {
  this.element.style.display = "none";
  this.save();
};