package org.organizadorTreinos.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.organizadorTreinos.entity.PasswordResetToken;

import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class PasswordResetTokenRepository implements PanacheRepository<PasswordResetToken> {

    public Optional<PasswordResetToken> findByToken(String token) {
        return find("token", token).firstResultOptional();
    }

    public void invalidateUnusedForUser(UUID userId) {
        update("used = true where user.id = ?1 and used = false", userId);
    }
}
