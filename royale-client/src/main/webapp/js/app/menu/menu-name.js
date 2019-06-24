"use strict";
/* global app */
/* global Cookies */

function MenuName() {
  this.element = document.getElementById("name");
  this.linkElement = document.getElementById("link");
  this.nameInput = document.getElementById("name-input");
  this.teamInput = document.getElementById("team-input");
  this.launchBtn = document.getElementById("name-launch");
  
  this.padLoop = undefined;
  
  var that = this;
  this.launchBtn.onclick = function() { that.launch(); };
};

/* When the launch button is clicked. */
MenuName.prototype.launch = function() {
  Cookies.set("name", this.nameInput.value, {expires: 30});
  Cookies.set("team", this.teamInput.value, {expires: 30});
  app.join(this.nameInput.value, this.teamInput.value);
};

MenuName.prototype.startPad = function() {
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

MenuName.prototype.show = function() {
  app.menu.hideAll();
  app.menu.navigation("name", "name");
  app.menu.background("a");
  var nam = Cookies.get("name");
  var tem = Cookies.get("team");
  this.nameInput.value = nam?nam:"";
  this.teamInput.value = tem?tem:"";
  this.startPad();
  this.linkElement.style.display = "block";
  this.element.style.display = "block";
};

MenuName.prototype.hide = function() {
  if(this.padLoop) { clearTimeout(this.padLoop); }
  this.linkElement.style.display = "none";
  this.element.style.display = "none";
};

/* Called when the back button is hit on this menu */
MenuName.prototype.onBack = function() {
  app.menu.main.show();
};