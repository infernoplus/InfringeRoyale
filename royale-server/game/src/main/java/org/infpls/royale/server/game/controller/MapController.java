package org.infpls.royale.server.game.controller;

import com.google.gson.*;
import java.io.IOException;
import java.util.*;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import org.infpls.royale.server.util.Oak;

@Controller
public class MapController {
    final private List<GameData> cache = new ArrayList();
  
    final Gson gson = new GsonBuilder().create();
    
    @RequestMapping(value = "/game/{id}", method = RequestMethod.GET, produces = "application/json")
    public @ResponseBody ResponseEntity getGameData(@PathVariable String id) {
      GameData m = null;
      for(int i=0;i<cache.size();i++) {
        final GameData c = cache.get(i);
        if(c.id.equals(id)) {
          m = c; break;
        }
      }
      if(m == null) {
        try {
          m = new GameData(id);
          cache.add(m);
        }
        catch(IOException ex) {
          Oak.log(Oak.Level.ERR, "Error parsing game data file: " + id + " FIELD_1", ex);
          return new ResponseEntity(HttpStatus.NOT_FOUND);
        }
      }      
      return new ResponseEntity(m.data, HttpStatus.OK);
    }
}
