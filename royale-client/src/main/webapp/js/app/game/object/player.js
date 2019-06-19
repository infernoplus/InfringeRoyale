"use strict";
/* global util, vec2, squar, td32 */
/* global GameObject, MushroomObject, PoisonObject, FlowerObject, StarObject, LifeObject, CoinObject, AxeObject, FireballProj, PlantObject */
/* global NET011, NET013, NET017, NET018, NET020 */

function CheepCheepObject(game, level, zone, pos, pid) {
  GameObject.call(this, game, level, zone, pos);
  
  this.pid = pid; // Unique Player ID
  
  /* Animation */
  this.anim = 0;
  this.reverse = false;
  this.arrowFade = 0.;
  
  /* Dead */
  this.deadFreezeTimer = 0;
  this.deadTimer = 0;
  
  /* Physics */
  this.lastPos = this.pos;   // Position of mario on previous frame
  this.dim = vec2.make(1., 1.);
  this.moveSpeed = 0;
  this.fallSpeed = 0;
  this.jumping = -1;
  this.isBounce = false;  // True if the jump we are doing was a bounce
  this.isSpring = false;  // True if the jump we are doing was a spring launch
  this.grounded = false;
  
  /* Var */
  this.name = undefined;     // If this is set for whatever reason, it will display a name tag over this player.
  
  this.power = 0;            // Powerup Index
  this.starTimer = 0;        // Star powerup active timer
  this.starMusic = undefined;
  this.damageTimer = 0;      // Post damage invincibility timer
  
  this.tfmTimer = 0;
  this.tfmTarget = -1;
  
  this.pipeWarp = undefined; // Warp point that the pipe we are using is linked to
  this.pipeTimer = 0;        // Timer for warp pipe animation
  this.pipeDir = -1;  // Direction of current anim.  null up down left right = -1 0 1 2 3
  this.pipeExt = -1;  // Direction of the exit pipe. null up down left right = -1 0 1 2 3
  this.pipeDelay = 0;
  this.pipeDelayLength = 0;  // Set by the last pipe we went in.
  
  this.poleTimer = 0; // Timer used for flag pole
  this.poleWait = false;  // True when waiting for flag to come all the way down
  this.poleSound = false; // True after it plays. Resets after pole slide done;
  
  this.vineWarp = undefined; // The warp id that we are going to warp to when we climb up this vine
  
  this.attackCharge = CheepCheepObject.MAX_CHARGE;
  this.attackTimer = 0;
  
  this.autoTarget = undefined; // Vec2 target for automatic movement.
  
  /* Control */
  this.btnD = [0,0]; // D-Pad
  this.btnA = false;
  this.btnB = false;
  this.btnBg = false; // More hacky stuff. last b state while grounded
  this.btnBde = false; // Pressed
  
  /* State */
  this.setState(CheepCheepObject.SNAME.STAND);
}


/* === STATIC =============================================================== */
CheepCheepObject.ASYNC = false;
CheepCheepObject.ID = 0x01;
CheepCheepObject.NAME = "PLAYER"; // Used by editor

CheepCheepObject.ANIMATION_RATE = 3;
CheepCheepObject.DIM_OFFSET = vec2.make(-.05, 0.);

CheepCheepObject.DEAD_FREEZE_TIME = 7;
CheepCheepObject.DEAD_TIME = 70;
CheepCheepObject.DEAD_UP_FORCE = 0.65;

CheepCheepObject.RUN_SPEED_MAX = 0.315; // VARIABLE FLATTENED INTO CODE FOR ANTI CHEAT
CheepCheepObject.MOVE_SPEED_MAX = 0.215; // VARIABLE FLATTENED INTO CODE FOR ANTI CHEAT
CheepCheepObject.MOVE_SPEED_ACCEL = 0.0125; // VARIABLE FLATTENED INTO CODE FOR ANTI CHEAT
CheepCheepObject.MOVE_SPEED_DECEL = 0.0225;
CheepCheepObject.MOVE_SPEED_ACCEL_AIR = 0.0025;
CheepCheepObject.STUCK_SLIDE_SPEED = 0.08;

CheepCheepObject.FALL_SPEED_MAX = 0.45; // VARIABLE FLATTENED INTO CODE FOR ANTI CHEAT
CheepCheepObject.FALL_SPEED_ACCEL = 0.085; // VARIABLE FLATTENED INTO CODE FOR ANTI CHEAT
CheepCheepObject.BOUNCE_LENGTH_MIN = 1;
CheepCheepObject.SPRING_LENGTH_MIN = 5;
CheepCheepObject.SPRING_LENGTH_MAX = 14; // VARIABLE FLATTENED INTO CODE FOR ANTI CHEAT
CheepCheepObject.JUMP_LENGTH_MIN = 3;
CheepCheepObject.JUMP_LENGTH_MAX = 7;  // VARIABLE FLATTENED INTO CODE FOR ANTI CHEAT
CheepCheepObject.JUMP_SPEED_INC_THRESHOLD = [0.1, 0.2, 0.25];
CheepCheepObject.JUMP_DECEL = 0.005; 
CheepCheepObject.BLOCK_BUMP_THRESHOLD = 0.12;

CheepCheepObject.POWER_INDEX_SIZE = 0x20;
CheepCheepObject.GENERIC_INDEX = 0x60;

CheepCheepObject.DAMAGE_TIME = 45;
CheepCheepObject.TRANSFORM_TIME = 18;
CheepCheepObject.TRANSFORM_ANIMATION_RATE = 2;
CheepCheepObject.STAR_LENGTH = 360;
CheepCheepObject.PROJ_OFFSET = vec2.make(0.75, 1.5);
CheepCheepObject.MAX_CHARGE = 60;
CheepCheepObject.ATTACK_DELAY = 7;
CheepCheepObject.ATTACK_CHARGE = 25;
CheepCheepObject.ATTACK_ANIM_LENGTH = 3;

CheepCheepObject.PIPE_TIME = 30; // VARIABLE FLATTENED INTO CODE FOR ANTI CHEAT
CheepCheepObject.PIPE_SPEED = 0.06; // VARIABLE FLATTENED INTO CODE FOR ANTI CHEAT
CheepCheepObject.PIPE_EXT_OFFSET = vec2.make(.5,0.); // Horizontal offset from warp point when exiting warp pipe.
CheepCheepObject.WEED_EAT_RADIUS = 3;

