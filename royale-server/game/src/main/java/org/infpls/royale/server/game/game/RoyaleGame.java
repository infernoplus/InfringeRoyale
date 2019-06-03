package org.infpls.royale.server.game.game;

import java.io.IOException;
import java.util.List;
import org.infpls.royale.server.game.dao.lobby.GameLobby;
import org.infpls.royale.server.game.session.game.PacketG13;

public class RoyaleGame extends RoyaleCore {
  
  private final static int START_DELAY = 450;
  
  private byte place = 0x00;
  
  private int startTimer;
  
  public RoyaleGame() {
    super();
    
    startTimer = 0;
  }
  
  @Override
  public void input(List<GameLobby.InputData> inputs) {
    if(startTimer >= 0) {
      if(startTimer >= START_DELAY) { startTimer = -1; send(new PacketG13(0)); }
      else if(startTimer++ % 15 == 0) { send(new PacketG13(START_DELAY-startTimer)); }
      return;
    }
    
    super.input(inputs);
  }

  @Override
  public void update() throws IOException {
    super.update();
  } 
  
  @Override
  public byte winRequest() {
    place = (byte)Math.min(place+1, 99);
    return place;
  }
}
