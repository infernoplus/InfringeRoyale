package org.infpls.royale.server.util;

import java.io.*;
import java.util.Date;

public class Oak {
  
  private static final String FILE = "game-log.html";
  
  public static enum Level {
    INFO("#000000", "#FFFFFF"), WARN("#000000", "#FFFF00"), ERR("#000000", "#FF0000"), CRIT("#FF0000", "#000000");
    
    private final String background, color;
    Level(String bkg, String col) {
      background = bkg; color = col;
    }
    public String html(String src, String message) {
      return "<div style='color: " + color + "; background-color: " + background + "; font-family: \"Calibri\", monospace;'><small>" + new Date().toString() + "</small> - <b>" + src + "</b> :: " + message + "</div>";
    }
  }
  
  private static FileWriter FW;
  private static BufferedWriter BW;
  private static PrintWriter OUT;
  private static boolean OPEN;
  public static void open() {
    if(OPEN) { return; }
    final String folder = Settable.getFilePath();
    final String file = Settable.getFilePath() + "/" + FILE;
    try {
      final File fsDir = new File(folder);
      if(fsDir.exists() && !fsDir.isDirectory()) { System.err.println("Oak.open :: Filestore path is not a valid directory!"); }
      if(fsDir.exists() && !fsDir.canWrite()) { System.err.println("Oak.open :: Can't write to filestore path!"); }
      if(!fsDir.exists()) { if(!fsDir.mkdirs()) { System.err.println("Oak.open :: Failed to create filestore directory!"); } }
      final File fsLog = new File(file);
      if(fsLog.exists() && fsLog.isDirectory()) { System.err.println("Oak.open :: Log file is a directory??"); }
      if(!fsLog.exists()) { if(!fsLog.createNewFile()) { System.err.println("Oak.open :: Failed to create log file!"); } }
      
      FW = new FileWriter(file, true);
      BW = new BufferedWriter(FW);
      OUT = new PrintWriter(BW);
      OPEN = true;
    }
    catch (IOException ex) {
      System.err.println("Oak.open :: Unable to open Log file: " + file);
      ex.printStackTrace();
      return;
    }
    Oak.log(Oak.Level.INFO, "Logging started.");
  }
  
  public static void close() {
    if(!OPEN) { return; }
    final String file = Settable.getFilePath() + "/" + FILE;
    try {
      OUT.close();
      BW.close();
      FW.close();
      OPEN = false;
    }
    catch (IOException ex) {
      System.err.println("Oak.close :: Unable to close Log file: " + file);
      ex.printStackTrace();
      return;
    }
    Oak.log(Oak.Level.INFO, "Logging stopped.");
  }
  
  public static void log(Level level, String msg) {
    log(level, msg, (Exception)null);
  }
  
  public static void log(Level level, String src, String msg) {
    log(level, src, msg, (Exception)null);
  }
  
  public static void log(Level level, String msg, Exception ex) {
    String src = "<Unknown>";
    try {
      final StackTraceElement[] ste = Thread.currentThread().getStackTrace();
      final String[] spl = ste[ste.length > 2 ? 3 : 0].getClassName().split("\\.");
      src = spl[spl.length > 0 ? spl.length-1 : 0] + "." + ste[ste.length > 2 ? 3 : 0].getMethodName();
    }
    catch(Exception e) { }
    
    log(level, src, msg, ex);
  }
  
  public static void log(Level level, String src, String msg, Exception ex) {
    System.out.println(new Date().toString() + " - " + src + " :: " + msg);
    if(ex != null) { ex.printStackTrace(); }
    write(level, src, msg, ex);
  }
  
  private static void write(Level level, String src, String msg, Exception ex) {
    if(!OPEN) { return; }
    
    OUT.println(level.html(src, msg));
    if(ex != null) {
      StringWriter sw = new StringWriter();
      PrintWriter pw = new PrintWriter(sw);
      ex.printStackTrace(pw);
      final String trace = "<div style='background-color: #888888; color: #000000; font-family: \"Calibri\", monospace;'><small>" + sw.toString().replaceAll("\\r?\\n", "</br>") + "</small></div>";
      OUT.println(trace);
    }
    
    OUT.flush();
  }
}
