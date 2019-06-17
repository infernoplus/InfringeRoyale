"use strict";
/* global app */

function MenuError() {
  this.element = document.getElementById("error");
  this.error = document.getElementById("error-message");
};

MenuError.prototype.show = function(disp, msg, ex) {
  app.net.close();
  
  app.menu.hideAll();
  app.menu.navigation("error", "error");
  app.menu.background("b");
  this.error.innerHTML = disp;
  if(msg) { console.warn("##ERROR## " + msg); }
  if(ex) { console.warn("##TRACE## " + ex); }
  this.element.style.display = "block";
};

MenuError.prototype.hide = function() {
  this.element.style.display = "none";
};