package org.infpls.royale.server.game.dao.lobby;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.*;

import org.infpls.royale.server.game.game.*;
import org.infpls.royale.server.game.session.*;
import org.infpls.royale.server.game.session.game.*;
import org.infpls.royale.server.util.*;

public abstract class GameLobby {
  private final static String LOBBY_FILE = "lobby";
  private final static String[] GAME_FILES = new String[]{ "world-1", "world-2", "world-3" };
  
  private final static int MIN_PLAYERS = 1;          // Min players needed to vote start
  private final static int MAX_PLAYERS = 75;         // Max players, game starts automatically
  private final static float MIN_VOTE_FRAC = .85f;   // Needs 85% ready vote to start early
  private final static int MAX_AGE = 1440000;        // Max number of frames before we just close the lobby. This is 12 hours.
  
  private final static int START_DELAY = 150;
  
  protected final String lid; //Lobby ID
  
  protected final List<RoyaleSession> players, loading;
  
  private final GameLoop loop; /* Seperate timer thread to trigger game steps */
  protected RoyaleCore game; /* The actual game object */
  
  protected final String gameFile;
  
  private final InputSync inputs; /* Packets that the game must handle are stored until a gamestep happens. This is for synchronization. */
  private final EventSync events; /* Second verse same as the first. */
  
  private int startTimer;
  private int age;
  
  protected boolean locked; // Prevents more people from joining
  protected boolean closed; // Clean this shit up!
  public GameLobby() throws IOException {
    lid = Key.generate32();
    
    players = new ArrayList();
    loading = new ArrayList();
    
    inputs = new InputSync();
    events = new EventSync();
    
    startTimer = -1;
    
    locked = false;
    closed = false;
    
    game = new RoyaleLobby();
    gameFile = GAME_FILES[(int)Math.min(GAME_FILES.length-1, Math.random()*GAME_FILES.length)];

    loop = new GameLoop(this);
  }
  
  /* It's apparently dangerous to start the thread in the constructor because ********REASONS********* so here we are! */
  public void start() { loop.start(); }

  public void step(final long tick) {
    try {      
      handleEvents();
      
      if(startTimer >= 0 && ++startTimer >= START_DELAY) { whereWeDroppin(); return; }
      if(locked && (loading.size() + players.size() < 1 || ++age > MAX_AGE)) { close(); }

      game.input(inputs.pop());
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
  
  private void handleEvents() throws IOException {
    final List<SessionEvent> evts = events.pop();
    for(int i=0;i<evts.size();i++) {
      final SessionEvent evt = evts.get(i);
      switch(evt.type) {
        case JOIN : { joinEvent(evt.session); break; }
        case READY : { readyEvent(evt.session); break; }
        case DISCONNECT : { disconnectEvent(evt.session); break; }
        case EJECT : { ejectEvent(evt.session); break; }
        case VOTE : { voteEvent(evt.session); break; }
      }
    }
  }
  
  private void joinEvent(RoyaleSession session) {
    try { if(isClosed() || loading.contains(session) || players.contains(session)) { session.close("Error joining lobby."); return; } }
    catch(IOException ioex) { Oak.log(Oak.Level.ERR, "Error during player disconnect.", ioex); return; }
    loading.add(session);
    sendPacket(new PacketG01(LOBBY_FILE), session);
  }
  
  private void readyEvent(RoyaleSession session) throws IOException {
    loading.remove(session);
    try { if(isClosed() || players.contains(session)) { session.close("Error joining lobby."); return; } }
    catch(IOException ioex) { Oak.log(Oak.Level.ERR, "Error during player disconnect.", ioex); return; }
    players.add(session);
    game.join(session);
    
    if(players.size() >= MAX_PLAYERS) { startTimer(); }
  }
  
  private void disconnectEvent(RoyaleSession session) {
    loading.remove(session);
    players.remove(session);
    game.leave(session);
  }
  
  private void ejectEvent(RoyaleSession session) {
    Oak.log(Oak.Level.WARN, "Player ejection event recieved: '" + session.getUser() + "'");
    loading.remove(session);
    players.remove(session);
    game.leave(session);
  }
  
  private void voteEvent(RoyaleSession session) {
    session.readyVote = true;
    if(players.size() < MIN_PLAYERS || locked) { return; }
    
    int vr = 0;
    for(int i=0;i<players.size();i++) {
      if(players.get(i).readyVote) { vr++; }
    }
    
    if((float)vr/(float)players.size() >= MIN_VOTE_FRAC) { startTimer(); }
  }
  
  protected void close(final String message) throws IOException {
    sendPacket(new PacketG06(message));
    close();
  }
  
  /* Starts timer to start game. */
  private void startTimer() {
    if(locked) { return; }
    locked = true;
    startTimer = 0;
  }
  
  /* When called, locks this lobby, tells clients to load the game data, and starts the battle royale match */
  private void whereWeDroppin() {
    startTimer = -1;
    
    game.destroy();
    
    for(int i=0;i<loading.size();i++) {
      try { loading.get(i).close("Match started while client was loading."); }
      catch(IOException ex) { Oak.log(Oak.Level.ERR, "GameLobby::whereWeDroppin()", "Error closing a loading client connection.", ex); }
    }
    
    for(int i=0;i<players.size();i++) {
      final RoyaleSession session = players.remove(i--);
      try { if(isClosed()) { session.close("Error during game setup."); return; } }
      catch(IOException ioex) { Oak.log(Oak.Level.ERR, "Error during game setup.", ioex); return; }
      loading.add(session);
      sendPacket(new PacketG01(gameFile), session);
    }
    
    game = new RoyaleGame();
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
  
  public void pushInput(final RoyaleSession session, final ByteBuffer data) { inputs.push(new InputData(session, data)); }
  public void pushEvent(final SessionEvent evt) { events.push(evt); }
  
  public String getLid() { return lid; }
  public boolean isFull() { return loading.size() + players.size() >= MAX_PLAYERS; }
  public boolean isLocked() { return locked; }
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
    public final ByteBuffer data;
    public InputData(final RoyaleSession session, final ByteBuffer data) {
      this.session = session;
      this.data = data;
    }
  }
}