CheepCheepObject.POLE_DELAY = 15; // VARIABLE FLATTENED INTO CODE FOR ANTI CHEAT
CheepCheepObject.POLE_SLIDE_SPEED = 0.15; // VARIABLE FLATTENED INTO CODE FOR ANTI CHEAT
CheepCheepObject.LEVEL_END_MOVE_OFF = vec2.make(10, 0); // Position offset for where auto walk to at the end of a level.

CheepCheepObject.CLIMB_SPEED = 0.125;

CheepCheepObject.PLATFORM_SNAP_DIST = 0.15;

CheepCheepObject.ARROW_SPRITE = 0x0FD;
CheepCheepObject.ARROW_TEXT = "YOU";
CheepCheepObject.ARROW_OFFSET = vec2.make(0., 0.1);
CheepCheepObject.TEXT_OFFSET = vec2.make(0., 0.55);
CheepCheepObject.TEXT_SIZE = .65;
CheepCheepObject.TEXT_COLOR = "#FFFFFF";
CheepCheepObject.ARROW_RAD_IN = 3;
CheepCheepObject.ARROW_RAD_OUT = 7;
CheepCheepObject.ARROW_THRESHOLD_MIN = 4;
CheepCheepObject.ARROW_THRESHOLD_MAX = 6;

CheepCheepObject.TEAM_OFFSET = vec2.make(0., 0.);
CheepCheepObject.TEAM_SIZE = .3;
CheepCheepObject.TEAM_COLOR = "rgba(255,255,255,0.75)";

CheepCheepObject.SPRITE = {};
CheepCheepObject.SPRITE_LIST = [
  /* [S]mall mario */
  {NAME: "S_STAND", ID: 0x00, INDEX: 0x000D},
  {NAME: "S_RUN0", ID: 0x01, INDEX: 0x000A},
  {NAME: "S_RUN1", ID: 0x02, INDEX: 0x000B},
  {NAME: "S_RUN2", ID: 0x03, INDEX: 0x000C},
  {NAME: "S_SLIDE", ID: 0x04, INDEX: 0x0009},
  {NAME: "S_FALL", ID: 0x05, INDEX: 0x0008},
  {NAME: "S_CLIMB0", ID: 0x06, INDEX: 0x0006},
  {NAME: "S_CLIMB1", ID: 0x07, INDEX: 0x0007},
  /* [B]ig mario */
  {NAME: "B_STAND", ID: 0x20, INDEX: [[0x002D], [0x01D]]}, 
  {NAME: "B_DOWN", ID: 0x21, INDEX: [[0x002C], [0x01C]]},
  {NAME: "B_RUN0", ID: 0x22, INDEX: [[0x0029], [0x019]]},
  {NAME: "B_RUN1", ID: 0x23, INDEX: [[0x002A], [0x01A]]},
  {NAME: "B_RUN2", ID: 0x24, INDEX: [[0x002B], [0x01B]]},
  {NAME: "B_SLIDE", ID: 0x25, INDEX: [[0x0028], [0x018]]},
  {NAME: "B_FALL", ID: 0x26, INDEX: [[0x0027], [0x017]]},
  {NAME: "B_CLIMB0", ID: 0x27, INDEX: [[0x0025], [0x015]]},
  {NAME: "B_CLIMB1", ID: 0x28, INDEX: [[0x0026], [0x016]]},
  {NAME: "B_TRANSFORM", ID:0x29, INDEX:[[0x002E], [0x01E]]},
  /* [F]ire flower mario */
  {NAME: "F_STAND", ID: 0x40, INDEX: [[0x004D], [0x03D]]}, 
  {NAME: "F_DOWN", ID: 0x41, INDEX: [[0x004C], [0x03C]]},
  {NAME: "F_RUN0", ID: 0x42, INDEX: [[0x0049], [0x039]]},
  {NAME: "F_RUN1", ID: 0x43, INDEX: [[0x004A], [0x03A]]},
  {NAME: "F_RUN2", ID: 0x44, INDEX: [[0x004B], [0x03B]]},
  {NAME: "F_SLIDE", ID: 0x45, INDEX: [[0x0048], [0x038]]},
  {NAME: "F_FALL", ID: 0x46, INDEX: [[0x0047], [0x037]]},
  {NAME: "F_CLIMB0", ID: 0x47, INDEX: [[0x0045], [0x035]]},
  {NAME: "F_CLIMB1", ID: 0x48, INDEX: [[0x0046], [0x036]]},
  {NAME: "F_ATTACK", ID: 0x49, INDEX: [[0x004F], [0x03F]]},
  {NAME: "F_TRANSFORM", ID:0x50, INDEX:[[0x004E], [0x03E]]},
  /* [G]eneric */
  {NAME: "G_DEAD", ID: 0x60, INDEX: 0x0000},
  {NAME: "G_HIDE", ID: 0x70, INDEX: 0x000E}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<CheepCheepObject.SPRITE_LIST.length;i++) {
  CheepCheepObject.SPRITE[CheepCheepObject.SPRITE_LIST[i].NAME] = CheepCheepObject.SPRITE_LIST[i];
  CheepCheepObject.SPRITE[CheepCheepObject.SPRITE_LIST[i].ID] = CheepCheepObject.SPRITE_LIST[i];
}

/* State Name */
CheepCheepObject.SNAME = {
  STAND: "STAND",
  DOWN: "DOWN",
  RUN: "RUN",
  SLIDE: "SLIDE",
  FALL: "FALL",
  POLE: "POLE",
  CLIMB: "CLIMB",
  ATTACK: "ATTACK",
  TRANSFORM: "TRANSFORM",
  DEAD: "DEAD",
  HIDE: "HIDE",
  GHOST: "GHOST",
  DEADGHOST: "DEADGHOST"
};

