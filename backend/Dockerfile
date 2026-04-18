# Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy pom.xml and Maven settings
COPY pom.xml ./
COPY .mvn .mvn
COPY mvnw mvnw.cmd ./

# Download Maven dependencies (this layer will be cached)
RUN mvn dependency:go-offline -DdownloadSources -DdownloadJavadoc

# Copy source code
COPY src ./src

# Build application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1000 appuser && adduser -D -u 1000 -G appuser appuser

# Copy jar from builder
COPY --from=builder /app/target/*.jar app.jar

# Change ownership
RUN chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD java -cp app.jar org.springframework.boot.loader.launch.JarLauncher health || exit 1

# Start application
ENTRYPOINT ["java", "-jar", "app.jar"]
