"use strict";
/* global app */
/* global util, vec2 */


/* Yo! This class was basically copy pasted in here from 20xx. */
/* Tbh it's fucking gross and doesn't fit the design of this engine but im out of time so hard coding it is */


/* Define Game Audio Class */
function Audio(game) {
  this.game = game;
  
  if(!this.initWebAudio()) { this.initFallback(); }
}

Audio.FALLOFF_MIN = 3;
Audio.FALLOFF_MAX = 25;

/* Returns true if webaudio is set up correctly, false if fuck no. */
Audio.prototype.initWebAudio = function() {
  try {
    var ACc = window.AudioContext || window.webkitAudioContext;
    this.context = new ACc();
  }
  catch(ex) {
    app.menu.warn.show("WebAudio not supported. Intializing fallback mode...");
    return false;
  }
  
  /* @TODO: ew. */
  var HARDCODED_SOUNDS = [
    "sfx/alert.wav",
    "sfx/break.wav",
    "sfx/breath.wav",
    "sfx/bump.wav",
    "sfx/coin.wav",
    "sfx/fireball.wav",
    "sfx/firework.wav",
    "sfx/flagpole.wav",
    "sfx/item.wav",
    "sfx/jump0.wav",
    "sfx/kick.wav",
    "sfx/life.wav",
    "sfx/pipe.wav",
    "sfx/powerup.wav",
    "sfx/stomp.wav",
    "sfx/vine.wav",
    
    "music/main0.mp3",
    "music/main1.mp3",
    "music/main2.mp3",
    "music/main3.mp3",
    "music/level.mp3",
    "music/castle.mp3",
    "music/victory.mp3",
    "music/star.mp3",
    "music/dead.mp3",
    "music/gameover.mp3"
  ];
  this.sounds = [];
  
  for(var i=0;i<HARDCODED_SOUNDS.length;i++) {
    if(!this.createAudio(HARDCODED_SOUNDS[i])) { return false; }
  }
  
  this.masterVolume = this.context.createGain();
  this.masterVolume.gain.value = 1.0;
  this.masterVolume.connect(this.context.destination); // Global Volume -> Speakers
  
  this.effectVolume = this.context.createGain();
  this.effectVolume.gain.value = 1.0;
  this.effectVolume.connect(this.masterVolume); // Effect Volume -> Master Volume
  
  this.musicVolume = this.context.createGain();
  this.musicVolume.gain.value = 1.0;
  this.musicVolume.connect(this.masterVolume); // Music Volume -> Master Volume
  
  this.updateVolume();
  
  this.context.listener.setPosition(0., 0., 0.);
  this.context.listener.setOrientation(1., 0., 0., 0., 1., 0.);
  
  return true;
};

Audio.prototype.initFallback = function() {
  this.context = undefined;
  this.sounds = [];
};

/* Updates position of audio context for 3d sound */
Audio.prototype.update = function() {
  this.updateVolume();
  
  /* Set Camera Position */
  var ply = this.game.getPlayer();
  this.context.listener.positionX.value = ply?ply.pos.x:this.game.display.camera.pos.x;
  this.context.listener.positionY.value = ply?ply.pos.y:this.game.display.camera.pos.y;
  this.context.listener.positionZ.value = 0.;

  /* Set Orientation */
  this.context.listener.forwardX.value = 1.;
  this.context.listener.forwardY.value = 0.;
  this.context.listener.forwardZ.value = 0.;
  this.context.listener.upX.value = 0.;
  this.context.listener.upY.value = 1.;
  this.context.listener.upZ.value = 0.;
};

/* Set Master Volume */
Audio.prototype.updateVolume = function() {
  this.masterVolume.gain.value = .5;
  this.effectVolume.gain.value = .75;
  this.musicVolume.gain.value = .75;
};

Audio.prototype.setMusic = function(sound, loop) {
  if(this.music) { 
    if(this.music.path === sound.path) { return; }
    this.music.stop();
  }
  this.music = sound;
  this.music.loop(loop);
  this.music.play();
};

Audio.prototype.stopMusic = function() {
  if(this.music) { this.music.stop(); this.music = undefined; }
};

/* Returns boolean. True if created succesfully and false if failed to create. */
Audio.prototype.createAudio = function(path) {
  var snd = new AudioData(this.context, path);
  this.sounds.push(snd);
  return true;
};

/* Returns boolean. True if created succesfully and false if failed to create. */
Audio.prototype.createCustomAudio = function(name) {
  var snd = new CustomAudioData(this.context, name);
  this.sounds.push(snd);
  return true;
};

/* Gets the sound at the path given. If it's not already loaded it loads it. If file not found returns default sound. */
Audio.prototype.getAudio = function(path, gain, shift, type) {
  var volume;
  switch(type) {
    case "effect" : { volume = this.effectVolume; break; }
    case "music" : { volume = this.musicVolume; break; }
    default : { volume = this.effectVolume; break; }
  }
  
  for(var i=0;i<this.sounds.length;i++) {
    if(this.sounds[i].path === path) {
      return new AudioInstance(this.context, path, this.sounds[i], gain, shift, volume);
    }
  }
  
  if(this.createAudio(path)) { return this.getAudio(path); }
  
  app.menu.warn.show("Failed to load sound: '" + path + "'");
  return this.getAudio("default.wav");
};

/* Gets the sound at the path given. If it's not already loaded it loads it. If file not found returns default sound. */
Audio.prototype.getSpatialAudio = function(path, gain, shift, type) {
  var volume;
  switch(type) {
    case "effect" : { volume = this.effectVolume; break; }
    case "music" : { volume = this.musicVolume; break; }
    default : { volume = this.effectVolume; break; }
  }
  
  for(var i=0;i<this.sounds.length;i++) {
    if(this.sounds[i].path === path) {
      return new SpatialAudioInstance(this.context, path, this.sounds[i], gain, shift, volume);
    }
  }
  
  if(this.createAudio(path)) { return this.getSpatialAudio(path); }
  
  app.menu.warn.show("Failed to load sound: '" + path + "'");
  return this.getSpatialAudio("multi/default.wav");
};

/* Stop and unload all sounds */
Audio.prototype.destroy = function() {
  for(var i=0;i<this.sounds.length;i++) {
    this.sounds[i].destroy();
  }
  this.stopMusic();
  this.sounds = [];
  this.context.close();
};