let DIM0 = vec2.make(0.9,0.95);  // Temp vars
let DIM1 = vec2.make(0.9,1.9);
CheepCheepObject.STATE = [
  /* Small Mario -> 0x00*/
  {NAME: CheepCheepObject.SNAME.STAND, ID: 0x00, DIM: DIM0, SPRITE: [CheepCheepObject.SPRITE.S_STAND]},
  {NAME: CheepCheepObject.SNAME.DOWN, ID: 0x01, DIM: DIM0, SPRITE: [CheepCheepObject.SPRITE.S_STAND]},
  {NAME: CheepCheepObject.SNAME.RUN, ID: 0x02, DIM: DIM0, SPRITE: [CheepCheepObject.SPRITE.S_RUN2,CheepCheepObject.SPRITE.S_RUN1,CheepCheepObject.SPRITE.S_RUN0]},
  {NAME: CheepCheepObject.SNAME.SLIDE, ID: 0x03, DIM: DIM0, SPRITE: [CheepCheepObject.SPRITE.S_SLIDE]},
  {NAME: CheepCheepObject.SNAME.FALL, ID: 0x04, DIM: DIM0, SPRITE: [CheepCheepObject.SPRITE.S_FALL]},
  {NAME: CheepCheepObject.SNAME.TRANSFORM, ID: 0x05, DIM: DIM0, SPRITE: [CheepCheepObject.SPRITE.S_STAND]},
  {NAME: CheepCheepObject.SNAME.POLE, ID: 0x06, DIM: DIM0, SPRITE: [CheepCheepObject.SPRITE.S_CLIMB1]},
  {NAME: CheepCheepObject.SNAME.CLIMB, ID: 0x07, DIM: DIM0, SPRITE: [CheepCheepObject.SPRITE.S_CLIMB0,CheepCheepObject.SPRITE.S_CLIMB1]},
  /* Big Mario -> 0x20 */
  {NAME: CheepCheepObject.SNAME.STAND, ID: 0x20, DIM: DIM1, SPRITE: [CheepCheepObject.SPRITE.B_STAND]},
  {NAME: CheepCheepObject.SNAME.DOWN, ID: 0x21, DIM: DIM0, SPRITE: [CheepCheepObject.SPRITE.B_DOWN]},
  {NAME: CheepCheepObject.SNAME.RUN, ID: 0x22, DIM: DIM1, SPRITE: [CheepCheepObject.SPRITE.B_RUN2,CheepCheepObject.SPRITE.B_RUN1,CheepCheepObject.SPRITE.B_RUN0]},
  {NAME: CheepCheepObject.SNAME.SLIDE, ID: 0x23, DIM: DIM1, SPRITE: [CheepCheepObject.SPRITE.B_SLIDE]},
  {NAME: CheepCheepObject.SNAME.FALL, ID: 0x24, DIM: DIM1, SPRITE: [CheepCheepObject.SPRITE.B_FALL]},
  {NAME: CheepCheepObject.SNAME.TRANSFORM, ID: 0x25, DIM: DIM0, SPRITE: [CheepCheepObject.SPRITE.B_TRANSFORM]},
  {NAME: CheepCheepObject.SNAME.POLE, ID: 0x26, DIM: DIM1, SPRITE: [CheepCheepObject.SPRITE.B_CLIMB0]},
  {NAME: CheepCheepObject.SNAME.CLIMB, ID: 0x27, DIM: DIM1, SPRITE: [CheepCheepObject.SPRITE.B_CLIMB0,CheepCheepObject.SPRITE.B_CLIMB1]},
  /* Fire Mario -> 0x40 */
  {NAME: CheepCheepObject.SNAME.STAND, ID: 0x40, DIM: DIM1, SPRITE: [CheepCheepObject.SPRITE.F_STAND]},
  {NAME: CheepCheepObject.SNAME.DOWN, ID: 0x41, DIM: DIM0, SPRITE: [CheepCheepObject.SPRITE.F_DOWN]},
  {NAME: CheepCheepObject.SNAME.RUN, ID: 0x42, DIM: DIM1, SPRITE: [CheepCheepObject.SPRITE.F_RUN2,CheepCheepObject.SPRITE.F_RUN1,CheepCheepObject.SPRITE.F_RUN0]},
  {NAME: CheepCheepObject.SNAME.SLIDE, ID: 0x43, DIM: DIM1, SPRITE: [CheepCheepObject.SPRITE.F_SLIDE]},
  {NAME: CheepCheepObject.SNAME.FALL, ID: 0x44, DIM: DIM1, SPRITE: [CheepCheepObject.SPRITE.F_FALL]},
  {NAME: CheepCheepObject.SNAME.ATTACK, ID: 0x45, DIM: DIM1, SPRITE: [CheepCheepObject.SPRITE.F_ATTACK]},
  {NAME: CheepCheepObject.SNAME.TRANSFORM, ID: 0x46, DIM: DIM0, SPRITE: [CheepCheepObject.SPRITE.F_TRANSFORM]},
  {NAME: CheepCheepObject.SNAME.POLE, ID: 0x47, DIM: DIM1, SPRITE: [CheepCheepObject.SPRITE.F_CLIMB0]},
  {NAME: CheepCheepObject.SNAME.CLIMB, ID: 0x48, DIM: DIM1, SPRITE: [CheepCheepObject.SPRITE.F_CLIMB0,CheepCheepObject.SPRITE.F_CLIMB1]},
  /* Generic -> 0x60 */
  {NAME: CheepCheepObject.SNAME.DEAD, DIM: DIM0, ID: 0x60, SPRITE: [CheepCheepObject.SPRITE.G_DEAD]},
  {NAME: CheepCheepObject.SNAME.HIDE, DIM: DIM0, ID: 0x70, SPRITE: [CheepCheepObject.SPRITE.G_HIDE]},
  {NAME: CheepCheepObject.SNAME.GHOST, DIM: DIM0, ID: 0xFF, SPRITE: []},
  {NAME: CheepCheepObject.SNAME.DEADGHOST, DIM: DIM0, ID: 0xFE, SPRITE: [CheepCheepObject.SPRITE.G_DEAD]}
];

/* === INSTANCE ============================================================= */

CheepCheepObject.prototype.update = function(data) {
  if(this.dead || this.garbage) { return; } // Don't do ghost playback if character is dead
  
  /* Ghost playback update */
  this.setState(CheepCheepObject.SNAME.GHOST);
  this.level = data.level;
  this.zone = data.zone;
  this.pos = data.pos;
  this.sprite = CheepCheepObject.SPRITE[data.sprite];
  this.reverse = data.reverse;
};

CheepCheepObject.prototype.trigger = function(type) {
  switch(type) {
    case 0x01 : { this.attack(); break; }
    case 0x02 : { this.star(); break; }
  }
};

