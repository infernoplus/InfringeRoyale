package org.infpls.royale.server.game.websocket;

import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;

import org.infpls.royale.server.game.dao.DaoContainer;
import org.infpls.royale.server.game.session.RoyaleSession;
import org.infpls.royale.server.util.Oak;


public class RoyaleSocket extends TextWebSocketHandler {
  
    @Autowired
    private DaoContainer dao;
  
    @Override
    public void afterConnectionEstablished(WebSocketSession webSocket) {
      try {
        RoyaleSession session = dao.getUserDao().createSession(webSocket, dao);
        session.start();
        webSocket.getAttributes().put("session", session);
      }
      catch(Exception ex) {
        Oak.log(Oak.Level.ERR, "Exception thrown at Websocket top level.", ex);
      }
    }

    @Override
    public void handleTextMessage(WebSocketSession webSocket, TextMessage data) {
      try {
        RoyaleSession session = (RoyaleSession)(webSocket.getAttributes().get("session"));
        session.handlePacket(data.getPayload());
      }
      catch(Exception ex) {
        Oak.log(Oak.Level.ERR, "Exception thrown at Websocket top level.", ex);
      }
    }
  
    @Override
    public void afterConnectionClosed(WebSocketSession webSocket, CloseStatus status) {
      try {
        dao.getUserDao().destroySession(webSocket);
      }
      catch(Exception ex) {
        Oak.log(Oak.Level.ERR, "Exception thrown at Websocket top level.", ex);
      }
    }
}