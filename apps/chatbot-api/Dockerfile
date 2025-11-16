# Build the Spring Boot based chatbot application
# Multi-stage build: compile with Maven, then run with JRE

# Build stage: use Maven to compile the application
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /app

# Copy source code into the build stage and compile the project. We skip tests for faster builds.
COPY . /app
RUN mvn -B package -DskipTests

# Runtime stage: run the compiled JAR with the correct port
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port used by the chatbot service. Default is 4017 but can be overridden.
EXPOSE 4017
ENV PORT=4017

# Pass the port to Spring Boot so it listens on the configured PORT instead of the default 8080.
CMD ["sh", "-c", "java -jar app.jar --server.port=$PORT"]
