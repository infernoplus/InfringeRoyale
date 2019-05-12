"use strict";
/* global app */

function MenuError() {
  this.element = document.getElementById("error");
  this.error = document.getElementById("error-message");
  
  this.hide();
};

MenuError.prototype.show = function(message) {
  this.error.innerHTML = message;
  console.warn("##ERROR## " + message);
  this.element.style.display = "block";
};

MenuError.prototype.hide = function() {
  this.element.style.display = "none";
};