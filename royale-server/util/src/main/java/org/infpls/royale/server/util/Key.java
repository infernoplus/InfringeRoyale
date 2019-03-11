package org.infpls.royale.server.util;

import java.util.UUID;

public class Key {
  public static String generate32() {
    return UUID.randomUUID().toString().replaceAll("-", "");
  }
  
  public static String generate16() {
    return UUID.randomUUID().toString().replaceAll("-", "").substring(0,16);
  }
  
  public static String generate6() {
    return UUID.randomUUID().toString().replaceAll("-", "").substring(0,6);
  }
}
