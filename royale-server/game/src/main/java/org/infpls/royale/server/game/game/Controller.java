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
  
  /* Anti Cheat Vars*/
  private static final int AC_STAR_MIN_TIME = 600;   // Minimum time from start of game before you could feasibly get a star.
  private static final int AC_STAR_MAX_COUNT = 3;    // If a player gets more than this number of stars they are cheating.
  private static final int AC_MIN_WIN_TIME = 2700;   // Minimum time for a player to win a game. 90 seconds atm
  
  public boolean banlock; // If flagged, we stop sending player updates out for this player. Used at end of level for cheaters.
  public boolean ban; // If flagged, this user will remain in the game but be essentially shadowbanned
  private int starCount;
  private int acSequence; // If a player skips a level they are cheating
  
  public Controller(RoyaleCore game, RoyaleSession session, short pid) {
    this.game = game;
    this.session = session; this.pid = pid;
    
    dead = true;
    level = 0x00;
    zone = 0x00;
    position = null;
    sprite = 0x00;
    
    result = 0x00;
    
    garbage = false;
    
    starCount = 0;
    ban = false;
  }
  
  /* Handle data from client about their current playstate */
  public void input(final ByteBuffer data) {
    try {
      final List<ByteMe.NETX> de = ByteMe.decode(data, pid);
      updates.add(de);
    }
    catch(IOException ioex) {
      Oak.log(Oak.Level.ERR, "Error during byte decode.", ioex);
      try { session.close("Stop! You violated the law!"); }
      catch(IOException ex) { Oak.log(Oak.Level.ERR, "Error during session ejection.", ex); }
    }
    catch(Exception ex) {
      Oak.log(Oak.Level.ERR, "Error during byte decode.", ex);
      try { session.close("Stop! You violated the law!"); }
      catch(IOException ex2) { Oak.log(Oak.Level.ERR, "Error during session ejection.", ex2); }
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
          case 0x12 : { process012((ByteMe.NET012)n);  if(!banlock) { loc.add(n); } break; }
          case 0x13 : { process013((ByteMe.NET013)n); if(!ban) { glo.add(n); } break; }
          case 0x18 : {
            final ByteMe.NET018 wr = process018((ByteMe.NET018)n);
            if(wr == null) { break; }
            else if(!ban) { glo.add(wr); }
            else { send(wr.encode().array()); }
            break;
          }
          case 0x19 : { process019((ByteMe.NET019)n); break; }
          case 0x20 : { process020((ByteMe.NET020)n); if(!ban) { glo.add(n); } break; }
          case 0x30 : { process030((ByteMe.NET030)n); if(!ban) { glo.add(n); } break; }
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
    
    if(level - acSequence > 1) { ban(); }
    
    acSequence = n.level;
  }
  
  /* PLAYER_OBJECT_EVENT */
  public void process013(ByteMe.NET013 n) {
    /* Anti Cheat */
    if(n.type == 0x02) {
      if(game instanceof RoyaleLobby) { ban(); }
      if(game.frame < AC_STAR_MIN_TIME) { ban(); }
      if(starCount++ > AC_STAR_MAX_COUNT) { ban(); }
    }
  }
  
  /* PLAYER_RESULT_REQUEST */
  public ByteMe.NET018 process018(ByteMe.NET018 n) {
    /* Anti Cheat */
    if(game.frame < AC_MIN_WIN_TIME) { ban(); }
    if(result != 0) { return null; }
    result = game.winRequest(!ban);
    if(ban) { banlock = true; }
    
    return new ByteMe.NET018(n.pid, result, ban);
  }
  
  /* PLAYER_SNITCH */
  public void process019(ByteMe.NET019 n) {
    /* Anti Cheat */
    ban();
  }
  
  /* OBJECT_EVENT_TRIGGER */
  public void process020(ByteMe.NET020 n) {
    
  }
  
  /* TILE_EVENT_TRIGGER */
  public void process030(ByteMe.NET030 n) {
    
  }
  
  /* Essentially a shadow ban. The player is able to keep playing but their actions no longer affect the game. They are also barred from winning. */
  public void ban() {
    if(!ban) { Oak.log(Oak.Level.WARN, "Player banned for potential cheating: '" + getName() +"', F: " + game.frame + ", IP: " + session.getIP()); }
    ban = true;
  }
  
  public void send(Packet p) {
    session.sendPacket(p);
  }
  
  public void send(byte[] bb) {
    session.sendBinary(bb);
  }
  
  public boolean isDead() { return dead; }
  
  public String getName() { return session.getUser(); }
  public String getTeam() { return session.getTeam(); }
  
  /* Called when the player using this controller disconnects */
  public void destroy() {
    garbage = true;
  }
}
