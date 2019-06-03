"use strict";
/* global util, vec2, squar */
/* global GameObject */
/* global NET011, NET020 */

/* Special object, renders text at the givin position. */
function TextObject(game, level, zone, pos, oid, offset, size, color, text) {
  GameObject.call(this, game, level, zone, pos);
  
  this.oid = oid; // Unique Object ID, is the shor2 of the spawn location
  
  this.setState(TextObject.STATE.IDLE);
  
  /* Var */
  this.offset = vec2.make(0., parseFloat(offset)); // Y value offset.
  this.size = parseFloat(size);
  this.color = color;
  this.text = text;
}


/* === STATIC =============================================================== */
TextObject.ASYNC = true;
TextObject.ID = 0xFD;
TextObject.NAME = "TEXT"; // Used by editor

TextObject.ANIMATION_RATE = 3;

TextObject.SPRITE = {};
TextObject.SPRITE_LIST = [
  {NAME: "IDLE", ID: 0x00, INDEX: 0x000E}
];

/* Makes sprites easily referenceable by NAME. For sanity. */
for(var i=0;i<TextObject.SPRITE_LIST.length;i++) {
  TextObject.SPRITE[TextObject.SPRITE_LIST[i].NAME] = TextObject.SPRITE_LIST[i];
  TextObject.SPRITE[TextObject.SPRITE_LIST[i].ID] = TextObject.SPRITE_LIST[i];
}

TextObject.STATE = {};
TextObject.STATE_LIST = [
  {NAME: "IDLE", ID: 0x00, SPRITE: [TextObject.SPRITE.IDLE]}
];

/* Makes states easily referenceable by either ID or NAME. For sanity. */
for(var i=0;i<TextObject.STATE_LIST.length;i++) {
  TextObject.STATE[TextObject.STATE_LIST[i].NAME] = TextObject.STATE_LIST[i];
  TextObject.STATE[TextObject.STATE_LIST[i].ID] = TextObject.STATE_LIST[i];
}


/* === INSTANCE ============================================================= */

TextObject.prototype.update = function(event) { /* ASYNC */ };

TextObject.prototype.step = function() { };

TextObject.prototype.kill = function() { };

TextObject.prototype.destroy = function() {
  this.garbage = true;
};

TextObject.prototype.setState = function(STATE) {
  if(STATE === this.state) { return; }
  this.state = STATE;
  this.sprite = STATE.SPRITE[0];
  this.anim = 0;
};

TextObject.prototype.draw = function(sprites) { };

TextObject.prototype.write = function(texts) {
  texts.push({pos: vec2.add(this.pos, this.offset), size: this.size, color: this.color, text: this.text});
};

/* Register object class */
GameObject.REGISTER_OBJECT(TextObject);