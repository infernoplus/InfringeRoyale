"use strict";
/* global app */

function ToolWorld(editor) {
  this.editor = editor;
  
  this.element = document.getElementById("editor-tool-world");
  
  this.valInitial = document.getElementById("editor-tool-world-initial");
  
  this.btnNew = document.getElementById("editor-tool-world-new");
  
  var tmp = this;
  this.btnApply = document.getElementById("editor-tool-world-apply");
  this.btnApply.onclick = function() { tmp.reload(); };
  
  this.btnNew = document.getElementById("editor-tool-world-new");
  this.btnNew.onclick = function() { tmp.addLevel(); };
}

ToolWorld.prototype.addLevel = function() {
  var lid = 0;
  for(var i=0;i<this.editor.world.levels.length;i++) {
    var level = this.editor.world.levels[i];
    if(level.id === lid) { lid++; i = 0; }
  }
  var data = {
    id: lid,
    initial: 0,
    name: "new level",
    zone: [
      {
        id: 0,
        initial: 196611,
        color: "#6B8CFF",
        data: [
          [98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306],
          [98306, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 98306],
          [98306, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 98306],
          [98306, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 98306],
          [98306, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 98306],
          [98306, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 98306],
          [98306, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 98306],
          [98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306, 98306]
        ],
        obj: [],
        warp: []
      }
    ]
  };
  
  this.editor.world.levels.push(new Level(data));
  
  app.menu.list.generate();
};

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
    if(isNaN(i)) { throw "oof"; }
    this.editor.world.initial = i;
  }
  catch(ex) { app.menu.warn.show("Failed to parse value. Changes not applied."); }
  
  app.menu.list.generate();
};

ToolWorld.prototype.destroy = function() {
  this.element.style.display = "none";
  this.save();
};