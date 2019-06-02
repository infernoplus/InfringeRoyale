package org.infpls.royale.server.game.session.game;

import org.infpls.royale.server.game.session.Packet;

public class PacketG13 extends Packet {
  public final int time;
  public PacketG13(int time) {
    super("g13");
    this.time = time;
  }
}
