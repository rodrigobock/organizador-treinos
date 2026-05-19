package org.organizadorTreinos.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.organizadorTreinos.entity.RefreshToken;

import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class RefreshTokenRepository implements PanacheRepository<RefreshToken> {

    public Optional<RefreshToken> findByToken(String token) {
        return find("token", token).firstResultOptional();
    }

    public void deleteByUserId(UUID userId) {
        delete("user.id", userId);
    }
}
