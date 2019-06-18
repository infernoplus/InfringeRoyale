"use strict";
/* global app */
/* global Cookies */

function MenuName() {
  this.element = document.getElementById("name");
  this.linkElement = document.getElementById("link");
  this.winElement = document.getElementById("win");
  this.nameInput = document.getElementById("name-input");
  this.teamInput = document.getElementById("team-input");
  this.launchBtn = document.getElementById("name-launch");
  
  var that = this;
  this.launchBtn.onclick = function() { that.launch(); };
};

/* When the launch button is clicked. */
MenuName.prototype.launch = function() {
  Cookies.set("name", this.nameInput.value, {expires: 30});
  Cookies.set("team", this.teamInput.value, {expires: 30});
  app.join(this.nameInput.value, this.teamInput.value);
};

MenuName.prototype.show = function() {
  app.menu.hideAll();
  app.menu.navigation("name", "name");
  app.menu.background("a");
  var nam = Cookies.get("name");
  var tem = Cookies.get("team");
  this.nameInput.value = nam?nam:"";
  this.teamInput.value = tem?tem:"";
  var epic = Cookies.get("epic_gamer_moments");
  this.winElement.style.display = "block";
  this.winElement.innerHTML = "Wins: " + (epic?epic:"0");
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