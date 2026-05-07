package org.organizadorTreinos.integration;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import io.quarkus.test.junit.QuarkusTestProfile;
import io.restassured.http.ContentType;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.organizadorTreinos.repository.PasswordResetTokenRepository;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.service.RateLimitService;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

@QuarkusTest
@TestProfile(AuthRateLimitTest.RateLimitProfile.class)
@DisplayName("Auth rate limiting (Bucket4j)")
class AuthRateLimitTest {

    public static class RateLimitProfile implements QuarkusTestProfile {
        @Override
        public Map<String, String> getConfigOverrides() {
            return Map.of(
                "auth.ratelimit.enabled", "true",
                "auth.ratelimit.login.capacity", "5",
                "auth.ratelimit.login.window-minutes", "15",
                "auth.ratelimit.signup.capacity", "3",
                "auth.ratelimit.signup.window-minutes", "60",
                "auth.ratelimit.forgot-password.capacity", "3",
                "auth.ratelimit.forgot-password.window-minutes", "60"
            );
        }
    }

    @Inject
    UserRepository userRepository;

    @Inject
    PasswordResetTokenRepository tokenRepository;

    @Inject
    RateLimitService rateLimitService;

    @BeforeEach
    void setUp() {
        tokenRepository.deleteAll();
        userRepository.deleteAll();
        rateLimitService.reset();
    }

    @Test
    @DisplayName("Login: 6th attempt with same email returns 429")
    void loginRateLimited() {
        Map<String, String> body = Map.of("email", "ratelimit-login@test.com", "password", "WrongPass1");

        for (int i = 0; i < 5; i++) {
            given().contentType(ContentType.JSON).body(body)
                .when().post("/auth/login")
                .then().statusCode(400);
        }

        given().contentType(ContentType.JSON).body(body)
            .when().post("/auth/login")
            .then()
                .statusCode(429)
                .header("Retry-After", notNullValue())
                .body("status", equalTo(429));
    }

    @Test
    @DisplayName("Signup: 4th attempt from same IP returns 429")
    void signupRateLimited() {
        for (int i = 0; i < 3; i++) {
            Map<String, String> body = Map.of(
                "name", "User " + i,
                "email", "rl-signup-" + i + "@test.com",
                "password", "Password123"
            );
            given().contentType(ContentType.JSON).body(body)
                .when().post("/auth/signup")
                .then().statusCode(201);
        }

        Map<String, String> body = Map.of(
            "name", "User Blocked",
            "email", "rl-signup-blocked@test.com",
            "password", "Password123"
        );
        given().contentType(ContentType.JSON).body(body)
            .when().post("/auth/signup")
            .then()
                .statusCode(429)
                .header("Retry-After", notNullValue());
    }

    @Test
    @DisplayName("Forgot-password: 4th request for same email returns 429")
    void forgotPasswordRateLimited() {
        Map<String, String> body = Map.of("email", "rl-forgot@test.com");

        for (int i = 0; i < 3; i++) {
            given().contentType(ContentType.JSON).body(body)
                .when().post("/auth/forgot-password")
                .then().statusCode(200);
        }

        given().contentType(ContentType.JSON).body(body)
            .when().post("/auth/forgot-password")
            .then()
                .statusCode(429)
                .header("Retry-After", notNullValue());
    }
}
