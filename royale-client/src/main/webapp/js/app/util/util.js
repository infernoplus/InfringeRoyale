"use strict";
/* global main */
/* global mat4 */
/* global vec4 */
/* global GLU */

/* Various utility/math functions */
var util = {
  line2: {},
  intersection: {},
  time: {},
  sprite: {}
};


var vec2 = {};
/* === Vec2 =============================================================================== */
/* ======================================================================================== */

vec2.make = function(x, y) {
  return {x: x, y: y};
};

vec2.random = function() {
  return vec2.normalize({x: (Math.random()*2.0)-1.0, y: (Math.random()*2.0)-1.0});
};

vec2.copy = function(a) {
  return {x: a.x, y: a.y};
};

vec2.add = function(a, b) {
  return {x: a.x + b.x, y: a.y + b.y};
};

vec2.subtract = function(a, b) {
  return {x: a.x - b.x, y: a.y - b.y};
};

vec2.scale = function(a, s) {
  return {x: a.x*s, y: a.y*s};
};

vec2.multiply = function(a, b) {
  return {x: a.x*b.x, y: a.y*b.y};
};

vec2.divide = function(a, b) {
  return {x: a.x/b.x, y: a.y/b.y};
};

vec2.magnitude = function(a) {
  return Math.sqrt((a.x*a.x) + (a.y*a.y));
};

vec2.normalize = function(a) {
  var mag = vec2.magnitude(a);
  return mag !== 0.0 ? {x: a.x/mag, y: a.y/mag} : {x: 0.0, y: 1.0};
};

vec2.distance = function(a, b) {
  return vec2.magnitude(vec2.subtract(a, b));
};

vec2.dot = function(a, b) {
  return (a.x*b.x)+(a.y*b.y);
};

vec2.inverse = function(a) {
  return {x: -1.0*a.x, y: -1.0*a.y};
};

/* Linear interpolation from a@(i=0.0) to b@(i=1.0) */
vec2.lerp = function(a, b, i) {
  return vec2.add(vec2.scale(a, 1.0-i), vec2.scale(b, i));
};

/* Rotates vec2 around 0,0. Identical to rotateZ on a vec3. */
vec2.rotate = function(a, r) {
    var cosDegrees = Math.cos(r);
    var sinDegrees = Math.sin(r);

    var x = (a.x * cosDegrees) + (a.y * sinDegrees);
    var y = (a.x * -sinDegrees) + (a.y * cosDegrees);

    return {x: x, y: y};
};

/* Find angle between vectors a and b */
vec2.angle = function(a, b) {
  var dot = vec2.dot(a, b);
  var A = Math.sqrt((a.x*a.x)+(a.y*a.y));
  var B = Math.sqrt((b.x*b.x)+(b.y*b.y));
  return Math.acos(dot/(A*B));
};

vec2.average = function(ary) {
  var c = vec2.create();
  for(var i=0;i<ary.length;i++) {
    c = vec2.add(c, ary[i]);
  }
  return vec2.scale(c, 1/ary.length);
};

vec2.equals = function(a, b) {
  return a.x === b.x && a.y === b.y;
};

vec2.toArray = function(a) {
  return [a.x, a.y];
};



var vec4 = {};
/* === Vec4 =============================================================================== */
/* ======================================================================================== */

vec4.make = function(x, y, z, w) {
  return {x: x, y: y, z: z, w: w};
};

vec4.copy = function(a) {
  return {x: a.x, y: a.y, z: a.z, w: a.w};
};

vec4.add = function(a, b) {
  return {x: a.x + b.x, y: a.y + b.y, z: a.z + b.z, w: a.w + b.w};
};

vec4.subtract = function(a, b) {
  return {x: a.x - b.x, y: a.y - b.y, z: a.z - b.z, w: a.w - b.w};
};

vec4.scale = function(a, b) {
  return {x: a.x*b, y: a.y*b, z: a.z*b, w: a.w*b};
};

vec4.multiply = function(a, b) {
  return {x: a.x*b.x, y: a.y*b.y, z: a.z*b.z, w: a.w*b.w};
};

/* Linear interpolation from a@(i=0.0) to b@(i=1.0) */
vec4.lerp = function(a, b, i) {
  return vec4.add(vec4.scale(a, 1.0-i), vec4.scale(b, i));
};

vec4.toArray = function(a) {
  return [a.x, a.y, a.z, a.w];
};

/* === Line2 =============================================================================== */
/* ======================================================================================== */

util.line2.normal = function(A) {
  return vec2.normalize({x: A.b.y-A.a.y, y: -1*(A.b.x-A.a.x)});
};

/* === Intersection ======================================================================= */
/* ======================================================================================== */

/* Vec2 p, Vec2 a, Vec2 b */
/* a is the starting corner, b is the size of the rectangle */
util.intersection.pointRectangle = function(p, a, b) {
  return a.x <= p.x &&
         a.x+b.x > p.x &&
         a.y <= p.y &&
         a.y+b.y > p.y;
};

