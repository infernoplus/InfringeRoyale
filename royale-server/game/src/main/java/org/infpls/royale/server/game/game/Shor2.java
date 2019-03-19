package org.infpls.royale.server.game.game;

public class Shor2 {
  
  public static int encode(short a, short b) {
    return (a & 0x0000FFFF) | ((b << 16) & 0xFFFF0000);
  }
  
  public static int encode(Vec2 a) {
    return ((short)(a.x) & 0x0000FFFF) | (((short)(a.y) << 16) & 0xFFFF0000);
  }
  
  public static Vec2 decode(/* shor2 */ int a) {
    return new Vec2(a & 0xFFFF, (a >> 16) & 0xFFFF);
  }
}
