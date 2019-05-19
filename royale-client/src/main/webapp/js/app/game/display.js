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
}

Display.TEXRES = 16.; // Texture resolution. The resolution of a single sprite in a sprite sheet.

/* Clears the canvas resizes it to fill the screen if nesscary. */
Display.prototype.clear = function() {
  var context = this.context; // Sanity
  
  // Resize if needed.
  if(this.container.clientWidth !== this.canvas.width || this.container.clientHeight !== this.canvas.height) {
    this.canvas.width = this.container.clientWidth; this.canvas.height = this.container.clientHeight;
  }
  
  // Clear
  context.clearRect(0,0,this.canvas.width,this.canvas.height);
  
  // Set Render Settings  ( these reset any time the canvas is resized, so I just reset them every draw )
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.msImageSmoothingEnabled = false;
  context.imageSmoothingEnabled = false;
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
  this.drawEffect();
  this.drawUI();
};

Display.prototype.drawMap = function(depth) {
  var context = this.context; // Sanity
  
  var tex = this.resource.getTexture("map");
  var zone = this.game.getZone();
  
  var DS = parseInt(Display.TEXRES * this.camera.scale); // Draw Size; Defines the W/H of tile drawing. Is exact pixels.
  
  for(var i=0;i<zone.data.length;i++) {
    var row = zone.data[i];
    for(var j=0;j<row.length;j++) {
      var t = row[j];
      var td = td32.decode16(t);
      if(td.depth !== depth) { continue; }
      
      var st = util.sprite.getSprite(tex, td.index);
      var bmp = 0;
      if(td.bump > 0) {
        bmp = Math.sin((1.-(td.bump/15.))*Math.PI)*0.16;
      }
      context.drawImage(tex, st[0], st[1], Display.TEXRES, Display.TEXRES, DS*j, DS*(i-bmp), DS, DS);
    }
  }
};

Display.prototype.drawObject = function() {
  var context = this.context; // Sanity
  
  var zone = this.game.getZone();
  var dim = zone.dimensions();
  
  var tex = this.resource.getTexture("obj");
  
  var DS = parseInt(Display.TEXRES * this.camera.scale); // Draw Size; Defines the W/H of tile drawing. Is exact pixels.
  
  var sprites = [];
  for(var i=0;i<this.game.objects.length;i++) {
    var obj = this.game.objects[i];
    if(obj.level === zone.level && obj.zone === zone.id) {
      obj.draw(sprites);
    }
  }
  
  for(var i=0;i<sprites.length;i++) {
    var sprite = sprites[i];
    
    var st = util.sprite.getSprite(tex, sprite.index);
    if(sprite.reverse) {
      context.save();
      context.scale(-1.,1.);
      context.drawImage(tex, st[0], st[1], Display.TEXRES, Display.TEXRES, (-1.*(DS*sprite.pos.x))-DS, DS*(dim.y-sprite.pos.y-1.), DS, DS);
      context.restore();
    }
    else {
      context.drawImage(tex, st[0], st[1], Display.TEXRES, Display.TEXRES, DS*sprite.pos.x, DS*(dim.y-sprite.pos.y-1.), DS, DS);
    }
  }
};

Display.prototype.drawEffect = function() {
  var context = this.context; // Sanity
  
  var zone = this.game.getZone();
  var dim = zone.dimensions();
  
  var texMap = this.resource.getTexture("map");
  var texObj = this.resource.getTexture("obj");
  
  var DS = parseInt(Display.TEXRES * this.camera.scale); // Draw Size; Defines the W/H of tile drawing. Is exact pixels.
  
  var fxs = [];
  zone.getEffects(fxs);
  
  for(var i=0;i<fxs.length;i++) {
    var fx = fxs[i];
    
    var tex;
    switch(fx.tex) {
      case "map" : { tex = texMap; break; }
      case "obj" : { tex = texObj; break; }
    }
    
    var st = util.sprite.getSprite(tex, fx.ind);
    st[0] = parseInt(st[0] + (fx.sp.x * Display.TEXRES));
    st[1] = parseInt(st[1] + (fx.sp.y * Display.TEXRES));
    
    context.save();
    context.translate(parseInt(DS*fx.ss.x*.5), parseInt(DS*fx.ss.y*.5));
    context.translate(DS*fx.pos.x, DS*(dim.y-fx.pos.y-1.));
    context.rotate(fx.rot);
    context.translate(-parseInt(DS*fx.ss.x*.5), -parseInt(DS*fx.ss.y*.5));
    context.drawImage(tex, st[0], st[1], parseInt(Display.TEXRES*fx.ss.x), parseInt(Display.TEXRES*fx.ss.y), 0, 0, parseInt(DS*fx.ss.x), parseInt(DS*fx.ss.y));
    context.restore();
  }
  
};

Display.prototype.drawUI = function() {
  var context = this.context; // Sanity
  if(this.game.levelWarpId) {
    context.beginPath();
    context.lineWidth = "6";
    context.strokeStyle = "red";
    context.rect(25,25,100,100); //Test
    context.stroke();
  }
};