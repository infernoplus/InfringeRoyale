package org.infpls.royale.server.game.session;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.*;
import org.infpls.royale.server.util.Oak;

/* This class handles the sending of packets to connected clients */
/* This is done on a seperate thread to prevent blocks in the game loop */
/* If a websocket is blocked for more than 15 seconds on sending a packet it will initiate a force close on it */
public class SessionThread extends Thread {
  private final RoyaleSession session;
  private List<Packet> pout;              // Outgoing packet queue
  private List<ByteBuffer> bout;              // Outgoing packet queue
  
  private static final int SEND_TIMEOUT = 15000, CLOSE_WAIT_TIMEOUT = 150;
  
  private long sendTime;                 // Time of last send start
  private boolean sending;               // Currently in the process of sending data to a client
  private boolean forceClose, safeClose, closed;
  public SessionThread(final RoyaleSession ns) {
    session = ns;
    pout = new ArrayList();
    bout = new ArrayList();
    
    sendTime = System.currentTimeMillis();
    sending = false;
    forceClose = false;
    safeClose  = false;
    closed = false;
  }
  
  @Override
  public void run() {
    while(session.isOpen() && !forceClose && !safeClose) {
      final List<Packet> paks = popPacket();
      final List<ByteBuffer> bins = popBinary();
      try {
        if(bins == null && paks == null) { doWait(); }
        if(bins != null) {
          sendTime = System.currentTimeMillis();
          sending = true;
          for(int i=0;i<bins.size();i++) {
            final ByteBuffer bb = bins.get(i);
            if(bb.capacity() > 0) { session.sendImmiediate(bb); }
          }
          sending = false;
        }
        if(paks != null) {
          sendTime = System.currentTimeMillis();
          sending = true;
          session.sendImmiediate(new PacketS01(paks));
          sending = false;
        }
      }
      catch(Exception ex) {
        Oak.log(Oak.Level.ERR, "Exception during SessionThread send for user: '" + session.getUser() + "'. Closing connection.", ex);
        forceClose();
      }
    }
    if(forceClose) {
      Oak.log(Oak.Level.WARN, "Unsafe SessionThread close for user: '" + session.getUser() + "'");
      try { if(session.isOpen()) { session.close(); } }
      catch(IOException ex) { Oak.log(Oak.Level.ERR, "Failed to force close SessionThread for user: '" + session.getUser() + "'", ex); }
      Oak.log(Oak.Level.INFO, "SessionThread resolved for user: '" + session.getUser() + "'");
    }
    closed = true;
  }
  
  private synchronized void doWait() { try { wait(); } catch(InterruptedException ex) { Oak.log(Oak.Level.ERR, "Interrupt Exception.", ex); } }
  private synchronized void doNotify() { notify(); }
  
  /* Note: For whatever reason, sending an empty ByteBuffer through sendImmiedate() causes the thread to hang. */
  /* Always check to make sure your ByteBuffer has data in it before sending! */
  public void checkTimeout() {
    final long now = System.currentTimeMillis();
    if(sending && ((now - sendTime) > SEND_TIMEOUT)) {
      Oak.log(Oak.Level.WARN, "Send Timeout exceeded for user: " + session.getUser() + " :: lastSend=" + sendTime + " now=" + now + " diff=" + (now-sendTime));
      forceClose();
    }
  }
  
  public void push(final Packet p) { if(forceClose || safeClose || closed) { return; } syncPacketAccess(false, p); checkTimeout(); doNotify(); }
  public void push(final ByteBuffer bb) { if(forceClose || safeClose || closed) { return; } syncBinaryAccess(false, bb); checkTimeout(); doNotify(); }
  
  private List<Packet> popPacket() { return syncPacketAccess(true, null); }
  private List<ByteBuffer> popBinary() { return syncBinaryAccess(true, null); }
  
  private synchronized List<Packet> syncPacketAccess(final boolean s, final Packet p) {
    if(s) {
      if(pout.size() > 0) { final List<Packet> popped = pout; pout = new ArrayList(); return popped; }
      else { return null; }
    }
    pout.add(p);
    return null;
  }
  
  private synchronized List<ByteBuffer> syncBinaryAccess(final boolean s, final ByteBuffer bb) {
    if(s) {
      if(bout.size() > 0) { final List<ByteBuffer> popped = bout; bout = new ArrayList(); return popped; }
      else { return null; }
    }
    bout.add(bb);
    return null;
  }
  
  /* This is the safe close, this is called by NoxioSession during a normal disconnect. */
  public void close() {
    safeClose = true;
    doNotify();
  }
  
  /* Returns as soon as thread is completely finished sending data OR if CLOSE_WAIT_TIMEOUT milliseconds pass */
  /* Returns true if properly closed, returns false if times out */
  public boolean blockingWaitForClose() throws IOException {
    doNotify();
    final long start = System.currentTimeMillis();
    long now = start;
    while(!closed && ((now - start) < CLOSE_WAIT_TIMEOUT)) { now = System.currentTimeMillis(); }
    if(!closed) { Oak.log(Oak.Level.ERR, "TIMED OUT WAITING FOR CLOSE! user: '" + session.getUser() + "'"); }
    return closed;
  }
  
  private void forceClose() {
    if(forceClose) { return; }
    forceClose = true;
    Oak.log(Oak.Level.WARN, "ForceClose call for user: '" + session.getUser() + "'");
    try { Oak.log(Oak.Level.INFO, "Kicking user from game: '" + session.getUser() + "'"); session.eject(); } catch(IOException ex) { Oak.log(Oak.Level.ERR, "Failed to kick user from game.", ex); }
    doNotify();
  }
}
