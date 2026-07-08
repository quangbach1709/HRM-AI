package com.hrm.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.security.Key;
import java.util.List;

/**
 * Gateway-level JWT authentication filter.
 * <p>
 * Applied per-route in application.yml via:
 *   filters:
 *     - name: JwtAuthentication
 * <p>
 * Public paths (e.g. /api/v1/hr/auth/**) are whitelisted and bypass this filter.
 * All other requests must carry a valid Bearer token in the Authorization header.
 * <p>
 * On success the filter forwards two extra headers to downstream services so they
 * do not need to re-parse the token:
 *   X-Auth-Username   – JWT subject (username)
 *   X-Auth-Roles      – comma-separated list of role claims
 */
@Component
public class JwtAuthenticationGatewayFilterFactory extends AbstractGatewayFilterFactory<JwtAuthenticationGatewayFilterFactory.Config> {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationGatewayFilterFactory.class);
    private static final String BEARER_PREFIX = "Bearer ";

    /** Paths that do NOT require a JWT (matched via startsWith). */
    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/v1/hr/auth/login",
            "/api/v1/hr/auth/register",
            "/api/v1/hr/actuator/health",
            "/api/v1/hr/file-descriptions"
    );

    @Value("${jwt.secret:your-256-bit-secret-key-here-must-be-at-least-32-characters}")
    private String jwtSecret;

    public JwtAuthenticationGatewayFilterFactory() {
        super(Config.class);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Filter logic
    // ──────────────────────────────────────────────────────────────────────────

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            // 1. Skip public paths
            if (isPublicPath(path)) {
                return chain.filter(exchange);
            }

            // 2. Extract Authorization header
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
                log.warn("Missing or malformed Authorization header for path: {}", path);
                return unauthorizedResponse(exchange, "Missing Authorization header");
            }

            String token = authHeader.substring(BEARER_PREFIX.length());

            // 3. Validate token
            Claims claims;
            try {
                claims = parseToken(token);
            } catch (ExpiredJwtException ex) {
                log.warn("Expired JWT token for path: {}", path);
                return unauthorizedResponse(exchange, "Token has expired");
            } catch (SignatureException | MalformedJwtException ex) {
                log.warn("Invalid JWT token for path: {}", path);
                return unauthorizedResponse(exchange, "Invalid token");
            } catch (Exception ex) {
                log.error("JWT parsing error: {}", ex.getMessage());
                return unauthorizedResponse(exchange, "Token validation failed");
            }

            // 4. Forward identity headers to downstream services
            String username = claims.getSubject();
            Object rolesClaim = claims.get("roles");
            String roles = rolesClaim != null ? rolesClaim.toString() : "";

            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-Auth-Username", username)
                    .header("X-Auth-Roles", roles)
                    // Remove raw token forwarding if downstream services re-validate:
                    // .header(HttpHeaders.AUTHORIZATION, authHeader) // keep as-is (already present)
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        };
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    private Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    private Mono<Void> unauthorizedResponse(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, "application/json");
        var body = ("{\"error\":\"Unauthorized\",\"message\":\"" + message + "\"}").getBytes();
        var buffer = response.bufferFactory().wrap(body);
        return response.writeWith(Mono.just(buffer));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Config (no properties needed – kept for extensibility)
    // ──────────────────────────────────────────────────────────────────────────

    public static class Config {
        // Future: per-route override of public paths or role requirements
    }
}
