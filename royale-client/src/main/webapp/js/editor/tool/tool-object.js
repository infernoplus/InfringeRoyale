"use strict";
/* global app, Display */
/* global vec2, td32, shor2, GameObject */

function ToolObject(editor) {
  this.editor = editor;
  
  this.element = document.getElementById("editor-tool-object");
  
  this.valName = document.getElementById("editor-tool-object-name");
  
  this.valType = document.getElementById("editor-tool-object-type");
  this.valPos = document.getElementById("editor-tool-object-pos");
  this.valParam = document.getElementById("editor-tool-object-param");
  
  var tmp = this;
  this.valType.onchange = function() { tmp.update(); };
  this.valParam.onchange = function() { tmp.update(); };
  
  this.moveTimer = 0;
  this.mmbx = false;
  
  this.obj = {type: 17, param: []};
}

ToolObject.prototype.input = function(imp, mous, keys) {
  
  /* Move selected object if wasd/arrowkeys are pressed. */
  if(this.selected && this.moveTimer-- < 1) {
    if(keys[87] || keys[38]) { this.move(0,1); return; } // W or UP
    if(keys[83] || keys[40]) { this.move(0,-1); return; } // S or DOWN
    if(keys[65] || keys[37]) { this.move(-1,0); return; } // A or LEFT
    if(keys[68] || keys[39]) { this.move(1,0); return; } // D or RIGHT
    if(keys[46]) { this.delete(); return; } // Delete
  }

  /* See if we are clicking on a object to select it. */
  var data = this.zone.data;
  
  var g = vec2.chop(this.editor.display.camera.unproject(mous.pos));
  g.y = data.length-g.y-1;
  if(g.x < 0 || g.x > data[0].length-1 || g.y < 0 || g.y > data.length-1) { return; }
  
  if(mous.lmb) {
    for(var i=0;i<this.zone.obj.length;i++) {
      var obj = this.zone.obj[i];
      if(vec2.distance(g, shor2.decode(obj.pos)) < 0.5) {
        this.select(obj);
        return;
      }
    }
  }
  
  /* See if we middle clicked to place an object */
  if(mous.mmb && !this.mmbx) {
    this.mmbx = true;
    var pos = shor2.encode(g.x, g.y);
    var obj = {type: this.obj.type, pos: pos, param: this.obj.param};
    this.zone.obj.push(obj);
    this.select(obj);
    return;
  }
  else if(!mous.mmb) { this.mmbx = false; }
};

ToolObject.prototype.update = function() {
  try {
    var type = Math.max(0, Math.min(255, parseInt(this.valType.value)));
    var param = this.valParam.value.trim().split(",");
    
    if(type === undefined || param === undefined) { throw "oof"; }
    
    if(this.selected) { this.selected.type = type; this.selected.param = param; }
    this.obj.type = type; this.obj.param = param;
    
    var cls = GameObject.OBJECT(type);
    if(cls && cls.NAME) { this.valName.innerHTML = cls.NAME; }
  }
  catch(ex) { return; }
};

ToolObject.prototype.select = function(object) {
  this.selected = object;
  this.obj.type = object.type;
  this.obj.param = object.param;
  
  this.valType.value = object.type;
  this.valPos.innerHTML = object.pos;
  this.valParam.value = object.param;
  
  var cls = GameObject.OBJECT(object.type);
  if(cls && cls.NAME) { this.valName.innerHTML = cls.NAME; }
};

ToolObject.prototype.move = function(x,y) {
  var pos = shor2.decode(this.selected.pos);
  pos = vec2.add(pos, vec2.make(x,y));
  if(pos.x < 0 || pos.x > this.zone.data[0].length-1 || pos.y < 0 || pos.y > this.zone.data.length-1) { return; }
  this.selected.pos = shor2.encode(pos.x, pos.y);
  this.moveTimer=4;
};

ToolObject.prototype.delete = function() {
  for(var i=0;i<this.zone.obj.length;i++) {
    var obj = this.zone.obj[i];
    if(obj === this.selected) {
      this.zone.obj.splice(i, 1);
      return;
    }
  }
};

ToolObject.prototype.reload = function() {
  this.save();
  this.load();
};

ToolObject.prototype.load = function() {
  this.zone = this.editor.currentZone;
  this.selected = undefined;
  this.element.style.display = "block";
};

ToolObject.prototype.save = function() {
  
};

ToolObject.prototype.destroy = function() {
  this.element.style.display = "none";
  this.save();
  
  this.valType.onchange = undefined;
  this.valParam.onchange = undefined;
};