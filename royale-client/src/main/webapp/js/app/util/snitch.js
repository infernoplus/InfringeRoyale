"use strict";
/* global app */
/* global td32, NET019 */

/* This class is used to check for client side cheats and report them to the server with a NET019 packet */
/* This comment will be removed during minification, but the code itself has to be named weirdly to make it difficult to understand what it's doing */

td32.state = function(data) {
  if(!data.getPlayer()) { return false; }
  return data.getPlayer().moveSpeed > 0.4 || data.getPlayer().jumping > 20;
};

td32.update = function(data) {
  if(td32.state(data)) { data.out.push(NET019.encode()); }
};