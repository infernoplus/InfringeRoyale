
package org.infpls.royale.server.game.session.game;

import org.infpls.royale.server.game.session.RoyaleSession;

/* Since game lobbies run on a seperate thread with a fixed timestep, we use events to communicate with game threads */
/* Direct communication runs the risk of race conditions and bad things happening */
public class SessionEvent {
  public enum Type { JOIN, READY, DISCONNECT, VOTE }
  
  public final RoyaleSession session; //Player session who created this event
  public final Type type;
  
  public SessionEvent(RoyaleSession session, Type type) {
    this.session = session;
    this.type = type;
  }
}
