package org.infpls.royale.server.game.session.game;

import org.infpls.royale.server.game.session.Packet;

public class PacketG10 extends Packet {
  public final int pid;
  public PacketG10(int pid) {
    super("g10");
    this.pid = pid;
  }
}
