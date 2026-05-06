package org.organizadorTreinos.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
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

    public UserResponse getUserById(UUID userId) {
        User user = userRepository.find("id", userId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("User not found"));

        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }

    public UserResponse updateUser(UUID userId, String name) {
        User user = userRepository.find("id", userId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("User not found"));

        user.setName(name);
        userRepository.persist(user);

        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }
}
