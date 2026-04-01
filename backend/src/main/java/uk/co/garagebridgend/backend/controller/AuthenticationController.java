package uk.co.garagebridgend.backend.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import uk.co.garagebridgend.backend.logic.AuthenticationService;
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

import java.util.Arrays;

/**
 * REST controller exposing authentication-related endpoints.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    /** Logger for logging authentication-related events and errors. */
    private static final Logger LOG = LoggerFactory.getLogger(AuthenticationController.class);

    /** Max age for mobile refresh token cookies in seconds. */
    @Value("${jwt.refresh_token_expiration_mobile}")
    private Long mobileRefreshTokenCookieExpiration;

    /** Max age for web refresh token cookies in seconds. */
    @Value("${jwt.refresh_token_expiration}")
    private Long webRefreshTokenCookieExpiration;

    /** Authentication service for handling authentication operations. */
    private final AuthenticationService authenticationService;

    /**
     * Extracts the refresh token from the request cookies.
     * @param request The HTTP request containing the cookies from which to extract the refresh token.
     * @return the refresh token if found in the cookies, or null if not found.
     */
    private String extractRefreshToken(final HttpServletRequest request) {
        // Get refresh token from cookie
        String refreshToken = null;

        if (request.getCookies() != null) {
            refreshToken = Arrays.stream(request.getCookies())
                    .filter(cookie -> "refreshToken".equals(cookie.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }

        return refreshToken;
    }

    /** Authenticates a user and issues access and refresh tokens.
     * @param body The request body containing the username, password, and client type.
     * @param response The HTTP response to set the refresh token cookie on.
     * @return RefreshTokenResponse containing the access token if authentication is successful.
     * */
    @PostMapping("/login")
    public RefreshTokenResponse authenticate(
            final @RequestBody AuthRequest body, final HttpServletResponse response
    ) {
        try {
            RotateRefreshTokenInternal tokens = authenticationService.authenticate(body);

            // Set the new refresh token in an HttpOnly cookie
            Cookie refreshTokenCookie = new Cookie("refreshToken", tokens.getRefreshToken());
            refreshTokenCookie.setHttpOnly(true);
            refreshTokenCookie.setPath("/");
            if (body.isMobile()) {
                refreshTokenCookie.setMaxAge(Math.toIntExact(mobileRefreshTokenCookieExpiration));
            } else {
                refreshTokenCookie.setMaxAge(Math.toIntExact(webRefreshTokenCookieExpiration));
            }

            response.addCookie(refreshTokenCookie);
            return new RefreshTokenResponse(tokens.getAccessToken());
        } catch (InvalidPasswordException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Username or password is incorrect."
            );
        } catch (NotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Account not found."
            );
        } catch (Exception e) {
            LOG.error("Error during authentication", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal sever error"
            );
        }
    }

    /** Authorises a user for MFA by validating the provided TOTP code.
     * @param body The request body containing the TOTP code for MFA authorisation.
     * @param request The HTTP request containing the refresh token cookie for validating the session.
     * @return RefreshTokenResponse containing a new access token if MFA authorisation is successful.
     * */
    @PostMapping("/mfa/authorise")
    public RefreshTokenResponse authoriseMfa(
            final @RequestBody MfaAuthoriseRequest body,
            final HttpServletRequest request) {
        // Get refresh token from cookie
        String refreshToken = extractRefreshToken(request);
        if (refreshToken == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Refresh token not found in cookies"
            );
        }

        try {
            return authenticationService.authenticateMfa(body, refreshToken);
        } catch (InvalidPasswordException e) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Invalid TOTP code provided."
            );
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated account not found."
            );
        } catch (InvalidRefreshTokenException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid or expired refresh token"
            );
        } catch (Exception e) {
            LOG.error("Error authorising MFA", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal sever error"
            );
        }
    }

    /** Checks if the currently authenticated user has completed MFA authorisation.
     * @return MfaCheckResponse indicating whether MFA is authorised or not.
     * */
    @GetMapping("/mfa/check")
    public MfaCheckResponse checkMfa() {
        try {
            return authenticationService.checkMfa();
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated account not found."
            );
        } catch (Exception e) {
            LOG.error("Error checking MFA status", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal sever error"
            );
        }
    }

    /** Rotates a mobile refresh token by invalidating the old one and issuing a new one.
     * @param body The request body containing the pin code for rotation.
     * @param response The HTTP response to set the new refresh token cookie on.
     * @return RefreshTokenResponse containing the new access token if rotation is successful.
     * */
    @PostMapping("/rotate")
    public RefreshTokenResponse rotateRefreshToken(
            final @RequestBody AuthRotateRequest body, final HttpServletResponse response
    ) {
        try {
            RotateRefreshTokenInternal tokens = authenticationService.rotateRefreshToken(body);

            // Set the new refresh token in an HttpOnly cookie
            Cookie refreshTokenCookie = new Cookie("refreshToken", tokens.getRefreshToken());
            refreshTokenCookie.setHttpOnly(true);
            refreshTokenCookie.setPath("/");
            refreshTokenCookie.setMaxAge(Math.toIntExact(mobileRefreshTokenCookieExpiration));

            response.addCookie(refreshTokenCookie);
            return new RefreshTokenResponse(tokens.getAccessToken());
        } catch (InvalidPasswordException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid pin code provided."
            );
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated account not found."
            );
        } catch (Exception e) {
            LOG.error("Error rotating refresh token", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal sever error"
            );
        }
    }


    /** Refreshes an access token using a valid refresh token
     * from the request cookies.
     * @param request The HTTP request containing the refresh token cookie.
     * @return a new access token if the refresh token is valid
     * */
    @GetMapping("/refresh")
    public RefreshTokenResponse refreshToken(final HttpServletRequest request) {
        // Get refresh token from cookie
        String refreshToken = extractRefreshToken(request);

        if (refreshToken == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Refresh token not found in cookies"
            );
        }

        try {
            return authenticationService.refreshAccessToken(refreshToken);
        } catch (InvalidRefreshTokenException e) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid or expired refresh token"
            );
        } catch (Exception e) {
            LOG.error("Error refreshing access token", e);
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal sever error"
            );
        }
    }
}
