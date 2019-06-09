"use strict";
/* global main */

/* Define Audio Data Class */
function AudioData(context, path) {
  this.path = path;
  
  var tmp = this; /* Oh look. Javascript. */
  var request = new XMLHttpRequest();
  request.open('GET', "audio/" + path, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() { tmp.onload(request, context); };
  request.send();
}

AudioData.prototype.onload = function(request, context) {
  var tmp = this; /* Anger... Rising... */
  context.decodeAudioData(request.response, function(buffer) {
    tmp.buffer = buffer;
  }, tmp.onError);
};

AudioData.prototype.onError = function() {
  
};

AudioData.prototype.ready = function() {
  return this.buffer !== undefined;
};

AudioData.prototype.destroy = function() {
  
};