/* Vec2 p, Vec2[] poly */
util.intersection.pointPoly = function(p, poly) {
  var i = 0;
  var j = 0;
  var c = false;
  var nvert = poly.length;
  for (i = 0, j = nvert-1; i < nvert; j = i++) {
    if ( ((poly[i].y>p.y) !== (poly[j].y>p.y)) &&
     (p.x < (poly[j].x-poly[i].x) * (p.y-poly[i].y) / (poly[j].y-poly[i].y) + poly[i].x) )
       c = !c;
  }
  return c;
};

/* Line2 A, Line2 B */
util.intersection.lineLine = function(A, B) {
  var s1_x, s1_y, s2_x, s2_y;
  var i_x, i_y;
  s1_x = A.b.x - A.a.x; s1_y = A.b.y - A.a.y;
  s2_x = B.b.x - B.a.x; s2_y = B.b.y - B.a.y;

  var s, t;
  s = (-s1_y * (A.a.x - B.a.x) + s1_x * (A.a.y - B.a.y)) / (-s2_x * s1_y + s1_x * s2_y);
  t = ( s2_x * (A.a.y - B.a.y) - s2_y * (A.a.x - B.a.x)) / (-s2_x * s1_y + s1_x * s2_y);

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
  {
      // Collision detected
      i_x = A.a.x + (t * s1_x);
      i_y = A.a.y + (t * s1_y);
      var intersection = {x: i_x, y: i_y};
      //var normal = vec2.normalize(vec2.subtract(intersection, A.a));
      var normal = util.line2.normal(B);
      return {intersection: intersection, normal: normal, distance: vec2.distance(intersection, A.a)};
  }

  return undefined; // No collision
};

/* Vec2 P, Line2 L, float r */
util.intersection.lineCircle = function(P, L, r) {
  var nearest = util.intersection.lineNearestPoint(P, L);
  if(vec2.equals(nearest, L.a)) {
    var dir = vec2.subtract(P, L.a);
    var dist = vec2.magnitude(dir);
    if(dist >= r) { return undefined; }
    var norm = vec2.normalize(dir);
    return {intersection: L.a, normal: norm, dist};
  }
  else if(vec2.equals(nearest, L.b)) {
    var dir = vec2.subtract(P, L.b);
    var dist = vec2.magnitude(dir);
    if(dist >= r) { return undefined; }
    var norm = vec2.normalize(dir);
    return {intersection: L.b, normal: norm, distance: dist};
  }
  else {
    var dir = vec2.subtract(P, nearest);
    var dist = vec2.magnitude(dir);
    if(dist >= r) { return undefined; }
    var norm = vec2.normalize(dir);
    return {intersection: nearest, normal: norm, distance: dist};
  }
};

/* Line2 L, Polygon G, float r */
util.intersection.polygonLine = function(L, G) {
  var hits = [];
  for(var i=0;i<G.v.length;i++) {
    var L2 = {a: G.v[i], b: G.v[i+1<G.v.length?i+1:0]};
    var inst = util.intersection.lineLine(L, L2);
    if(inst) { hits.push(inst); }
  }
  if(hits.length < 1) { return undefined; }
  var nearest = hits[0];
  for(var i=1;i<hits.length;i++) {
    if(hits[i].distance < nearest.distance) {
      nearest = hits[i];
    }
  }
  return nearest;
};

/* Vec2 P, Polygon G, float r */
util.intersection.polygonCircle = function(P, G, r) {
  var hits = [];
  for(var i=0;i<G.v.length;i++) {
    var L = {a: G.v[i], b: G.v[i+1<G.v.length?i+1:0]};
    var inst = util.intersection.lineCircle(P, L, r);
    if(inst) { hits.push(inst); }
  }
  if(hits.length < 1) { return undefined; }
  var nearest = hits[0];
  for(var i=1;i<hits.length;i++) {
    if(hits[i].distance < nearest.distance) {
      nearest = hits[i];
    }
  }
  return nearest;
};

/* Vec2 P, Line2 L */
util.intersection.lineNearestPoint = function(P, L) {
  var v = vec2.subtract(L.b, L.a);
  var w = vec2.subtract(P, L.a);
  var c1 = vec2.dot(w, v);
  if ( c1 <= 0 ) { return L.a; }
  var c2 = vec2.dot(v, v);
  if ( c2 <= c1 ) { return L.b; }
  var b = c1 / c2;
  return vec2.add(L.a, vec2.scale(v, b));
};

/* === Time =============================================================================== */
/* ======================================================================================== */

util.time.now = function() {
  return Date.now();
};

/* === Sprite ============================================================================= */
/* ======================================================================================== */

/* global Display */

/* Returns the [x, y] location of the top left corner of a tile in the sprite sheet. Location is in pixels. */
util.sprite.getSprite = function(texture, index) {
  var w = texture.width;
  var h = texture.height;
  var i = index * Display.TEXRES;
  
  var y = parseInt(Math.floor(i / w) * Display.TEXRES);
  var x = i % w;
  
  if(y>h) { return [0, 0]; }
  return [x, y];
};