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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.server.ResponseStatusException;

import uk.co.garagebridgend.backend.logic.AuthenticationService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.exception.InvalidPasswordException;
import uk.co.garagebridgend.backend.models.exception.InvalidRefreshTokenException;
import uk.co.garagebridgend.backend.models.exception.NotFoundException;
import uk.co.garagebridgend.backend.models.internal.RotateRefreshTokenInternal;
import uk.co.garagebridgend.backend.models.request.AuthRequest;
import uk.co.garagebridgend.backend.models.request.AuthRotateRequest;
import uk.co.garagebridgend.backend.models.response.RefreshTokenResponse;

import java.util.Arrays;

/**
 * REST controller exposing authentication-related endpoints.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    /** Max age for mobile refresh token cookies in seconds. */
    @Value("${jwt.refresh_token_expiration_mobile}")
    private Long mobileRefreshTokenCookieExpiration;

    /** Max age for web refresh token cookies in seconds. */
    @Value("${jwt.refresh_token_expiration}")
    private Long webRefreshTokenCookieExpiration;

    /** Logger for logging authentication-related events and errors. */
    private static final Logger log = LoggerFactory.getLogger(AuthenticationController.class);

    /** Authentication service for handling authentication operations. */
    private final AuthenticationService authenticationService;

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
            log.error("Error during authentication", e);
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
            log.error("Error rotating refresh token", e);
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
        String refreshToken = null;

        if (request.getCookies() != null) {
            refreshToken = Arrays.stream(request.getCookies())
                    .filter(cookie -> "refreshToken".equals(cookie.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }

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
            log.error("Error refreshing access token", e);
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal sever error"
            );
        }
    }
}
