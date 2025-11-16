# Use Maven to build the Spring Boot / Java application for hotel ranking
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app

# Copy source code into the build stage and compile the project. We skip tests for faster builds.
COPY . /app
RUN mvn -B package -DskipTests

## Runtime stage: run the compiled JAR with the correct port
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the default service port. The environment variable PORT can override it.
EXPOSE 4016
ENV PORT=4016

# Pass the server port to Spring Boot so it listens on the exposed port. Without this the app would default to port 8080.
CMD ["sh", "-c", "java -jar app.jar --server.port=$PORT"]