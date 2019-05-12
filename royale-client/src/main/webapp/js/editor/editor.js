"use strict";
/* global app */
/* global util, shor2, vec2, td32 */
/* global Function, requestAnimFrameFunc, cancelAnimFrameFunc */
/* global GameObject */


function Editor(data) {
  this.middle = document.getElementById("editor-middle");
  
  this.container = document.getElementById("editor-display");
  this.canvas = document.getElementById("editor-display-canvas");
  
  this.input = new Input(this, this.canvas);
  this.display = new EditorDisplay(this, this.container, this.canvas, data.resource);
  
  this.load(data);
  
  this.frame = 0;
  this.delta = util.time.now();
  
  var that = this;
  this.frameReq = requestAnimFrameFunc.call(window, function() { that.draw(); }); // Javascript 🙄
};

Editor.TICK_RATE = 33;

Editor.prototype.load = function(data) {  
  /* Load world data */
  this.world = new World(data);
  
  this.ready = true;
};

Editor.prototype.setTool = function(tool) {
  if(this.tool) { this.tool.destroy(); }
  
  switch(tool) {
    case "world" : { this.tool = new ToolWorld(this); this.tool.load(); break; }
    case "level" : { this.tool = new ToolLevel(this); this.tool.load(); break; }
  }
};

/* Handle player input */
Editor.prototype.doInput = function() {
//  var imp = this.input.pop();
//  
//  if(!this.inx27 && this.input.keyboard.keys[27]) { /* MENU */ } this.inx27 = this.input.keyboard.keys[27]; // ESC
//  
//  var obj = this.getPlayer();
//  if(!obj) { return; }
//  
//  var keys = this.input.keyboard.keys;
//  var dir = [0,0];
//  if(keys[87] || keys[38]) { dir[1]++; } // W or UP
//  if(keys[83] || keys[40]) { dir[1]--; } // S or DOWN
//  if(keys[65] || keys[37]) { dir[0]--; } // A or LEFT
//  if(keys[68] || keys[39]) { dir[0]++; } // D or RIGHT
//  var a = keys[32] || keys[17]; // SPACE or RIGHT CONTROL
//  var b = keys[16] || keys[45]; // LEFT SHIFT or NUMPAD 0
//  
//  obj.input(dir, a, b);
};

/* Step game world */
Editor.prototype.doStep = function() {  
  
  /* Step world to update bumps & effects & etc */
  this.world.step();
  
};

/* Changes to specifed zone  */
Editor.prototype.setZone = function(zone) {
  this.currentZone = zone;
  this.tool.reload();
};

/* Returns the zone we are editing. */
Editor.prototype.getZone = function() {
  if(!this.currentZone) {this.currentZone = this.world.getInitialZone(); }
  return this.currentZone;
};

Editor.prototype.draw = function() {
  if(this.ready) {
    var now = util.time.now();
    if((now - this.delta) / Editor.TICK_RATE > 0.75) {      
      this.doInput();
      this.doStep();
      this.display.draw();
      
      this.frame++;
      this.delta = now;
    }
  }
  
  var that = this;
  this.frameReq = requestAnimFrameFunc.call(window, function() { that.draw(); }); // Javascript 🙄
};

Editor.prototype.destroy = function() {
  cancelAnimFrameFunc.call(window, this.frameReq);
};