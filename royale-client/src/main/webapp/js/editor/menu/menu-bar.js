"use strict";
/* global app */

function MenuBar() {
  this.element = document.getElementById("editor-top");
  
  this.btnWorld = document.getElementById("editor-top-world");
  this.btnLevel = document.getElementById("editor-top-level");
  this.btnZone = document.getElementById("editor-top-zone");
  this.btnTile = document.getElementById("editor-top-tile");
  this.btnObject = document.getElementById("editor-top-object");
  this.btnWarp = document.getElementById("editor-top-warp");
  this.btnCopy = document.getElementById("editor-top-copy");
  this.btnRep = document.getElementById("editor-top-rep");
  this.btnRef = document.getElementById("editor-top-ref");
  this.btnAbout = document.getElementById("editor-top-about");
  this.btnSave = document.getElementById("editor-top-save");
  
  this.btnWorld.onclick = function() { app.menu.tool.set("world"); };
  this.btnLevel.onclick = function() { app.menu.tool.set("level"); };
  this.btnZone.onclick = function() { app.menu.tool.set("zone"); };
  this.btnTile.onclick = function() { app.menu.tool.set("tile"); };
  this.btnObject.onclick = function() { app.menu.tool.set("object"); };
  this.btnWarp.onclick = function() { app.menu.tool.set("warp"); };
  this.btnCopy.onclick = function() { app.menu.tool.set("copy"); };
  this.btnRep.onclick = function() { app.menu.tool.set("rep"); };
  this.btnRef.onclick = function() { app.menu.tool.set("ref"); };
  
  this.btnSave.onclick = function() { app.save(); };
  this.btnAbout.onclick = function() { window.open("https://www.youtube.com/watch?v=oHg5SJYRHA0",'_blank'); }; // Oof
}

MenuBar.prototype.show = function() {
  this.element.style.display = "block";
};

MenuBar.prototype.hide = function() {
  this.element.style.display = "none";
};