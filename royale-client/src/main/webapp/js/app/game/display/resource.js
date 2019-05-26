"use strict";
/* global app */

/* Stores all texture and audio data */

/* src param is structured as follows */
/* [{id: "map", src: <url>},{id: "m_jump", src: <url>}] */

function Resource(src) {
  this.texture = {
    cache: {},
    load: 0
  };
  
  this.audio = {
    cache: {},
    load: 0
  };
  
  this.load(src);
}

Resource.prototype.load = function (src) {
  for(var i=0;i<src.length;i++) {
    var s = src[i];
    var ext = s.src.split(".").pop().toLowerCase();
    switch(ext) {
      case "png" : { this.loadTexture(s); break; }
      case "gif" : { this.loadTexture(s); break; }
      case "wav" : { this.loadAudio(s); break; }
      default : { app.menu.warn.show("Failed to load resource with unknown extension: " + ext); break; }
    }
  }
};

Resource.prototype.loadTexture = function(src) {
  var tex = this.texture;
  if(tex.cache[src.id]) { return; }  // Skip if already loaded.
  else {
    var img = new Image();
    img.onload = function() {
      tex.cache[src.id] = img;
      tex.load--;
    };
    img.src = src.src;
    tex.load++;
  }
};

Resource.prototype.loadAudio = function(src) {
  
};

/* Retrieves a texture by it's ID */
Resource.prototype.getTexture = function(id) {
  return this.texture.cache[id];
};

/* Returns true if all resources are done loading */
Resource.prototype.ready = function() {
  return this.texture.load === 0 && this.audio.load === 0;
};