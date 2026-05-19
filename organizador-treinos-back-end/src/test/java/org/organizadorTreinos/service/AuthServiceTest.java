package org.organizadorTreinos.service;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.mockito.InjectMock;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.organizadorTreinos.dto.request.ForgotPasswordRequest;
import org.organizadorTreinos.dto.request.LoginRequest;
import org.organizadorTreinos.dto.request.ResetPasswordRequest;
import org.organizadorTreinos.dto.request.SignupRequest;
import org.organizadorTreinos.dto.response.AuthResponse;
import org.organizadorTreinos.entity.PasswordResetToken;
import org.organizadorTreinos.repository.PasswordResetTokenRepository;
import org.organizadorTreinos.repository.UserRepository;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("AuthService JWT & Signup/Login Tests")
class AuthServiceTest {

    @Inject
    AuthService authService;

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

    @Test
    @DisplayName("Should signup new user successfully")
    void testSignupSuccess() {
        SignupRequest request = new SignupRequest();
        request.setName("João Silva");
        request.setEmail("joao@test.com");
        request.setPassword("SecurePass123");

        AuthResponse response = authService.signup(request, "pt-BR");

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertNotNull(response.getUser());
        assertEquals("joao@test.com", response.getUser().getEmail());
    }

    @Test
    @DisplayName("🔥 Should generate valid JWT token on signup")
    void testSignupGeneratesValidToken() {
        SignupRequest request = new SignupRequest();
        request.setName("User");
        request.setEmail("test@test.com");
        request.setPassword("ValidPass123");

        AuthResponse response = authService.signup(request, "pt-BR");

        assertNotNull(response.getToken());
        assertFalse(response.getToken().isEmpty());
        assertTrue(response.getToken().contains("."));
    }

    @Test
    @DisplayName("Should reject signup with duplicate email")
    void testSignupDuplicateEmail() {
        SignupRequest request1 = new SignupRequest();
        request1.setName("User 1");
        request1.setEmail("duplicate@test.com");
        request1.setPassword("Password123");
        authService.signup(request1, "pt-BR");

        SignupRequest request2 = new SignupRequest();
        request2.setName("User 2");
        request2.setEmail("duplicate@test.com");
        request2.setPassword("Password456");

        assertThrows(BadRequestException.class, () -> {
            authService.signup(request2, "pt-BR");
        });
    }

    @Test
    @DisplayName("Should reject weak passwords")
    void testSignupWeakPassword() {
        SignupRequest request = new SignupRequest();
        request.setName("User");
        request.setEmail("weak@test.com");
        request.setPassword("weak");

        assertThrows(Exception.class, () -> {
            authService.signup(request, "pt-BR");
        });
    }

    @Test
    @DisplayName("Should login with valid credentials")
    void testLoginSuccess() {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("User");
        signupRequest.setEmail("login@test.com");
        signupRequest.setPassword("ValidPass123");
        authService.signup(signupRequest, "pt-BR");

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("login@test.com");
        loginRequest.setPassword("ValidPass123");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("login@test.com", response.getUser().getEmail());
    }

