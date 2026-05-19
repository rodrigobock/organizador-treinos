package org.organizadorTreinos.service;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.mockito.InjectMock;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotAuthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.organizadorTreinos.dto.request.SignupRequest;
import org.organizadorTreinos.dto.response.AuthResponse;
import org.organizadorTreinos.entity.RefreshToken;
import org.organizadorTreinos.repository.PasswordResetTokenRepository;
import org.organizadorTreinos.repository.RefreshTokenRepository;
import org.organizadorTreinos.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("Token Refresh / Rotation Tests")
class TokenRefreshTest {

    @Inject
    AuthService authService;

    @Inject
    UserRepository userRepository;

    @Inject
    PasswordResetTokenRepository tokenRepository;

    @Inject
    RefreshTokenRepository refreshTokenRepository;

    @InjectMock
    EmailService emailService;

    @BeforeEach
    @Transactional
    void setUp() {
        refreshTokenRepository.deleteAll();
        tokenRepository.deleteAll();
        userRepository.deleteAll();
        Mockito.reset(emailService);
    }

    private AuthResponse signupUser() {
        SignupRequest request = new SignupRequest();
        request.setName("Refresh User");
        request.setEmail("refresh@test.com");
        request.setPassword("ValidPass123");
        return authService.signup(request, "pt-BR");
    }

    @Test
    @DisplayName("Should return new access token and refresh token on valid refresh")
    void testRefreshWithValidOpaqueToken() {
        AuthResponse signup = signupUser();

        AuthResponse response = authService.refresh(signup.getRefreshToken());

        assertNotNull(response.getToken());
        assertNotNull(response.getRefreshToken());
        assertNotEquals(signup.getToken(), response.getToken());
        assertEquals("refresh@test.com", response.getUser().getEmail());
    }

    @Test
    @DisplayName("Should rotate refresh token on use (old token no longer valid)")
    void testRefreshTokenRotation() {
        AuthResponse signup = signupUser();
        String originalRefreshToken = signup.getRefreshToken();

        authService.refresh(originalRefreshToken);

        assertThrows(NotAuthorizedException.class, () -> authService.refresh(originalRefreshToken));
    }

    @Test
    @DisplayName("Should reject unknown refresh token")
    void testRefreshRejectsUnknownToken() {
        assertThrows(NotAuthorizedException.class, () -> authService.refresh(UUID.randomUUID().toString()));
    }

    @Test
    @DisplayName("Should reject expired refresh token")
    @Transactional
    void testRefreshRejectsExpiredToken() {
        AuthResponse signup = signupUser();

        RefreshToken stored = refreshTokenRepository.findByToken(signup.getRefreshToken()).orElseThrow();
        stored.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        refreshTokenRepository.persist(stored);

        assertThrows(NotAuthorizedException.class, () -> authService.refresh(signup.getRefreshToken()));
    }

    @Test
    @DisplayName("Signup should return both access token and refresh token")
    void testSignupReturnsBothTokens() {
        AuthResponse response = signupUser();

        assertNotNull(response.getToken());
        assertNotNull(response.getRefreshToken());
        assertFalse(response.getToken().isEmpty());
        assertFalse(response.getRefreshToken().isEmpty());
    }

    @Test
    @DisplayName("Login should return both access token and refresh token")
    void testLoginReturnsBothTokens() {
        signupUser();

        org.organizadorTreinos.dto.request.LoginRequest loginRequest = new org.organizadorTreinos.dto.request.LoginRequest();
        loginRequest.setEmail("refresh@test.com");
        loginRequest.setPassword("ValidPass123");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response.getToken());
        assertNotNull(response.getRefreshToken());
    }

    @Test
    @DisplayName("New login should replace previous refresh token for same user")
    void testNewLoginInvalidatesPreviousRefreshToken() {
        AuthResponse first = signupUser();
        String firstRefreshToken = first.getRefreshToken();

        org.organizadorTreinos.dto.request.LoginRequest loginRequest = new org.organizadorTreinos.dto.request.LoginRequest();
        loginRequest.setEmail("refresh@test.com");
        loginRequest.setPassword("ValidPass123");
        authService.login(loginRequest);

        assertThrows(NotAuthorizedException.class, () -> authService.refresh(firstRefreshToken));
    }
}
