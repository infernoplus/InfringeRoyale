"use strict";
/* global app */

function MenuWarn() {
  this.element = document.getElementById("warn");
  
  this.timeout = undefined;
  this.hide();
};

MenuWarn.prototype.show = function(message) {
  this.element.innerHTML = "<img src='img/home/warn.png' class='warn-ico'/> " + message;
  console.warn("##WARN## " + message);

  if(this.timeout) { clearTimeout(this.timeout); }
  var tmp = this.element;
  this.timeout = setTimeout(function() { tmp.style.display = "none"; }, 5000);
  this.element.style.display = "block";
};

MenuWarn.prototype.hide = function() {
  this.element.style.display = "none";
};