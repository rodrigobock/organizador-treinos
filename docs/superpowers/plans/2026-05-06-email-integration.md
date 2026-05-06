# Email Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Resend Java SDK to send welcome email on signup and implement full forgot-password/reset-password flow with DB tokens.

**Architecture:** `EmailService` wraps Resend SDK and is injected into `AuthService`. Password reset uses a `password_reset_tokens` table with single-use UUID tokens that expire after 1 hour. Existing tests are updated to mock `EmailService` so no real HTTP calls happen during test runs.

**Tech Stack:** Quarkus 3.9.1, Java 17, `com.resend:resend-java`, `quarkus-junit5-mockito`, Panache ORM, Liquibase

---

## File Map

| Action | File |
|---|---|
| Modify | `organizador-treinos-back-end/pom.xml` |
| Modify | `organizador-treinos-back-end/src/main/resources/application.properties` |
| Create | `organizador-treinos-back-end/src/main/resources/db/changelog/V2__add_password_reset_tokens.sql` |
| Modify | `organizador-treinos-back-end/src/main/resources/db/changelog/changelog-master.xml` |
| Create | `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/entity/PasswordResetToken.java` |
| Create | `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/repository/PasswordResetTokenRepository.java` |
| Create | `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/service/EmailService.java` |
| Modify | `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/service/AuthService.java` |
| Create | `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/dto/request/ForgotPasswordRequest.java` |
| Create | `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/dto/request/ResetPasswordRequest.java` |
| Modify | `organizador-treinos-back-end/src/main/java/org/organizadorTreinos/controller/AuthController.java` |
| Modify | `organizador-treinos-back-end/src/test/java/org/organizadorTreinos/service/AuthServiceTest.java` |
| Create | `organizador-treinos-back-end/src/test/java/org/organizadorTreinos/repository/PasswordResetTokenRepositoryTest.java` |

---

## Task 1: Dependencies and Configuration

**Files:**
- Modify: `organizador-treinos-back-end/pom.xml`
- Modify: `organizador-treinos-back-end/src/main/resources/application.properties`

- [ ] **Step 1: Add `resend-java` SDK and `quarkus-junit5-mockito` to pom.xml**

In `pom.xml`, inside the `<dependencies>` block, add after the lombok dependency:

```xml
<dependency>
    <groupId>com.resend</groupId>
    <artifactId>resend-java</artifactId>
    <version>3.1.0</version>
</dependency>
```

And in the test dependencies section (after the mockito-junit-jupiter dependency):

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-junit5-mockito</artifactId>
    <scope>test</scope>
