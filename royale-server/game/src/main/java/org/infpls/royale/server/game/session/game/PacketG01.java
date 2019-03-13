package org.infpls.royale.server.game.session.game;

import org.infpls.royale.server.game.session.Packet;

public class PacketG01 extends Packet {
  final String game;
  public PacketG01(String game) {
    super("g01");
    this.game = game;
  }
}
