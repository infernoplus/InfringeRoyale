package org.infpls.royale.server.game.session.error;

import org.infpls.royale.server.game.session.Packet;

public class PacketX00 extends Packet {
  private final String message;
  public PacketX00(final String message) {
    super("x00");
    this.message = message;
  }
  
  public String getMessage() { return message; }
}
