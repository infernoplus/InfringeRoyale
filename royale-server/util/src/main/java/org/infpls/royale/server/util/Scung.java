package org.infpls.royale.server.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

public class Scung {
  
  /* Reads a file from the classpath and return as a string. Murders new lines */
  public static String readFile(final String path) throws IOException {
    final Resource resource = new ClassPathResource(path);
    final InputStream in = resource.getInputStream();
    final BufferedReader br = new BufferedReader(new InputStreamReader(in, "UTF-8"));
    final StringBuilder sb = new StringBuilder();
    String line;
    while((line=br.readLine()) != null) {
       sb.append(line);
    }
    br.close();
    in.close();
    return sb.toString();
  }
}