CheepCheepObject.prototype.step = function() {
  if(this.starTimer > 0) { this.starTimer--; }
  else if(this.starMusic) { this.starMusic.stop(); this.starMusic = undefined; }
  
  /* Ghost playback */
  if(this.isState(CheepCheepObject.SNAME.GHOST)) { this.sound(); return; }
  
  /* Player Hidden */
  if(this.isState(CheepCheepObject.SNAME.HIDE)) { return; }
    
  /* Flagpole Slide */
  if(this.isState(CheepCheepObject.SNAME.POLE)) {
    if(this.poleTimer > 0 && !this.poleWait) { this.poleTimer--; return; }
    else if(!this.poleSound) { this.poleSound = true; this.play("sfx/flagpole.wav", 1., 0.); }
        
    if(this.poleWait) { }
    else if(this.poleTimer <= 0 && this.autoTarget) { this.setState(CheepCheepObject.SNAME.STAND); }
    else {
      var mov = vec2.add(this.pos, vec2.make(0., -0.15));
      var ext1 = vec2.make(this.pos.x, this.pos.y-0.15);
      var ext2 = vec2.make(this.dim.x, this.dim.y+0.15);

      var tiles = this.game.world.getZone(this.level, this.zone).getTiles(ext1, ext2);
      var tdim = vec2.make(1., 1.);

      var hit = false;
      for(var i=0;i<tiles.length;i++) {
        var tile = tiles[i];
        if(squar.intersection(tile.pos, tdim, mov, this.dim) && tile.definition.COLLIDE) { hit = true; break; }
      }
      
      if(hit) {
        this.poleTimer = 15;
        this.autoTarget = vec2.add(mov, CheepCheepObject.LEVEL_END_MOVE_OFF);
        this.poleWait = true;
      }
      else { this.pos = mov; }
    }
    
    var flag = this.game.getFlag(this.level, this.zone);
    if(flag.pos.y - 0.15 >= this.pos.y) { flag.pos.y -= 0.15; }
    else { flag.pos.y = this.pos.y; this.poleWait = false; }
    
    return;
  }
  
  /* Anim */
  if(this.isState(CheepCheepObject.SNAME.RUN)) { this.anim += Math.max(.5, Math.abs(this.moveSpeed*5)); }
  else { this.anim++; }
  this.sprite = this.state.SPRITE[parseInt(parseInt(this.anim)/CheepCheepObject.ANIMATION_RATE) % this.state.SPRITE.length];
  
  /* Climb a vine */
  if(this.isState(CheepCheepObject.SNAME.CLIMB)) {
    this.pos.y += CheepCheepObject.CLIMB_SPEED;
    if(this.pos.y >= this.game.world.getZone(this.level, this.zone).dimensions().y) {
      this.warp(this.vineWarp);
      this.setState(CheepCheepObject.SNAME.FALL);
    }
    return;
  }
  
  /* Dead */
  if(this.isState(CheepCheepObject.SNAME.DEAD) || this.isState(CheepCheepObject.SNAME.DEADGHOST)) {
    if(this.deadFreezeTimer > 0) { this.deadFreezeTimer--; }
    else if(this.deadTimer > 0) {
      this.deadTimer--;
      this.pos.y += this.fallSpeed;
      this.fallSpeed = Math.max(this.fallSpeed - 0.085, -0.45);
    }
    else { this.destroy(); }
    return;
  }
  
  /* Transform */
  if(this.isState(CheepCheepObject.SNAME.TRANSFORM)) {
    if(--this.tfmTimer > 0) {
      var ind = parseInt(this.anim/CheepCheepObject.TRANSFORM_ANIMATION_RATE) % 3;
      var high = this.power>this.tfmTarget?this.power:this.tfmTarget;
      switch(ind) {
        case 0 : { this.sprite = this.getStateByPowerIndex(CheepCheepObject.SNAME.STAND, this.power).SPRITE[0]; break; }
        case 1 : { this.sprite = this.getStateByPowerIndex(CheepCheepObject.SNAME.TRANSFORM, high).SPRITE[0]; break; }
        case 2 : { this.sprite = this.getStateByPowerIndex(CheepCheepObject.SNAME.STAND, this.tfmTarget).SPRITE[0]; break; }
      }
    }
    else {
      this.power = this.tfmTarget;
      this.tfmTarget = -1;
      this.setState(CheepCheepObject.SNAME.STAND);
      if(this.collisionTest(this.pos, this.dim)) { this.setState(CheepCheepObject.SNAME.DOWN); }
      this.damageTimer = CheepCheepObject.DAMAGE_TIME;
    }
    return;
  }
  
  /* Warp Pipe */
  if(this.pipeDelay > 0) { this.pipeDelay--; return; }
  if(this.pipeTimer > 0 && this.pipeDelay <= 0) {
    if(this.pipeTimer >= 30) { this.play("sfx/pipe.wav", 1., .04); }
    switch(this.pipeDir) {
      case 1 : { this.pos.y += 0.06; break; }
      case 2 : { this.pos.y -= 0.06; break; }
      case 3 : { this.pos.x -= 0.06; break; }
      case 4 : { this.pos.x += 0.06; break; }
    }
    if(--this.pipeTimer === 1 && this.pipeWarp) { this.pipeDelay = this.pipeDelayLength; }
    if(this.pipeTimer <= 0 && this.pipeWarp) {
      this.warp(this.pipeWarp);
      this.weedeat();
      this.pipeWarp = undefined;
      switch(this.pipeExt) {
        case 1 : { this.pos.y -= ((30-1)*0.06); this.setState(CheepCheepObject.SNAME.STAND); this.pos = vec2.add(this.pos, CheepCheepObject.PIPE_EXT_OFFSET); break; }
        case 2 : { this.pos.y += ((30-1)*0.06); this.setState(CheepCheepObject.SNAME.STAND); this.pos = vec2.add(this.pos, CheepCheepObject.PIPE_EXT_OFFSET); break; }
        case 3 : { this.pos.x -= ((30-1)*0.06); this.setState(CheepCheepObject.SNAME.RUN); break; }
        case 4 : { this.pos.x += ((30-1)*0.06); this.setState(CheepCheepObject.SNAME.RUN); break; }
        default : { return; }
      }
      this.pipeTimer = 30;
      this.pipeDir = this.pipeExt;
      this.pipeDelay = this.pipeDelayLength;
    }
    return;
  }
  
  /* Normal Gameplay */
  this.lastPos = this.pos;
  
  if(this.damageTimer > 0) { this.damageTimer--; }
  if(this.attackCharge < CheepCheepObject.MAX_CHARGE) { this.attackCharge++; }
  if(this.attackTimer > 0) { this.attackTimer--; }
  
  if(this.autoTarget) { this.autoMove(); }  
  this.control();
  this.physics();
  this.interaction();
  this.arrow();
  this.sound();
  
  if(this.pos.y < 0.) { this.kill(); }
};

