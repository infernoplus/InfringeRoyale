package org.infpls.royale.server.game.game;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.*;
import org.infpls.royale.server.game.session.*;
import org.infpls.royale.server.util.Oak;

public class Controller {
  private final RoyaleCore game;           // Parent
  
  public final RoyaleSession session;      // Session. So we can send game data packets to players.
  public final short pid;                  // Player identifier. Used to id players with a small bit of data.
  
  public final Queue<List<ByteMe.NETX>> updates = new LinkedList();

  /* Player State Info */
  protected boolean dead;
  protected byte level, zone;
  protected Vec2 position;
  protected byte sprite;
  
  protected byte result;
  
  public boolean garbage;  // If flagged, we will delete this controler on next update.
  
  public Controller(RoyaleCore game, RoyaleSession session, short pid) {
    this.game = game;
    this.session = session; this.pid = pid;
    
    dead = true;
    level = 0x00;
    zone = 0x00;
    position = null;
    sprite = 0x00;
    
    result = 0;
    
    garbage = false;
  }
  
  /* Handle data from client about their current playstate */
  public void input(final ByteBuffer data) {
    try {
      final List<ByteMe.NETX> de = ByteMe.decode(data, pid);
      updates.add(de);
    }
    catch(IOException ioex) {
      Oak.log(Oak.Level.ERR, "Error during byte decode.", ioex);
    }
    catch(Exception ex) {
      Oak.log(Oak.Level.ERR, "Error during byte decode.", ex);
    }
  }
  
  /* Sends information to the client about the current gamestate */
  public void update(List<ByteMe.NETX> loc, List<ByteMe.NETX> glo) {
    if(updates.size() < 1) { return; }
    if(updates.size() > 120) { Oak.log(Oak.Level.INFO, "Buffer Oversize: " + updates.size()); updates.clear(); }
    /* Process client input, if there is more than 3 updates in the queue we 'catch up' by processing 2 updates per tick instead of 1 */
    int lm = Math.max(1, Math.min(2, updates.size()-1));
    for(int j=0;j<updates.size()&&j<lm;j++) {
      final List<ByteMe.NETX> proc = updates.remove();
      for(int i=0;i<proc.size();i++) {
        final ByteMe.NETX n = proc.get(i);
        switch(n.designation) {
          case 0x10 : { process010((ByteMe.NET010)n); glo.add(n); break; }
          case 0x11 : { process011((ByteMe.NET011)n); glo.add(n); break; }
          case 0x12 : { process012((ByteMe.NET012)n); loc.add(n); break; }
          case 0x13 : { process013((ByteMe.NET013)n); glo.add(n); break; }
          case 0x18 : { glo.add(process018((ByteMe.NET018)n)); break; }
          case 0x20 : { process020((ByteMe.NET020)n); glo.add(n); break; }
          case 0x30 : { process030((ByteMe.NET030)n); glo.add(n); break; }
        }
      }
    }
  }
  
  /* CREATE_PLAYER_OBJECT */
  public void process010(ByteMe.NET010 n) {
    dead = false;
    level = n.level;
    zone = n.zone;
    position = Shor2.decode(n.pos);
  }
  
  /* KILL_PLAYER_OBJECT */
  public void process011(ByteMe.NET011 n) {
    dead = true;
  }
  
  /* UPDATE_PLAYER_OBJECT */
  public void process012(ByteMe.NET012 n) {
    level = n.level;
    zone = n.zone;
    position = n.pos;
    sprite = n.sprite;
  }
  
  /* PLAYER_OBJECT_EVENT */
  public void process013(ByteMe.NET013 n) {
    
  }
  
    /* PLAYER_RESULT_REQUEST */
  public ByteMe.NET018 process018(ByteMe.NET018 n) {
    result = game.winRequest();
    return new ByteMe.NET018(n.pid, result);
  }
  
  /* OBJECT_EVENT_TRIGGER */
  public void process020(ByteMe.NET020 n) {
    
  }
  
  /* TILE_EVENT_TRIGGER */
  public void process030(ByteMe.NET030 n) {
    
  }
  
  public void send(Packet p) {
    session.sendPacket(p);
  }
  
  public void send(byte[] bb) {
    session.sendBinary(bb);
  }
  
  public boolean isDead() { return dead; }
  
  public String getName() { return session.getUser(); }
  
  /* Called when the player using this controller disconnects */
  public void destroy() {
    garbage = true;
  }
}
