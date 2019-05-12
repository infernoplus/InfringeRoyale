"use strict";
/* global util, td32 */
/* global Display */

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
  
  this.drawMap(false); // Render background
  //this.drawObject();
  this.drawMap(true);  // Render foreground
  //this.drawEffect();
  //this.drawUI();
  this.drawPallete();
};

EditorDisplay.prototype.drawMap = Display.prototype.drawMap;

EditorDisplay.prototype.drawObject = Display.prototype.drawObject;

EditorDisplay.prototype.drawEffect = Display.prototype.drawEffect;

EditorDisplay.prototype.drawUI = Display.prototype.drawUI;

EditorDisplay.prototype.drawPallete = function() {
  var context = this.context;
  var tex = this.resource.getTexture("map");
  
  var num = (tex.width/Display.TEXRES)*(tex.height/Display.TEXRES);
  var x = 0, y = Display.TEXRES;
  for(var i=0;i<num;i++) {
    var st = util.sprite.getSprite(tex, i);
    context.drawImage(tex, st[0], st[1], Display.TEXRES, Display.TEXRES, x, this.canvas.height-y, Display.TEXRES, Display.TEXRES);
    x+=Display.TEXRES;
    if(x >= this.canvas.width) {
      x=0; y+=Display.TEXRES;
    }
  }
  
  context.fillStyle = "black";
  context.fillRect(0,this.canvas.height-(y+Display.TEXRES),this.canvas.width,Display.TEXRES);
  
  context.font = Display.TEXRES + "px Arial";
  context.fillStyle = "white";
  context.textAlign = "left";
  context.fillText("  SPRITE SHEET  ", 2, this.canvas.height-(y+2)); 
};