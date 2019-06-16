"use strict";
/* global app */

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

  this.mouse.input = this;
  this.keyboard.input = this;
};

Input.prototype.pad = {
  pads: [],
  ax: vec2.make(0., 0.),
  a: false,
  b: false
};

Input.prototype.pad.update = function() {
  if(navigator) { this.pads = navigator.getGamepads(); }
  else { this.pads = [undefined]; }
  this.analog();
  this.button();
};

Input.prototype.pad.analog = function() {
  var pad = this.pads[0];
  if(pad) {
    for(var i=0;i<pad.axes.length-1;i++) {
      var x = pad.axes[i];
      var y = pad.axes[i+1];
      if(Math.abs(x) < 0.1 && Math.abs(y) < 0.1) { continue; }
      else { this.ax = vec2.make(x,y); return; }
    }
  }
  this.ax = vec2.make(0., 0.);
};

Input.prototype.pad.button = function() {
  var pad = this.pads[0];
  var a = false;
  var b = false;
  if(pad) {
    for(var i=0;i<pad.buttons.length;i++) {
      var btn = pad.buttons[i];
      if(btn.value === 1) {
        if(i%2 === 0) { a = true; }
        else { b = true; }
      }
    }
  }
  this.a = a;
  this.b = b;
};

Input.prototype.pad.connected = function() {
  return !!this.pads[0];
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

Input.prototype.pop = function() {
  this.mouse.mov = this.mouse.nxtMov;
  this.mouse.spin = this.mouse.nxtSpin;
  this.mouse.nxtMov = {x: 0, y: 0};
  this.mouse.nxtSpin = 0.0;
  
  var inputs = {mouse: this.mouse.inputs, keyboard: this.keyboard.inputs};
  this.keyboard.inputs = [];
  this.mouse.inputs = [];
  
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