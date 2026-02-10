package uk.co.garagebridgend.backend.logic;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.util.function.Function;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import uk.co.garagebridgend.backend.models.entity.SessionTable;
import uk.co.garagebridgend.backend.models.exception.InvalidRefreshTokenException;
import uk.co.garagebridgend.backend.models.response.RefreshTokenResponse;
import uk.co.garagebridgend.backend.repository.SessionRepository;

/**
 * Service responsible for JWT handling and authentication operations.
 */
@Component
public class AuthenticationService {
    /** Secret key for signing JWTs, injected from application properties. */
    @Value("${jwt.secret}")
    private String secretKey;

    /** Access tokens expiration time in milliseconds, injected from application properties. */
    @Value("${jwt.access_token_expiration}")
    private Long jwtAccessTokenExpiration;

    /** Refresh tokens expiration time in milliseconds, injected from application properties. */
    @Value("${jwt.refresh_token_expiration}")
    private Long jwtRefreshTokenExpiration;

    /** Mobile refresh tokens expiration time in milliseconds, injected from application properties. */
    @Value("${jwt.refresh_token_expiration_mobile}")
    private Long jwtRefreshTokenExpirationMobile;

    /** Repository for fetching session data related to refresh tokens. */
    private final SessionRepository sessionRepository;

    /**
     * Constructor for dependency injection of required services and repositories.
     * @param sessionRepositoryImpl the SessionRepository implementation to use
     */
    @Autowired
    public AuthenticationService(final SessionRepository sessionRepositoryImpl) {
        this.sessionRepository = sessionRepositoryImpl;
    }

    /**
     * Refreshes an access token using a valid refresh token. Validates the refresh token.
     * @param refreshToken the refresh token to validate and use for generating a new access token
     * @return a new access token if the refresh token is valid, otherwise throws an exception
     * @throws InvalidRefreshTokenException if the refresh token is invalid or expired
     */
    public RefreshTokenResponse refreshAccessToken(final String refreshToken) throws InvalidRefreshTokenException {
        Optional<SessionTable> session = sessionRepository.findById(UUID.fromString(refreshToken));

        if (session.isEmpty() || session.get().getExpires().isBefore(LocalDateTime.now())) {
            throw new InvalidRefreshTokenException();
        }

        // Get username and claims from session
        final String username = session.get().getAccount().getUsername();

        Map<String, Object> claims = new HashMap<>();
        claims.put("mfa", session.get().isTwoFactor());
        claims.put("mobileToken", session.get().isMobile());

        // Generate new access token
        String newAccessToken = createToken(claims, username);

        return new RefreshTokenResponse(newAccessToken);
    }

    /**
     * Creates a JWT access token with the given claims and username. The token is signed using the secret key
     * @param claims the claims to include in the token payload
     * @param username the subject (username) to include in the token
     * @return the generated JWT access token as a string
     */
    private String createToken(final Map<String, Object> claims, final String username) {
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtAccessTokenExpiration))
                .signWith(getSignKey(), Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Gets the signing key for JWTs by decoding the base64-encoded secret key and creating an HMAC-SHA key.
     * @return the SecretKey used for signing JWTs
     */
    private SecretKey getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Extracts the username (subject) from the given JWT token by parsing the claims and retrieving the subject field.
     * @param token the JWT token from which to extract the username
     * @return the username (subject) extracted from the token claims
     */
    public String extractUsername(final String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts the token type (mobile or not) from the given JWT token by parsing the claims and
     * retrieving the "mobileToken" field as a boolean.
     * @param token the JWT token from which to extract the token type
     * @return true if the token is a mobile token, false otherwise
     */
    public boolean extractTokenType(final String token) {
        Boolean value = extractClaim(token, claims -> claims.get("mobileToken", Boolean.class));
        return Boolean.TRUE.equals(value);
    }

    /**
     * Extracts the two-factor authentication status from the given JWT token by parsing the claims and
     * retrieving the "mfa" field as a boolean.
     * @param token the JWT token from which to extract the two-factor authentication status
     * @return true if two-factor authentication has been completed for this token, false otherwise
     */
    public boolean extract2FA(final String token) {
        Boolean value = extractClaim(token, claims -> claims.get("mfa", Boolean.class));
        return Boolean.TRUE.equals(value);
    }

    /**
     * Extracts the expiration date from the given JWT token by parsing the claims and retrieving the expiration field.
     * @param token the JWT token from which to extract the expiration date
     * @return the expiration date extracted from the token claims
     */
    public Date extractExpiration(final String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Generic method to extract any claim from the given JWT token by parsing the claims and
     * applying the provided claims resolver function.
     * @param token the JWT token from which to extract the claim
     * @param claimsResolver a function that takes the Claims object and returns the desired claim value
     * @return the claim value extracted from the token claims using the provided resolver function
     * @param <T> the type of the claim value to be returned
     */
    public <T> T extractClaim(final String token, final Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts all claims from the given JWT token by parsing the token using the signing key and
     * retrieving the payload as Claims.
     * @param token the JWT token from which to extract all claims
     * @return the Claims object containing all claims extracted from the token payload
     */
    private Claims extractAllClaims(final String token) {
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Checks if the given JWT token is expired by extracting the expiration date and comparing it to the current date.
     * @param token the JWT token from which to check for expiration
     * @return true if the token is expired (expiration date is before the current date), false otherwise
     */
    private Boolean isTokenExpired(final String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Validates the given JWT token by checking if the username matches the user details and
     * if the token is not expired.
     * @param token the JWT token to validate
     * @param userDetails the UserDetails object containing the expected username for validation
     * @return true if the token is valid (username matches and token is not expired), false otherwise
     */
    public Boolean validateToken(final String token, final UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
