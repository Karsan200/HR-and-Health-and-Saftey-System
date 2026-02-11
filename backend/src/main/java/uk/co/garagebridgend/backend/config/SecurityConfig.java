package uk.co.garagebridgend.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import uk.co.garagebridgend.backend.logic.JwtAuthFilter;
import uk.co.garagebridgend.backend.logic.UserInfoService;

/**
 * Spring Security configuration for the application.
 * <p>
 * Sets up JWT-based stateless authentication, the custom JWT filter, and
 * role-based endpoint authorization rules.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /** Custom JWT authentication filter that processes incoming requests. */
    private final JwtAuthFilter jwtAuthFilter;
    /** Service for loading user details during authentication. */
    private final UserInfoService userInfoService;

    /**
     * Constructor for dependency injection of required services.
     * @param jwtAuthFilterImpl the JwtAuthFilter implementation to use
     * @param userInfoServiceImpl the UserDetailsService implementation to use
     */
    public SecurityConfig(
        final JwtAuthFilter jwtAuthFilterImpl,
        @Lazy final UserInfoService userInfoServiceImpl) {
        this.jwtAuthFilter = jwtAuthFilterImpl;
        this.userInfoService = userInfoServiceImpl;
    }

    /**
     * Configures the security filter chain for HTTP requests.
     * @param http the HttpSecurity object to configure
     * @return the configured SecurityFilterChain
     * @throws Exception if an error occurs during configuration
     */
    @Bean
    public SecurityFilterChain securityFilterChain(final HttpSecurity http) throws Exception {
        http
                // Disable CSRF (not needed for stateless JWT)
                .csrf(csrf -> csrf.disable())

                // Configure endpoint authorization
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/auth/refresh").permitAll()

                        // Role-based endpoints (order matters - most specific first)
                        .requestMatchers("/admin/permissions/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/admin/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )

                // Stateless session (required for JWT)
                .sessionManagement(sess ->
                        sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Set custom authentication provider
                .authenticationProvider(authenticationProvider())

                // Add JWT filter before Spring Security's default filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Defines the password encoder bean using BCrypt hashing algorithm.
     * @return a PasswordEncoder instance for encoding and verifying passwords
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Defines the authentication provider bean that uses a DaoAuthenticationProvider.
     * @return an AuthenticationProvider configured with the UserDetailsService and PasswordEncoder
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userInfoService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * Defines the authentication manager bean that retrieves the AuthenticationManager
     * from the AuthenticationConfiguration.
     * @param config the AuthenticationConfiguration used to obtain the AuthenticationManager
     * @return the AuthenticationManager for handling authentication operations
     * @throws Exception if an error occurs while retrieving the AuthenticationManager
     */
    @Bean
    public AuthenticationManager authenticationManager(final AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
