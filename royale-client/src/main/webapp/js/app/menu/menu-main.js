"use strict";
/* global app */

function MenuMain() {
  this.element = document.getElementById("main");
  this.linkElement = document.getElementById("link");
  this.launchBtn = document.getElementById("main-launch");
  this.number = document.getElementById("main-number");
  
  var that = this;
  this.launchBtn.onclick = function() { that.launch(); };
};

/* When the launch button is clicked. */
MenuMain.prototype.launch = function() {
  app.menu.name.show();
};

MenuMain.prototype.show = function(number) {
  app.menu.hideAll();
  app.menu.navigation("main", "main");
  app.menu.background("a");
  if(number) { this.number.innerHTML = number; }
  this.linkElement.style.display = "block";
  this.element.style.display = "block";
};

MenuMain.prototype.hide = function() {
  this.linkElement.style.display = "none";
  this.element.style.display = "none";
};