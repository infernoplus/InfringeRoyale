package org.infpls.royale.server.game.util;

import java.util.*;
import org.infpls.royale.server.util.Oak;

/* The final solution of anti-cheat */
public class VirginSlayer {
  
  private static final int STRIKES = 2;
  
  private static final List<Virgin> VIRGINS = new ArrayList();
  
  
  public static synchronized void strike(String ip) {
    try { 
      final String ipt = ip.substring(1).split(":")[0].trim(); // Cut string to just IP

      final Virgin v = get(ipt);
      if(v != null) {
        if(++v.strikes >= STRIKES) { Oak.log(Oak.Level.CRIT, "PERM BANNED IP: " + ipt); }
      }
      else {
        VIRGINS.add(new Virgin(ipt));
      }
      
    }
    catch(Exception ex) {
      Oak.log(Oak.Level.ERR, "Error while striking : " + ip, ex);
    }
  }
  
  private static Virgin get(String ipt) {
    for(int i=0;i<VIRGINS.size();i++) {
      final Virgin v = VIRGINS.get(i);
      if(v.ipt.equals(ipt)) { return v; }
    }
    return null;
  }
  
  public static boolean isBanned(String ip) {
    try { 
      final String ipt = ip.substring(1).split(":")[0].trim(); // Cut string to just IP
      
      final Virgin v = get(ipt);
      if(v != null) { return v.strikes >= STRIKES; }
    }
    catch(Exception ex) {
      Oak.log(Oak.Level.ERR, "Error while checking ban for : " + ip, ex);
    }
    return false; // Good faith I guess...
  }
  
  
  private static class Virgin {
    public final String ipt;
    public int strikes;
    public Virgin(String ipt) {
      this.ipt = ipt;
      strikes = 1;
    }
  }
}
