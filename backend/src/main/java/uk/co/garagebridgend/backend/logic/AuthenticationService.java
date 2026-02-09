package uk.co.garagebridgend.backend.logic;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;

import uk.co.garagebridgend.backend.models.entity.SessionTable;
import uk.co.garagebridgend.backend.models.exception.InvalidRefreshTokenException;
import uk.co.garagebridgend.backend.models.response.RefreshTokenResponse;
import uk.co.garagebridgend.backend.repository.SessionRepository;

@Component
public class AuthenticationService {
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access_token_expiration}")
    private Long jwtAccessTokenExpiration;

    @Value("${jwt.refresh_token_expiration}")
    private Long jwtRefreshTokenExpiration;

    @Value("${jwt.refresh_token_expiration_mobile}")
    private Long jwtRefreshTokenExpirationMobile;

    private final SessionRepository sessionRepository;

    public AuthenticationService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public RefreshTokenResponse refreshAccessToken(String refreshToken) {
        Optional<SessionTable> session = sessionRepository.findById(UUID.fromString(refreshToken));

        if (session.isEmpty() || session.get().getExpires().isBefore(LocalDateTime.now())) {
            throw new InvalidRefreshTokenException();
        }

        // Get username and claims from session
        String username = session.get().getAccount().getUsername();

        Map<String, Object> claims = new HashMap<>();
        claims.put("TWO_FACTOR_AUTHORISED", session.get().isTwoFactor());
        claims.put("TOKEN_MOBILE", session.get().isMobile());

        // Generate new access token
        String newAccessToken = createToken(claims, username);

        return new RefreshTokenResponse(newAccessToken);
    }

    private String createToken(Map<String, Object> claims, String username) {
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtAccessTokenExpiration))
                .signWith(getSignKey(), Jwts.SIG.HS256)
                .compact();
    }

    private SecretKey getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