/* Handles player input */
CheepCheepObject.prototype.input = function(dir, a, b) {
  this.btnD = dir;
  this.btnA = a;
  this.btnB = b;
};

/* Handles auto input */
CheepCheepObject.prototype.autoMove = function() {
  this.btnD = [0,0];
  this.btnA = false; this.btnB = false;
  
  if(Math.abs(this.pos.x-this.autoTarget.x) >= 0.1) {
    this.btnD = [this.pos.x-this.autoTarget.x<=0?1:-1,0];
  }
  else if(Math.abs(this.moveSpeed) < 0.01){
    this.btnA = this.pos.y-this.autoTarget.y<-.5;
  }
};

CheepCheepObject.prototype.control = function() {
  if(this.grounded) { this.btnBg = this.btnB; }
  
  if(this.isState(CheepCheepObject.SNAME.DOWN) && this.collisionTest(this.pos, this.getStateByPowerIndex(CheepCheepObject.SNAME.STAND, this.power).DIM)) {
    if(this.btnD[1] !== -1) {
      this.moveSpeed = (this.moveSpeed + CheepCheepObject.STUCK_SLIDE_SPEED) * .5; // Rirp
    }
    this.moveSpeed = Math.sign(this.moveSpeed) * Math.max(Math.abs(this.moveSpeed)-CheepCheepObject.MOVE_SPEED_DECEL, 0);
    return;
  }
  
  if(this.btnD[0] !== 0) {
    if(Math.abs(this.moveSpeed) > 0.01 && !(this.btnD[0] >= 0 ^ this.moveSpeed < 0)) {
      this.moveSpeed += CheepCheepObject.MOVE_SPEED_DECEL * this.btnD[0];
      this.setState(CheepCheepObject.SNAME.SLIDE);
    }
    else {
      this.moveSpeed = this.btnD[0] * Math.min(Math.abs(this.moveSpeed) + 0.0125, this.btnBg?0.315:0.215);
      this.setState(CheepCheepObject.SNAME.RUN);
    }
    if(this.grounded) { this.reverse = this.btnD[0] >= 0; }
  }
  else {
    if(Math.abs(this.moveSpeed) > 0.01) {
      this.moveSpeed = Math.sign(this.moveSpeed) * Math.max(Math.abs(this.moveSpeed)-CheepCheepObject.MOVE_SPEED_DECEL, 0);
      this.setState(CheepCheepObject.SNAME.RUN);
    }
    else {
      this.moveSpeed = 0;
      this.setState(CheepCheepObject.SNAME.STAND);
    }
    if(this.btnD[1] === -1) {
      this.setState(CheepCheepObject.SNAME.DOWN);
    }
  }
  
  var jumpMax = this.isSpring?14:7;
  var jumpMin = this.isSpring?CheepCheepObject.SPRING_LENGTH_MIN:(this.isBounce?CheepCheepObject.BOUNCE_LENGTH_MIN:CheepCheepObject.JUMP_LENGTH_MIN);
  
  for(var i=0;i<CheepCheepObject.JUMP_SPEED_INC_THRESHOLD.length&&Math.abs(this.moveSpeed)>=CheepCheepObject.JUMP_SPEED_INC_THRESHOLD[i];i++) { jumpMax++; }
  
  if(this.btnA) {
    if(this.grounded) {
      this.jumping = 0;
      this.play(this.power>0?"sfx/jump1.wav":"sfx/jump0.wav", .7, .04);
    }
    if(this.jumping > jumpMax) {
      this.jumping = -1;
    }
  }
  else {
    if(this.jumping > jumpMin) {
      this.jumping = -1;
    }
  }
  
  if(!this.grounded) { this.setState(CheepCheepObject.SNAME.FALL); }
  
  if(this.btnB && !this.btnBde && this.power === 2 && !this.isState(CheepCheepObject.SNAME.DOWN) && !this.isState(CheepCheepObject.SNAME.SLIDE) && this.attackTimer < 1 && this.attackCharge >= CheepCheepObject.ATTACK_CHARGE) {
    this.attack();
    this.game.out.push(NET013.encode(0x01));
  }
  this.btnBde = this.btnB;
  
  if(this.attackTimer > 0 && this.power === 2 && (this.isState(CheepCheepObject.SNAME.STAND) || this.isState(CheepCheepObject.SNAME.RUN))) {
    this.setState(CheepCheepObject.SNAME.ATTACK);
  }
};

