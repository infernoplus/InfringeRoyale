"use strict";
/* global app */
/* global Audio */

/* Define Audio Instance Classes */
function AudioInstance(context, path, soundData, gain, shift, volume) {
  this.context = context;
  this.path = path;
  this.data = soundData;
  this.ready = false;
  this.played = false;
  this.playing = false;
  
  if(!this.data.ready()) {
    app.menu.warn.show("Attempted to instance partially loaded sound data: '" + path + "'");
    return;
  }
  
  this.create(gain, shift, volume);
}

AudioInstance.prototype.create = function(gain, shift, volume) {
  var parent = this;
  this.source = this.context.createBufferSource();      // Creates source
  this.source.buffer = this.data.buffer;                // Set source audio
  this.source.onended = function() { parent.playing = false; };
  this.source.playbackRate.value = 1.+((shift*Math.random())-(shift*0.5));
  this.gain = this.context.createGain();
  this.gain.gain.value = gain;
  this.source.connect(this.gain);                       // Source -> Gain
  this.gain.connect(volume);                            // Gain -> Global Volume
  this.ready = true;
};

AudioInstance.prototype.position = function() { /* UNSUPPORTED */ };

AudioInstance.prototype.volume = function(gain) {
  if(this.ready) { this.gain.gain.value = gain; }
};

AudioInstance.prototype.play = function() {
  if(this.ready && !this.played) { this.source.start(0); this.playing = true; }
  else if(this.played) { app.menu.warn.show("Attempted to replay sound instance: '" + this.path + "'"); }
  this.played = true;
};

AudioInstance.prototype.stop = function() {
  if(this.ready && this.played) { this.source.stop(); }
};

AudioInstance.prototype.loop = function(loop) {
  if(this.ready) { this.source.loop = loop; }
};

/* return true if we are done playing and ready to be deleted */
AudioInstance.prototype.done = function() {
  return this.played && !this.playing;
};

/* Define Spatial Audio Instance Classes */
function SpatialAudioInstance(context, path, soundData, gain, shift, volume) {
  AudioInstance.call(this, context, path, soundData, gain, shift, volume);
}

SpatialAudioInstance.prototype.create = function(gain, shift, volume) {
  var parent = this;
  this.source = this.context.createBufferSource();      // Creates source
  this.source.buffer = this.data.buffer;                // Set sourcea audio
  this.source.onended = function() { parent.playing = false; };
  this.source.playbackRate.value = 1.+((shift*Math.random())-(shift*0.5));
  this.gain = this.context.createGain();
  this.gain.gain.value = gain;
  this.panner = this.context.createPanner();
  this.panner.panningModel = 'HRTF';
  this.panner.distanceModel = 'linear';
  this.panner.refDistance = Audio.FALLOFF_MIN;
  this.panner.maxDistance = Audio.FALLOFF_MAX;
  this.panner.rolloffFactor = 1;
  this.panner.coneInnerAngle = 360;
  this.panner.coneOuterAngle = 0;
  this.panner.coneOuterGain = 0;
  this.source.connect(this.gain);                      // Source -> Gain
  this.gain.connect(this.panner);                      // Gain -> Panner
  this.panner.connect(volume);                         // Panner -> Global Volume
  this.panner.setPosition(0., 0., 0.);
  this.panner.setOrientation(1., 0., 0.);
  
  this.ready = true;
};

SpatialAudioInstance.prototype.position = function(pos) {
  if(this.data.ready() && this.ready) {
    this.panner.positionX.value = pos.x;
    this.panner.positionY.value = pos.y;
    this.panner.positionZ.value = 0.;
  }
};

SpatialAudioInstance.prototype.volume = AudioInstance.prototype.volume;
SpatialAudioInstance.prototype.play = function(pos) {
  this.position(pos);
  if(this.ready && !this.played) { this.source.start(0); this.playing = true; }
  else if(this.played) { app.menu.warn.show("Attempted to replay sound instance: '" + this.path + "'"); }
  this.played = true;
};
SpatialAudioInstance.prototype.stop = AudioInstance.prototype.stop;
SpatialAudioInstance.prototype.loop = AudioInstance.prototype.loop;
SpatialAudioInstance.prototype.done = AudioInstance.prototype.done;