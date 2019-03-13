"use strict";
/* global util, td32 */

function Display(game, container, canvas, resource) {
  this.game = game;
  this.container = container;
  this.canvas = canvas;
  this.context = this.canvas.getContext("2d");
  
  this.resource = new Resource(resource);
  this.camera = new Camera();
  
  var context = this.context; // Sanity
  
  /* "NEAREST" texture filtering */
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.msImageSmoothingEnabled = false;
  context.imageSmoothingEnabled = false;
}

Display.TEXRES = 16; // Texture resolution. The resolution of a single sprite in a sprite sheet.

/* Clears the canvas resizes it to fill the screen if nesscary. */
Display.prototype.clear = function() {
  var context = this.context; // Sanity
  
  // Resize if needed.
  if(this.container.clientWidth !== this.canvas.width || this.container.clientHeight !== this.canvas.height) {
    this.canvas.width = this.container.clientWidth; this.canvas.height = this.container.clientHeight;
  }
  
  // Clear
  context.clearRect(0,0,this.canvas.width,this.canvas.height);
};

Display.prototype.draw = function() {
  var context = this.context; // Sanity
  
  this.clear();
  
  /* Background color */
  context.fillStyle = this.game.getZone().color;
  context.fillRect(0,0,this.canvas.width,this.canvas.height);
  
  this.drawMap(false); // Render background
  this.drawObject();
  this.drawMap(true);  // Render foreground
  this.drawUI();
};

Display.prototype.drawMap = function(depth) {
  var context = this.context; // Sanity
  
  var tex = this.resource.getTexture("map");
  var zone = this.game.getZone();
  
  for(var i=0;i<zone.data.length;i++) {
    var row = zone.data[i];
    for(var j=0;j<row.length;j++) {
      var t = row[j];
      var td = td32.decode16(t);
      if(td.depth !== depth) { continue; }
      
      var st = util.sprite.getSprite(tex, td.index);
      context.drawImage(tex, st[0], st[1], Display.TEXRES, Display.TEXRES, Display.TEXRES*j, Display.TEXRES*i, Display.TEXRES, Display.TEXRES);
    }
  }
};

Display.prototype.drawObject = function() {
  var context = this.context; // Sanity
  
  context.fillStyle = "#FFFFFF";
  context.fillRect(0,0,32,32);
};

Display.prototype.drawUI = function() {
  var context = this.context; // Sanity
  
};