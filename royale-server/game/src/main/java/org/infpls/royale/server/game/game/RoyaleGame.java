package org.infpls.royale.server.game.game;

import java.util.*;
import org.infpls.royale.server.game.dao.lobby.GameLobby;
import org.infpls.royale.server.game.session.*;
import org.infpls.royale.server.game.session.game.*;

public class RoyaleGame {
  public final List<Controller> controllers;
  
  public RoyaleGame() {
    controllers = new ArrayList();
  }
  
  /* Handle data from client about their current playstate */
  public void input(List<GameLobby.InputData> inputs) {
    for(int i=0;i<inputs.size();i++) {
      final GameLobby.InputData input = inputs.get(i);
      final Controller controller = getController(input.session);
      controller.input(input.data);
    }
  }
  
  /* Gamestate update */
  public void step() {
    
  }
  
  /* Sends information to the client about the current gamestate */
  public void update() {
    send(new PacketG11(""));
  }
  
  /* Player Join */
  public void join(RoyaleSession session) {
    final Controller controller = new Controller(this, session, createPid());
    controllers.add(controller);
    
    // Send inital packet
    controller.send(new PacketG10());
    
    // Regenerate player list
    final List<PacketG12.NamePair> players = new ArrayList();
    for(int i=0;i<controllers.size();i++) {
      final Controller c = controllers.get(i);
      players.add(new PacketG12.NamePair(c.pid, c.getName()));
    }
    send(new PacketG12(players));
  }
  
  /* Player Leave */
  public void leave(RoyaleSession session) {
    final Controller controller = getController(session);
    if(controller == null) { return; }
    
    controller.destroy();
    controllers.remove(controller);
    
    // Regenerate player list
    final List<PacketG12.NamePair> players = new ArrayList();
    for(int i=0;i<controllers.size();i++) {
      final Controller c = controllers.get(i);
      players.add(new PacketG12.NamePair(c.pid, c.getName()));
    }
    send(new PacketG12(players));
  }
  
  private Controller getController(RoyaleSession session) {
    for(int i=0;i<controllers.size();i++) {
      final Controller controller = controllers.get(i);
      if(controller.session == session) {
        return controller;
      }
    }
    return null;
  }
  
  private void send(Packet p) {
    for(int i=0;i<controllers.size();i++) {
      final Controller controller = controllers.get(i);
      controller.send(p);
    }
  }
  
  private short nxtPid;
  private short createPid() {
    return nxtPid++;
  }
  
  /* Called when game is over and lobby is closing */
  public void destroy() {
    
  }
}
