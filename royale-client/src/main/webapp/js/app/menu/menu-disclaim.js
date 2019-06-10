"use strict";
/* global app */

function MenuDisclaim() {
  this.element = document.getElementById("disclaim");
  this.linkElement = document.getElementById("link");
};

MenuDisclaim.prototype.show = function(number) {
  app.menu.hideAll();
  app.menu.background("c");
  this.linkElement.style.display = "block";
  this.element.style.display = "block";
};

MenuDisclaim.prototype.hide = function() {
  this.linkElement.style.display = "none";
  this.element.style.display = "none";
};