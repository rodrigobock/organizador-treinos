package org.organizadorTreinos.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.organizadorTreinos.exception.RateLimitException;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("RateLimitService unit tests")
class RateLimitServiceTest {

    private RateLimitService service;

    @BeforeEach
    void setUp() {
        service = new RateLimitService();
        service.loginCapacity = 5;
        service.loginWindowMinutes = 15;
        service.signupCapacity = 3;
        service.signupWindowMinutes = 60;
        service.forgotPasswordCapacity = 3;
        service.forgotPasswordWindowMinutes = 60;
        service.enabled = true;
    }

    @Test
    @DisplayName("Login: allows up to 5 attempts then throws RateLimitException")
    void loginEnforcesCapacity() {
        for (int i = 0; i < 5; i++) {
            assertDoesNotThrow(() -> service.checkLogin("user@test.com"));
        }
        RateLimitException ex = assertThrows(RateLimitException.class,
                () -> service.checkLogin("user@test.com"));
        assertEquals(429, ex.getResponse().getStatus());
        assertTrue(ex.getRetryAfterSeconds() > 0);
    }

    @Test
    @DisplayName("Login: different emails have independent buckets")
    void loginBucketsAreIsolatedPerEmail() {
        for (int i = 0; i < 5; i++) {
            service.checkLogin("a@test.com");
        }
        assertThrows(RateLimitException.class, () -> service.checkLogin("a@test.com"));
        assertDoesNotThrow(() -> service.checkLogin("b@test.com"));
    }

    @Test
    @DisplayName("Login: email is normalized (case + trim)")
    void loginEmailNormalized() {
        service.checkLogin("User@Test.com");
        service.checkLogin("  user@test.com  ");
        service.checkLogin("USER@TEST.COM");
        service.checkLogin("user@test.com");
        service.checkLogin("user@test.com");
        assertThrows(RateLimitException.class, () -> service.checkLogin("user@test.com"));
    }

    @Test
    @DisplayName("Signup: allows up to 3 attempts per IP")
    void signupEnforcesCapacityPerIp() {
        for (int i = 0; i < 3; i++) {
            service.checkSignup("10.0.0.1");
        }
        assertThrows(RateLimitException.class, () -> service.checkSignup("10.0.0.1"));
        assertDoesNotThrow(() -> service.checkSignup("10.0.0.2"));
    }

    @Test
    @DisplayName("Forgot-password: allows up to 3 attempts per email")
    void forgotPasswordEnforcesCapacity() {
        for (int i = 0; i < 3; i++) {
            service.checkForgotPassword("forgot@test.com");
        }
        assertThrows(RateLimitException.class, () -> service.checkForgotPassword("forgot@test.com"));
    }

    @Test
    @DisplayName("Disabled: no limit applied when enabled=false")
    void disabledSkipsLimit() {
        service.enabled = false;
        for (int i = 0; i < 100; i++) {
            assertDoesNotThrow(() -> service.checkLogin("anything@test.com"));
        }
    }

    @Test
    @DisplayName("Reset clears all buckets")
    void resetClearsBuckets() {
        for (int i = 0; i < 5; i++) {
            service.checkLogin("reset@test.com");
        }
        assertThrows(RateLimitException.class, () -> service.checkLogin("reset@test.com"));

        service.reset();

        assertDoesNotThrow(() -> service.checkLogin("reset@test.com"));
    }
}
