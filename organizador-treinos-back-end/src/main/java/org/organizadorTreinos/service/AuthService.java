package org.organizadorTreinos.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotAuthorizedException;
import org.jboss.logging.Logger;
import org.organizadorTreinos.dto.request.ForgotPasswordRequest;
import org.organizadorTreinos.dto.request.LoginRequest;
import org.organizadorTreinos.dto.request.ResetPasswordRequest;
import org.organizadorTreinos.dto.request.SignupRequest;
import org.organizadorTreinos.dto.response.AuthResponse;
import org.organizadorTreinos.dto.response.UserResponse;
import org.organizadorTreinos.entity.Gender;
import org.organizadorTreinos.entity.PasswordResetToken;
import org.organizadorTreinos.entity.RefreshToken;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.UserRole;
import org.organizadorTreinos.repository.PasswordResetTokenRepository;
import org.organizadorTreinos.repository.RefreshTokenRepository;
import org.organizadorTreinos.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@ApplicationScoped
@Transactional
public class AuthService {

    private static final Logger LOG = Logger.getLogger(AuthService.class);

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
        user.setRole(parseRole(request.getRole()));
        user.setGender(parseGender(request.getGender()));

        userRepository.persist(user);
        LOG.infof("New user signed up: userId=%s", user.getId());

        emailService.sendWelcome(user);

        String accessToken = jwtService.generateToken(user.getId());
        String refreshTokenValue = createRefreshToken(user);
        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCurrentWorkoutId(), user.getPreferredLocale(), user.getRole().name(), user.getGender().name());

        return new AuthResponse(accessToken, refreshTokenValue, userResponse);
    }

    public AuthResponse login(LoginRequest request) {
        String maskedEmail = maskEmail(request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> {
                LOG.warnf("Login failed for email=%s: user not found", maskedEmail);
                return new BadRequestException("Invalid email or password");
            });

        if (!passwordService.verify(request.getPassword(), user.getPasswordHash())) {
            LOG.warnf("Login failed for email=%s, userId=%s: invalid password", maskedEmail, user.getId());
            throw new BadRequestException("Invalid email or password");
        }

        LOG.infof("Login successful for userId=%s", user.getId());

        String accessToken = jwtService.generateToken(user.getId());
        String refreshTokenValue = createRefreshToken(user);
        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCurrentWorkoutId(), user.getPreferredLocale(), user.getRole().name(), user.getGender().name());

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
        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCurrentWorkoutId(), user.getPreferredLocale(), user.getRole().name(), user.getGender().name());

        return new AuthResponse(accessToken, newRefreshToken, userResponse);
    }

    public void logout(String rawRefreshToken) {
        refreshTokenRepository.findByToken(rawRefreshToken)
                .ifPresent(token -> {
                    UUID userId = token.getUser().getId();
                    refreshTokenRepository.delete(token);
                    LOG.infof("User logged out: userId=%s", userId);
                });
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        LOG.infof("Password reset requested for email=%s", maskEmail(request.getEmail()));

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
                .orElseThrow(() -> {
                    LOG.warn("Password reset attempted with invalid token (not found)");
                    return new BadRequestException("Invalid or expired token");
                });

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            LOG.warnf("Password reset attempted with expired/used token for userId=%s", resetToken.getUser().getId());
            throw new BadRequestException("Invalid or expired token");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordService.hash(request.getNewPassword()));
        resetToken.setUsed(true);

        LOG.infof("Password reset completed for userId=%s", user.getId());
    }

    /**
     * Masks an email address for safe logging.
     * Example: "john@example.com" becomes "j***@example.com"
     */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "***";
        }
        String[] parts = email.split("@", 2);
        String localPart = parts[0];
        String domain = parts[1];
        if (localPart.isEmpty()) {
            return "***@" + domain;
        }
        return localPart.charAt(0) + "***@" + domain;
    }

    private UserRole parseRole(String role) {
        if ("PERSONAL_TRAINER".equalsIgnoreCase(role)) return UserRole.PERSONAL_TRAINER;
        return UserRole.STUDENT;
    }

    private Gender parseGender(String gender) {
        if ("MALE".equalsIgnoreCase(gender)) return Gender.MALE;
        if ("FEMALE".equalsIgnoreCase(gender)) return Gender.FEMALE;
        return Gender.UNISEX;
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