</dependency>
```

- [ ] **Step 2: Add email config properties to `application.properties`**

Append to the end of `src/main/resources/application.properties`:

```properties
# Email (Resend SDK)
resend.api-key=${RESEND_API_KEY}
resend.from-email=${FROM_EMAIL:Organizador de Treinos <noreply@seudominio.com>}
app.frontend-url=${FRONTEND_URL:http://localhost:3000}

# Test profile - dummy key so Quarkus starts without RESEND_API_KEY env var
%test.resend.api-key=re_test_dummy
```

- [ ] **Step 3: Verify application compiles**

Run from `organizador-treinos-back-end/`:
```bash
mvn compile -q
```
Expected: `BUILD SUCCESS` with no errors.

---

## Task 2: Database Migration, Entity, and Repository

**Files:**
- Create: `src/main/resources/db/changelog/V2__add_password_reset_tokens.sql`
- Modify: `src/main/resources/db/changelog/changelog-master.xml`
- Create: `src/main/java/org/organizadorTreinos/entity/PasswordResetToken.java`
- Create: `src/main/java/org/organizadorTreinos/repository/PasswordResetTokenRepository.java`
- Test: `src/test/java/org/organizadorTreinos/repository/PasswordResetTokenRepositoryTest.java`

- [ ] **Step 1: Write the failing repository tests**

Create `src/test/java/org/organizadorTreinos/repository/PasswordResetTokenRepositoryTest.java`:

```java
package org.organizadorTreinos.repository;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.organizadorTreinos.entity.PasswordResetToken;
import org.organizadorTreinos.entity.User;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("PasswordResetTokenRepository Tests")
class PasswordResetTokenRepositoryTest {

    @Inject
    PasswordResetTokenRepository tokenRepository;

    @Inject
    UserRepository userRepository;

    private User testUser;

    @BeforeEach
    @Transactional
    void setUp() {
        tokenRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("test@test.com");
        testUser.setPasswordHash("$2a$12$hash");
        userRepository.persist(testUser);
    }

    @Test
    @Transactional
    @DisplayName("Should find token by token string")
    void testFindByToken() {
        PasswordResetToken prt = new PasswordResetToken();
        prt.setUser(testUser);
        prt.setToken(UUID.randomUUID().toString());
        prt.setExpiresAt(LocalDateTime.now().plusHours(1));
        tokenRepository.persist(prt);

        Optional<PasswordResetToken> found = tokenRepository.findByToken(prt.getToken());

        assertTrue(found.isPresent());
        assertEquals(prt.getToken(), found.get().getToken());
    }

    @Test
    @Transactional
    @DisplayName("Should return empty when token not found")
    void testFindByTokenNotFound() {
        Optional<PasswordResetToken> found = tokenRepository.findByToken("nonexistent-token");
        assertFalse(found.isPresent());
    }

    @Test
    @Transactional
    @DisplayName("Should invalidate all unused tokens for user")
    void testInvalidateUnusedForUser() {
        PasswordResetToken prt1 = new PasswordResetToken();
        prt1.setUser(testUser);
        prt1.setToken(UUID.randomUUID().toString());
        prt1.setExpiresAt(LocalDateTime.now().plusHours(1));
        tokenRepository.persist(prt1);

        PasswordResetToken prt2 = new PasswordResetToken();
        prt2.setUser(testUser);
        prt2.setToken(UUID.randomUUID().toString());
        prt2.setExpiresAt(LocalDateTime.now().plusHours(1));
        tokenRepository.persist(prt2);

        tokenRepository.invalidateUnusedForUser(testUser.getId());

        PasswordResetToken updated1 = tokenRepository.findByToken(prt1.getToken()).get();
        PasswordResetToken updated2 = tokenRepository.findByToken(prt2.getToken()).get();
        assertTrue(updated1.isUsed());
        assertTrue(updated2.isUsed());
    }

    @Test
    @Transactional
    @DisplayName("Should not invalidate already used tokens (idempotent)")
    void testInvalidateDoesNotAffectAlreadyUsed() {
        PasswordResetToken used = new PasswordResetToken();
        used.setUser(testUser);
        used.setToken(UUID.randomUUID().toString());
        used.setExpiresAt(LocalDateTime.now().plusHours(1));
        used.setUsed(true);
        tokenRepository.persist(used);

        // Should not throw and token stays used=true
        tokenRepository.invalidateUnusedForUser(testUser.getId());

        assertTrue(tokenRepository.findByToken(used.getToken()).get().isUsed());
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
mvn test -Dtest=PasswordResetTokenRepositoryTest -q
```
Expected: FAIL with `ClassNotFoundException` or compilation error (entity/repo don't exist yet).

- [ ] **Step 3: Create the DB migration SQL**

Create `src/main/resources/db/changelog/V2__add_password_reset_tokens.sql`:

```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prt_token ON password_reset_tokens(token);
```

- [ ] **Step 4: Register migration in changelog-master.xml**

In `src/main/resources/db/changelog/changelog-master.xml`, add the include after V1:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
        xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">

    <include file="db/changelog/V1__create_initial_schema.sql" relativeToChangelogFile="false"/>
    <include file="db/changelog/V2__add_password_reset_tokens.sql" relativeToChangelogFile="false"/>

</databaseChangeLog>
```

- [ ] **Step 5: Create the `PasswordResetToken` entity**

Create `src/main/java/org/organizadorTreinos/entity/PasswordResetToken.java`:

```java
package org.organizadorTreinos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean used = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

- [ ] **Step 6: Create the `PasswordResetTokenRepository`**

Create `src/main/java/org/organizadorTreinos/repository/PasswordResetTokenRepository.java`:

```java
package org.organizadorTreinos.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.organizadorTreinos.entity.PasswordResetToken;

import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class PasswordResetTokenRepository implements PanacheRepository<PasswordResetToken> {

    public Optional<PasswordResetToken> findByToken(String token) {
        return find("token", token).firstResultOptional();
    }

    public void invalidateUnusedForUser(UUID userId) {
        update("used = true where user.id = ?1 and used = false", userId);
    }
}
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
mvn test -Dtest=PasswordResetTokenRepositoryTest -q
```
Expected: `BUILD SUCCESS`, all 4 tests pass.

---

## Task 3: EmailService

**Files:**
- Create: `src/main/java/org/organizadorTreinos/service/EmailService.java`

No unit tests for `EmailService` directly — it is a thin wrapper around the Resend SDK that would require real HTTP calls. Integration is verified indirectly via `AuthServiceTest` (Task 4 and 5).

- [ ] **Step 1: Create `EmailService.java`**

Create `src/main/java/org/organizadorTreinos/service/EmailService.java`:

```java
package org.organizadorTreinos.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.InternalServerErrorException;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.organizadorTreinos.entity.User;

@ApplicationScoped
public class EmailService {

    private static final Logger LOG = Logger.getLogger(EmailService.class);

    @ConfigProperty(name = "resend.api-key")
    String apiKey;

    @ConfigProperty(name = "resend.from-email", defaultValue = "Organizador de Treinos <noreply@seudominio.com>")
    String fromEmail;

    @ConfigProperty(name = "app.frontend-url", defaultValue = "http://localhost:3000")
    String frontendUrl;

    private Resend resend;

    @PostConstruct
    void init() {
        resend = new Resend(apiKey);
    }

    public void sendWelcome(User user) {
        try {
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(user.getEmail())
                    .subject("Bem-vindo ao Organizador de Treinos!")
                    .html(buildWelcomeHtml(user.getName()))
                    .build();
            resend.emails().send(params);
        } catch (ResendException e) {
            LOG.warnf("Failed to send welcome email to %s: %s", user.getEmail(), e.getMessage());
        }
    }

    public void sendPasswordReset(String email, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        try {
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(email)
                    .subject("Redefinição de senha")
                    .html(buildPasswordResetHtml(resetLink))
                    .build();
            resend.emails().send(params);
        } catch (ResendException e) {
            LOG.errorf("Failed to send password reset email to %s: %s", email, e.getMessage());
            throw new InternalServerErrorException("Falha ao enviar email de recuperação. Tente novamente.");
        }
    }

    private String buildWelcomeHtml(String name) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Bem-vindo, %s!</h2>
                  <p>Sua conta no <strong>Organizador de Treinos</strong> foi criada com sucesso.</p>
                  <p>Agora você pode organizar seus treinos e exercícios em um só lugar.</p>
                  <p>Bons treinos!</p>
                </div>
                """.formatted(name);
    }

    private String buildPasswordResetHtml(String resetLink) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Redefinição de senha</h2>
                  <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
                  <p>Clique no link abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
                  <p>
                    <a href="%s" style="background-color: #007bff; color: white; padding: 12px 24px;
                       text-decoration: none; border-radius: 4px; display: inline-block;">
                      Redefinir senha
                    </a>
                  </p>
                  <p>Se você não solicitou a redefinição, ignore este email.</p>
                </div>
                """.formatted(resetLink);
    }
}
```

- [ ] **Step 2: Verify application compiles**

```bash
mvn compile -q
```
Expected: `BUILD SUCCESS`.

---

## Task 4: Welcome Email on Signup

**Files:**
- Modify: `src/main/java/org/organizadorTreinos/service/AuthService.java`
- Modify: `src/test/java/org/organizadorTreinos/service/AuthServiceTest.java`

- [ ] **Step 1: Update `AuthServiceTest` to mock `EmailService`**

Add `@InjectMock` to the existing `AuthServiceTest.java`. Add these imports and the mock field at the top of the class (after `@QuarkusTest`):

```java
// Add these imports:
import io.quarkus.test.junit.mockito.InjectMock;
import org.mockito.Mockito;
import org.organizadorTreinos.service.EmailService;
```

Add this field inside the class, after the existing `@Inject` fields:

```java
@InjectMock
EmailService emailService;
```

Add a `@BeforeEach` body line to reset the mock (add inside the existing `setUp()` method, after `userRepository.deleteAll()`):

```java
Mockito.reset(emailService);
```

The full updated imports block and class opening should look like:

```java
package org.organizadorTreinos.service;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.mockito.InjectMock;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.organizadorTreinos.dto.request.LoginRequest;
import org.organizadorTreinos.dto.request.SignupRequest;
import org.organizadorTreinos.dto.response.AuthResponse;
import org.organizadorTreinos.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("AuthService JWT & Signup/Login Tests")
class AuthServiceTest {

    @Inject
    AuthService authService;

    @Inject
    UserRepository userRepository;

    @InjectMock
    EmailService emailService;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        Mockito.reset(emailService);
    }
    // ... existing tests unchanged ...
}
```

- [ ] **Step 2: Run existing tests to confirm they still pass before modifying AuthService**

```bash
mvn test -Dtest=AuthServiceTest -q
```
Expected: `BUILD SUCCESS`, all 8 tests pass (EmailService is mocked and does nothing).

- [ ] **Step 3: Add `sendWelcome` call to `AuthService.signup()`**

Replace the full `AuthService.java` content:

```java
package org.organizadorTreinos.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
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

    @Inject
    EmailService emailService;

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordService.hash(request.getPassword()));

        userRepository.persist(user);

        emailService.sendWelcome(user);

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
```

- [ ] **Step 4: Add test verifying `sendWelcome` is called on signup**

Add this test method to `AuthServiceTest.java`:

```java
@Test
@DisplayName("Should send welcome email after successful signup")
void testSignupSendsWelcomeEmail() {
    SignupRequest request = new SignupRequest();
    request.setName("Maria");
    request.setEmail("maria@test.com");
    request.setPassword("ValidPass123");

    authService.signup(request);

    Mockito.verify(emailService, Mockito.times(1)).sendWelcome(Mockito.any());
}
```

- [ ] **Step 5: Run tests**

```bash
mvn test -Dtest=AuthServiceTest -q
```
Expected: `BUILD SUCCESS`, all 9 tests pass.

---

## Task 5: Forgot Password and Reset Password

**Files:**
- Create: `src/main/java/org/organizadorTreinos/dto/request/ForgotPasswordRequest.java`
- Create: `src/main/java/org/organizadorTreinos/dto/request/ResetPasswordRequest.java`
- Modify: `src/main/java/org/organizadorTreinos/service/AuthService.java`
- Modify: `src/test/java/org/organizadorTreinos/service/AuthServiceTest.java`

- [ ] **Step 1: Write failing tests for `forgotPassword` and `resetPassword`**

Add these imports to `AuthServiceTest.java`:

```java
import jakarta.ws.rs.BadRequestException;
import org.organizadorTreinos.dto.request.ForgotPasswordRequest;
import org.organizadorTreinos.dto.request.ResetPasswordRequest;
import org.organizadorTreinos.entity.PasswordResetToken;
import org.organizadorTreinos.repository.PasswordResetTokenRepository;
import java.time.LocalDateTime;
```

Add this inject field to `AuthServiceTest`:

```java
@Inject
PasswordResetTokenRepository tokenRepository;
```

And add this to `setUp()`:

```java
tokenRepository.deleteAll();
```

Add these test methods:

```java
@Test
@DisplayName("Should send reset email when user exists")
void testForgotPasswordSendsEmail() {
    SignupRequest signup = new SignupRequest();
    signup.setName("User");
    signup.setEmail("user@test.com");
    signup.setPassword("ValidPass123");
    authService.signup(signup);
    Mockito.reset(emailService);

    ForgotPasswordRequest request = new ForgotPasswordRequest();
    request.setEmail("user@test.com");

    authService.forgotPassword(request);

    Mockito.verify(emailService, Mockito.times(1))
            .sendPasswordReset(Mockito.eq("user@test.com"), Mockito.anyString());
}

