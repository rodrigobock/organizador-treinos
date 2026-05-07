package org.organizadorTreinos.service;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.mockito.InjectMock;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.Test;
import org.organizadorTreinos.dto.response.UserResponse;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@QuarkusTest
public class UserServiceTest {

    @Inject
    UserService userService;

    @InjectMock
    UserRepository userRepository;

    @InjectMock
    PasswordService passwordService;

    @Test
    public void testDeleteUserWithValidPassword() {
        UUID userId = UUID.randomUUID();
        String password = "Test@123";
        String passwordHash = "hashed_password";

        User user = new User();
        user.setId(userId);
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setPasswordHash(passwordHash);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        when(userRepository.find("id", userId)).thenReturn(userRepository.find("id", userId));
        when(userRepository.find("id", userId).firstResultOptional()).thenReturn(Optional.of(user));
        when(passwordService.verify(password, passwordHash)).thenReturn(true);

        userService.deleteUser(userId, password);

        verify(userRepository).delete(user);
    }

    @Test
    public void testDeleteUserWithInvalidPassword() {
        UUID userId = UUID.randomUUID();
        String password = "WrongPassword";
        String passwordHash = "hashed_password";

        User user = new User();
        user.setId(userId);
        user.setPasswordHash(passwordHash);

        when(userRepository.find("id", userId)).thenReturn(userRepository.find("id", userId));
        when(userRepository.find("id", userId).firstResultOptional()).thenReturn(Optional.of(user));
        when(passwordService.verify(password, passwordHash)).thenReturn(false);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            userService.deleteUser(userId, password);
        });

        assertEquals("Invalid password", exception.getMessage());
    }

    @Test
    public void testDeleteUserNotFound() {
        UUID userId = UUID.randomUUID();
        String password = "Test@123";

        when(userRepository.find("id", userId)).thenReturn(userRepository.find("id", userId));
        when(userRepository.find("id", userId).firstResultOptional()).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            userService.deleteUser(userId, password);
        });

        assertEquals("User not found", exception.getMessage());
    }
}
