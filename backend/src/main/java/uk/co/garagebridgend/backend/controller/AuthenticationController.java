package uk.co.garagebridgend.backend.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import uk.co.garagebridgend.backend.logic.AuthenticationService;
import uk.co.garagebridgend.backend.models.exception.InvalidRefreshTokenException;
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