@Test
@DisplayName("Should return silently when email not found (no enumeration)")
void testForgotPasswordUnknownEmailSilent() {
    ForgotPasswordRequest request = new ForgotPasswordRequest();
    request.setEmail("nobody@test.com");

    assertDoesNotThrow(() -> authService.forgotPassword(request));
    Mockito.verify(emailService, Mockito.never()).sendPasswordReset(Mockito.any(), Mockito.any());
}

@Test
@DisplayName("Should invalidate previous tokens when new reset is requested")
void testForgotPasswordInvalidatesPreviousTokens() {
    SignupRequest signup = new SignupRequest();
    signup.setName("User");
    signup.setEmail("user2@test.com");
    signup.setPassword("ValidPass123");
    authService.signup(signup);
    Mockito.reset(emailService);

    ForgotPasswordRequest request = new ForgotPasswordRequest();
    request.setEmail("user2@test.com");

    authService.forgotPassword(request);
    authService.forgotPassword(request);

    long unusedCount = tokenRepository.find("user.email = ?1 and used = false", "user2@test.com").count();
    assertEquals(1, unusedCount);
}

@Test
@DisplayName("Should reset password with valid token")
void testResetPasswordSuccess() {
    SignupRequest signup = new SignupRequest();
    signup.setName("User");
    signup.setEmail("reset@test.com");
    signup.setPassword("OldPass123");
    authService.signup(signup);
    Mockito.reset(emailService);

    ForgotPasswordRequest forgotRequest = new ForgotPasswordRequest();
    forgotRequest.setEmail("reset@test.com");
    authService.forgotPassword(forgotRequest);

    PasswordResetToken prt = tokenRepository.find("user.email = ?1 and used = false", "reset@test.com")
            .firstResult();

    ResetPasswordRequest resetRequest = new ResetPasswordRequest();
    resetRequest.setToken(prt.getToken());
    resetRequest.setNewPassword("NewPass456");

    assertDoesNotThrow(() -> authService.resetPassword(resetRequest));

    LoginRequest loginRequest = new LoginRequest();
    loginRequest.setEmail("reset@test.com");
    loginRequest.setPassword("NewPass456");
    AuthResponse response = authService.login(loginRequest);
    assertNotNull(response.getToken());
}

