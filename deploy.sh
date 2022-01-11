echo [-- Shutdown Tomcat Server --]
~/Tomcat/bin/shutdown.sh

echo [-- Build WAR --]
mvn clean install

echo [-- Copy WAR --]
rm ~/Tomcat/webapps/royale.war
cp royale-client/target/client-1.0.war ~/Tomcat/webapps/royale.war

echo [-- Start Tomcat Server --]
~/Tomcat/bin/startup.sh