CheepCheepObject.prototype.physics = function() {
  if(this.jumping !== -1) {
    this.fallSpeed = 0.45 - (this.jumping*0.005);
    this.jumping++;
    this.grounded = false;
  }
  else {
    this.isBounce = false;
    this.isSpring = false;
    if(this.grounded) {
      this.fallSpeed = 0;
    }
    this.fallSpeed = Math.max(this.fallSpeed - 0.085, -0.45);
  }
  
  var mov = vec2.add(this.pos, vec2.make(this.moveSpeed, this.fallSpeed));
  
  var ext1 = vec2.make(this.pos.x+Math.min(0, this.moveSpeed), this.pos.y+Math.min(0, this.fallSpeed));
  var ext2 = vec2.make(this.dim.x+Math.max(0, this.moveSpeed), this.dim.y+Math.max(0, this.fallSpeed));
  
  var tiles = this.game.world.getZone(this.level, this.zone).getTiles(ext1, ext2);
  var plats = this.game.getPlatforms();
  var tdim = vec2.make(1., 1.);
  
  var grounded = false;
  var hit = [];
  var on = [];              // Tiles we are directly standing on
  var psh = [];             // Tiles we are directly pushing against
  var bmp = [];             // Tiles we bumped from below when jumping
  var platforms = [];       // All platforms we collided with
  var platform;             // The platform we are actually riding, if applicable.
  
  /* Collect likely hits & handle push */
  for(var i=0;i<tiles.length;i++) {
    var tile = tiles[i];
    if(!tile.definition.COLLIDE) { continue; }
    if(tile.definition.HIDDEN) { hit.push(tile); continue; }
    
    if(squar.intersection(tile.pos, tdim, mov, this.dim) || squar.intersection(tile.pos, tdim, this.pos, this.dim)) {
      if(Math.abs(this.moveSpeed) > 0.01  && this.grounded && this.pos.y <= tile.pos.y) { psh.push(tile); }
      hit.push(tile);
    }
  }
  
  /* Platforms */
  for(var i=0;i<plats.length;i++) {
    var plat = plats[i];
    if(squar.intersection(plat.pos, plat.dim, mov, this.dim)) { platforms.push(plat); }
  }
  
  /* Correct X collision */
  var mvx = vec2.make(mov.x, this.pos.y);
  for(var i=0;i<hit.length;i++) {
    var tile = hit[i];
    if(tile.definition.HIDDEN) { continue; }
    if(!squar.intersection(tile.pos, tdim, mvx, this.dim)) { continue; }
    
    /* +X */
    if(mvx.x + (this.dim.x*.5) < tile.pos.x + (tdim.x*.5)) {
      mvx.x = tile.pos.x - this.dim.x;
      this.moveSpeed *= 0.33;
    }
    /* -X */
    else {
      mvx.x = tile.pos.x + tdim.x;
      this.moveSpeed *= 0.33;
    }
  }
  
  mov.x = mvx.x;
  
  /* Handle bumps && grounding */
  for(var i=0;i<hit.length;i++) {
    var tile = hit[i];
    if(squar.intersection(tile.pos, tdim, mov, this.dim)) {
      if(this.fallSpeed > CheepCheepObject.BLOCK_BUMP_THRESHOLD) { bmp.push(tile); }
      if(this.fallSpeed < 0 && this.pos.y >= tile.pos.y) { on.push(tile); }
    }
  }
  
  /* Correct Y collision */
  for(var i=0;i<hit.length;i++) {
    var tile = hit[i];
    if(!squar.intersection(tile.pos, tdim, mov, this.dim)) { continue; }
    
    /* -Y */
    if(this.pos.y >= mov.y) {
      if(tile.definition.HIDDEN) { continue; }
      mov.y = tile.pos.y + tdim.y;
      this.fallSpeed = 0;
      grounded = true;
    }
    /* +Y */
    else {
      mov.y = tile.pos.y - this.dim.y;
      this.fallSpeed = 0;
    }
  }
  
  for(var i=0;i<platforms.length;i++) {
    var plat = platforms[i];
    if(this.pos.y >= mov.y && (plat.pos.y + plat.dim.y) - this.pos.y < CheepCheepObject.PLATFORM_SNAP_DIST) {
      mov.y = plat.pos.y + plat.dim.y;
      grounded = true;
      platform = plat;
      break;
    }
    else {
      /* Nothing, pass through bottom of platform when going up */
    }
  }
  
  this.grounded = grounded;
  this.pos = mov;
  
  /* On Platform */
  if(platform) {
    platform.riding(this);
  }
  
  /* Tile Touch events */
  for(var i=0;i<tiles.length;i++) {
    var tile = tiles[i];
    if(squar.intersection(tile.pos, tdim, mov, this.dim)) {
      tile.definition.TRIGGER(this.game, this.pid, tile, this.level, this.zone, tile.pos.x, tile.pos.y, td32.TRIGGER.TYPE.TOUCH);
    }
  }
  
  /* Tile Down events */
  if(this.isState(CheepCheepObject.SNAME.DOWN) && this.moveSpeed < 0.05) {
    for(var i=0;i<on.length;i++) {
      var tile = on[i];
      tile.definition.TRIGGER(this.game, this.pid, tile, this.level, this.zone, tile.pos.x, tile.pos.y, td32.TRIGGER.TYPE.DOWN);
    }
  }
  
  /* Tile Push events */
  if(this.isState(CheepCheepObject.SNAME.RUN)) {
    for(var i=0;i<psh.length;i++) {
      var tile = psh[i];
      tile.definition.TRIGGER(this.game, this.pid, tile, this.level, this.zone, tile.pos.x, tile.pos.y, td32.TRIGGER.TYPE.PUSH);
    }
  }
  
  /* Tile Bump events */
  for(var i=0;i<bmp.length;i++) {
    var tile = bmp[i];
    var bty = this.power>0?td32.TRIGGER.TYPE.BIG_BUMP:td32.TRIGGER.TYPE.SMALL_BUMP;
    tile.definition.TRIGGER(this.game, this.pid, tile, this.level, this.zone, tile.pos.x, tile.pos.y, bty);
    this.jumping = -1;
    this.fallSpeed = -CheepCheepObject.BLOCK_BUMP_THRESHOLD;
  }
};

/* Does a collision test in place, returns true if hits something */
/* Used to check if it's okay to standup as big mario */
CheepCheepObject.prototype.collisionTest = function(pos, dim) {
  var tdim = vec2.make(1., 1.);
  var tiles = this.game.world.getZone(this.level, this.zone).getTiles(pos, dim);
  for(var i=0;i<tiles.length;i++) {
    var tile = tiles[i];
    if(!tile.definition.COLLIDE) { continue; }
    
    if(squar.intersection(tile.pos, tdim, pos, dim)) { return true; }
  }
  return false;
};

/* Checks if this object has touched or interacted with any other object */
CheepCheepObject.prototype.interaction = function() {
  for(var i=0;i<this.game.objects.length;i++) {
    var obj = this.game.objects[i];
    if(obj === this || this.dead) { continue; }
    if(obj.level === this.level && obj.zone === this.zone && obj.isTangible()) {
      var hit = squar.intersection(obj.pos, obj.dim, this.pos, this.dim);
      if(hit) {
        if(this.starTimer > 0 && obj.bonk) {
          /* Touch something with Star */
          obj.bonk();
          this.game.out.push(NET020.encode(obj.level, obj.zone, obj.oid, 0x01));
        }
        if(obj instanceof CheepCheepObject && obj.starTimer > 0 && !this.autoTarget) {
          /* Touch other player who has Star */
          this.damage(obj);
          if(this.dead) { this.game.out.push(NET017.encode(obj.pid)); }
        }
        if(this.lastPos.y > obj.pos.y + (obj.dim.y*.66) - Math.max(0., obj.fallSpeed)) {
          /* Stomped */
          if(obj.playerStomp) { obj.playerStomp(this); }
        }
        else if(this.lastPos.y < obj.pos.y) {
          /* Bumped */
          if(obj.playerBump) { obj.playerBump(this); }
        }
        else {
          /* Touched */
          if(obj.playerCollide) { obj.playerCollide(this); }
        }
      }
    }
  }
};

