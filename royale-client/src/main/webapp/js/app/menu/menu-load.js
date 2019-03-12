"use strict";
/* global app */

function MenuLoad() {
  this.element = document.getElementById("load");
};

MenuLoad.prototype.show = function() {
  app.menu.hideAll();
  app.menu.background("a");
  this.element.style.display = "block";
};

MenuLoad.prototype.hide = function() {
  this.element.style.display = "none";
};