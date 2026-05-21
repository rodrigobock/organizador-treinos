package org.organizadorTreinos.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import org.organizadorTreinos.dto.response.UserResponse;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.repository.UserRepository;

import java.util.UUID;

@ApplicationScoped
@Transactional
public class UserService {

    @Inject
    UserRepository userRepository;

    @Inject
    PasswordService passwordService;

    public UserResponse getUserById(UUID userId) {
        User user = userRepository.find("id", userId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("User not found"));

        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCurrentWorkoutId(), user.getPreferredLocale(), user.getRole().name(), user.getGender().name());
    }

    public UserResponse updateUser(UUID userId, String name, String preferredLocale) {
        User user = userRepository.find("id", userId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("User not found"));

        if (name != null) {
            user.setName(name);
        }
        if (preferredLocale != null) {
            user.setPreferredLocale(preferredLocale);
        }
        userRepository.persist(user);

        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCurrentWorkoutId(), user.getPreferredLocale(), user.getRole().name(), user.getGender().name());
    }

    public void changePassword(UUID userId, String oldPassword, String newPassword) {
        User user = userRepository.find("id", userId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("User not found"));

        if (!passwordService.verify(oldPassword, user.getPasswordHash())) {
            throw new BadRequestException("Invalid current password");
        }

        user.setPasswordHash(passwordService.hash(newPassword));
        userRepository.persist(user);
    }

    public void deleteUser(UUID userId, String password) {
        User user = userRepository.find("id", userId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("User not found"));

        if (!passwordService.verify(password, user.getPasswordHash())) {
            throw new BadRequestException("Invalid password");
        }

        user.setCurrentWorkoutId(null);
        userRepository.persist(user);
        userRepository.delete(user);
    }
}
