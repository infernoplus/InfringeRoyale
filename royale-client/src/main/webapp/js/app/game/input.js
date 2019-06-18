"use strict";
/* global app */
/* global vec2 */
/* global Cookies */

/* Define Input Class */
function Input(game, container) {
  this.game = game;
  this.container = container;
  
  var that = this;
  this.container.onmousemove = function(event) { that.mouse.event(event); };
  this.container.onmousedown = function(event) { that.mouse.event(event, true); };
  this.container.onmouseup = function(event) { that.mouse.event(event, false); };
  this.container.addEventListener("mousewheel", function(event) { that.mouse.wheel(event); }, false); // IE9, Chrome, Safari, Opera
  this.container.addEventListener("DOMMouseScroll", function(event) { that.mouse.wheel(event); }, false); // Firefox
  document.onkeyup = function(event) { that.keyboard.event(event, false); };
  document.onkeydown = function(event) { that.keyboard.event(event, true); };

  this.touchEvt = function(event) { app.game.input.touch.event(event); };
  
  document.addEventListener('touchstart', this.touchEvt, true);
  document.addEventListener('touchmove', this.touchEvt, true);
  document.addEventListener('touchend', this.touchEvt, true);

  this.mouse.input = this;
  this.keyboard.input = this;
  this.touch.input = this; // Reeeeeeee
  
  this.load();
};

Input.INPUTS = ["up","down","left","right","a","b"];
Input.K_DEFAULT = [87, 83, 65, 68, 32, 16];
Input.G_DEFAULT = [0, 1, 2, 3, 4, 5];

Input.prototype.load = function() {
  this.assignK = {};
  for(var i=0;i<Input.INPUTS.length;i++) {
    var val = Cookies.get("k_" + Input.INPUTS[i]);
    this.assignK[Input.INPUTS[i]] = val?parseInt(val):Input.K_DEFAULT[i];
  }
  
  this.assignG = {};
  for(var i=0;i<Input.INPUTS.length;i++) {
    var val = Cookies.get("g_" + Input.INPUTS[i]);
    this.assignG[Input.INPUTS[i]] = val?parseInt(val):Input.G_DEFAULT[i];
  }
};

Input.prototype.pad = {
  pad: undefined,
  ax: vec2.make(0., 0.)
};

Input.prototype.pad.update = function() {
  if(navigator) { this.pad = navigator.getGamepads()[0]; }
  else { this.pad = undefined; }
  this.analog();
};

Input.prototype.pad.analog = function() {
  if(this.pad) {
    for(var i=0;i<this.pad.axes.length-1;i++) {
      var x = this.pad.axes[i];
      var y = this.pad.axes[i+1];
      if(Math.abs(x) < 0.25 && Math.abs(y) < 0.25) { continue; }
      else { this.ax = vec2.make(x,y); return; }
    }
  }
  this.ax = vec2.make(0., 0.);
};

Input.prototype.pad.button = function(i) {
  if(this.pad) {
    return this.pad.buttons[i].pressed;
  }
  return false;
};

Input.prototype.pad.connected = function() {
  return !!this.pad;
};

Input.prototype.mouse = {
  inputs: [],
  pos: {x: 0, y: 0},
  mov: {x: 0, y: 0},
  spin: 0.0,
  nxtMov: {x: 0, y: 0},
  nxtSpin: 0.0,
  lmb: false,
  rmb: false,
  mmb: false
};

Input.prototype.mouse.event = function(event, state) {
  this.nxtMov = {x: this.nxtMov.x+(this.pos.x-event.offsetX), y: this.nxtMov.y+((this.pos.y-event.offsetY)*-1)};
  this.pos = {x: event.offsetX, y: event.offsetY};
  if(state === undefined) { return; }
  switch(event.button) {
		case 0 : { this.lmb = state; break; }
		case 2 : { this.rmb = state; break; }
		case 1 : { this.mmb = state; break; }
		default : { /* Ignore */ break; }
  }
  if(state) { this.inputs.push({btn: event.button, pos: this.pos}); }
};

Input.prototype.mouse.wheel = function(event) {
    var e = window.event || event;
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    this.nxtSpin += delta;
    return false;
};

Input.prototype.keyboard = {
  inputs: [],
  keys: []
};

Input.prototype.keyboard.event = function(evt, state) {
  this.keys[evt.keyCode] = state;  
  if(state) { this.inputs.push({key: evt.keyCode, char: evt.key.length!==1?"":evt.key}); }
};


Input.prototype.touch = {
  inputs: [],
  pos: []
};

Input.prototype.touch.event = function(event) {
  var last = this.pos;
  this.pos = [];
  for(var i=0;i<event.touches.length;i++) {
    var tch = event.touches[i];
    var contains = false;
    for(var j=0;j<last.length;j++) {
      if(last[j].id === tch.identifier) { contains = true; break; }
    }
    if(!contains) {
      this.inputs.push({id: tch.identifier, x: tch.clientX, y: tch.clientY});
    }
    this.pos.push({id: tch.identifier, x: tch.clientX, y: tch.clientY});
  }
};

Input.prototype.pop = function() {
  this.mouse.mov = this.mouse.nxtMov;
  this.mouse.spin = this.mouse.nxtSpin;
  this.mouse.nxtMov = {x: 0, y: 0};
  this.mouse.nxtSpin = 0.0;
  
  var inputs = {mouse: this.mouse.inputs, keyboard: this.keyboard.inputs, touch: this.touch.inputs};
  this.keyboard.inputs = [];
  this.mouse.inputs = [];
  this.touch.inputs = [];
  
  return inputs;
};

Input.prototype.destroy = function() {
  var that = this;
  this.container.onmousemove=function() {};
  this.container.onmousedown=function() {};
  this.container.onmouseup=function() {};
  this.container.removeEventListener("mousewheel", that.mouse.wheel, false); // IE9, Chrome, Safari, Opera
  this.container.removeEventListener("DOMMouseScroll", that.mouse.wheel, false); // Firefox
  document.onkeyup = function() {};
  document.onkeydown = function() {};
};