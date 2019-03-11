package org.infpls.royale.server.game.session.login;

import org.infpls.royale.server.game.session.Packet;

public class PacketL01 extends Packet {
  public final String name, sid;
  public PacketL01(String name, String sid) {
    super("l01");
    this.name = name;
    this.sid = sid;
  }
}
