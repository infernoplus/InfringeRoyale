package org.infpls.royale.server.game.controller;

import java.io.IOException;
import org.infpls.royale.server.util.Scung;

/* Contains all resources needed for the game. */
public class GameData {
  public final String id;
  public final String data;
  public GameData(final String id) throws IOException {
    this.id = id;
    data = Scung.readFile("game/" + id + ".game");
  }
}
