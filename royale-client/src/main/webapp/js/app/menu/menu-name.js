"use strict";
/* global app */

function MenuName() {
  this.element = document.getElementById("name");
  this.nameInput = document.getElementById("name-input");
  this.launchBtn = document.getElementById("name-launch");
  
  var that = this;
  this.launchBtn.onclick = function() { that.launch(); };
};

/* When the launch button is clicked. */
MenuName.prototype.launch = function() {
  app.join(this.nameInput.value);
};

MenuName.prototype.show = function() {
  app.menu.hideAll();
  app.menu.navigation("name", "name");
  this.element.style.display = "block";
};

MenuName.prototype.hide = function() {
  this.element.style.display = "none";
};

/* Called when the back button is hit on this menu */
MenuName.prototype.onBack = function() {
  app.menu.main.show();
};