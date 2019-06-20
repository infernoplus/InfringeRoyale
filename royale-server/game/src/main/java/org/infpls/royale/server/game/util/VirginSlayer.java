package org.infpls.royale.server.game.util;

import java.util.*;
import org.infpls.royale.server.util.Oak;

/* The final solution of anti-cheat */
public class VirginSlayer {
  
  private static final int STRIKES = 2;
  
  private static final List<Virgin> VIRGINS = new ArrayList();
  
  /* TODO: I should write this to a file but that would be more work so whatever.*/
  public static final String[] BAN_LIST = new String[] {
    "82.21.54.197",
    "88.90.251.221",
    "2.86.213.204",
    "72.179.247.80",
    "72.179.247.80",
    "104.131.176.234",
    "85.72.94.74",
    "104.236.53.155",
    "155.4.129.252",
    "155.4.129.252",
    "104.131.19.173",
    "79.157.67.69",
    "104.236.205.233",
    "104.236.205.233",
    "138.99.224.119",
    "89.152.216.115",
    "77.16.221.54",
    "77.16.67.80",
    "178.117.132.133",
    "77.16.210.4",
    "159.118.45.128",
    "85.225.155.28",
    "67.174.159.53",
    "77.16.208.130",
    "79.131.10.225",
    "77.16.57.171",
    "77.16.65.228",
    "77.16.67.222",
    "177.98.164.32",
    "77.18.57.197",
    "68.228.78.146",
    "77.16.77.242",
    "77.18.57.35",
    "73.75.66.185",
    "73.75.66.185",
    "77.16.78.80",
    "24.45.243.88",
    "24.45.243.88",
    "173.160.95.142",
    "185.159.82.172"
  };
  
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
      
      for(int i=0;i<BAN_LIST.length;i++) {
        if(BAN_LIST[i].equals(ipt)) { return true; }
      }
      
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
