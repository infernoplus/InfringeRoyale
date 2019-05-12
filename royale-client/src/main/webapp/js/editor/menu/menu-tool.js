"use strict";
/* global app */

function MenuTool() {
  this.element = document.getElementById("editor-bottom");
}

/* Sets the tool in use. */
MenuTool.prototype.set = function(tool) {
  if(!app.editor) { return; }
  app.editor.setTool(tool);
};

MenuTool.prototype.show = function() {
  this.element.style.display = "block";
};

MenuTool.prototype.hide = function() {
  this.element.style.display = "none";
};