package com.team24.pharma.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;
        final String userRole;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        try {
            userEmail = jwtService.extractUsername(jwt);
            userRole = jwtService.extractRole(jwt);
            
            // Only authenticate if context is currently empty (not yet authenticated)
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // If it reached here, the token is perfectly valid (not expired, signature matches, etc)
                // because parseSignedClaims would throw a JwtException otherwise.
                
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority(userRole);
                
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userEmail,
                        null,
                        Collections.singletonList(authority)
                );
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Update SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (JwtException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            // Do not set SecurityContext; let it proceed unauthenticated to hit 401
        } catch (Exception e) {
            log.error("Error processing JWT token", e);
        }

        filterChain.doFilter(request, response);
    }
}
