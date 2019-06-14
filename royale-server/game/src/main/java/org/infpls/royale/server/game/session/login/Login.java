package org.infpls.royale.server.game.session.login;

import com.google.gson.*;
import java.io.IOException;
import java.nio.ByteBuffer;
import org.infpls.royale.server.game.dao.lobby.GameLobby;

import org.infpls.royale.server.game.dao.lobby.LobbyDao;
import org.infpls.royale.server.game.session.*;

public class Login extends SessionState {
  
  private final LobbyDao lobbyDao;
  
  public Login(final RoyaleSession session, final LobbyDao lobbyDao) throws IOException {
    super(session);
    
    this.lobbyDao = lobbyDao;
    
    sendPacket(new PacketS00('l'));
  }
  
  /* Packet Info [ < outgoing | > incoming ]
     > l00 user ready (login)
     < l01 sid and name
     > l02 close
  */
  
  @Override
  public void handlePacket(final String data) throws IOException {
    try {
      final Gson gson = new GsonBuilder().create();
      Packet p = gson.fromJson(data, Packet.class);
      if(p.getType() == null) { close("Invalid data: NULL TYPE"); return; } //Switch statements throw Null Pointer if this happens.
      switch(p.getType()) {
        case "l00" : { login(gson.fromJson(data, PacketL00.class)); break; }
        case "l02" : { close(); break; }
        default : { close("Invalid data: " + p.getType()); break; }
      }
    } catch(IOException | NullPointerException | JsonParseException ex) {
      close(ex);
    }
  }
  
  /* Validate username, login, return data, automatically choose and join a lobby */
  private void login(final PacketL00 p) throws IOException {
    /* Username */
    String name = p.name.trim();
    if(name.length() > 20) { name = name.substring(0, 20); }
    else if(name.length() < 1) { name = "Infringio"; }
    
    /* Login */
    session.login(name);
    
    /* Return data */
    sendPacket(new PacketL01(name, session.getSessionId()));
    
    /* Choose Lobby */
    final GameLobby lobby = lobbyDao.findLobby();
    
    /* Join Lobby */
    session.join(lobby);
  }
  
  @Override
  public void handleBinary(final ByteBuffer data) throws IOException {
    throw new IOException("Recieved unknown binary data from client!");
  }
  
  public void eject() { }

  @Override
  public void destroy() throws IOException {
    
  }
  
}
