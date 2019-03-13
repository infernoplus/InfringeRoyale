package org.infpls.royale.server.game.dao.lobby;

import java.io.IOException;
import java.util.*;
import org.infpls.royale.server.game.game.RoyaleGame;

import org.infpls.royale.server.game.session.*;
import org.infpls.royale.server.game.session.game.*;
import org.infpls.royale.server.util.*;

public abstract class GameLobby {
  private final static String GAME_ID = "smb";
  
  protected final String lid; //Lobby ID
  
  protected final int maxPlayers;
  protected final List<RoyaleSession> players, loading;
  
  private final GameLoop loop; /* Seperate timer thread to trigger game steps */
  protected final RoyaleGame game; /* The actual game object */
  
  private final InputSync inputs; /* Packets that the game must handle are stored until a gamestep happens. This is for synchronization. */
  private final EventSync events; /* Second verse same as the first. */
  
  protected boolean closed; // Clean this shit up!
  public GameLobby() throws IOException {
    lid = Key.generate32();
    
    maxPlayers = 99;
    
    players = new ArrayList();
    loading = new ArrayList();
    
    inputs = new InputSync();
    events = new EventSync();
    
    closed = false;
    
    game = new RoyaleGame();

    loop = new GameLoop(this);
  }
  
  /* It's apparently dangerous to start the thread in the constructor because ********REASONS********* so here we are! */
  public void start() { loop.start(); }

  public void step(final long tick) {
    try {
      handleEvents();
      
      game.input(inputs.pop());
      game.step();
      game.update();
    }
    catch(Exception ex) {
      Oak.log(Oak.Level.CRIT, "Game step exception ??? <INFO>", ex);
      Oak.log(Oak.Level.ERR,"Attempting to close lobby nicely!");
      try { close("The Game Lobby encoutered an error and had to close. Sorry!"); Oak.log(Oak.Level.INFO, "Lobby closed correctly."); }
      catch(IOException ioex) {
        Oak.log(Oak.Level.ERR, "Failed to close lobby correctly! Ejecting players manually!", ioex);
        closed = true;
        for(int i=0;i<players.size();i++) {
          try { players.get(i).close(ex); }
          catch(Exception pioex) { Oak.log(Oak.Level.CRIT, "Very bad! Better start praying!", pioex); }
        }
      }
    }
  }
  
  private void handleEvents() {
    final List<SessionEvent> evts = events.pop();
    for(int i=0;i<evts.size();i++) {
      final SessionEvent evt = evts.get(i);
      switch(evt.type) {
        case JOIN : { joinEvent(evt.session); break; }
        case READY : { readyEvent(evt.session); break; }
        case DISCONNECT : { disconnectEvent(evt.session); break; }
      }
    }
  }
  
  private void joinEvent(RoyaleSession session) {
    try { if(isClosed() || loading.contains(session) || players.contains(session)) { session.close("Error joining lobby."); return; } }
    catch(IOException ioex) { Oak.log(Oak.Level.ERR, "Error during player disconnect.", ioex); return; }
    loading.add(session);
    sendPacket(new PacketG01(GAME_ID), session);
  }
  
  private void readyEvent(RoyaleSession session) {
    loading.remove(session);
    try { if(isClosed() || players.contains(session)) { session.close("Error joining lobby."); return; } }
    catch(IOException ioex) { Oak.log(Oak.Level.ERR, "Error during player disconnect.", ioex); return; }
    players.add(session);
    game.join(session);
  }
  
  private void disconnectEvent(RoyaleSession session) {
    loading.remove(session);
    players.remove(session);
    game.leave(session);
  }
  
  protected void close(final String message) throws IOException {
    sendPacket(new PacketG06(message));
    close();
  }
  
  protected void close() throws IOException {
    closed = true;
    for(int i=0;i<players.size();i++) {
      players.get(i).close();
    }
    game.destroy();
  }
  
  /* Send a packet to everyone in the lobby */
  public void sendPacket(final Packet p) {
    for(int i=0;i<players.size();i++) {
      players.get(i).sendPacket(p);
    }
  }
  
