"use strict";
/* global util, td32 */
/* global Game, Lobby */
/* global TextObject */

function Display(game, container, canvas, resource) {
  this.game = game;
  this.container = container;
  this.canvas = canvas;
  this.context = this.canvas.getContext("2d");
  
  this.resource = new Resource(resource);
  this.camera = new Camera(this);
  
  var context = this.context; // Sanity
}

Display.TEXRES = 16.; // Texture resolution. The resolution of a single sprite in a sprite sheet.

/* Clears the canvas resizes it to fill the screen if nesscary. */
Display.prototype.clear = function() {
  var context = this.context; // Sanity
  
  // Resize if needed.
  if(this.container.clientWidth !== this.canvas.width || this.container.clientHeight !== this.canvas.height) {
    this.canvas.width = this.container.clientWidth; this.canvas.height = this.container.clientHeight;
  }
  
  // Clear
  context.clearRect(0,0,this.canvas.width,this.canvas.height);
  
  // Set Render Settings  ( these reset any time the canvas is resized, so I just set them every draw )
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.msImageSmoothingEnabled = false;
  context.imageSmoothingEnabled = false;
};

Display.prototype.draw = function() {
  var context = this.context; // Sanity
  
  this.clear();
  
  /* Background color */
  context.fillStyle = this.game.getZone().color;
  context.fillRect(0,0,this.canvas.width,this.canvas.height);
  
  /* Loading Check */
  if(!this.resource.ready()) {
    this.drawLoad();
    return;
  }
  
  /* Camera Transform */
  var zone = this.game.getZone();
  var dim = zone.dimensions();
  
  context.save();
  //context.translate(.5, .5);
  context.translate(parseInt(this.canvas.width*.5), parseInt(this.canvas.height*.5));
  context.scale(this.camera.scale, this.camera.scale);
  context.translate(parseInt(-this.camera.pos.x*Display.TEXRES), parseInt(-this.camera.pos.y*Display.TEXRES));
  
  /* Draw Game */
  this.drawMap(false); // Render background
  this.drawObject();
  this.drawMap(true);  // Render foreground
  this.drawEffect();
  
  /* Draw UI */
  context.restore();
  this.drawUI();
};

Display.prototype.drawMap = function(depth) {
  var context = this.context; // Sanity
  
  var tex = this.resource.getTexture("map");
  var zone = this.game.getZone();
  var dim = zone.dimensions();
  
  /* Culling */
  var w = ((this.canvas.width/Display.TEXRES)*.55)/this.camera.scale;
  var cx0 = Math.max(0, Math.min(dim.x, parseInt(this.camera.pos.x - w)));
  var cx1 = Math.max(0, Math.min(dim.x, parseInt(this.camera.pos.x + w)));
  
  for(var i=0;i<zone.data.length;i++) {
    var row = zone.data[i];
    for(var j=cx0;j<cx1;j++) {
      var t = row[j];
      var td = td32.decode16(t);
      if(td.depth !== depth) { continue; }
      
      var st = util.sprite.getSprite(tex, td.index);
      var bmp = 0;
      var adj = Math.max(0, td.bump-7);
      if(adj > 0) {
        bmp = Math.sin((1.-((adj-2)/8.))*Math.PI)*0.22;
      }
      context.drawImage(tex, st[0], st[1], Display.TEXRES, Display.TEXRES, Display.TEXRES*j, Display.TEXRES*(i-bmp), Display.TEXRES, Display.TEXRES);
    }
  }
};

