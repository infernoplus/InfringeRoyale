package org.infpls.royale.server.home.controller;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
public class StatusController {
  @RequestMapping(value = "/status", method = RequestMethod.GET, produces = "application/json")
  public @ResponseBody ResponseEntity getStatus() {
    final Gson gson = new GsonBuilder().create();
    final Status status = new Status(42);
    return new ResponseEntity(gson.toJson(status), HttpStatus.OK);
  }
  
  public class Status {
    public final String result;
    public final int active;
    public Status(int act) {
      result = null;
      active = act;
    }
    
    public Status(int act, String errorMessage) {
      result = errorMessage;
      active = act;
    }
  }
}