    @Test
    @DisplayName("🔥 Should generate JWT token on successful login")
    void testLoginGeneratesToken() {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("User");
        signupRequest.setEmail("token@test.com");
        signupRequest.setPassword("ValidPass123");
        authService.signup(signupRequest, "pt-BR");

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("token@test.com");
        loginRequest.setPassword("ValidPass123");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response.getToken());
        assertTrue(response.getToken().contains("."));
    }

    @Test
    @DisplayName("Should reject login with wrong password")
    void testLoginWrongPassword() {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("User");
        signupRequest.setEmail("wrong@test.com");
        signupRequest.setPassword("CorrectPass123");
        authService.signup(signupRequest, "pt-BR");

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("wrong@test.com");
        loginRequest.setPassword("WrongPassword456");

        assertThrows(BadRequestException.class, () -> {
            authService.login(loginRequest);
        });
    }

    @Test
    @DisplayName("Should reject login with non-existent user")
    void testLoginNonExistentUser() {
        LoginRequest request = new LoginRequest();
        request.setEmail("nonexistent@test.com");
        request.setPassword("SomePass123");

        assertThrows(BadRequestException.class, () -> {
            authService.login(request);
        });
    }

    @Test
    @DisplayName("Should hash passwords with BCrypt (never plaintext)")
    void testPasswordIsHashed() {
        SignupRequest request = new SignupRequest();
        request.setName("User");
        request.setEmail("hash@test.com");
        request.setPassword("MyPassword123");

        authService.signup(request, "pt-BR");
        String storedHash = userRepository.findByEmail("hash@test.com").get().getPasswordHash();

        assertNotNull(storedHash);
        assertNotEquals("MyPassword123", storedHash);
        assertTrue(storedHash.startsWith("$2a$"));
    }

    @Test
    @DisplayName("Should send welcome email after successful signup")
    void testSignupSendsWelcomeEmail() {
        SignupRequest request = new SignupRequest();
        request.setName("Maria");
        request.setEmail("maria@test.com");
        request.setPassword("ValidPass123");

        authService.signup(request, "pt-BR");

        Mockito.verify(emailService, Mockito.times(1)).sendWelcome(Mockito.any());
    }

    @Test
    @DisplayName("Should send reset email when user exists")
    void testForgotPasswordSendsEmail() {
        SignupRequest signup = new SignupRequest();
        signup.setName("User");
        signup.setEmail("user@test.com");
        signup.setPassword("ValidPass123");
        authService.signup(signup, "pt-BR");
        Mockito.reset(emailService);

        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("user@test.com");

        authService.forgotPassword(request);

        Mockito.verify(emailService, Mockito.times(1))
                .sendPasswordReset(Mockito.any(org.organizadorTreinos.entity.User.class), Mockito.anyString());
    }

    @Test
    @DisplayName("Should return silently when email not found (no enumeration)")
    void testForgotPasswordUnknownEmailSilent() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("nobody@test.com");

        assertDoesNotThrow(() -> authService.forgotPassword(request));
        Mockito.verify(emailService, Mockito.never()).sendPasswordReset(Mockito.any(org.organizadorTreinos.entity.User.class), Mockito.any());
    }

    @Test
    @DisplayName("Should invalidate previous tokens when new reset is requested")
    void testForgotPasswordInvalidatesPreviousTokens() {
        SignupRequest signup = new SignupRequest();
        signup.setName("User");
        signup.setEmail("user2@test.com");
        signup.setPassword("ValidPass123");
        authService.signup(signup, "pt-BR");
        Mockito.reset(emailService);

        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("user2@test.com");

        authService.forgotPassword(request);
        authService.forgotPassword(request);

        long unusedCount = tokenRepository.find("user.email = ?1 and used = false", "user2@test.com").count();
        assertEquals(1, unusedCount);
    }

    @Test
    @DisplayName("Should reset password with valid token")
    void testResetPasswordSuccess() {
        SignupRequest signup = new SignupRequest();
        signup.setName("User");
        signup.setEmail("reset@test.com");
        signup.setPassword("OldPass123");
        authService.signup(signup, "pt-BR");
        Mockito.reset(emailService);

        ForgotPasswordRequest forgotRequest = new ForgotPasswordRequest();
        forgotRequest.setEmail("reset@test.com");
        authService.forgotPassword(forgotRequest);

        PasswordResetToken prt = tokenRepository.find("user.email = ?1 and used = false", "reset@test.com")
                .firstResult();

        ResetPasswordRequest resetRequest = new ResetPasswordRequest();
        resetRequest.setToken(prt.getToken());
        resetRequest.setNewPassword("NewPass456");

        assertDoesNotThrow(() -> authService.resetPassword(resetRequest));

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("reset@test.com");
        loginRequest.setPassword("NewPass456");
        AuthResponse response = authService.login(loginRequest);
        assertNotNull(response.getToken());
    }

    @Test
    @DisplayName("Should reject reset with invalid token")
    void testResetPasswordInvalidToken() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("nonexistent-token");
        request.setNewPassword("NewPass456");

        assertThrows(BadRequestException.class, () -> authService.resetPassword(request));
    }

    @Test
    @DisplayName("Should reject reset with used token")
    void testResetPasswordUsedToken() {
        SignupRequest signup = new SignupRequest();
        signup.setName("User");
        signup.setEmail("used@test.com");
        signup.setPassword("OldPass123");
        authService.signup(signup, "pt-BR");
        Mockito.reset(emailService);

        ForgotPasswordRequest forgotRequest = new ForgotPasswordRequest();
        forgotRequest.setEmail("used@test.com");
        authService.forgotPassword(forgotRequest);

        PasswordResetToken prt = tokenRepository.find("user.email = ?1 and used = false", "used@test.com")
                .firstResult();

        ResetPasswordRequest resetRequest = new ResetPasswordRequest();
        resetRequest.setToken(prt.getToken());
        resetRequest.setNewPassword("NewPass456");

        authService.resetPassword(resetRequest);

        assertThrows(BadRequestException.class, () -> authService.resetPassword(resetRequest));
    }

    @Test
    @Transactional
    @DisplayName("Should reject reset with expired token")
    void testResetPasswordExpiredToken() {
        SignupRequest signup = new SignupRequest();
        signup.setName("User");
        signup.setEmail("expired@test.com");
        signup.setPassword("OldPass123");
        authService.signup(signup, "pt-BR");
        Mockito.reset(emailService);

        ForgotPasswordRequest forgotRequest = new ForgotPasswordRequest();
        forgotRequest.setEmail("expired@test.com");
        authService.forgotPassword(forgotRequest);

        PasswordResetToken prt = tokenRepository.find("user.email = ?1 and used = false", "expired@test.com")
                .firstResult();
        prt.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        tokenRepository.persist(prt);

        ResetPasswordRequest resetRequest = new ResetPasswordRequest();
        resetRequest.setToken(prt.getToken());
        resetRequest.setNewPassword("NewPass456");

        assertThrows(BadRequestException.class, () -> authService.resetPassword(resetRequest));
    }
}
