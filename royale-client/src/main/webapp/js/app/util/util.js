"use strict";
/* global main */
/* global mat4 */
/* global vec4 */
/* global GLU */

/* Various utility/math functions */
var util = {
  vec2 : {},
  vec4 : {},
  line2: {},
  intersection: {},
  time: {}
};

/* === Vec2 =============================================================================== */
/* ======================================================================================== */

util.vec2.create = function() {
  return {x: 0.0, y: 0.0};
};

util.vec2.random = function() {
  return util.vec2.normalize({x: (Math.random()*2.0)-1.0, y: (Math.random()*2.0)-1.0});
};

util.vec2.make = function(x, y) {
  return {x: x, y: y};
};

util.vec2.copy = function(a) {
  return {x: a.x, y: a.y};
};

/* Takes a string of <float x>,<float y> and makes an object out of it */
util.vec2.parse = function(data) {
  var spl = data.split(",");
  return {x: parseFloat(spl[0]), y: parseFloat(spl[1])};
};

util.vec2.add = function(a, b) {
  return {x: a.x + b.x, y: a.y + b.y};
};

util.vec2.subtract = function(a, b) {
  return {x: a.x - b.x, y: a.y - b.y};
};

util.vec2.scale = function(a, s) {
  return {x: a.x*s, y: a.y*s};
};

util.vec2.multiply = function(a, b) {
  return {x: a.x*b.x, y: a.y*b.y};
};

util.vec2.divide = function(a, b) {
  return {x: a.x/b.x, y: a.y/b.y};
};

util.vec2.magnitude = function(a) {
  return Math.sqrt((a.x*a.x) + (a.y*a.y));
};

util.vec2.normalize = function(a) {
  var mag = util.vec2.magnitude(a);
  return mag !== 0.0 ? {x: a.x/mag, y: a.y/mag} : {x: 0.0, y: 1.0};
};

util.vec2.distance = function(a, b) {
  return util.vec2.magnitude(util.vec2.subtract(a, b));
};

util.vec2.dot = function(a, b) {
  return (a.x*b.x)+(a.y*b.y);
};

util.vec2.inverse = function(a) {
  return {x: -1.0*a.x, y: -1.0*a.y};
};

/* Linear interpolation from a@(i=0.0) to b@(i=1.0) */
util.vec2.lerp = function(a, b, i) {
  return util.vec2.add(util.vec2.scale(a, 1.0-i), util.vec2.scale(b, i));
};

/* Rotates vec2 around 0,0. Identical to rotateZ on a vec3. */
util.vec2.rotate = function(a, r) {
    var cosDegrees = Math.cos(r);
    var sinDegrees = Math.sin(r);

    var x = (a.x * cosDegrees) + (a.y * sinDegrees);
    var y = (a.x * -sinDegrees) + (a.y * cosDegrees);

    return {x: x, y: y};
};

/* Find angle between vectors a and b */
util.vec2.angle = function(a, b) {
  var dot = util.vec2.dot(a, b);
  var A = Math.sqrt((a.x*a.x)+(a.y*a.y));
  var B = Math.sqrt((b.x*b.x)+(b.y*b.y));
  return Math.acos(dot/(A*B));
};

util.vec2.average = function(ary) {
  var c = util.vec2.create();
  for(var i=0;i<ary.length;i++) {
    c = util.vec2.add(c, ary[i]);
  }
  return util.vec2.scale(c, 1/ary.length);
};

util.vec2.equals = function(a, b) {
  return a.x === b.x && a.y === b.y;
};

util.vec2.toArray = function(a) {
  return [a.x, a.y];
};

/* === Vec4 =============================================================================== */
/* ======================================================================================== */

util.vec4.create = function() {
  return {x: 0.0, y: 0.0, z: 0.0, w: 1.0};
};

util.vec4.make = function(x, y, z, w) {
  return {x: x, y: y, z: z, w: w};
};

util.vec4.copy = function(a) {
  return {x: a.x, y: a.y, z: a.z, w: a.w};
};

util.vec4.copy3 = function(a, w) {
  // Copies xyz but sets w to the value specified.
  return {x: a.x, y: a.y, z: a.z, w: w};
};

util.vec4.add = function(a, b) {
  return {x: a.x + b.x, y: a.y + b.y, z: a.z + b.z, w: a.w + b.w};
};

util.vec4.subtract = function(a, b) {
  return {x: a.x - b.x, y: a.y - b.y, z: a.z - b.z, w: a.w - b.w};
};

util.vec4.scale = function(a, b) {
  return {x: a.x*b, y: a.y*b, z: a.z*b, w: a.w*b};
};

