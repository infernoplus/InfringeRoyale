package org.infpls.royale.server.game.session;

public class Packet {
  private final String type;
  private transient String srcSid;
  public Packet(final String type) { this.type = type; }
  public final String getType() { return type; }
//  public final String getSrcSid() { return srcSid; }
//  public final Packet setSrcSid(final String srcSid) { this.srcSid = srcSid; return this; } //Returns 'this' so we can 1 line stuff in InGame.java. Sue me.
//  public final boolean matchSrcSid(final String sid) { if(srcSid == null) { return true; } else { return sid.equals(srcSid); } } //If none then we ignore and return true
}
