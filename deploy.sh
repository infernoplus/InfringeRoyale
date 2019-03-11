echo [-- Shutdown Tomcat Server --]
/home/inferno/Tomcat/bin/shutdown.sh

echo [-- Build WAR --]
mvn clean install

echo [-- Copy WAR --]
rm /home/inferno/Tomcat/webapps/royale.war
cp royale-client/target/client-1.0.war /home/inferno/Tomcat/webapps/royale.war

echo [-- Start Tomcat Server --]
/home/inferno/Tomcat/bin/startup.sh

