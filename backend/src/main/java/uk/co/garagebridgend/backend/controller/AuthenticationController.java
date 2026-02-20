package uk.co.garagebridgend.backend.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import uk.co.garagebridgend.backend.logic.AuthenticationService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.exception.InvalidPasswordException;
import uk.co.garagebridgend.backend.models.exception.InvalidRefreshTokenException;
import uk.co.garagebridgend.backend.models.internal.RotateRefreshTokenInternal;
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
    /** Authentication service for handling authentication operations. */
    private final AuthenticationService authenticationService;

    /** Rotates a refresh token by invalidating the old one and issuing a new one.
     * @param body The request body containing the pin code for rotation.
     * */
    @PostMapping("/rotate")
    public RefreshTokenResponse rotateRefreshToken(
            @RequestBody AuthRotateRequest body, HttpServletResponse response
    ) {
        try {
            RotateRefreshTokenInternal tokens = authenticationService.rotateRefreshToken(body);

            // Set the new refresh token in an HttpOnly cookie
            Cookie refreshTokenCookie = new Cookie("refreshToken", tokens.getRefreshToken());
            refreshTokenCookie.setHttpOnly(true);
            refreshTokenCookie.setPath("/");
            refreshTokenCookie.setMaxAge(30 * 24 * 60 * 60);

            response.addCookie(refreshTokenCookie);
            return new RefreshTokenResponse(tokens.getAccessToken());
        } catch (InvalidPasswordException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid pin code provided."
            );
        }
        catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated account not found."
            );
        }
        catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal sever error"
            );
        }
    }


    /** Refreshes an access token using a valid refresh token
     * from the request cookies.
     * @param request The HTTP request containing the refresh token cookie.
     * @return a new access token if the refresh token is valid, otherwise
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
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal sever error"
            );
        }
    }
}
