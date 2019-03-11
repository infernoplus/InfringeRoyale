package org.infpls.royale.server.game.session;

import java.util.List;

public class PacketS01 extends Packet {
  
  private final List<Packet> packets;
  public PacketS01(final List<Packet> packets) {
    super("s01");
    this.packets = packets;
  }
  
  public List<Packet> getPackets() { return packets; }
}
