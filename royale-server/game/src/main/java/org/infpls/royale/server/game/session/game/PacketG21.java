package org.infpls.royale.server.game.session.game;

import org.infpls.royale.server.game.session.Packet;

public class PacketG21 extends Packet {
  private final long delta;
  public PacketG21(final long delta) {
    super("g21");
    this.delta = delta;
  }
  
  public long getDelta() { return delta; }
}