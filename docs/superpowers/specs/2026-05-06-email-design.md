# Email Integration Design — Resend SDK

**Date:** 2026-05-06  
**Status:** Approved  
**Scope:** Backend only (Quarkus)

---

## Overview

Integrate the Resend Java SDK into the backend to send:
1. **Welcome email** on user signup (informational, does not block account creation)
2. **Password reset email** for forgot-password flow (token-based, single-use, 1-hour expiry)

---

## Architecture

### New Files

| File | Responsibility |
|---|---|
| `service/EmailService.java` | Wraps Resend SDK; exposes `sendWelcome(User)` and `sendPasswordReset(String email, String token)` |
| `entity/PasswordResetToken.java` | JPA entity for reset tokens |
| `repository/PasswordResetTokenRepository.java` | Panache repository for token lookup and persistence |
| `dto/request/ForgotPasswordRequest.java` | Request body: `{ email }` |
| `dto/request/ResetPasswordRequest.java` | Request body: `{ token, newPassword }` |
| `db/changelog/V2__add_password_reset_tokens.sql` | Liquibase migration adding the `password_reset_tokens` table |

### Modified Files

| File | Change |
|---|---|
| `AuthService.java` | Call `emailService.sendWelcome()` after signup; add `forgotPassword()` and `resetPassword()` methods |
| `AuthController.java` | Add `POST /auth/forgot-password` and `POST /auth/reset-password` endpoints |
| `pom.xml` | Add `com.resend:resend-java` dependency |
| `application.properties` | Add `resend.api-key`, `resend.from-email`, `app.frontend-url` config properties |

---

## Database

### New Table: `password_reset_tokens`

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

- Token: UUID generated via `SecureRandom` (not sequential, not guessable)
- Expiry: 1 hour from creation
- Single-use: `used` flag set to `true` after successful reset

---

## API Endpoints

### `POST /auth/forgot-password`

**Request body:**
```json
{ "email": "user@example.com" }
```

**Behavior:**
- Always returns `200 OK` regardless of whether email exists (prevents user enumeration)
- If user exists: invalidates all existing unused tokens for that user, generates new token, persists in DB, sends reset email
- If user does not exist: silently returns 200, no email sent

**Response:** `200 OK` (empty body)

---

### `POST /auth/reset-password`

**Request body:**
```json
{ "token": "uuid-here", "newPassword": "newpass123" }
```

**Validation:**
- Token exists in DB
- `used = false`
- `expires_at > NOW()`

**On success:**
- Updates `user.password_hash` with BCrypt hash of new password
- Sets `used = true` on the token
- Returns `200 OK`

**On failure:**
- Returns `400 Bad Request` with generic message (`"Invalid or expired token"`)
- Does not reveal which check failed

---

## Email Templates

### Welcome Email
- **Subject:** `Bem-vindo ao Organizador de Treinos!`
- **Content:** HTML greeting with user's name, confirmation that account was created

### Password Reset Email
- **Subject:** `Redefinição de senha`
- **Content:** HTML with reset link: `{FRONTEND_URL}/reset-password?token={token}`
- Link expiry stated in email: 1 hour

---

## Configuration

Via environment variables (never hardcoded):

```properties
resend.api-key=${RESEND_API_KEY}
resend.from-email=${FROM_EMAIL:Organizador de Treinos <noreply@seudominio.com>}
app.frontend-url=${FRONTEND_URL:http://localhost:3000}
```

- `RESEND_API_KEY`: Resend API token — **sem default, obrigatório**. Nunca commitar no git.
- `FROM_EMAIL`: Sender address (must be a verified domain in Resend)
- `FRONTEND_URL`: Used to build the password reset link in the email

---

## Error Handling

- Welcome email failure: caught, logged as `WARN`, does not propagate — signup succeeds regardless
- Password reset email failure: propagated as `500 Internal Server Error` (user should retry)
- `EmailService` wraps `ResendException` and re-throws as `jakarta.ws.rs.InternalServerErrorException`

---

## Security

- Reset token uses `UUID.randomUUID()` (backed by `SecureRandom`) — not guessable
- On new forgot-password request: previous unused tokens for the same user are invalidated (set `used = true`) before creating a new one
- `POST /auth/forgot-password` always returns 200 — prevents email enumeration
- `POST /auth/reset-password` returns same generic error for expired/used/nonexistent token
- API key stored only in env vars, never in code or git

---

## Out of Scope

- Email verification (account active immediately on signup)
- Rate limiting on forgot-password endpoint (future Phase 5)
- Token cleanup job for expired tokens (future Phase 5)
- Frontend pages (`ForgotPassword/`, `ResetPassword/`) — backend only