Display.prototype.drawObject = function() {
  var context = this.context; // Sanity
  
  var zone = this.game.getZone();
  var dim = zone.dimensions();
  
  /* Culling Bounds */
  var w = ((this.canvas.width/Display.TEXRES)*.6)/this.camera.scale;
  var cx0 = Math.max(0, Math.min(dim.x, parseInt(this.camera.pos.x - w)));
  var cx1 = Math.max(0, Math.min(dim.x, parseInt(this.camera.pos.x + w)));
  
  var sprites = [];
  var texts = [];
  for(var i=0;i<this.game.objects.length;i++) {
    var obj = this.game.objects[i];
    if(obj.level === zone.level && obj.zone === zone.id && obj.pid !== this.game.pid) {
      if(obj.pos.x >= cx0 && obj.pos.x <= cx1) {
        if(obj.write) { obj.write(texts); }
        if(obj.draw) { obj.draw(sprites); }
      }
    }
  }
  
  var ply = this.game.getPlayer();
  if(ply && ply.level === zone.level && ply.zone === zone.id) { ply.draw(sprites); ply.write(texts); } // Draw our character last.
  
  var tex = this.resource.getTexture("obj");
  
  for(var i=0;i<sprites.length;i++) {
    var sprite = sprites[i];
    
    var st = util.sprite.getSprite(tex, sprite.index);
    var rx = !!sprite.reverse, ry = false;
    var x, y;
    
    var rest = false;
    switch(sprite.mode) {
      case 0x00 : { break; }  // Standard
      case 0x01 : { context.save(); rest = true; context.globalAlpha = .5; break; }  // 50% Transparent
      case 0x02 : { if(parseInt(this.game.frame*.5) % 2 === 0) { context.save(); rest = true; context.globalCompositeOperation = "lighter"; } break; }  // Flashing Composite
      case 0x03 : { ry = true; break; } // Vertical mirror
      default : { if(sprite.mode >= 0xA0 && sprite.mode < 0xC0) { context.save(); rest = true; context.globalAlpha = parseFloat(sprite.mode-0xA0)/32.; break; } } // Transparency settings
    }
    
    if(rx || ry) { context.save(); context.scale(rx?-1.:1., ry?-1.:1.); }
    x = rx?((-1.*(Display.TEXRES*sprite.pos.x))-Display.TEXRES):(Display.TEXRES*sprite.pos.x);
    y = ry?((-1.*(Display.TEXRES*(dim.y-sprite.pos.y-1.)))-Display.TEXRES):(Display.TEXRES*(dim.y-sprite.pos.y-1.));

    context.drawImage(tex, st[0], st[1], Display.TEXRES, Display.TEXRES, x, y, Display.TEXRES, Display.TEXRES);
    
    if(rx || ry) { context.restore(); }
    if(rest) { context.restore(); }
  }
  
  for(var i=0;i<texts.length;i++) {
    var txt = texts[i];
    var x = (Display.TEXRES*txt.pos.x)+(Display.TEXRES*.5);
    var y = (Display.TEXRES*(dim.y-txt.pos.y-1.))+(Display.TEXRES*.5);
    
    context.fillStyle = txt.color;
    context.font = (txt.size*Display.TEXRES) + "px SmbWeb";
    context.textAlign = "center";
    context.fillText(txt.text, x, y);
  }
};

Display.prototype.drawEffect = function() {
  var context = this.context; // Sanity
  
  var zone = this.game.getZone();
  var dim = zone.dimensions();
  
  var texMap = this.resource.getTexture("map");
  var texObj = this.resource.getTexture("obj");
  
  var fxs = [];
  zone.getEffects(fxs);
  
  for(var i=0;i<fxs.length;i++) {
    var fx = fxs[i];
    
    var tex;
    switch(fx.tex) {
      case "map" : { tex = texMap; break; }
      case "obj" : { tex = texObj; break; }
    }
    
    var st = util.sprite.getSprite(tex, fx.ind);
    st[0] = parseInt(st[0] + (fx.sp.x * Display.TEXRES));
    st[1] = parseInt(st[1] + (fx.sp.y * Display.TEXRES));
    
    context.save();
    context.translate(parseInt(Display.TEXRES*fx.ss.x*.5), parseInt(Display.TEXRES*fx.ss.y*.5));
    context.translate(Display.TEXRES*fx.pos.x, Display.TEXRES*(dim.y-fx.pos.y-1.));
    context.rotate(fx.rot);
    context.translate(-parseInt(Display.TEXRES*fx.ss.x*.5), -parseInt(Display.TEXRES*fx.ss.y*.5));
    context.drawImage(tex, st[0], st[1], parseInt(Display.TEXRES*fx.ss.x), parseInt(Display.TEXRES*fx.ss.y), 0, 0, parseInt(Display.TEXRES*fx.ss.x), parseInt(Display.TEXRES*fx.ss.y));
    context.restore();
  }
  
};

