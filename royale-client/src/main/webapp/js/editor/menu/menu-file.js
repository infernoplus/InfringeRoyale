"use strict";
/* global app */

function MenuFile() {
  this.element = document.getElementById("file");
  this.fileInput = document.getElementById('file-input');
  this.fileError = document.getElementById('file-error');
          
  this.fileInput.addEventListener('change', function(e) { app.file.open(e); }, false);
}

MenuFile.prototype.error = function(ex) {
  this.fileError.style.display = "block";
  this.fileError.innerHTML = ex.stack.replace("\n", "<br/>");
};

MenuFile.prototype.show = function() {
  this.element.style.display = "block";
  this.fileError.style.display = "none";
};

MenuFile.prototype.hide = function() {
  this.element.style.display = "none";
};