package org.infpls.royale.server.game.dao.lobby;

import java.io.IOException;
import org.infpls.royale.server.game.session.RoyaleSession;
import org.infpls.royale.server.game.session.game.PacketG01;
import org.infpls.royale.server.util.Oak;

public class JailLobby extends GameLobby {
  
  private final static String JAIL_FILE = "jail";
  
  public JailLobby() throws IOException {
    super();
  }
  
  @Override
  protected void joinEvent(RoyaleSession session) {
    try { if(isClosed() || loading.contains(session) || players.contains(session)) { session.close("Error joining lobby."); return; } }
    catch(IOException ioex) { Oak.log(Oak.Level.ERR, "Error during player disconnect.", ioex); return; }
    loading.add(session);
    sendPacket(new PacketG01(JAIL_FILE), session);
  }
  
  @Override
  protected void whereWeDroppin() { }
}
