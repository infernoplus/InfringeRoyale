package org.infpls.royale.server.game.session;

import java.io.IOException;

public abstract class SessionState {
  
  final public RoyaleSession session;
  
  public SessionState(RoyaleSession session) {
    this.session = session;
  }
  
  public abstract void handlePacket(final String data) throws IOException;
  
  public final void sendPacket(final Packet p) throws IOException {
    session.sendPacket(p);
  }
  
  public abstract void destroy() throws IOException;
  
  /* Normal connection close */
  public final void close() throws IOException {
    session.close();
  }
  
  /* Error connection close */
  public final void close(final String message) throws IOException {
    session.close(message);
  }
  
  /* Exception connection close */
  public final void close(final Exception ex) throws IOException {
    session.close(ex);
  }
  
}
