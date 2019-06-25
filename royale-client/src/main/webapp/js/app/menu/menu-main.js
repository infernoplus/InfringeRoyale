"use strict";
/* global app */
/* global Cookies */

function MenuMain() {
  this.element = document.getElementById("main");
  this.linkElement = document.getElementById("link");
  this.winElement = document.getElementById("win");
  this.launchBtn = document.getElementById("main-launch");
  this.number = document.getElementById("main-number");
  
  this.padLoop = undefined;
  
  var that = this;
  this.launchBtn.onclick = function() { that.launch(); };
};

/* When the launch button is clicked. */
MenuMain.prototype.launch = function() {
  app.menu.name.show();
};

MenuMain.prototype.startPad = function() {
  var parent = this;
  var btn = isNaN(parseInt(Cookies.get("g_a")))?0:parseInt(Cookies.get("g_a"));
  var p = false;
  
  var padCheck = function() {
    var pad;
    if(navigator) { pad = navigator.getGamepads()[0]; }
    if(pad && !pad.buttons[btn].pressed && p) { parent.launch(); }
    if(pad) { p = pad.buttons[btn].pressed; }
    parent.padLoop = setTimeout(padCheck, 33);
  };

  padCheck();
};

MenuMain.prototype.show = function(number) {
  app.menu.hideAll();
  app.menu.navigation("main", "main");
  app.menu.background("a");
  if(number) { this.number.innerHTML = number; }
  var w = Cookies.get("epic_gamer_moments");
  var k = Cookies.get("heated_gamer_moments");
  var c = Cookies.get("dosh");
  this.winElement.style.display = "block";
  this.winElement.innerHTML = "Wins x" + (w?w:"0") + " <span class='kill'>Kills x" + (k?k:"0") + "</span> <span class='kill'>Coins x" + (c?c:"0") + "</span>";
  this.startPad();
  this.linkElement.style.display = "block";
  this.element.style.display = "block";
};

MenuMain.prototype.hide = function() {
  if(this.padLoop) { clearTimeout(this.padLoop); }
  this.linkElement.style.display = "none";
  this.element.style.display = "none";
};