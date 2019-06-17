package org.infpls.royale.server.game.session.login;

import org.infpls.royale.server.game.session.Packet;

public class PacketL00 extends Packet {
  public final String name, team;
  public PacketL00(String name, String team) {
    super("l00");
    this.name = name;
    this.team = team;
  }
}
