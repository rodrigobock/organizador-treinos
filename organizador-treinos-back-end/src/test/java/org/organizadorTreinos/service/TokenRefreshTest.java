package org.organizadorTreinos.service;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.mockito.InjectMock;
import io.smallrye.jwt.build.Jwt;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotAuthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.organizadorTreinos.dto.request.SignupRequest;
import org.organizadorTreinos.dto.response.AuthResponse;
import org.organizadorTreinos.repository.PasswordResetTokenRepository;
import org.organizadorTreinos.repository.UserRepository;

import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("Token Refresh / Rotation Tests")
class TokenRefreshTest {

    @Inject
    AuthService authService;

    @Inject
    JwtService jwtService;

    @Inject
    UserRepository userRepository;

    @Inject
    PasswordResetTokenRepository tokenRepository;

    @InjectMock
    EmailService emailService;

    @BeforeEach
    @Transactional
    void setUp() {
        tokenRepository.deleteAll();
        userRepository.deleteAll();
        Mockito.reset(emailService);
    }

    private UUID signupUser() {
        SignupRequest request = new SignupRequest();
        request.setName("Refresh User");
        request.setEmail("refresh@test.com");
        request.setPassword("ValidPass123");
        AuthResponse response = authService.signup(request, "pt-BR");
        return response.getUser().getId();
    }

    private String makeExpiredToken(UUID userId, long expiredSecondsAgo) {
        Instant expiresAt = Instant.now().minusSeconds(expiredSecondsAgo);
        Instant issuedAt = expiresAt.minus(Duration.ofMinutes(15));
        return Jwt.issuer("https://organizador-treinos.com")
                .subject(userId.toString())
                .groups(Set.of("users"))
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .sign();
    }

    @Test
    @DisplayName("Should refresh expired token and return a new valid token")
    void testRefreshExpiredToken() {
        UUID userId = signupUser();
        String expiredToken = makeExpiredToken(userId, 60);

        AuthResponse response = authService.refresh(expiredToken);

        assertNotNull(response.getToken());
        assertNotEquals(expiredToken, response.getToken());
        assertEquals(userId, response.getUser().getId());
    }

    @Test
    @DisplayName("Should reject token with invalid signature")
    void testRefreshRejectsForgedToken() {
        UUID userId = signupUser();
        String validToken = makeExpiredToken(userId, 60);
        // Tamper with payload byte
        String[] parts = validToken.split("\\.");
        String tampered = parts[0] + "." + parts[1] + "." + parts[2].substring(0, parts[2].length() - 4) + "AAAA";

        assertThrows(NotAuthorizedException.class, () -> authService.refresh(tampered));
    }

    @Test
    @DisplayName("Should reject malformed token")
    void testRefreshRejectsMalformed() {
        assertThrows(NotAuthorizedException.class, () -> authService.refresh("not-a-jwt"));
    }

    @Test
    @DisplayName("Should reject blank token")
    void testRefreshRejectsBlank() {
        assertThrows(NotAuthorizedException.class, () -> authService.refresh(""));
        assertThrows(NotAuthorizedException.class, () -> authService.refresh(null));
    }

    @Test
    @DisplayName("Should reject token whose user no longer exists")
    void testRefreshRejectsDeletedUser() {
        UUID userId = signupUser();
        String token = makeExpiredToken(userId, 30);

        // delete user
        userRepository.getEntityManager().createNativeQuery("DELETE FROM users WHERE id = :id")
                .setParameter("id", userId).executeUpdate();

        assertThrows(NotAuthorizedException.class, () -> authService.refresh(token));
    }

    @Test
    @DisplayName("Should reject token expired beyond max refresh window")
    void testRefreshRejectsTooOldToken() {
        UUID userId = signupUser();
        // 8 days past expiration (max-expired-age default is 7 days = 604800s)
        String veryOldToken = makeExpiredToken(userId, 8L * 24 * 3600);

        assertThrows(NotAuthorizedException.class, () -> authService.refresh(veryOldToken));
    }

    @Test
    @DisplayName("Should accept currently-valid token (not expired) for refresh")
    void testRefreshAcceptsValidToken() {
        UUID userId = signupUser();
        String validToken = jwtService.generateToken(userId);

        AuthResponse response = authService.refresh(validToken);

        assertNotNull(response.getToken());
        assertEquals(userId, response.getUser().getId());
    }
}
