package org.organizadorTreinos.service;

import io.quarkus.runtime.Startup;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@ApplicationScoped
@Startup
public class JwtService {

    @ConfigProperty(name = "smallrye.jwt.new-token.lifespan", defaultValue = "86400")
    long tokenLifespan;

    @ConfigProperty(name = "mp.jwt.verify.issuer", defaultValue = "https://organizador-treinos.com")
    String issuer;

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
}
