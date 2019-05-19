"use strict";
/* global util, td32 */
/* global Display, GameObject, shor2, vec2 */

/* !!! Extends regular game display.js !!! */
function EditorDisplay(game, container, canvas, resource) {
  Display.call(this, game, container, canvas, resource);
}

EditorDisplay.prototype.clear = Display.prototype.clear;

EditorDisplay.prototype.draw = function() {
  var context = this.context; // Sanity
  
  this.container.style.height = this.game.middle.clientHeight; // Hack for window layout of editor
  
  this.clear();
  
  /* Background color */
  context.fillStyle = this.game.getZone().color;
  context.fillRect(0,0,this.canvas.width,this.canvas.height);
  
  /* Camera Transform */
  var zone = this.game.getZone();
  var dim = zone.dimensions();
  
  context.save();
  context.translate(this.canvas.width*.5, this.canvas.height*.5);
  context.scale(this.camera.scale, this.camera.scale);
  context.translate(-this.camera.pos.x*Display.TEXRES, -this.camera.pos.y*Display.TEXRES);
  
  /* Draw Game */
  this.drawReference();
  
  this.drawMap(false); // Render background
  //this.drawObject();
  this.drawMap(true);  // Render foreground
  //this.drawEffect();
  //this.drawUI();
  this.drawBorder();
  this.drawCursor();
  this.drawObjectTool();
  this.drawWarp();
  
  /* Draw UI */
  context.restore();
  this.drawPallete();
};

EditorDisplay.prototype.drawReference = function() {
  var context = this.context; // Sanity
  
  if(!this.game.reference || !this.game.showRef) { return; }
  
  var tex = this.resource.getTexture(this.game.reference);
  
  if(!tex) { return; }
  
  context.drawImage(tex, 0, 0, tex.width, tex.height, this.game.offsetRef.x, this.game.offsetRef.y, tex.width, tex.height);
};

EditorDisplay.prototype.drawMap = Display.prototype.drawMap;

EditorDisplay.prototype.drawObject = Display.prototype.drawObject;

EditorDisplay.prototype.drawEffect = Display.prototype.drawEffect;

EditorDisplay.prototype.drawUI = Display.prototype.drawUI;

EditorDisplay.prototype.drawBorder = function() {
  var context = this.context;
  
  var dim = vec2.scale(this.game.getZone().dimensions(), Display.TEXRES);
  context.lineWidth = 1;
  context.strokeStyle = '#FFFFFF';
  context.beginPath(); 
  context.moveTo(-(Display.TEXRES*0.1),-(Display.TEXRES*0.1));
  context.lineTo(dim.x+(Display.TEXRES*0.1),-(Display.TEXRES*0.1));
  context.lineTo(dim.x+(Display.TEXRES*0.1),dim.y+(Display.TEXRES*0.1));
  context.lineTo(-(Display.TEXRES*0.1),dim.y+(Display.TEXRES*0.1));
  context.lineTo(-(Display.TEXRES*0.1),-(Display.TEXRES*0.1));
  context.stroke();
};

EditorDisplay.prototype.drawCursor = function() {
  if(!this.game.tool || this.game.tool.brush === undefined) { return; }
  
  var context = this.context;
  
  var dim = this.game.getZone().dimensions();
  var mous = this.game.input.mouse;

  var g = vec2.chop(this.camera.unproject(mous.pos));
  if(g.x < 0 || g.x >= dim.x || g.y < 0 || g.y >= dim.y) { return; }
  
  context.fillStyle = "rgba(255,255,255,0.5)";
  context.fillRect(g.x*Display.TEXRES,g.y*Display.TEXRES,Display.TEXRES,Display.TEXRES);
};

EditorDisplay.prototype.drawPallete = function() {
  
  if(!this.game.tool || this.game.tool.brush === undefined) { return; }
  
  var context = this.context;
  var tex = this.resource.getTexture("map");
  
  var num = (tex.width/Display.TEXRES)*(tex.height/Display.TEXRES);
  var uplim = this.canvas.height-(parseInt(num/parseInt(this.canvas.width/Display.TEXRES))+1)*Display.TEXRES;

  context.fillStyle = "rgba(0,0,0,0.5)";
  context.fillRect(0,uplim,this.canvas.width,this.canvas.height);
  
  var x = 0, y = Display.TEXRES;
  for(var i=0;i<num;i++) {
    var st = util.sprite.getSprite(tex, i);
    context.drawImage(tex, st[0], st[1], Display.TEXRES, Display.TEXRES, x, this.canvas.height-y, Display.TEXRES, Display.TEXRES);
    x+=Display.TEXRES;
    if(x >= this.canvas.width-Display.TEXRES) {
      x=0; y+=Display.TEXRES;
    }
  }
  
  context.fillStyle = "black";
  context.fillRect(0,this.canvas.height-(y+Display.TEXRES),this.canvas.width,Display.TEXRES);
  
  context.font = Display.TEXRES + "px Arial";
  context.fillStyle = "white";
  context.textAlign = "left";
  context.fillText("  SPRITE SHEET  ", 2, this.canvas.height-(y+2));
  

  var td = td32.decode(this.game.tool.brush);
  var st = util.sprite.getSprite(tex, td.index);
  for(var xx=144;xx<this.canvas.width;xx+=Display.TEXRES) {
    context.drawImage(tex, st[0], st[1], Display.TEXRES, Display.TEXRES, xx, this.canvas.height-(y+Display.TEXRES), Display.TEXRES, Display.TEXRES);
  }
};

EditorDisplay.prototype.drawObjectTool = function() {
  if(!this.game.tool || this.game.tool.obj === undefined) { return; }
  
  var context = this.context;
  
  var tex = this.resource.getTexture("obj");
  var zone = this.game.getZone();
  
  for(var i=0;i<zone.obj.length;i++) {
    var obj = zone.obj[i];
    var cls = GameObject.OBJECT(obj.type);
    var pos = shor2.decode(obj.pos);
        
    context.fillStyle = obj === this.game.tool.selected ? "rgba(0,255,0,0.5)" : "rgba(255,0,0,0.5)";
    context.fillRect(pos.x*Display.TEXRES,(zone.data.length-pos.y-1)*Display.TEXRES,Display.TEXRES,Display.TEXRES);
    
    if(cls && cls.SPRITE && cls.SPRITE[0]) {
      var st = util.sprite.getSprite(tex, cls.SPRITE[0].INDEX);
      context.drawImage(tex, st[0], st[1], Display.TEXRES, Display.TEXRES, pos.x*Display.TEXRES,(zone.data.length-pos.y-1)*Display.TEXRES, Display.TEXRES, Display.TEXRES);
    }
  }
};

EditorDisplay.prototype.drawWarp = function() {
  if(!this.game.tool || this.game.tool.vore === undefined) { return; }
  
  var context = this.context;

  var zone = this.game.getZone();
  
  for(var i=0;i<zone.warp.length;i++) {
    var wrp = zone.warp[i];
    var pos = shor2.decode(wrp.pos);
        
    context.fillStyle = wrp === this.game.tool.selected ? "rgba(0,0,255,0.5)" : "rgba(255,0,0,0.5)";
    context.fillRect(pos.x*Display.TEXRES,(zone.data.length-pos.y-1)*Display.TEXRES,Display.TEXRES,Display.TEXRES);
  }
};