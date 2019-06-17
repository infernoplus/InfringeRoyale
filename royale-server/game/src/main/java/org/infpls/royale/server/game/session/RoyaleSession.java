package org.infpls.royale.server.game.session;
import java.io.*;
import com.google.gson.*;
import java.nio.ByteBuffer;
import org.springframework.web.socket.*;

 
import org.infpls.royale.server.game.dao.DaoContainer;
import org.infpls.royale.server.game.dao.lobby.*;
import org.infpls.royale.server.game.session.error.*;
import org.infpls.royale.server.game.session.login.Login;
import org.infpls.royale.server.game.session.game.Game;
import org.infpls.royale.server.util.*;

public final class RoyaleSession {
  private final WebSocketSession webSocket;
  private final DaoContainer dao;
  
  private String name;
  private final String sid;
  private final SessionThread sessionThread;
  private SessionState sessionState;
  
  public boolean readyVote;   // Kinda messy. Should really be a linked list in GameLobby instead.
 
  public RoyaleSession(final WebSocketSession webSocket, final DaoContainer dao) throws IOException {
    this.webSocket = webSocket;
    this.dao = dao;
    sid = Key.generate32();

    sessionThread = new SessionThread(this);
    
    readyVote = false;
    
    changeState("l");
  }
  
  public void start() {
    sessionThread.start();
  }
  
  public void handlePacket(final String data) throws IOException {
    sessionState.handlePacket(data);
  }
  
  public void handleBinary(final ByteBuffer data) throws IOException {
    sessionState.handleBinary(data);
  }
  
  public void sendPacket(final Packet p) {
    sessionThread.push(p);
  }
  
  public void sendBinary(final byte[] bb) {
    sessionThread.push(bb);
  }
  
  /* Sends data over websocket on immiediate thread. Should only be called by SessionThread.run() */
  public void sendImmiediate(final Packet p) throws IOException, IllegalStateException {
    if(isOpen()) {
      final Gson gson = new GsonBuilder().create();
      try {
        webSocket.sendMessage(new TextMessage(gson.toJson(p)));
      }
      catch(IllegalArgumentException iae) {
        Oak.log(Oak.Level.ERR, "JSON IAException caught for : '" + getUser() + "'", iae);
      }
    }
  }
  
  /* Sends data over websocket on immiediate thread. Should only be called by SessionThread.run() */
  public void sendImmiediate(final byte[] bb) throws IOException, IllegalStateException {
    if(isOpen()) {
      try {
        webSocket.sendMessage(new BinaryMessage(bb));
      }
      catch(IllegalArgumentException iae) {
        Oak.log(Oak.Level.ERR, "Binary IAException caught for : '" + getUser() + "'", iae);
      }
    }
  }
  
  private void changeState(final String id) throws IOException { changeState(id, null); }
  private void changeState(final String id, final Object generic) throws IOException {
    if(sessionState != null) { sessionState.destroy(); }
    switch(id) { 
      case "l" : { sessionState = new Login(this, dao.getLobbyDao()); break; }
      case "g" : { sessionState = new Game(this, (GameLobby)generic); break; }
      default : throw new IOException("Invalid State Exception. What the fuck are you doing?");
    }
  }
  
  public void join(final GameLobby gl) throws IOException {
    if(!loggedIn()) { throw new IOException("This session is not logged in!"); }
    changeState("g", gl);
  }
  
  public void login(String name) {
    this.name = name;
  }
  
  public boolean loggedIn() {
    return name != null;
  }

  public String getUser() {
    return name;
  }

  public String getSessionId() {
    return sid;
  }
  
  public String getWebSocketId() {
    return webSocket.getId();
  }
  
  /* Only called when anti cheat triggers. */
  public String getIP() {
    return webSocket.getRemoteAddress().toString();
  }
  
  public boolean isOpen() { 
    return webSocket.isOpen();
  }
  
  /* Foricbly removes player from the game they are in. Used in event of critical connection error. */
  /* Does not write to socket or do anything that would cause blocking. */
  public void eject() {
    sessionState.eject();
  }
  
  public void destroy() throws IOException {
    sessionThread.close();
    sessionState.destroy();
  }
  
  /* Normal connection close */
  public void close() throws IOException {
    sessionThread.close();
    webSocket.close();
  }
  
  /* Error connection close */
  public void close(final String message) throws IOException {
    Oak.log(Oak.Level.WARN, "Connection closed for user: '" + (loggedIn()?getUser():"Not Logged In") + "' with message: " + message);
    sessionThread.close();
    if(sessionThread.blockingWaitForClose()) { sendImmiediate(new PacketX00(message)); }
    webSocket.close(CloseStatus.NOT_ACCEPTABLE);
  }
  
  /* Exception connection close */
  public void close(final Exception ex) throws IOException {
    Oak.log(Oak.Level.WARN, "Connection closed for user: '" + (loggedIn()?getUser():"Not Logged In") + "' with Exception: ", ex);
    sessionThread.close();
    StringWriter sw = new StringWriter();
    PrintWriter pw = new PrintWriter(sw);
    ex.printStackTrace(pw);
    if(sessionThread.blockingWaitForClose()) { sendImmiediate(new PacketX01(ex.getMessage(), sw.toString())); }
    webSocket.close(CloseStatus.NOT_ACCEPTABLE);
  }
}
