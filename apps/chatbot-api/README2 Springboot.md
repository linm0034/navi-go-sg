netstat -ano | Select-String ":8080"
Stop-Process -Id <PID> -Force
mvn clean compile
mvn spring-boot:run

REACT Portion: Change localhostaddress to REACT address (under ChatController.java)