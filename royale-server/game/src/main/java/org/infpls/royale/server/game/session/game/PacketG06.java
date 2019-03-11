package org.infpls.royale.server.game.session.game;

import org.infpls.royale.server.game.session.Packet;

public class PacketG06 extends Packet {
  public final String message;
  public PacketG06(String message) {
    super("g06");
    this.message = message;
  }
}
