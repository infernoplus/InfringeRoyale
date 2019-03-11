"use strict";
/* global app */

function MenuError() {
  this.element = document.getElementById("error");
  this.error = document.getElementById("error-message");
};

MenuError.prototype.show = function(message) {
  app.menu.hideAll();
  app.menu.navigation("error", "error");
  this.error.innerHTML = message;
  console.warn("##ERROR## " + message);
  this.element.style.display = "block";
  
  app.net.close();
};

MenuError.prototype.hide = function() {
  this.element.style.display = "none";
};