Display.prototype.drawUI = function() {
  var context = this.context; // Sanity
  var W = this.canvas.width;
  var H = this.canvas.height;
  var COIN = [0x00F0, 0x00F1, 0x00F2, 0x00F1];
  var PLAY = 0x000D;
  var SFX = [0x00FC, 0x00FA];
  var MUSIC = [0x00FB, 0x00F9];
  var PAD = 0x00F8;
  var c = COIN[parseInt(this.game.frame/3) % COIN.length];
  var tex = this.resource.getTexture("obj");
  var ply = this.game.getPlayerInfo(this.game.pid);
  
  var level;
  if(this.game.levelWarpId !== undefined) { level = this.game.world.getLevel(this.game.levelWarpId); }
  else if(this.game.startDelta === undefined) { level = this.game.world.getInitialLevel(); }
  
  if(this.game.gameOver) {
    context.fillStyle = "black";
    context.fillRect(0,0,W,H);
    
    context.fillStyle = "white";
    context.font = "32px SmbWeb";
    context.textAlign = "center";
    context.fillText("GAME OVER", W*.5, H*.5);
  }
  else if(level) {
    context.fillStyle = "black";
    context.fillRect(0,0,W,H);
    
    context.fillStyle = "white";
    context.font = "32px SmbWeb";
    context.textAlign = "center";
    context.fillText(level.name, W*.5, H*.5);
    
    if(this.game.startTimer >= 0) {
      context.font = "24px SmbWeb";
      context.textAlign = "center";
      context.fillText("GAME STARTS IN: " + parseInt(this.game.startTimer/30), W*.5, (H*.5)+40);
    }
  }
  
  if(this.game.victory > 0) {
    context.fillStyle = "white";
    context.font = "32px SmbWeb";
    context.textAlign = "center";
    context.fillText((this.game.victory<=3?"VICTORY ROYALE #":"TOO BAD #") + this.game.victory, W*.5, 40);
  }
  else {
    context.fillStyle = "white";
    context.font = "24px SmbWeb";
    context.textAlign = "left";
    context.fillText((ply?ply.name:"INFRINGIO"), 8, 32);
    var st = util.sprite.getSprite(tex, c);
    var ctxt = "x"+(this.game.coins<=9?"0"+this.game.coins:this.game.coins);
    context.drawImage(tex, st[0], st[1], Display.TEXRES, Display.TEXRES, 4, 40, 24, 24);
    context.fillText(ctxt, 30, 64);
    var st = util.sprite.getSprite(tex, PLAY);
    var l = context.measureText(ctxt).width + 30;
    context.drawImage(tex, st[0], st[1], Display.TEXRES, Display.TEXRES, 4+l+16, 40, 24, 24);
    context.fillText("x"+(this.game.lives<=9?"0"+this.game.lives:this.game.lives), 4+l+16+26, 64);
    var w;
    if(this.game instanceof Game) {
      var txt = this.game.remain + " PLAYERS REMAIN";
      w = context.measureText(txt).width;
      context.fillText(txt, W-w-8, 32);
    }
    else if(this.game instanceof Lobby) {
      var txt = this.game.players.length + " / 75 PLAYERS";
      w = context.measureText(txt).width;
      context.fillText(txt, W-w-8, 32);
    }
    var st = util.sprite.getSprite(tex, MUSIC[this.game.audio.muteMusic?1:0]);
    context.drawImage(tex, st[0], st[1], Display.TEXRES, Display.TEXRES, W-24-8, 40, 24, 24);
    var st = util.sprite.getSprite(tex, SFX[this.game.audio.muteSound?1:0]);
    context.drawImage(tex, st[0], st[1], Display.TEXRES, Display.TEXRES, W-24-8-24-8, 40, 24, 24);
    if(this.game.input.pad.connected()) {
      var st = util.sprite.getSprite(tex, PAD);
      context.drawImage(tex, st[0], st[1], Display.TEXRES, Display.TEXRES, W-24-8-24-8-24-8, 40, 24, 24);
    }
  }
};

Display.prototype.drawLoad = function() {
  var context = this.context;
  var W = this.canvas.width;
  var H = this.canvas.height;
  
  context.fillStyle = "black";
  context.fillRect(0,0,W,H);
  
  context.font = "32px SmbWeb";
  context.fillStyle = "white";
  context.textAlign = "center";
  context.fillText("Loading Resources...", W*.5, H*.5);
};

Display.prototype.destroy = function() {
  
};