util.vec4.multiply = function(a, b) {
  return {x: a.x*b.x, y: a.y*b.y, z: a.z*b.z, w: a.w*b.w};
};

/* Linear interpolation from a@(i=0.0) to b@(i=1.0) */
util.vec4.lerp = function(a, b, i) {
  return util.vec4.add(util.vec4.scale(a, 1.0-i), util.vec4.scale(b, i));
};

util.vec4.toArray = function(a) {
  return [a.x, a.y, a.z, a.w];
};

/* === Line2 =============================================================================== */
/* ======================================================================================== */

util.line2.normal = function(A) {
  return util.vec2.normalize({x: A.b.y-A.a.y, y: -1*(A.b.x-A.a.x)});
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

/* Line l {a: <startpoint vec3>, b: <endpoint vec3>} */
/* Plane pl {a: <p1 vec3>, b: <p2 vec3>, c: <p3 vec3>, n: <normal vec3>} */
util.intersection.linePlane = function(l, pl) {
  // Does the line intersect the plane?
  var b = util.vec3.subtract(l.b, l.a);
  var v = util.vec3.normalize(b);
  var dp = util.vec3.dot(pl.n, util.vec3.subtract(pl.c, l.a)) / util.vec3.dot(pl.n, v);
  var p = {x: l.a.x + (dp*v.x), y: l.a.y + (dp*v.y), z: l.a.z + (dp*v.z)};
  // Make sure we are not getting a collision in the inverse direction
  if(util.vec3.distance(v, pl.n) >= util.vec3.distance(v, util.vec3.inverse(pl.n))) {
      var iv = util.vec3.inverse(v);
      dp = util.vec3.dot(pl.n, iv);
      return {intersection: p};
  }
  return undefined;
};

/* Generates some extra data about the collision */
util.intersection.linePlaneVerbose = function(l, pl) {
  // Does the line intersect the plane?
  var b = util.vec3.subtract(l.b, l.a);
  var v = util.vec3.normalize(b);
  var dp = util.vec3.dot(pl.n, util.vec3.subtract(pl.c, l.a)) / util.vec3.dot(pl.n, v);
  var p = {x: l.a.x + (dp*v.x), y: l.a.y + (dp*v.y), z: l.a.z + (dp*v.z)};
  // Make sure we are not getting a collision in the inverse direction
  if(util.vec3.distance(v, pl.n) >= util.vec3.distance(v, util.vec3.inverse(pl.n))) {
      var ad = util.vec3.distance(l.a, p);
      var iv = util.vec3.inverse(v);
      dp = util.vec3.dot(pl.n, iv);
      var r = util.vec3.scale(util.vec3.normalize(util.vec3.subtract(util.vec3.scale(pl.n, 2*dp), iv)), util.vec3.distance(p, l.b));
      return {intersection: p, reflection: r, plane: pl, distance: ad};
  }
  return undefined;
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
      //var normal = util.vec2.normalize(util.vec2.subtract(intersection, A.a));
      var normal = util.line2.normal(B);
      return {intersection: intersection, normal: normal, distance: util.vec2.distance(intersection, A.a)};
  }

  return undefined; // No collision
};

/* Vec2 P, Line2 L, float r */
util.intersection.lineCircle = function(P, L, r) {
  var nearest = util.intersection.lineNearestPoint(P, L);
  if(util.vec2.equals(nearest, L.a)) {
    var dir = util.vec2.subtract(P, L.a);
    var dist = util.vec2.magnitude(dir);
    if(dist >= r) { return undefined; }
    var norm = util.vec2.normalize(dir);
    return {intersection: L.a, normal: norm, dist};
  }
  else if(util.vec2.equals(nearest, L.b)) {
    var dir = util.vec2.subtract(P, L.b);
    var dist = util.vec2.magnitude(dir);
    if(dist >= r) { return undefined; }
    var norm = util.vec2.normalize(dir);
    return {intersection: L.b, normal: norm, distance: dist};
  }
  else {
    var dir = util.vec2.subtract(P, nearest);
    var dist = util.vec2.magnitude(dir);
    if(dist >= r) { return undefined; }
    var norm = util.vec2.normalize(dir);
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
  var v = util.vec2.subtract(L.b, L.a);
  var w = util.vec2.subtract(P, L.a);
  var c1 = util.vec2.dot(w, v);
  if ( c1 <= 0 ) { return L.a; }
  var c2 = util.vec2.dot(v, v);
  if ( c2 <= c1 ) { return L.b; }
  var b = c1 / c2;
  return util.vec2.add(L.a, util.vec2.scale(v, b));
};

/* === Time =============================================================================== */
/* ======================================================================================== */

util.time.now = function() {
  return Date.now();
};
