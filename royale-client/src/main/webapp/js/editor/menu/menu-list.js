"use strict";
/* global app */

function MenuList() {
  this.element = document.getElementById("editor-list");
}

MenuList.prototype.generate = function() {
  if(!app.editor) { return; }
  
  var world = app.editor.world;
  
  var html = "<div class='list-header'>World</div>";
  for(var i=0;i<world.levels.length;i++) {
    var level = world.levels[i];
    html += "<div class='list-world'>" + level.name + " :: " + level.id + "</div>";
    for(var j=0;j<level.zones.length;j++) {
      var zone = level.zones[j];
      html += "<div class='list-zone' onclick='app.menu.list.select(" + level.id + ", " + zone.id + ")'>" + zone.id + "</div>";
    }
  }
  
  this.element.innerHTML = html;
};

MenuList.prototype.select = function(level, zone) {
  if(!app.editor) { return; }
  
  var world = app.editor.world;
  
  app.editor.setZone(world.getZone(level, zone));
};

MenuList.prototype.show = function() {
  this.element.style.display = "block";
};

MenuList.prototype.hide = function() {
  this.element.style.display = "none";
};