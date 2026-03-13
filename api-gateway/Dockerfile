# Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy pom.xml và source code
COPY pom.xml ./
COPY src ./src

# Build application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Cài đặt curl cho healthcheck
RUN apk add --no-cache curl

# Tạo user non-root để bảo mật
RUN addgroup -g 1000 appuser && adduser -D -u 1000 -G appuser appuser

# Copy jar từ builder stage
COPY --from=builder /app/target/*.jar app.jar

# Cấp quyền cho user
RUN chown -R appuser:appuser /app

USER appuser

# API Gateway chạy trên port 9000
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:9000/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
