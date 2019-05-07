"use strict";
/* global app */
/* global Effect */
/* global util, vec2 */

function BreakEffect(pos, sprite) {
  Effect.call(this, pos);
  
  this.sprite = sprite; // Index of sprite for the map tile we are 'breaking'
  this.life = 25;
  
  this.bits = [
    {
      pos: vec2.add(this.pos, vec2.make(0.,0.)),
      vel: vec2.make(-0.1,0.4),
      rot: 0.,
      ang: -0.4,
      
      sp: vec2.make(0.,0.),   // Sprite Position
      ss: vec2.make(.5,.5),   // Sprite Size
      so: vec2.make(0.25,0.25)    // Sprite Offset
    },
    {
      pos: vec2.add(this.pos, vec2.make(.5,0.)),
      vel: vec2.make(0.1,0.4),
      rot: 0.,
      ang: 0.4,
      
      sp: vec2.make(.5,0.),   // Sprite Position
      ss: vec2.make(.5,.5),   // Sprite Size
      so: vec2.make(.25,.25)    // Sprite Offset
    },
    {
      pos: vec2.add(this.pos, vec2.make(0.,-.5)),
      vel: vec2.make(-0.15,0.2),
      rot: 0.,
      ang: -0.4,
      
      sp: vec2.make(0.,.5),   // Sprite Position
      ss: vec2.make(.5,.5),   // Sprite Size
      so: vec2.make(.25,.25)    // Sprite Offset
    },
    {
      pos: vec2.add(this.pos, vec2.make(.5,-.5)),
      vel: vec2.make(0.15,0.2),
      rot: 0.,
      ang: 0.4,
      
      sp: vec2.make(.5,.5),   // Sprite Position
      ss: vec2.make(.5,.5),   // Sprite Size
      so: vec2.make(.25,.25)    // Sprite Offset
    }
  ];
};

BreakEffect.FALL_SPEED = 0.0825;
BreakEffect.DRAG = 0.965;

BreakEffect.prototype.step = function() {
  for(var i=0;i<this.bits.length;i++) {
    var bit = this.bits[i];
    bit.vel.y -= BreakEffect.FALL_SPEED;
    bit.vel = vec2.scale(bit.vel, BreakEffect.DRAG);
    bit.pos = vec2.add(bit.pos, bit.vel);
    bit.ang *= BreakEffect.DRAG;
    bit.rot += bit.ang;
  }  
  
  Effect.prototype.step.call(this);
};

BreakEffect.prototype.destroy = Effect.prototype.destroy;

BreakEffect.prototype.draw = function(fxs) {
  for(var i=0;i<this.bits.length;i++) {
    var bit = this.bits[i];
    
    fxs.push({
      tex: "map",
      ind: this.sprite,
      
      pos: bit.pos,
      off: bit.so,
      rot: bit.rot,
      
      sp: bit.sp,
      ss: bit.ss
    });
  }
  
};