/* Shows or hides the YOU arrow over the player based on crowdedness */
CheepCheepObject.prototype.arrow = function() {
  var pts = 0;
  for(var i=0;i<this.game.objects.length;i++) {
    var obj = this.game.objects[i];
    if(obj !== this && obj instanceof CheepCheepObject && obj.level === this.level && obj.zone === this.zone) {
      pts += 1.-(Math.min(CheepCheepObject.ARROW_RAD_OUT, Math.max(0., vec2.distance(this.pos, obj.pos)-CheepCheepObject.ARROW_RAD_IN))/CheepCheepObject.ARROW_RAD_OUT);
    } 
  }
  this.arrowFade = Math.min(CheepCheepObject.ARROW_THRESHOLD_MAX, Math.max(0., pts-CheepCheepObject.ARROW_THRESHOLD_MIN))/CheepCheepObject.ARROW_THRESHOLD_MAX;
};

CheepCheepObject.prototype.sound = GameObject.prototype.sound;

CheepCheepObject.prototype.attack = function() {
  this.attackTimer = CheepCheepObject.ATTACK_DELAY;
  this.attackCharge -= CheepCheepObject.ATTACK_CHARGE;
  var p = this.reverse?vec2.add(this.pos, CheepCheepObject.PROJ_OFFSET):vec2.add(this.pos, vec2.multiply(CheepCheepObject.PROJ_OFFSET, vec2.make(-1., 1.)));
  this.game.createObject(FireballProj.ID, this.level, this.zone, p, [this.reverse, this.pid]);
  this.play("sfx/fireball.wav", 1., .04);
};

CheepCheepObject.prototype.bounce = function() {
  this.jumping = 0;
  this.isBounce = true;
};

CheepCheepObject.prototype.damage = function(obj) {
  if(
    this.damageTimer > 0 || this.starTimer > 0 ||
    this.isState(CheepCheepObject.SNAME.TRANSFORM) ||
    this.isState(CheepCheepObject.SNAME.CLIMB) ||
    this.isState(CheepCheepObject.SNAME.POLE) ||
    this.pipeWarp || this.pipeTimer > 0 || this.pipeDelay > 0 ||
    this.autoTarget
  ) { return; }
  if(this.power > 0) { this.tfm(0); this.damageTimer = CheepCheepObject.DAMAGE_TIME; }
  else { this.kill(); }
};

/* Temp invuln. Called when player loads into a level to prevent instant spawn kill */
CheepCheepObject.prototype.invuln = function() {
  this.damageTimer = CheepCheepObject.DAMAGE_TIME;
};

CheepCheepObject.prototype.powerup = function(obj) {
  if(obj instanceof MushroomObject && this.power < 1) { this.tfm(1); this.rate = 0x73; return; }
  if(obj instanceof FlowerObject && this.power < 2) { this.tfm(2); this.rate = 0x71; return; }
  if(obj instanceof StarObject) { this.star(); this.game.out.push(NET013.encode(0x02)); this.rate = 0x43; return; }
  if(obj instanceof LifeObject) { this.game.lifeage(); return; }
  if(obj instanceof CoinObject) { this.game.coinage(); return; }
  if(obj instanceof AxeObject) { this.game.out.push(NET018.encode()); return; }  // Asks server what result to get from picking up the axe and 'winning'
  if(obj instanceof PoisonObject) { this.damage(obj); return; }
};

/* This essentially is the win state. */
/* Result is the numerical place we came in. 1 being the best (first place) */
CheepCheepObject.prototype.axe = function(result) {
  var txt = this.game.getText(this.level, this.zone, result.toString());
  if(!txt) { txt = this.game.getText(this.level, this.zone, "too bad"); }
  
  if(txt) { this.autoTarget = vec2.add(txt.pos, vec2.make(0., -1.6)); }
};

CheepCheepObject.prototype.star = function() {
  if(this.starMusic) { this.starMusic.stop(); this.starMusic = undefined; }
  this.starTimer = CheepCheepObject.STAR_LENGTH;
  this.starMusic = this.play("music/star.mp3", 1., .04);
  if(this.starMusic) { this.starMusic.loop(true); }
};

CheepCheepObject.prototype.tfm = function(to) {
  if(this.power<to) { this.play("sfx/powerup.wav", 1., .04); }
  else { this.play("sfx/pipe.wav", 1., .04); }
  this.tfmTarget = to;
  this.tfmTimer = CheepCheepObject.TRANSFORM_TIME;
  this.setState(CheepCheepObject.SNAME.TRANSFORM);
};

CheepCheepObject.prototype.warp = function(wid) {
  var wrp = this.game.world.getLevel(this.level).getWarp(wid);
  if(!wrp) { return; } /* Error */
    
  this.level = wrp.level;
  this.zone = wrp.zone;
  this.pos = wrp.pos;
  
  this.autoTarget = undefined;
  this.grounded = false;
};

/* ent/ext = null, up, down, left, right [0,1,2,3,4] */
CheepCheepObject.prototype.pipe = function(ent, wid, delay) {
  if(ent === 1 || ent === 2) { this.setState(CheepCheepObject.SNAME.STAND); }
  var wrp = this.game.world.getLevel(this.level).getWarp(wid);
  this.pipeWarp = wid;
  this.pipeTimer = 30;
  this.pipeDir = ent;
  this.pipeExt = wrp.data;
  this.pipeDelayLength = delay;
};

/* Kills any plants that would be in the pipe we are coming out of */
CheepCheepObject.prototype.weedeat = function() {
  for(var i=0;i<this.game.objects.length;i++) {
    var obj = this.game.objects[i];
    if(obj instanceof PlantObject && !obj.dead) {
      if(vec2.distance(this.pos, obj.pos) < CheepCheepObject.WEED_EAT_RADIUS) {
        obj.destroy();
      }
    }
  }
};

