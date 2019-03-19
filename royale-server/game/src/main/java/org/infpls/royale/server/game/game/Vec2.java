package org.infpls.royale.server.game.game;

public final class Vec2 {
  public final float x, y;
  public Vec2(final float x, final float y) {
    this.x = x; this.y = y;
  }
  public Vec2(final float a) {
    this(a, a);
  }
  public Vec2() {
    this(0f, 0f);
  }
  
  public boolean isZero() { return magnitude() == 0.0f; }
  public boolean isNaN() { return Float.isNaN(x) || Float.isNaN(y); }
  public Vec2 add(final Vec2 b) { return new Vec2(x + b.x, y + b.y); }
  public Vec2 subtract(final Vec2 b) { return new Vec2(x - b.x, y - b.y); }
  public Vec2 scale(final float s) { return new Vec2(x*s, y*s); }
  public Vec2 inverse() { return new Vec2(x*-1, y*-1); }
  public float magnitude() { return (float)(Math.sqrt((x*x)+(y*y))); }
  public Vec2 normalize() { final float m = magnitude(); return Math.abs(m) != 0f ? new Vec2(x/m,y/m) : new Vec2(0f, 1f); }  /* Safe on potential NaN */
  public Vec2 lerp(final Vec2 b, final float s) { return new Vec2((x*s)+(b.x*(1-s)),(y*s)+(b.y*(1-s))); }
  public float distance(final Vec2 b) { return subtract(b).magnitude(); }
  public Vec2 tangent() { return new Vec2(y*-1, x); }
  public float dot(final Vec2 b) { return (x*b.x)+(y*b.y); }
  public Vec2 rotate(final float angle) { float cos = (float)Math.cos(angle); float sin = (float)Math.sin(angle); return new Vec2((x*cos)+(y*sin), (x*-sin)+(y*cos)); }
  public boolean equals(final Vec2 b) { return x == b.x && y == b.y; }
  public Vec2 copy() { return new Vec2(x, y); } /* @TODO: Does not need to exist since Vec2 is final */
  
  @Override
  public String toString() { return x + "," + y; }
  public void toString(final StringBuilder sb) { sb.append(x); sb.append(","); sb.append(y); }
}