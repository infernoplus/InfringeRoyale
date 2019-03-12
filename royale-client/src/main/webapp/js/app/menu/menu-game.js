"use strict";
/* global app */

function MenuGame() {
  this.element = document.getElementById("game");
};

MenuGame.prototype.show = function() {
  app.menu.hideAll();
  app.menu.navigation("game", "game");
  app.menu.background("c");
  this.element.style.display = "block";
};

MenuGame.prototype.hide = function() {
  this.element.style.display = "none";
};

/* Called when the back button is hit on this menu */
MenuGame.prototype.onBack = function() {
  app.close();
};