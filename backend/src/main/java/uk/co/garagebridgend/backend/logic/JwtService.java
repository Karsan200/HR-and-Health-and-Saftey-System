package uk.co.garagebridgend.backend.logic;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtService {
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access_token_expiration}")
    private Long jwtAccessTokenExpiration;

    @Value("${jwt.refresh_token_expiration}")
    private Long jwtRefreshTokenExpiration;

    @Value("${jwt.refresh_token_expiration_mobile}")
    private Long jwtRefreshTokenExpirationMobile;

    public String generateAccessToken(String email) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, email, jwtAccessTokenExpiration);
    }

    public String generateRefreshToken(String email, Boolean isMobile) {
        Map<String, Object> claims = new HashMap<>();
        if (isMobile) {
            return createToken(claims, email, jwtRefreshTokenExpirationMobile);
        } else {
            return createToken(claims, email, jwtRefreshTokenExpiration);
        }
    }

    private String createToken(Map<String, Object> claims, String email, Long expiration) {
        return Jwts.builder()
                .claims(claims)  // or .add(extraClaims) to add to existing claims
                .subject(email)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), Jwts.SIG.HS256)  // SignatureAlgorithm parameter is no longer needed
                .compact();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Key getSignKey() {
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
                .verifyWith(getSignInKey())
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