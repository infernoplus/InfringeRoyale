"use strict";

/* Define Main Class */
function App() {
  this.menu = new Menu();                // Handles HTML menus
  this.file = new File();                // Manages loading files
}

App.prototype.init = function() {
  this.menu.fileMenu();
};

App.prototype.load = function(game) {
  this.menu.editorMenu();
  this.editor = new Editor(game);
  
  app.menu.list.generate();
};

/* Close active game and reload page */
App.prototype.close = function() {
  if(this.editor) { this.editor.destroy(); }
  location.reload();
};

/* Starts the App */
var app = new App();
app.init();