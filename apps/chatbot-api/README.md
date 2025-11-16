# Tourism Chatbot — How to run the project

This repository contains a frontend and backend chatbot, with available usage of java console on IDE
Chatbot features translation, route planning, and recommendations features with the usage of APIs available online

# Quick overview
Backend:
   Java 21
   Maven

Frontend
   React
   Node.js

# Prerequisites:
    1. Make sure java is installed and on PATH
    2. Verify with java -version
    3. Make sure Maven is installed and on PATH
    4. Verify with mvn -v
    5. If using vscode, make sure java extension pack is also downloaded
    6. Ensure node.js is installed
    7. Verify with node.js

# Setup steps:
    1. Open folder on IDE
    2. cd to backend folder using Terminal (cd to folder with pom.xml)  --> My folder has this at the very start
    3. cd to frontend folder under (cd to folder under chatbotfrontend)
        Example of the two is C:\Users\Example\Desktop\Chatbot
                              C:\Users\Example\Desktop\Chatbot\chatbotfrontend
    3. Open two terminals, one for front end, one for backend
    4. For backend terminal, run mvn -compile
    5. Then, run mvn spring-boot:run
    6. This should open localhost:8080
    6. For frontend terminal, run npm install
    7. Then, run npm start
    8. This should open localhost:3000
    9. Open localhost:3000 on web browser (should be automatically opened when u run npm start)

# What to check if something goes wrong
    1. Backend cannot be reached
        -> Check terminal logs to see where backend port is hosted
        -> Check package.json file under Chatbotfrontend under src to see what's the proxy
        -> Edit accordingly
    2. If route optimzation fails
        -> Check correct map locations are used when asking
        -> Check if API is enabled under google 
    3. If translation module fails
        -> Check if language code is correct
        -> Check if website is reachable
        -> Check if the language used is under the available languages (Not all languages can be used)
    4. Current localhost is being used (usually backend issue because you already have existing spring boot opened on same localhost without closing the previous one)
        -> netstat -ano | Select-String ":8080"
        -> Stop-Process -Id <PID> -Force       <-- Replace PID with id of 8080 local host
        -> mvn clean compile
        -> mvn spring-boot:run
  


# How to turn it off
    1. Go to both terminals and press ctrl c






mvn -compile
mvn spring-boot:run

go to another terminal
go to chatbotfrontend path folder
npm install
npm start

To end, go on both terminal ctrl + c

