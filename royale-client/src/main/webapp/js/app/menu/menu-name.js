"use strict";
/* global app */
/* global Cookies */

function MenuName() {
  this.element = document.getElementById("name");
  this.linkElement = document.getElementById("link");
  this.nameInput = document.getElementById("name-input");
  this.launchBtn = document.getElementById("name-launch");
  
  var that = this;
  this.launchBtn.onclick = function() { that.launch(); };
};

/* When the launch button is clicked. */
MenuName.prototype.launch = function() {
  Cookies.set("name", this.nameInput.value, {expires: 30});
  app.join(this.nameInput.value);
};

MenuName.prototype.show = function() {
  app.menu.hideAll();
  app.menu.navigation("name", "name");
  app.menu.background("a");
  var nam = Cookies.get("name");
  this.nameInput.value = nam?nam:"";
  this.linkElement.style.display = "block";
  this.element.style.display = "block";
};

MenuName.prototype.hide = function() {
  this.linkElement.style.display = "none";
  this.element.style.display = "none";
};

/* Called when the back button is hit on this menu */
MenuName.prototype.onBack = function() {
  app.menu.main.show();
};