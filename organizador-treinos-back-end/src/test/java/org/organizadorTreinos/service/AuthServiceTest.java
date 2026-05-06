package org.organizadorTreinos.service;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.organizadorTreinos.dto.request.LoginRequest;
import org.organizadorTreinos.dto.request.SignupRequest;
import org.organizadorTreinos.dto.response.AuthResponse;
import org.organizadorTreinos.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("AuthService JWT & Signup/Login Tests")
class AuthServiceTest {

    @Inject
    AuthService authService;

    @Inject
    UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Should signup new user successfully")
    void testSignupSuccess() {
        // Arrange
        SignupRequest request = new SignupRequest();
        request.setName("João Silva");
        request.setEmail("joao@test.com");
        request.setPassword("SecurePass123");

        // Act
        AuthResponse response = authService.signup(request);

        // Assert
        assertNotNull(response);
        assertNotNull(response.getToken());
        assertNotNull(response.getUser());
        assertEquals("joao@test.com", response.getUser().getEmail());
    }

    @Test
    @DisplayName("🔥 Should generate valid JWT token on signup")
    void testSignupGeneratesValidToken() {
        // Arrange
        SignupRequest request = new SignupRequest();
        request.setName("User");
        request.setEmail("test@test.com");
        request.setPassword("ValidPass123");

        // Act
        AuthResponse response = authService.signup(request);

        // Assert
        assertNotNull(response.getToken());
        assertFalse(response.getToken().isEmpty());
        // Token should contain JWT format (3 parts separated by dots)
        assertTrue(response.getToken().contains("."));
    }

    @Test
    @DisplayName("Should reject signup with duplicate email")
    void testSignupDuplicateEmail() {
        // Arrange
        SignupRequest request1 = new SignupRequest();
        request1.setName("User 1");
        request1.setEmail("duplicate@test.com");
        request1.setPassword("Password123");
        authService.signup(request1);

        SignupRequest request2 = new SignupRequest();
        request2.setName("User 2");
        request2.setEmail("duplicate@test.com");
        request2.setPassword("Password456");

        // Act & Assert
        assertThrows(BadRequestException.class, () -> {
            authService.signup(request2);
        });
    }

    @Test
    @DisplayName("Should reject weak passwords")
    void testSignupWeakPassword() {
        // Arrange
        SignupRequest request = new SignupRequest();
        request.setName("User");
        request.setEmail("weak@test.com");
        request.setPassword("weak");  // Too short, no uppercase, no number

        // Act & Assert
        assertThrows(Exception.class, () -> {
            authService.signup(request);
        });
    }

    @Test
    @DisplayName("Should login with valid credentials")
    void testLoginSuccess() {
        // Arrange
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("User");
        signupRequest.setEmail("login@test.com");
        signupRequest.setPassword("ValidPass123");
        authService.signup(signupRequest);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("login@test.com");
        loginRequest.setPassword("ValidPass123");

        // Act
        AuthResponse response = authService.login(loginRequest);

        // Assert
        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("login@test.com", response.getUser().getEmail());
    }

    @Test
    @DisplayName("🔥 Should generate JWT token on successful login")
    void testLoginGeneratesToken() {
        // Arrange
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("User");
        signupRequest.setEmail("token@test.com");
        signupRequest.setPassword("ValidPass123");
        authService.signup(signupRequest);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("token@test.com");
        loginRequest.setPassword("ValidPass123");

        // Act
        AuthResponse response = authService.login(loginRequest);

        // Assert
        assertNotNull(response.getToken());
        assertTrue(response.getToken().contains("."));
    }

    @Test
    @DisplayName("Should reject login with wrong password")
    void testLoginWrongPassword() {
        // Arrange
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("User");
        signupRequest.setEmail("wrong@test.com");
        signupRequest.setPassword("CorrectPass123");
        authService.signup(signupRequest);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("wrong@test.com");
        loginRequest.setPassword("WrongPassword456");

        // Act & Assert
        assertThrows(BadRequestException.class, () -> {
            authService.login(loginRequest);
        });
    }

    @Test
    @DisplayName("Should reject login with non-existent user")
    void testLoginNonExistentUser() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("nonexistent@test.com");
        request.setPassword("SomePass123");

        // Act & Assert
        assertThrows(NotFoundException.class, () -> {
            authService.login(request);
        });
    }

    @Test
    @DisplayName("Should hash passwords with BCrypt (never plaintext)")
    void testPasswordIsHashed() {
        // Arrange
        SignupRequest request = new SignupRequest();
        request.setName("User");
        request.setEmail("hash@test.com");
        request.setPassword("MyPassword123");

        // Act
        authService.signup(request);
        String storedHash = userRepository.findByEmail("hash@test.com").get().getPasswordHash();

        // Assert
        assertNotNull(storedHash);
        assertNotEquals("MyPassword123", storedHash);  // Should NOT be plaintext
        assertTrue(storedHash.startsWith("$2a$"));  // BCrypt format
    }
}
