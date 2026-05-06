# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy pom and source
COPY pom.xml .
COPY src ./src

# Copy JWT keys if present locally (for docker-compose builds with keys checked out)
RUN cp src/test/resources/privateKey.pem src/main/resources/ 2>/dev/null || true
RUN cp src/test/resources/publicKey.pem src/main/resources/ 2>/dev/null || true

# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the Quarkus app from builder
COPY --from=builder /build/target/quarkus-app /app/quarkus-app

# Copy entrypoint (writes JWT keys from env vars on startup)
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Expose default port (Render overrides via PORT env var)
EXPOSE 8080

# Set JVM options for better Docker compatibility
ENV JAVA_OPTS="-Djava.util.logging.manager=org.jboss.logmanager.LogManager"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