CheepCheepObject.prototype.pole = function(p) {
  if(this.autoTarget) { return; }
  this.setState(CheepCheepObject.SNAME.POLE);
  this.moveSpeed = 0;
  this.fallSpeed = 0;
  this.pos.x = p.x;
  this.poleTimer = 15;
  this.poleSound = false;
};

CheepCheepObject.prototype.vine = function(p, wid) {
  this.setState(CheepCheepObject.SNAME.CLIMB);
  this.moveSpeed = 0;
  this.fallSpeed = 0;
  this.pos.x = p.x;
  this.vineWarp = wid;
};

/* Make the player invisible, intangible, and frozen until show() is called. */
CheepCheepObject.prototype.hide = function() {
  this.setState(CheepCheepObject.SNAME.HIDE);
};

CheepCheepObject.prototype.show = function() {
  this.setState(CheepCheepObject.SNAME.STAND);
};

CheepCheepObject.prototype.kill = function() {
  if(this.starMusic) { this.starMusic.stop(); this.starMusic = undefined; this.starTimer = 0; }
  if(this.isState(CheepCheepObject.SNAME.GHOST)) { this.setState(CheepCheepObject.SNAME.DEADGHOST); }
  else { this.setState(CheepCheepObject.SNAME.DEAD); }
  
  this.dead = true;
  this.deadTimer = CheepCheepObject.DEAD_TIME;
  this.deadFreezeTimer = CheepCheepObject.DEAD_FREEZE_TIME;
  this.fallSpeed = CheepCheepObject.DEAD_UP_FORCE;
  
  if(this.game.getPlayer() === this) { this.game.out.push(NET011.encode()); }
};

CheepCheepObject.prototype.destroy = function() {
  if(this.starMusic) { this.starMusic.stop(); this.starMusic = undefined; this.starTimer = 0; }
  GameObject.prototype.destroy.call(this);
};
CheepCheepObject.prototype.isTangible = function() {
  return GameObject.prototype.isTangible.call(this) && !this.isState(CheepCheepObject.SNAME.HIDE) && this.pipeDelay <= 0;
};

CheepCheepObject.prototype.setState = function(SNAME) {
  var STATE = this.getStateByPowerIndex(SNAME, this.power);
  if(STATE === this.state) { return; }
  this.state = STATE;
  if(STATE.SPRITE.length > 0) { this.sprite = STATE.SPRITE[0]; } // Ghost state special case
  this.dim = STATE.DIM;
  this.anim = 0;
};

/* Lmoa */
CheepCheepObject.prototype.getStateByPowerIndex = function(SNAME, pind) {
  for(var i=0;i<CheepCheepObject.STATE.length;i++) {
    var ste = CheepCheepObject.STATE[i];
    if(ste.NAME !== SNAME) { continue; }
    if(ste.ID >= CheepCheepObject.GENERIC_INDEX) { return ste; }
    if(ste.ID >= CheepCheepObject.POWER_INDEX_SIZE*pind && ste.ID < CheepCheepObject.POWER_INDEX_SIZE*(pind+1)) { return ste; }
  }
};

CheepCheepObject.prototype.isState = function(SNAME) {
  return SNAME === this.state.NAME;
};

CheepCheepObject.prototype.draw = function(sprites) {
  if(this.isState(CheepCheepObject.SNAME.HIDE) || this.pipeDelay > 0) { return; } // Don't render when hidden or when in a pipe
  if(this.damageTimer > 0 && this.damageTimer % 3 > 1) { return; } // Post damage timer blinking
    
  var mod; // Special draw mode
  if(this.starTimer > 0) { mod = 0x02; }
  else if(this.isState(CheepCheepObject.SNAME.GHOST) || this.isState(CheepCheepObject.SNAME.DEADGHOST)) { mod = 0x01; }
  else { mod = 0x00; }

  if(this.sprite.INDEX instanceof Array) {
    var s = this.sprite.INDEX;
    for(var i=0;i<s.length;i++) {
      for(var j=0;j<s[i].length;j++) {
        if(mod === 0x02) { sprites.push({pos: vec2.add(vec2.add(this.pos, CheepCheepObject.DIM_OFFSET), vec2.make(j,i)), reverse: this.reverse, index: s[i][j], mode: 0x00}); }
        sprites.push({pos: vec2.add(vec2.add(this.pos, CheepCheepObject.DIM_OFFSET), vec2.make(j,i)), reverse: this.reverse, index: s[i][j], mode: mod});
      }
    }
  }
  else {
    if(mod === 0x02) { sprites.push({pos: vec2.add(this.pos, CheepCheepObject.DIM_OFFSET), reverse: this.reverse, index: this.sprite.INDEX, mode: 0x00}); }
    sprites.push({pos: vec2.add(this.pos, CheepCheepObject.DIM_OFFSET), reverse: this.reverse, index: this.sprite.INDEX, mode: mod});
  }
  
  var mod;
  if(this.arrowFade > 0.) {
    mod = 0xA0 + parseInt(this.arrowFade*32.);
    sprites.push({pos: vec2.add(vec2.add(this.pos, vec2.make(0., this.dim.y)), CheepCheepObject.ARROW_OFFSET), reverse: false, index: CheepCheepObject.ARROW_SPRITE, mode: mod});
  }
  else if(this.name) {
    
  }
};

CheepCheepObject.prototype.write = function(texts) {
  if(this.arrowFade > 0.) {
    texts.push({pos: vec2.add(vec2.add(this.pos, vec2.make(0., this.dim.y)), CheepCheepObject.TEXT_OFFSET), size: CheepCheepObject.TEXT_SIZE, color: "rgba(255,255,255,"+this.arrowFade+")", text: CheepCheepObject.ARROW_TEXT});
  }
  else if(this.name) { /* Hacky thing for ghost dim @TODO: */
    texts.push({pos: vec2.add(vec2.add(this.pos, vec2.make(0., this.sprite.INDEX instanceof Array?2.:1.)), CheepCheepObject.TEAM_OFFSET), size: CheepCheepObject.TEAM_SIZE, color: CheepCheepObject.TEAM_COLOR, text: this.name});
  }
};

CheepCheepObject.prototype.play = GameObject.prototype.play;

/* Register object class */
GameObject.REGISTER_OBJECT(CheepCheepObject);