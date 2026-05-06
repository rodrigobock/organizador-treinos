package org.organizadorTreinos.repository;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.organizadorTreinos.entity.PasswordResetToken;
import org.organizadorTreinos.entity.User;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("PasswordResetTokenRepository Tests")
class PasswordResetTokenRepositoryTest {

    @Inject
    PasswordResetTokenRepository tokenRepository;

    @Inject
    UserRepository userRepository;

    private User testUser;

    @BeforeEach
    @Transactional
    void setUp() {
        tokenRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("test@test.com");
        testUser.setPasswordHash("$2a$12$hash");
        userRepository.persist(testUser);
    }

    @Test
    @Transactional
    @DisplayName("Should find token by token string")
    void testFindByToken() {
        PasswordResetToken prt = new PasswordResetToken();
        prt.setUser(testUser);
        prt.setToken(UUID.randomUUID().toString());
        prt.setExpiresAt(LocalDateTime.now().plusHours(1));
        tokenRepository.persist(prt);

        Optional<PasswordResetToken> found = tokenRepository.findByToken(prt.getToken());

        assertTrue(found.isPresent());
        assertEquals(prt.getToken(), found.get().getToken());
    }

    @Test
    @Transactional
    @DisplayName("Should return empty when token not found")
    void testFindByTokenNotFound() {
        Optional<PasswordResetToken> found = tokenRepository.findByToken("nonexistent-token");
        assertFalse(found.isPresent());
    }

    @Test
    @Transactional
    @DisplayName("Should invalidate all unused tokens for user")
    void testInvalidateUnusedForUser() {
        PasswordResetToken prt1 = new PasswordResetToken();
        prt1.setUser(testUser);
        prt1.setToken(UUID.randomUUID().toString());
        prt1.setExpiresAt(LocalDateTime.now().plusHours(1));
        tokenRepository.persist(prt1);

        PasswordResetToken prt2 = new PasswordResetToken();
        prt2.setUser(testUser);
        prt2.setToken(UUID.randomUUID().toString());
        prt2.setExpiresAt(LocalDateTime.now().plusHours(1));
        tokenRepository.persist(prt2);

        tokenRepository.invalidateUnusedForUser(testUser.getId());
        tokenRepository.getEntityManager().clear();

        PasswordResetToken updated1 = tokenRepository.findByToken(prt1.getToken()).get();
        PasswordResetToken updated2 = tokenRepository.findByToken(prt2.getToken()).get();
        assertTrue(updated1.isUsed());
        assertTrue(updated2.isUsed());
    }

    @Test
    @Transactional
    @DisplayName("Should not invalidate already used tokens (idempotent)")
    void testInvalidateDoesNotAffectAlreadyUsed() {
        PasswordResetToken used = new PasswordResetToken();
        used.setUser(testUser);
        used.setToken(UUID.randomUUID().toString());
        used.setExpiresAt(LocalDateTime.now().plusHours(1));
        used.setUsed(true);
        tokenRepository.persist(used);

        tokenRepository.invalidateUnusedForUser(testUser.getId());

        assertTrue(tokenRepository.findByToken(used.getToken()).get().isUsed());
    }
}
