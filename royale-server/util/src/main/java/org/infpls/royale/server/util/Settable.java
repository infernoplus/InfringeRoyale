package org.infpls.royale.server.util;

import com.google.gson.*;
import java.io.IOException;

/* Global settings, read from file noxio.properties. */
/* This was used instead of spring config due to many minor issues caused by spring */
public class Settable {
  
  private static final String FILE = "noxio.properties";
  private static boolean INIT = false;
  
  private static ServerInfo SERVER_INFO;                                        // Game Server settings
  private static String AUTH_DOMAIN, AUTH_ADDRESS;                              // Auth Server settings
  private static int AUTH_PORT;
  
  private static String FILE_PATH;                                              // File Store settings
  
  /* Checks if the settings finle ( FILE ) has been changed or yet to be loaded and reads it into this class */
  public static synchronized void update() {
    if(!INIT) { read(); INIT = true; }
    /* @TODO: check and update */
  }
  
  /* Reads in all settings from the properties file to this class */
  private static void read() {
    try {
      final String data = Scung.readFile(FILE);
      final JsonElement json = new JsonParser().parse(data);

      final JsonObject server = json.getAsJsonObject().getAsJsonObject("server");
      final JsonObject auth = json.getAsJsonObject().getAsJsonObject("auth");
      final JsonObject file = json.getAsJsonObject().getAsJsonObject("file");

      final String name = server.get("name").getAsString();
      final String location = server.get("location").getAsString();
      final String description = server.get("description").getAsString();
      final int port = server.get("port").getAsInt();
      final int max = server.get("max").getAsInt();
      SERVER_INFO = new ServerInfo(name, description, location, port, max);
      
      AUTH_DOMAIN = auth.get("domain").getAsString();
      AUTH_ADDRESS = auth.get("address").getAsString();
      AUTH_PORT = auth.get("port").getAsInt();
      
      FILE_PATH = file.get("path").getAsString();
    }
    catch(IOException ex) {
      System.err.println("Settable.read :: Failed to read settings file: " + FILE);
      ex.printStackTrace();
    }
    catch(JsonParseException | NumberFormatException ex) {
      System.err.println("Settable.read :: Failed to parse settings file: " + FILE);
      ex.printStackTrace();
    }
  }
  
  public static class ServerInfo {
    public final String name, description, location;
    public final int port, max;
    ServerInfo(String name, String description, String location, int port, int max) {
      this.name = name; this.description = description; this.location = location; this.port = port; this.max = max;
    }
  }
  
  public static ServerInfo getServerInfo() { return SERVER_INFO; }
  public static String getAuthDomain() { return AUTH_DOMAIN; }
  public static String getAuthAddress() { return AUTH_ADDRESS; }
  public static int getAuthPort() { return AUTH_PORT; }
  public static String getFilePath() { return FILE_PATH; }
  
}
