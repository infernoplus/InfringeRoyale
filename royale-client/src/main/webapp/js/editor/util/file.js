"use strict";
/* global app */

/* Class that reads, parses, and writes map files for Noxio Mapper */
function File() {
  this.lastFileName = "untitled.map";
}

File.prototype.open = function(e) {
  var file = e.target.files[0];
  var tmp = this; // Fucking javascript ugh...
  this.lastFileName = file.name;
  if (!file) {
    return;
  }
  this.file = undefined;
  var reader = new FileReader();
  reader.onload = function(e) {
    var r = e.target.result;
		tmp.file = r;
  };
  reader.readAsText(file);
  
  //Wait until map is fully loaded then parse...
  var opened = function() {
    if(tmp.file === undefined) {
      setTimeout(function() { opened(); }, 500);
    }
    else {
      //GOTCHA!
      tmp.parse(tmp.file);
    }
  };

  opened();
};

File.prototype.parse = function(raw) {
  var game = JSON.parse(raw);
  app.load(game);
};