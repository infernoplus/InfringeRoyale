package org.infpls.royale.server.game.session.game;

import com.google.gson.*;
import java.io.IOException;

import org.infpls.royale.server.game.dao.lobby.GameLobby;
import org.infpls.royale.server.game.session.Packet;
import org.infpls.royale.server.game.session.PacketS00;
import org.infpls.royale.server.game.session.RoyaleSession;
import org.infpls.royale.server.game.session.SessionState;
import org.infpls.royale.server.util.Oak;

public class Game extends SessionState {
  
  private final GameLobby lobby;
  
  public Game(final RoyaleSession session, final GameLobby lobby) throws IOException {
    super(session);
    
    this.lobby = lobby;
    
    sendPacket(new PacketS00('g'));
    sendGameData();
  }
  
  /* Packet Info [ < outgoing | > incoming ]
    < g00 game data (loading screen)
    > g01 client ready (load done)
    < g06 lobby global warning
    = g21 ping
  */
  
  @Override
  public void handlePacket(final String data) throws IOException {
    try {
      final Gson gson = new GsonBuilder().create();
      Packet p = gson.fromJson(data, Packet.class);
      if(p.getType() == null) { close("Invalid data: NULL TYPE"); return; } //Switch statements throw NullPointer if this happens.
      switch(p.getType()) {
        /* Session Type Packets g0x */
        case "g01" : { clientReady(gson.fromJson(data, PacketG01.class)); break; }
        case "g02" : { close(); break; }
        case "g21" : { ping(gson.fromJson(data, PacketG21.class)); break; }
        /* Ingame Type Packets gxx */
        
        /* Input Type Packets ixx */
        
        default : { close("Invalid data: " + p.getType()); break; }
      }
    } catch(Exception ex) { /* IOException | NullPointerException | JsonParseException */
      Oak.log(Oak.Level.WARN, "User: '" + session.getUser() + "' threw Unknown Exception", ex);
      close(ex);
    }
  }
  
  private void sendGameData() throws IOException {
    sendPacket(new PacketG00());
  }
  
  private void clientReady(PacketG01 p) throws IOException {
    /* joiny */
  }
  
  private void ping(PacketG21 p) throws IOException { sendPacket(p); }
  
  @Override
  public void destroy() throws IOException { }
}
