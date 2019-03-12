"use strict";

function Display(game, container, canvas) {
  this.game = game;
  this.container = container;
  this.canvas = canvas;
  this.context = this.canvas.getContext("2d");
  
  this.camera = new Camera();
  
  var context = this.context; // Sanity
  
  /* "NEAREST" texture filtering */
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.msImageSmoothingEnabled = false;
  context.imageSmoothingEnabled = false; 
}

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
  this.clear();
  this.drawMap();
  this.drawObject();
  this.drawUI();
};

Display.prototype.drawMap = function() {
  var context = this.context; // Sanity
  
};

Display.prototype.drawObject = function() {
  var context = this.context; // Sanity
  
  context.fillStyle = "#FFFFFF";
  context.fillRect(0,0,32,32);
};

Display.prototype.drawUI = function() {
  var context = this.context; // Sanity
  
};