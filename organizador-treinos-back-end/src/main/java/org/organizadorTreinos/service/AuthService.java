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
import org.organizadorTreinos.entity.RefreshToken;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.repository.PasswordResetTokenRepository;
import org.organizadorTreinos.repository.RefreshTokenRepository;
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

    @Inject
    RefreshTokenRepository refreshTokenRepository;

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

        String accessToken = jwtService.generateToken(user.getId());
        String refreshTokenValue = createRefreshToken(user);
        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCurrentWorkoutId(), user.getPreferredLocale());

        return new AuthResponse(accessToken, refreshTokenValue, userResponse);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordService.verify(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        String accessToken = jwtService.generateToken(user.getId());
        String refreshTokenValue = createRefreshToken(user);
        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCurrentWorkoutId(), user.getPreferredLocale());

        return new AuthResponse(accessToken, refreshTokenValue, userResponse);
    }

    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken stored = refreshTokenRepository.findByToken(rawRefreshToken)
                .orElseThrow(() -> new NotAuthorizedException("Invalid or expired refresh token"));

        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(stored);
            throw new NotAuthorizedException("Refresh token expired");
        }

        User user = stored.getUser();

        refreshTokenRepository.delete(stored);

        String accessToken = jwtService.generateToken(user.getId());
        String newRefreshToken = createRefreshToken(user);
        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCurrentWorkoutId(), user.getPreferredLocale());

        return new AuthResponse(accessToken, newRefreshToken, userResponse);
    }

    public void logout(String rawRefreshToken) {
        refreshTokenRepository.findByToken(rawRefreshToken)
                .ifPresent(refreshTokenRepository::delete);
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

    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired token"));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Invalid or expired token");
        }

        resetToken.getUser().setPasswordHash(passwordService.hash(request.getNewPassword()));
        resetToken.setUsed(true);
    }

    private String createRefreshToken(User user) {
        refreshTokenRepository.deleteByUserId(user.getId());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString());
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(7));
        refreshTokenRepository.persist(refreshToken);

        return refreshToken.getToken();
    }
}
