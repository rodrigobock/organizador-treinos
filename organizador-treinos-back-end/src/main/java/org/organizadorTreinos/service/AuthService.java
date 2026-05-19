package org.organizadorTreinos.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotAuthorizedException;
import org.organizadorTreinos.dto.request.ForgotPasswordRequest;
import org.organizadorTreinos.dto.request.LoginRequest;
import org.organizadorTreinos.dto.request.ResetPasswordRequest;
import org.organizadorTreinos.dto.request.SignupRequest;
import org.organizadorTreinos.dto.response.AuthResponse;
import org.organizadorTreinos.dto.response.UserResponse;
import org.organizadorTreinos.entity.PasswordResetToken;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.repository.PasswordResetTokenRepository;
import org.organizadorTreinos.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@ApplicationScoped
@Transactional
public class AuthService {

    @Inject
    UserRepository userRepository;

    @Inject
    PasswordService passwordService;

    @Inject
    JwtService jwtService;

    @Inject
    EmailService emailService;

    @Inject
    PasswordResetTokenRepository tokenRepository;

    public AuthResponse signup(SignupRequest request, String locale) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordService.hash(request.getPassword()));
        user.setPreferredLocale(locale != null ? locale : "pt-BR");

        userRepository.persist(user);

        emailService.sendWelcome(user);

        String token = jwtService.generateToken(user.getId());
        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCurrentWorkoutId(), user.getPreferredLocale());

        return new AuthResponse(token, userResponse);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordService.verify(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getId());
        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCurrentWorkoutId(), user.getPreferredLocale());

        return new AuthResponse(token, userResponse);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            tokenRepository.invalidateUnusedForUser(user.getId());

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setExpiresAt(LocalDateTime.now().plusHours(1));
            tokenRepository.persist(resetToken);

            emailService.sendPasswordReset(user, resetToken.getToken());
        });
    }

    public AuthResponse refresh(String token) {
        UUID userId = jwtService.validateExpiredToken(token);
        User user = userRepository.find("id", userId).firstResultOptional()
                .orElseThrow(() -> new NotAuthorizedException("User no longer exists"));

        String newToken = jwtService.generateToken(user.getId());
        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCurrentWorkoutId(), user.getPreferredLocale());
        return new AuthResponse(newToken, userResponse);
    }

    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired token"));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Invalid or expired token");
        }

        resetToken.getUser().setPasswordHash(passwordService.hash(request.getNewPassword()));
        resetToken.setUsed(true);
    }
}
