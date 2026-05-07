package org.organizadorTreinos.service;

import io.quarkus.runtime.Startup;
import io.smallrye.jwt.auth.principal.JWTParser;
import io.smallrye.jwt.auth.principal.ParseException;
import io.smallrye.jwt.build.Jwt;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotAuthorizedException;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jose4j.jws.JsonWebSignature;
import org.jose4j.lang.JoseException;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Set;
import java.util.UUID;

@ApplicationScoped
@Startup
public class JwtService {

    @ConfigProperty(name = "smallrye.jwt.new-token.lifespan", defaultValue = "86400")
    long tokenLifespan;

    @ConfigProperty(name = "mp.jwt.verify.issuer", defaultValue = "https://organizador-treinos.com")
    String issuer;

    @ConfigProperty(name = "mp.jwt.verify.publickey.location", defaultValue = "publicKey.pem")
    String publicKeyLocation;

    @ConfigProperty(name = "auth.refresh.max-expired-age-seconds", defaultValue = "604800")
    long maxExpiredAgeSeconds;

    @Inject
    JWTParser jwtParser;

    private PublicKey publicKey;

    @PostConstruct
    void loadPublicKey() {
        try {
            String pem = readPublicKeyPem();
            String stripped = pem
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s+", "");
            byte[] decoded = Base64.getDecoder().decode(stripped);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(decoded);
            this.publicKey = KeyFactory.getInstance("RSA").generatePublic(spec);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load JWT public key from " + publicKeyLocation, e);
        }
    }

    private String readPublicKeyPem() throws Exception {
        InputStream classpath = Thread.currentThread().getContextClassLoader().getResourceAsStream(publicKeyLocation);
        try (InputStream stream = classpath != null
                ? classpath
                : java.nio.file.Files.newInputStream(java.nio.file.Paths.get(publicKeyLocation))) {
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    public String generateToken(UUID userId) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(Duration.ofSeconds(tokenLifespan));

        return Jwt.issuer(issuer)
            .subject(userId.toString())
            .groups(Set.of("users"))
            .issuedAt(issuedAt)
            .expiresAt(expiresAt)
            .sign();
    }

    /**
     * Parses a token that may be expired. Verifies the cryptographic signature
     * (so attackers cannot forge tokens) but tolerates expired `exp` claim,
     * up to `auth.refresh.max-expired-age-seconds` past expiration.
     *
     * @return the userId encoded in the token's `sub` claim
     * @throws NotAuthorizedException when signature is invalid, claims are
     *         malformed, or the token expired too long ago to be refreshed.
     */
    public UUID validateExpiredToken(String token) {
        if (token == null || token.isBlank()) {
            throw new NotAuthorizedException("Token is required");
        }

        if (!verifySignature(token)) {
            throw new NotAuthorizedException("Invalid token signature");
        }

        JsonWebToken parsed;
        try {
            parsed = jwtParser.parseOnly(token);
        } catch (ParseException e) {
            throw new NotAuthorizedException("Malformed token");
        }

        if (!issuer.equals(parsed.getIssuer())) {
            throw new NotAuthorizedException("Invalid token issuer");
        }

        long exp = parsed.getExpirationTime();
        if (exp <= 0) {
            throw new NotAuthorizedException("Token missing expiration");
        }
        long nowSeconds = Instant.now().getEpochSecond();
        if (nowSeconds - exp > maxExpiredAgeSeconds) {
            throw new NotAuthorizedException("Token expired too long ago to refresh");
        }

        String subject = parsed.getSubject();
        if (subject == null || subject.isBlank()) {
            throw new NotAuthorizedException("Token missing subject");
        }
        try {
            return UUID.fromString(subject);
        } catch (IllegalArgumentException e) {
            throw new NotAuthorizedException("Invalid subject");
        }
    }

    private boolean verifySignature(String token) {
        try {
            JsonWebSignature jws = new JsonWebSignature();
            jws.setCompactSerialization(token);
            jws.setKey(publicKey);
            return jws.verifySignature();
        } catch (JoseException e) {
            return false;
        }
    }
}
