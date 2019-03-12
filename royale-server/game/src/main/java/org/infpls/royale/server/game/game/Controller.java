package org.infpls.royale.server.game.game;

import org.infpls.royale.server.game.session.Packet;
import org.infpls.royale.server.game.session.RoyaleSession;

public class Controller {
  private final RoyaleGame game;           // Parent
  
  public final RoyaleSession session;      // Session. So we can send game data packets to players.
  public final short pid;                  // Player identifier. Used to id players with a small bit of data.
  
  public Controller(RoyaleGame game, RoyaleSession session, short pid) {
    this.game = game;
    this.session = session; this.pid = pid;
  }
  
  /* Handle data from client about their current playstate */
  public void input(final String data) {
    
  }
  
  /* Gamestate update */
  public void step() {
    
  }
  
  /* Sends information to the client about the current gamestate */
  public void update() {
    
  }
  
  /* Spawn infringio for player to control. */
  public void spawn() {
    
  }
  
  public void send(Packet p) {
    session.sendPacket(p);
  }
  
  public String getName() { return session.getUser(); }
  
  /* Called when the player using this controller disconnects */
  public void destroy() {
    
  }
}
