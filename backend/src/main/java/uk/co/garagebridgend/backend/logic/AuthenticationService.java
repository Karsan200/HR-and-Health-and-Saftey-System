package uk.co.garagebridgend.backend.logic;

import com.bastiaanjansen.otp.HMACAlgorithm;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.apache.commons.codec.binary.Base32;
import com.bastiaanjansen.otp.TOTPGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.SessionTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.exception.InvalidPasswordException;
import uk.co.garagebridgend.backend.models.exception.InvalidRefreshTokenException;
import uk.co.garagebridgend.backend.models.exception.NotFoundException;
import uk.co.garagebridgend.backend.models.internal.RotateRefreshTokenInternal;
import uk.co.garagebridgend.backend.models.request.AuthRequest;
import uk.co.garagebridgend.backend.models.request.AuthRotateRequest;
import uk.co.garagebridgend.backend.models.request.MfaAuthoriseRequest;
import uk.co.garagebridgend.backend.models.response.MfaCheckResponse;
import uk.co.garagebridgend.backend.models.response.RefreshTokenResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.SessionRepository;

/**
 * Service responsible for JWT handling and authentication operations.
 */
@Service
public class AuthenticationService {
    /** Length of generated refresh tokens. */
    private static final int REFRESH_TOKEN_LENGTH = 128;

    /** Alphanumeric characters used for generating random strings. */
    private static final String ALPHANUMERIC =
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    /** Length of the MFA secret in bytes. */
    private static final int MFA_SECRET_LENGTH = 20;

    /** Length of the TOTP code to be generated and validated. */
    private static final int TOTP_CODE_LENGTH = 6;

    /** Time period in seconds for which a TOTP code is valid. */
    private static final int TOTP_PERIOD_SECONDS = 30;

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

    /** Repository for fetching account data related to session creation and validation. */
    private final AccountRepository accountRepository;

    /**
     * Constructor for dependency injection of required services and repositories.
     * @param sessionRepositoryImpl the SessionRepository implementation to use
     * @param accountRepositoryImpl the AccountRepository implementation to use
     */
    @Autowired
    public AuthenticationService(
            final SessionRepository sessionRepositoryImpl,
            final AccountRepository accountRepositoryImpl
    ) {
        this.sessionRepository = sessionRepositoryImpl;
        this.accountRepository = accountRepositoryImpl;
    }

    /**
     * Authenticates a user based on the provided username and password. Validates the credentials,
     * creates a new refresh token for the user, and generates a new access token with appropriate claims.
     * @param body the request body containing the user's username and password
     * @return a RotateRefreshTokenInternal object containing the new refresh token and access token
     * @throws NotFoundException if no account is found with the provided username
     * @throws InvalidPasswordException if the provided password does not match the stored password
     */
    public RotateRefreshTokenInternal authenticate(final AuthRequest body)
            throws NotFoundException, InvalidPasswordException {
        // Get the account from the database
        AccountTable account = accountRepository.findByUsername(body.getUsername())
                .orElseThrow(() -> new NotFoundException("Account not found"));

        // Validate the provided password
        if (!BCrypt.checkpw(body.getPassword(), account.getPassword())) {
            throw new InvalidPasswordException("Invalid password");
        }

        // Create a new refresh token for the user
        String refreshToken = createRefreshToken(account.getAccountId(), body.isMobile());

        // Generate new access token
        RefreshTokenResponse token = refreshAccessToken(refreshToken);

        return new RotateRefreshTokenInternal(refreshToken, token.getAccessToken());
    }

