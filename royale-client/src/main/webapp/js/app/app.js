"use strict";
/* global Game, Lobby */

/* Define Main Class */
function App() {
  this.menu = new Menu();                // Handles HTML menus
  this.net = new Network();              // Handles websockets
}

App.prototype.init = function() {
  var that = this;
  this.menu.disclaim.show();
  setTimeout(function() {
    that.menu.load.show();
    var serverResponse = function(data) {
      if(data.result) { that.menu.error.show(data.result); return; }
      /* OK */
      that.menu.main.show(data.active);
    };

    var serverError = function() {
      that.menu.error.show("An unknown error occured while connecting to the game server...");
    };

    $.ajax({
      url: "/royale/status",
      type: 'GET',
      timeout: 3000,
      success: function(data) { serverResponse(data); },
      error: function() { serverError(); }
    });
  }, 2000);
};

/* Load a game from .game file */
App.prototype.load = function(data) {
  if(this.game instanceof Game) { this.menu.error.show("State error. Game already loaded."); return; }
  if(this.game instanceof Lobby) { this.game.destroy(); }
  
  switch(data.type) {
    case "game" : { this.game = new Game(data); break; }
    case "lobby": { this.game = new Lobby(data); break; }
    default : { this.menu.error.show("Critical error! Game file missing type!"); break; }
  }
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