@Test
@DisplayName("Should reject reset with invalid token")
void testResetPasswordInvalidToken() {
    ResetPasswordRequest request = new ResetPasswordRequest();
    request.setToken("nonexistent-token");
    request.setNewPassword("NewPass456");

    assertThrows(BadRequestException.class, () -> authService.resetPassword(request));
}

@Test
@DisplayName("Should reject reset with used token")
void testResetPasswordUsedToken() {
    SignupRequest signup = new SignupRequest();
    signup.setName("User");
    signup.setEmail("used@test.com");
    signup.setPassword("OldPass123");
    authService.signup(signup);
    Mockito.reset(emailService);

    ForgotPasswordRequest forgotRequest = new ForgotPasswordRequest();
    forgotRequest.setEmail("used@test.com");
    authService.forgotPassword(forgotRequest);

    PasswordResetToken prt = tokenRepository.find("user.email = ?1 and used = false", "used@test.com")
            .firstResult();

    ResetPasswordRequest resetRequest = new ResetPasswordRequest();
    resetRequest.setToken(prt.getToken());
    resetRequest.setNewPassword("NewPass456");

    authService.resetPassword(resetRequest);

    assertThrows(BadRequestException.class, () -> authService.resetPassword(resetRequest));
}

@Test
@DisplayName("Should reject reset with expired token")
void testResetPasswordExpiredToken() {
    SignupRequest signup = new SignupRequest();
    signup.setName("User");
    signup.setEmail("expired@test.com");
    signup.setPassword("OldPass123");
    authService.signup(signup);
    Mockito.reset(emailService);

    ForgotPasswordRequest forgotRequest = new ForgotPasswordRequest();
    forgotRequest.setEmail("expired@test.com");
    authService.forgotPassword(forgotRequest);

    PasswordResetToken prt = tokenRepository.find("user.email = ?1 and used = false", "expired@test.com")
            .firstResult();
    prt.setExpiresAt(LocalDateTime.now().minusMinutes(1));
    tokenRepository.persist(prt);

    ResetPasswordRequest resetRequest = new ResetPasswordRequest();
    resetRequest.setToken(prt.getToken());
    resetRequest.setNewPassword("NewPass456");

    assertThrows(BadRequestException.class, () -> authService.resetPassword(resetRequest));
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
mvn test -Dtest=AuthServiceTest -q
```
Expected: FAIL with compilation error (DTOs and methods don't exist yet).

- [ ] **Step 3: Create `ForgotPasswordRequest.java`**

Create `src/main/java/org/organizadorTreinos/dto/request/ForgotPasswordRequest.java`:

```java
package org.organizadorTreinos.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ForgotPasswordRequest {

    @NotBlank
    @Email
    private String email;
}
```

- [ ] **Step 4: Create `ResetPasswordRequest.java`**

Create `src/main/java/org/organizadorTreinos/dto/request/ResetPasswordRequest.java`:

```java
package org.organizadorTreinos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ResetPasswordRequest {

    @NotBlank
    private String token;

    @NotBlank
    @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
    private String newPassword;
}
```

- [ ] **Step 5: Add `forgotPassword()` and `resetPassword()` to `AuthService.java`**

Replace the full `AuthService.java` content:

```java
package org.organizadorTreinos.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
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

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordService.hash(request.getPassword()));

        userRepository.persist(user);

        emailService.sendWelcome(user);

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

    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            tokenRepository.invalidateUnusedForUser(user.getId());

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setExpiresAt(LocalDateTime.now().plusHours(1));
            tokenRepository.persist(resetToken);

            emailService.sendPasswordReset(user.getEmail(), resetToken.getToken());
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
}
```

- [ ] **Step 6: Run tests**

```bash
mvn test -Dtest=AuthServiceTest -q
```
Expected: `BUILD SUCCESS`, all 16 tests pass.

---

## Task 6: Controller Endpoints

**Files:**
- Modify: `src/main/java/org/organizadorTreinos/controller/AuthController.java`

- [ ] **Step 1: Add endpoints to `AuthController.java`**

Replace the full `AuthController.java` content:

```java
package org.organizadorTreinos.controller;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.organizadorTreinos.dto.request.ForgotPasswordRequest;
import org.organizadorTreinos.dto.request.LoginRequest;
import org.organizadorTreinos.dto.request.ResetPasswordRequest;
import org.organizadorTreinos.dto.request.SignupRequest;
import org.organizadorTreinos.dto.response.AuthResponse;
import org.organizadorTreinos.service.AuthService;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthController {

    @Inject
    AuthService authService;

    @POST
    @Path("/signup")
    public Response signup(@Valid SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @POST
    @Path("/login")
    public Response login(@Valid LoginRequest request) {
        AuthResponse response = authService.login(request);
        return Response.ok(response).build();
    }

    @POST
    @Path("/forgot-password")
    public Response forgotPassword(@Valid ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return Response.ok().build();
    }

    @POST
    @Path("/reset-password")
    public Response resetPassword(@Valid ResetPasswordRequest request) {
        authService.resetPassword(request);
        return Response.ok().build();
    }
}
```

- [ ] **Step 2: Run all tests to verify nothing is broken**

```bash
mvn test -q
```
Expected: `BUILD SUCCESS`, all tests pass.

- [ ] **Step 3: Start the application and manually test the endpoints**

Start the backend (requires PostgreSQL running and `RESEND_API_KEY` set):
```bash
RESEND_API_KEY=re_XxAS422Y_5p1rFDRd6wYVxB483yjBVCso mvn quarkus:dev
```

Test signup sends welcome email:
```bash
curl -s -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"your@email.com","password":"SecurePass123"}' | jq .
```
Expected: `201 Created` with token + user. Check inbox for welcome email.

Test forgot-password returns 200 for unknown email (no enumeration):
```bash
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8080/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"nobody@example.com"}'
```
Expected: `200`

Test forgot-password sends email for known user:
```bash
curl -s -X POST http://localhost:8080/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```
Expected: `200`. Check inbox for reset email with link.

Test reset-password with invalid token:
```bash
curl -s -X POST http://localhost:8080/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"bad-token","newPassword":"NewPass456"}' | jq .
```
Expected: `400` with `"Invalid or expired token"`.