    /**
     * Authenticates a user for multifactor authentication (MFA) using a provided TOTP code and refresh token.
     * Validates the TOTP code against the user's 2FA secret, updates the session it's MFA authorised.
     * and returns a new access token with updated claims.
     * @param body the request body containing the TOTP code for MFA authentication
     * @param refreshToken the refresh token associated with the current session to update
     * @return a RefreshTokenResponse containing a new access token with updated claims
     * @throws AuthenticatedAccountNotFoundException if no authenticated user is found in the security context
     * @throws InvalidPasswordException if the provided TOTP code is invalid
     * @throws InvalidRefreshTokenException if the provided refresh token is invalid
     */
    public RefreshTokenResponse authenticateMfa(final MfaAuthoriseRequest body, final String refreshToken)
        throws AuthenticatedAccountNotFoundException, InvalidPasswordException, InvalidRefreshTokenException {
        // Get the current user
        AccountTable account = this.getCurrentUser();

        // Decode the secret into a byte array
        byte[] secret = new Base32().decode(account.getTwoFactorSecret());

        // Encode the secret as a base32 byte array
        secret = new Base32().encode(secret);

        // Create a TOTP generator
        TOTPGenerator totp = new TOTPGenerator.Builder(secret)
                .withHOTPGenerator(builder -> {
                    builder.withPasswordLength(TOTP_CODE_LENGTH);
                    builder.withAlgorithm(HMACAlgorithm.SHA1);
                })
                .withPeriod(Duration.ofSeconds(TOTP_PERIOD_SECONDS))
                .build();

        // Validate the provided TOTP code
        if (!totp.verify(body.getCode(), 2)) {
            throw new InvalidPasswordException("Invalid TOTP code");
        }

        // Get the current session using the refresh token
        Optional<SessionTable> sessionOpt = sessionRepository.findByRefreshToken(refreshToken);
        if (sessionOpt.isEmpty()) {
            throw new InvalidRefreshTokenException();
        }

        // Update the session to indicate that 2FA has been authenticated
        SessionTable session = sessionOpt.get();
        session.setTwoFactor(true);
        sessionRepository.save(session);

        // Return new access token with updated claims
        return this.refreshAccessToken(refreshToken);
    }

    /**
     * Checks if multifactor authentication (MFA) is required for the currently authenticated user.
     * If the user does not have a 2FA secret set up, generates a new secret and saves it to the user's account.
     * @return a MfaCheckResponse containing the MFA secret (if generated) and whether MFA is required for the user
     * @throws AuthenticatedAccountNotFoundException if no authenticated user is found in the security context
     */
    public MfaCheckResponse checkMfa() throws AuthenticatedAccountNotFoundException {
        AccountTable account = this.getCurrentUser();

        // Get the current claims (authorities) of the authenticated user to determine if mfa is required
        var authorities = this.getCurrentClaims();

        boolean mfaRequired = authorities.contains("2FA_OK");

        // Check the user's 2FA secret to determine if 2FA has been set up
        String mfaSecret = null;
        if (account.getTwoFactorSecret() == null) {
            // Create a random 20 byte array
            byte[] secret = new byte[MFA_SECRET_LENGTH];
            new SecureRandom().nextBytes(secret);

            // Encode the secret as a base32 string
            mfaSecret = new Base32().encodeToString(secret);

            // Save the secret to the user's account in the database
            account.setTwoFactorSecret(mfaSecret);
            accountRepository.save(account);
        }

        return new MfaCheckResponse(mfaSecret, account.getUsername(), mfaRequired);
    }

    /**
     * Rotates the refresh token for the currently authenticated user. Revokes all existing mobile refresh tokens,
     * creates a new mobile refresh token, and generates a new access token with appropriate claims.
     * @param body the request body containing the user's pin code
     * @return a RotateRefreshTokenInternal object containing the new refresh token and access token
     * @throws AuthenticatedAccountNotFoundException if no authenticated user is found in the security context
     */
    @Transactional
    public RotateRefreshTokenInternal rotateRefreshToken(final AuthRotateRequest body)
            throws AuthenticatedAccountNotFoundException, InvalidPasswordException {
        // Get the current user
        AccountTable account = this.getCurrentUser();

        /* If the user does not have a pin code set, set it to the provided pin code,
         * otherwise validate the provided pin code against the stored hash. */
        if (account.getMobilePin() == null) {
            account.setMobilePin(BCrypt.hashpw(body.getPinCode(), BCrypt.gensalt()));
            accountRepository.save(account);
        } else if (!BCrypt.checkpw(body.getPinCode(), account.getMobilePin())) {
            throw new InvalidPasswordException("Invalid pin code");
        }

        // Revoke all existing mobile refresh tokens for the user
        sessionRepository.deleteMobileSessionsByAccountId(account.getAccountId());

        // Create a new mobile refresh token
        String newRefreshToken = createRefreshToken(account.getAccountId(), true);

        // Create a new access token
        Map<String, Object> claims = new HashMap<>();
        claims.put("mfa", false);
        claims.put("mobileToken", true);

        String newAccessToken = createToken(claims, account.getAccountId());

        return new RotateRefreshTokenInternal(newRefreshToken, newAccessToken);
    }

