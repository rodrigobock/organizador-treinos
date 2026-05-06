package org.organizadorTreinos.repository;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.organizadorTreinos.entity.User;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("UserRepository Tests")
class UserRepositoryTest {

    @Inject
    UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Clean up previous test data
        userRepository.deleteAll();

        // Arrange
        testUser = new User();
        testUser.setName("João Silva");
        testUser.setEmail("test@test.com");
        testUser.setPasswordHash("$2a$12$hashed_password");
    }

    @Test
    @DisplayName("Should save and retrieve a user by ID")
    void testSaveAndFindById() {
        // Act
        userRepository.persist(testUser);
        Optional<User> found = userRepository.find("id", testUser.getId().toString()).firstResultOptional();

        // Assert
        assertTrue(found.isPresent());
        assertEquals("João Silva", found.get().getName());
        assertEquals("test@test.com", found.get().getEmail());
    }

    @Test
    @DisplayName("Should find user by email")
    void testFindByEmail() {
        // Arrange
        userRepository.persist(testUser);

        // Act
        Optional<User> found = userRepository.findByEmail("test@test.com");

        // Assert
        assertTrue(found.isPresent());
        assertEquals(testUser.getId(), found.get().getId());
    }

    @Test
    @DisplayName("Should return empty when user email not found")
    void testFindByEmailNotFound() {
        // Arrange
        userRepository.persist(testUser);

        // Act
        Optional<User> found = userRepository.findByEmail("nonexistent@test.com");

        // Assert
        assertFalse(found.isPresent());
    }

    @Test
    @DisplayName("Should check if email exists")
    void testExistsByEmail() {
        // Arrange
        userRepository.persist(testUser);

        // Act & Assert
        assertTrue(userRepository.existsByEmail("test@test.com"));
        assertFalse(userRepository.existsByEmail("other@test.com"));
    }

    @Test
    @DisplayName("Should enforce email uniqueness")
    void testEmailUniqueness() {
        // Arrange
        userRepository.persist(testUser);

        User duplicateUser = new User();
        duplicateUser.setName("Another User");
        duplicateUser.setEmail("test@test.com");
        duplicateUser.setPasswordHash("different_hash");

        // Act & Assert
        assertThrows(Exception.class, () -> {
            userRepository.persist(duplicateUser);
        });
    }

    @Test
    @DisplayName("Should update user successfully")
    void testUpdateUser() {
        // Arrange
        userRepository.persist(testUser);

        // Act
        testUser.setName("João Updated");
        userRepository.persist(testUser);
        Optional<User> updated = userRepository.find("id", testUser.getId().toString()).firstResultOptional();

        // Assert
        assertTrue(updated.isPresent());
        assertEquals("João Updated", updated.get().getName());
    }

    @Test
    @DisplayName("Should delete user successfully")
    void testDeleteUser() {
        // Arrange
        userRepository.persist(testUser);
        UUID userId = testUser.getId();

        // Act
        userRepository.delete("id", userId.toString());
        Optional<User> deleted = userRepository.find("id", userId.toString()).firstResultOptional();

        // Assert
        assertFalse(deleted.isPresent());
    }
}
