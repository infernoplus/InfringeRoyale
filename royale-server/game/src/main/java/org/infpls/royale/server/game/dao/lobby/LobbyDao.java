package org.infpls.royale.server.game.dao.lobby;

import java.io.IOException;
import java.util.*;

import org.infpls.royale.server.util.Oak;

public class LobbyDao {
  private final List<GameLobby> lobbies;
  
  public LobbyDao() {
    lobbies = new ArrayList();
  }
  
  public GameLobby createLobby() throws IOException {
    GameLobby lobby = new OfficialLobby();
    lobbies.add(lobby);
    lobby.start();
    return lobby;
  }
  
  /* Returns a lobby with open space for a player to join. */
  public GameLobby findLobby() throws IOException {
    cleanUp();
    for(int i=0;i<lobbies.size();i++) {
      final GameLobby lobby = lobbies.get(i);
      if(!lobby.isFull() && !lobby.isLocked()) { return lobby; }
    }
    final GameLobby lobby = createLobby();
    return lobby;
  }
 
  /* This method deletes any user created lobbies that are flagged as closed. */
  public void cleanUp() {
    for(int i=0;i<lobbies.size();i++) {
      if(lobbies.get(i).isClosed()) {
        lobbies.remove(i--);
      }
    }
  }

  public void destroy() {
    try {
      for(int i=0;i<lobbies.size();i++) {
        lobbies.get(i).close("Game server is shutting down...");
      }
    }
    catch(IOException ex) {
      Oak.log(Oak.Level.ERR, "Error during server shutdown.", ex);
    }
  }
}