  /* Send a packet to a specific player with the given SID */
  public void sendPacket(final Packet p, final String sid) {
    for(int i=0;i<players.size();i++) {
      final RoyaleSession player = players.get(i);
      if(player.getSessionId().equals(sid)) {
        player.sendPacket(p);
        return;
      }
    }
    Oak.log(Oak.Level.WARN, "Invalid User SID: '" + sid + "'");
  }
  
  /* Send a packet to a specific player */
  public void sendPacket(final Packet p, final RoyaleSession player) {
    player.sendPacket(p);
  }
  
  public void pushInput(final RoyaleSession session, final String data) { inputs.push(new InputData(session, data)); }
  public void pushEvent(final SessionEvent evt) { events.push(evt); }
  
  public String getLid() { return lid; }
  public boolean isFull() { return loading.size() + players.size() >= maxPlayers; }
  public boolean isClosed() { return closed; }
  
  /* @FIXME This might be the worst way to do this in the universe. It might be fine. No way to know really. 
     Just make sure it's safe by using sychronized methods where you can and making sure you don't subscribe
     players to the game loop before their clients are ready to handle the stream of data.
  */
  private class GameLoop extends Thread {
    private static final int TICK_RATE = 33;
    private final GameLobby lobby;
    
    private long lastStepTime;
    public GameLoop(final GameLobby lobby) {
      super();
      this.lobby = lobby;
      lastStepTime = 0;
    }
    
    @Override
    public void run() {
      long last = System.currentTimeMillis();
      while(!lobby.closed) {
        long now = System.currentTimeMillis();
        if(last + GameLoop.TICK_RATE <= now) {
          last = now;
          lobby.step(lastStepTime);
          lastStepTime = System.currentTimeMillis() - now;
        }
        try {
          long t = (last + GameLoop.TICK_RATE) - System.currentTimeMillis(); //Cannot use 'now' again because time may have passed during lobby.step();
          sleep(t > GameLoop.TICK_RATE ? GameLoop.TICK_RATE : (t < 1 ? 1 : t));
        }
        catch(InterruptedException ex) {
          Oak.log(Oak.Level.CRIT, "Game loop thread interupted by exception!", ex);
          /* DO something about this... Not sure if this is a real problem or not, might report it in debug. */
        }
      }
    }
  }
  
  private class InputSync {
    private List<InputData> inputs;
    public InputSync() { inputs = new ArrayList(); }

    public void push(final InputData in) { syncInputAccess(false, in); }
    public List<InputData> pop() { return syncInputAccess(true, null); }

    /* Game Packet handling methods 
       - syncAccess.s == true / pop
       - syncAccess.s == false / push
    */
    private synchronized List<InputData> syncInputAccess(final boolean s, final InputData in) {
      if(s) {
        List<InputData> inps = inputs;
        inputs = new ArrayList();
        return inps;
      }
      else {
        if(in == null) { return null; }
        inputs.add(in);
        return null;
      }
    }
  }
  
  private class EventSync {
    private List<SessionEvent> sessionEvents;
    public EventSync() { sessionEvents = new ArrayList(); }

    public void push(final SessionEvent evt) { syncEventAccess(false, evt); }
    public List<SessionEvent> pop() { return syncEventAccess(true, null); }

    /* SessionEvent handling methods 
     - syncAccess.s == true / pop
     - syncAccess.s == false / push
    */
    private synchronized List<SessionEvent> syncEventAccess(final boolean s, final SessionEvent evt) {
      if(s) {
        List<SessionEvent> evts = sessionEvents;
        sessionEvents = new ArrayList();
        return evts;
      }
      else {
        if(evt == null) { return null; }
        sessionEvents.add(evt);
        return null;
      }
    }
  }
  
  public class InputData {
    public final RoyaleSession session;
    public final String data;
    public InputData(final RoyaleSession session, final String data) {
      this.session = session;
      this.data = data;
    }
  }
}
