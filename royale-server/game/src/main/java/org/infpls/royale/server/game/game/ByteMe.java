package org.infpls.royale.server.game.game;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.*;

public class ByteMe {
 
  public static List<NETX> decode(ByteBuffer data, short pid) throws IOException {
    final List<NETX> de = new ArrayList();
    while(data.remaining() > 0) {
      byte designation = data.get();
      switch(designation) {
        case 0x10 : { de.add(new NET010(pid, data)); break; }
        case 0x11 : { de.add(new NET011(pid, data)); break; }
        case 0x12 : { de.add(new NET012(pid, data)); break; }
        default : { throw new IOException("Invalid designation byte: " + designation); }
      }
    }
    return de;
  }
  
  public static ByteBuffer encode(List<NETX> nets) throws IOException {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    for(int i=0;i<nets.size();i++) {
      baos.write(nets.get(i).encode().array());
    }
    ByteBuffer bb = ByteBuffer.wrap(baos.toByteArray());
    baos.close();
    return bb;
  }
  
  public static abstract class NETX {
    public final byte designation;
    public final short pid;
    public NETX(byte designation, short pid) {
      this.designation = designation;
      this.pid = pid;
    }
    
    public abstract ByteBuffer encode();
  }
  
  public static class NET001 extends NETX {
    public NET001(short pid) {
      super((byte)0x01, pid);
    }
    
    @Override
    public ByteBuffer encode() {
      final ByteBuffer bb = ByteBuffer.allocate(3);
      bb.put(designation);
      bb.putShort(pid);
      return bb;
    }
  }
  
  public static class NET010 extends NETX {
    public final byte level, zone;
    public final int pos;             // shor2
    public NET010(short pid, ByteBuffer data) {
      super((byte)0x10, pid);
      level = data.get();
      zone = data.get();
      pos = data.getInt();
    }
    
    public NET010(short pid, byte level, byte zone, int pos) {
      super((byte)0x10, pid);
      this.level = level;
      this.zone = zone;
      this.pos = pos;
    }
    
    @Override
    public ByteBuffer encode() {
      final ByteBuffer bb = ByteBuffer.allocate(9);
      bb.put(designation);
      bb.putShort(pid);
      bb.put(level);
      bb.put(zone);
      bb.putInt(pos);
      return bb;
    }
  }
  
  public static class NET011 extends NETX {
    public NET011(short pid, ByteBuffer data) {
      super((byte)0x11, pid);
    }
    
    public NET011(short pid) {
      super((byte)0x11, pid);
    }
    
    @Override
    public ByteBuffer encode() {
      final ByteBuffer bb = ByteBuffer.allocate(3);
      bb.put(designation);
      bb.putShort(pid);
      return bb;
    }
  }
  
  public static class NET012 extends NETX {
    public final byte level, zone;
    public final Vec2 pos;             // Vec2
    public final byte sprite;
    public NET012(short pid, ByteBuffer data) {
      super((byte)0x12, pid);
      level = data.get();
      zone = data.get();
      pos = new Vec2(data.getFloat(), data.getFloat());
      sprite = data.get();
    }
    
    @Override
    public ByteBuffer encode() {
      final ByteBuffer bb = ByteBuffer.allocate(14);
      bb.put(designation);
      bb.putShort(pid);
      bb.put(level);
      bb.put(zone);
      bb.putFloat(pos.x);
      bb.putFloat(pos.y);
      bb.put(sprite);
      return bb;
    }
  }
  
}