    /**
     * Refreshes an access token using a valid refresh token. Validates the refresh token.
     * @param refreshToken the refresh token to validate and use for generating a new access token
     * @return a new access token if the refresh token is valid, otherwise throws an exception
     * @throws InvalidRefreshTokenException if the refresh token is invalid or expired
     */
    public RefreshTokenResponse refreshAccessToken(final String refreshToken) throws InvalidRefreshTokenException {
        Optional<SessionTable> session = sessionRepository.findByRefreshToken(refreshToken);

        if (session.isEmpty() || session.get().getExpires().isBefore(LocalDateTime.now(Clock.systemUTC()))) {
            throw new InvalidRefreshTokenException();
        }

        // Get username and claims from session
        final Long accountId = session.get().getAccount().getAccountId();

        Map<String, Object> claims = new HashMap<>();
        claims.put("mfa", session.get().isTwoFactor());
        claims.put("mobileToken", session.get().isMobile());

        // Generate new access token
        String newAccessToken = createToken(claims, accountId);

        return new RefreshTokenResponse(newAccessToken);
    }

    /**
     * Retrieves the currently authenticated user from the Spring Security context. If the authentication
     * is present and the principal is an instance of User, it returns the AccountTable object.
     * @return the currently authenticated User, or null if no authentication is present or the principal is not a User
     * @throws AuthenticatedAccountNotFoundException if no authenticated user is found in the security context
     */
    public AccountTable getCurrentUser()
        throws AuthenticatedAccountNotFoundException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            return accountRepository.findById(Long.valueOf(user.getUsername()))
                    .orElseThrow(AuthenticatedAccountNotFoundException::new);
        }

        throw new AuthenticatedAccountNotFoundException();
    }

    /**
     * Retrieves the current claims (authorities) of the authenticated user from the Spring Security context.
     * @return a list of claim strings representing the authorities of the authenticated user
     * @throws AuthenticatedAccountNotFoundException if no authenticated user is found in the security context
     */
    public List<String> getCurrentClaims()
        throws AuthenticatedAccountNotFoundException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null) {
            var authorities = authentication.getAuthorities();

            return authorities.stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());
        }
        throw new AuthenticatedAccountNotFoundException();
    }

    /**
     * Creates a new refresh token for the given account ID and mobile token flag. Validates the account ID and creates
     * a new session in the database with the generated refresh token and expiration time
     * based on whether it's a mobile token or not.
     * @param accountId the ID of the account for which to create the refresh token
     * @param isMobile flag indicating whether the refresh token is for a mobile device
     * @return the generated refresh token as a string
     * @throws IllegalArgumentException if the account ID is not found in the database
     */
    private String createRefreshToken(final Long accountId, final boolean isMobile)
            throws AuthenticatedAccountNotFoundException {
        // Find the account to create a session for
        Optional<AccountTable> account = accountRepository.findById(accountId);

        // Check if a user has been found
        if (account.isEmpty()) {
            throw new AuthenticatedAccountNotFoundException();
        }

        // Create the refresh token
        String refreshToken = generateRandomString();

        // Create a new session in the database
        SessionTable session = new SessionTable();
        session.setAccount(account.get());
        session.setRefreshToken(refreshToken);
        session.setTwoFactor(false);
        session.setMobile(isMobile);
        session.setExpires(LocalDateTime.now(Clock.systemUTC()).plusSeconds(
                isMobile ? jwtRefreshTokenExpirationMobile : jwtRefreshTokenExpiration
        ));

        // Save the session to the database
        sessionRepository.save(session);

        // Return the generated refresh token
        return refreshToken;
    }

    /**
     * Generates a random string of the specified length consisting of alphanumeric characters (0-9, A-Z, a-z).
     * @return a random string of the specified length containing only alphanumeric characters
     */
    private String generateRandomString() {
        SecureRandom random = new SecureRandom();

        return random.ints(REFRESH_TOKEN_LENGTH, 0, ALPHANUMERIC.length())
                .mapToObj(ALPHANUMERIC::charAt)
                .collect(StringBuilder::new,
                        StringBuilder::append,
                        StringBuilder::append)
                .toString();
    }

    /**
     * Creates a JWT access token with the given claims and username. The token is signed using the secret key
     * @param claims the claims to include in the token payload
     * @param accountId the subject (accountId) to include in the token
     * @return the generated JWT access token as a string
     */
    private String createToken(final Map<String, Object> claims, final Long accountId) {
        return Jwts.builder()
                .claims(claims)
                .subject(accountId.toString())
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
