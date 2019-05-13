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