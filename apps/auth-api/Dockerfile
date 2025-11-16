# Use a multi-stage build to create a runnable Spring Boot image for the auth and rewards API

### Build stage: compile the project with Maven
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the application source code into the build stage
COPY . /app

# Package the application without running tests. The resulting JAR will be placed in the target directory.
RUN mvn -B package -DskipTests

### Runtime stage: run the packaged Spring Boot application
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the built JAR from the build stage into the runtime stage
COPY --from=build /app/target/*.jar app.jar

# Copy the data directory into the runtime image so CSVs can be read from the filesystem.  
# The Spring controllers expect to find files under "data/" relative to the working
# directory. In a fat-jar, classpath resources are not accessible as regular files, so
# we copy the CSVs out of the jar into the container.
COPY --from=build /app/src/main/resources/data /app/data

# Default port used by this service (can be overridden by environment)
EXPOSE 4011
ENV PORT=4011

# Run the Spring Boot application, passing the port via JVM property
CMD ["sh", "-c", "java -jar app.jar --server.port=$PORT"]