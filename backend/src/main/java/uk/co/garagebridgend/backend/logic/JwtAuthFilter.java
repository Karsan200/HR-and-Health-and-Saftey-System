package uk.co.garagebridgend.backend.logic;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;


/**
 * Servlet filter that authenticates requests based on a JWT passed in the
 * Authorization header. When valid, places an authenticated
 * UsernamePasswordAuthenticationToken into the SecurityContext.
 */
@Component
public final class JwtAuthFilter extends OncePerRequestFilter {
    /** Service for UserDetails. */
    private final UserInfoService userInfoService;
    /** Service for JWT handling and authentication operations. */
    private final AuthenticationService authenticationService;
    /** Length of the "Bearer " prefix in the Authorization header. */
    private final int tokenBeginIndex = 7; // "Bearer " prefix length

    /**
     * Constructor for dependency injection of required services.
     * @param userInfoServiceImpl the UserInfoService implementation to use
     * @param authenticationServiceImpl the AuthenticationService implementation to use
     */
    @Autowired
    public JwtAuthFilter(
        @Lazy final UserInfoService userInfoServiceImpl,
        final AuthenticationService authenticationServiceImpl
    ) {
        this.userInfoService = userInfoServiceImpl;
        this.authenticationService = authenticationServiceImpl;
    }

    @Override
    protected void doFilterInternal(
        final HttpServletRequest request,
        final HttpServletResponse response,
        final FilterChain filterChain
    ) throws ServletException, IOException {
        String path = request.getRequestURI();
        if (path.equals("/auth/refresh")) {
            filterChain.doFilter(request, response); // skip JWT parsing
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // "Bearer " prefix length
            token = authHeader.substring(tokenBeginIndex);
            username = authenticationService.extractUsername(token);
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userInfoService.loadUserByUsername(username);
            if (userDetails == null) {
                filterChain.doFilter(request, response); // User not found, skip authentication
                return;
            }
            if (authenticationService.validateToken(token, userDetails)) {

                // Roles (still source-of-truth from DB or token)
                List<GrantedAuthority> authorities = new ArrayList<>(userDetails.getAuthorities());

                // Token context
                if (authenticationService.extractTokenType(token)) {
                    authorities.add(new SimpleGrantedAuthority("TOKEN_MOBILE"));
                } else {
                    authorities.add(new SimpleGrantedAuthority("TOKEN_WEB"));
                }

                // 2FA state
                if (authenticationService.extract2FA(token)) {
                    authorities.add(new SimpleGrantedAuthority("2FA_OK"));
                }

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                authorities
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
