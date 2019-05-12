"use strict";
/* global app */

function Menu() {
  this.body = document.getElementById("body");
  
  /* General */
  this.warn = new MenuWarn();
  this.error = new MenuError();
  
  /* Editor Menu */
  this.editor = document.getElementById("editor");
  this.bar = new MenuBar();
  this.list = new MenuList();
  this.tool = new MenuTool();
  
  /* File Menu */
  this.file = new MenuFile();
  
  this.body.style.display = "block";
}

/* Shows file load page */
Menu.prototype.fileMenu = function() {
  this.editor.style.display = "none";
  this.file.show();
};

/* Called after loading is done, hides file load page and shows actual editor */
Menu.prototype.editorMenu = function() {
  this.file.hide();
  this.bar.show();
  this.list.show();
  this.tool.show();
  this.editor.style.display = "flex";
};