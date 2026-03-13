package com.hrm.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

/**
 * Disable Spring Security's default authentication mechanism at the Gateway level.
 * <p>
 * Authentication is handled exclusively by {@link com.hrm.gateway.filter.JwtAuthenticationGatewayFilterFactory}
 * (a GatewayFilter), which gives us full control over which routes are protected
 * and what happens on auth failure.
 * <p>
 * CSRF is disabled because all API clients send JWTs (stateless).
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
            .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
            // Permit all at the Spring Security layer; JWT filter enforces auth per route
            .authorizeExchange(exchanges -> exchanges.anyExchange().permitAll());

        return http.build();
    }
}
