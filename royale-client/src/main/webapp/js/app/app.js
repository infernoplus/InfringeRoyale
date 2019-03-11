"use strict";

/* Define Main Class */
function App() {
  this.menu = new Menu();                // Handles HTML menus
  this.net = new Network();              // Handles websockets
}

App.prototype.init = function() {
  this.menu.load.show();
  
  var serverResponse = function(data) {
    if(data.result) { app.menu.error.show(data.result); return; }
    /* OK */
    app.menu.main.show(data.active);
  };

  var serverError = function() {
    app.menu.error.show("An unknown error occured while connecting to the game server...");
  };

  $.ajax({
    url: "/royale/status",
    type: 'GET',
    timeout: 3000,
    success: function(data) { serverResponse(data); },
    error: function() { serverError(); }
  });
};


/* Returns true if the player is currently connected to a game. */
App.prototype.ingame = function() {
  return !!this.game;
};

/* Connect to game server and join a game */
App.prototype.join = function(name) {
  if(this.ingame()) {
    this.menu.error.show("An error occured while starting game..."); return;
  }
  this.menu.load.show();
  this.net.connect(name);
};

/* Close active game and reload page */
App.prototype.close = function() {
  this.menu.load.show();
  if(this.ingame()) {
    this.net.close();
  }
  location.reload();
};

/* Starts the App */
var app = new App();
app.init();