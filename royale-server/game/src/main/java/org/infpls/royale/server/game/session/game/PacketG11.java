package org.infpls.royale.server.game.session.game;

import org.infpls.royale.server.game.session.Packet;

public class PacketG11 extends Packet {
  public final String data;
  public PacketG11(String data) {
    super("g11");
    this.data = data;
  }
}
