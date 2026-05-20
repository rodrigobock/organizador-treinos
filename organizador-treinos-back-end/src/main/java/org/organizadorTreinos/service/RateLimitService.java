package org.organizadorTreinos.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.organizadorTreinos.exception.RateLimitException;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@ApplicationScoped
public class RateLimitService {

    private static final Logger LOG = Logger.getLogger(RateLimitService.class);

    @ConfigProperty(name = "auth.ratelimit.login.capacity", defaultValue = "5")
    long loginCapacity;

    @ConfigProperty(name = "auth.ratelimit.login.window-minutes", defaultValue = "15")
    long loginWindowMinutes;

    @ConfigProperty(name = "auth.ratelimit.signup.capacity", defaultValue = "3")
    long signupCapacity;

    @ConfigProperty(name = "auth.ratelimit.signup.window-minutes", defaultValue = "60")
    long signupWindowMinutes;

    @ConfigProperty(name = "auth.ratelimit.forgot-password.capacity", defaultValue = "3")
    long forgotPasswordCapacity;

    @ConfigProperty(name = "auth.ratelimit.forgot-password.window-minutes", defaultValue = "60")
    long forgotPasswordWindowMinutes;

    @ConfigProperty(name = "auth.ratelimit.enabled", defaultValue = "true")
    boolean enabled;

    private final ConcurrentMap<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Bucket> signupBuckets = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Bucket> forgotPasswordBuckets = new ConcurrentHashMap<>();

    public void checkLogin(String email) {
        if (!enabled) return;
        String key = normalizeEmail(email);
        Bucket bucket = loginBuckets.computeIfAbsent(key, k -> newBucket(loginCapacity, loginWindowMinutes));
        consumeOrThrow(bucket, "Too many login attempts. Try again later.");
    }

    public void checkSignup(String ip) {
        if (!enabled) return;
        String key = ip == null ? "unknown" : ip;
        Bucket bucket = signupBuckets.computeIfAbsent(key, k -> newBucket(signupCapacity, signupWindowMinutes));
        consumeOrThrow(bucket, "Too many signup attempts from this IP. Try again later.");
    }

    public void checkForgotPassword(String email) {
        if (!enabled) return;
        String key = normalizeEmail(email);
        Bucket bucket = forgotPasswordBuckets.computeIfAbsent(key, k -> newBucket(forgotPasswordCapacity, forgotPasswordWindowMinutes));
        consumeOrThrow(bucket, "Too many password reset requests. Try again later.");
    }

    public void reset() {
        loginBuckets.clear();
        signupBuckets.clear();
        forgotPasswordBuckets.clear();
    }

    private Bucket newBucket(long capacity, long windowMinutes) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillIntervally(capacity, Duration.ofMinutes(windowMinutes))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private void consumeOrThrow(Bucket bucket, String message) {
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        if (!probe.isConsumed()) {
            long retryAfterSeconds = Math.max(1L, probe.getNanosToWaitForRefill() / 1_000_000_000L);
            LOG.warnf("Rate limit exceeded: %s — retry after %ds", message, retryAfterSeconds);
            throw new RateLimitException(message, retryAfterSeconds);
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
