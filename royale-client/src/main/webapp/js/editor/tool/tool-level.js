"use strict";
/* global app */

function ToolLevel(editor) {
  this.editor = editor;
  
  this.element = document.getElementById("editor-tool-level");
  
  this.valId = document.getElementById("editor-tool-level-id");
  this.valName = document.getElementById("editor-tool-level-name");
  this.valInitial = document.getElementById("editor-tool-level-initial");
  
  var tmp = this;
  this.btnApply = document.getElementById("editor-tool-level-apply");
  this.btnApply.onclick = function() { tmp.reload(); };
  
  this.btnNew = document.getElementById("editor-tool-level-new");
  this.btnNew.onclick = function() { tmp.addZone(); };
}

ToolLevel.prototype.addZone = function() {
  var zid = 0;
  for(var i=0;i<this.level.zones.length;i++) {
    var zone = this.level.zones[i];
    if(zone.id === zid) { zid++; i = 0; }
  }
  var data = {
    id: zid,
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
  };
  
  this.level.zones.push(new Zone(this.game, this.level, data));
  
  app.menu.list.generate();
};

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
    
    for(var i=0;i<this.level.zones.length;i++) {
      var zone = this.level.zones[i];
      zone.level = this.level.id;
    }
  }
  catch(ex) { app.menu.warn.show("Failed to parse value. Changes not applied."); }
  
  app.menu.list.generate();
};

ToolLevel.prototype.destroy = function() {
  this.element.style.display = "none";
  this.save();
};