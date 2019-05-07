"use strict";
/* global app */
/* global Effect */
/* global util, vec2 */

function CoinEffect(pos) {
  Effect.call(this, pos);
  
  this.life = CoinEffect.UP_TIME+CoinEffect.DOWN_TIME;
  this.sprite = 0;
  this.anim = 0;
  
  this.bits = [
    {
      pos: vec2.add(this.pos, vec2.make(0.,0.)),
      
      sp: vec2.make(0.,0.),   // Sprite Position
      ss: vec2.make(1.,1.),   // Sprite Size
      so: vec2.make(0.,0.)    // Sprite Offset
    }
  ];
};

CoinEffect.SPRITE = [0x00F4, 0x00F5, 0x00F6, 0x00F7];

CoinEffect.ANIMATION_RATE = 2;

CoinEffect.MOVE_SPEED = 0.375;
CoinEffect.UP_TIME = 8;
CoinEffect.DOWN_TIME = 6;

CoinEffect.prototype.step = function() {
  Effect.prototype.step.call(this);
  
  this.sprite = CoinEffect.SPRITE[parseInt(this.anim++/CoinEffect.ANIMATION_RATE) % CoinEffect.SPRITE.length];
  if(this.life >= CoinEffect.DOWN_TIME) { this.bits[0].pos.y += CoinEffect.MOVE_SPEED; }
  else { this.bits[0].pos.y -= CoinEffect.MOVE_SPEED; }
};

CoinEffect.prototype.destroy = Effect.prototype.destroy;

CoinEffect.prototype.draw = function(fxs) {
  for(var i=0;i<this.bits.length;i++) {
    var bit = this.bits[i];
    
    fxs.push({
      tex: "obj",
      ind: this.sprite,
      
      pos: bit.pos,
      off: bit.so,
      rot: 0,
      
      sp: bit.sp,
      ss: bit.ss
    });
  }
  
};