package org.organizadorTreinos.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;
import org.organizadorTreinos.dto.request.LoginRequest;
import org.organizadorTreinos.dto.request.SignupRequest;
import org.organizadorTreinos.dto.response.AuthResponse;
import org.organizadorTreinos.dto.response.UserResponse;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.repository.UserRepository;

@ApplicationScoped
@Transactional
public class AuthService {

    @Inject
    UserRepository userRepository;

    @Inject
    PasswordService passwordService;

    @Inject
    JwtService jwtService;

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordService.hash(request.getPassword()));

        userRepository.persist(user);

        String token = jwtService.generateToken(user.getId());
        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail());

        return new AuthResponse(token, userResponse);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new NotFoundException("User not found"));

        if (!passwordService.verify(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getId());
        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail());

        return new AuthResponse(token, userResponse);
    }
}
