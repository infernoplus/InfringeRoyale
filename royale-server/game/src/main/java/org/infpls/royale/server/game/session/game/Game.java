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
  }
  
  /* Packet Info [ < outgoing | > incoming ]
    > g00 ready to join
    < g01 what to load (from lobby)
    > g03 loaddone, ready
    < g06 lobby global warning
    < g10 gamestate initial (on join)
    < g11 gamestate update
    < g12 player list update (when someone joins)
    = g21 ping
  */
  
  @Override
  public void handlePacket(final String data) throws IOException {
    try {
      final Gson gson = new GsonBuilder().create();
      Packet p = gson.fromJson(data, Packet.class);
      if(p.getType() == null) { close("Invalid data: NULL TYPE"); return; } //Switch statements throw NullPointer if this happens.
      switch(p.getType()) {
        /* Session Type Packets gxx */
        case "g00" : { clientJoin(gson.fromJson(data, PacketG01.class)); break; }
        case "g02" : { close(); break; }
        case "g03" : { clientReady(gson.fromJson(data, PacketG03.class)); break; }
        case "g21" : { ping(gson.fromJson(data, PacketG21.class)); break; }
        
        /* Input Type Packets nxx */
        case "n00" : { input(gson.fromJson(data, PacketN00.class)); break; }
        
        default : { close("Invalid data: " + p.getType()); break; }
      }
    } catch(Exception ex) { /* IOException | NullPointerException | JsonParseException */
      Oak.log(Oak.Level.WARN, "User: '" + session.getUser() + "' threw Unknown Exception", ex);
      close(ex);
    }
  }
  
  private void clientJoin(PacketG01 p) throws IOException {
    lobby.pushEvent(new SessionEvent(session, SessionEvent.Type.JOIN));
  }
  
  private void clientReady(PacketG03 p) throws IOException {
    lobby.pushEvent(new SessionEvent(session, SessionEvent.Type.READY));
  }
  
  private void input(PacketN00 p) throws IOException {
    lobby.pushInput(session, "");
  }
  
  private void ping(PacketG21 p) throws IOException { sendPacket(p); }
  
  @Override
  public void destroy() throws IOException { }
}
