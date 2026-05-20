package org.organizadorTreinos.exception;

import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.util.stream.Collectors;

@Provider
public class GlobalExceptionHandler implements ExceptionMapper<Exception> {

    private static final Logger LOG = Logger.getLogger(GlobalExceptionHandler.class);

    @Override
    public Response toResponse(Exception exception) {
        if (exception instanceof RateLimitException rle) {
            ErrorResponse error = new ErrorResponse(rle.getMessage(), "auth.rate_limit_exceeded", 429);
            return Response.status(429)
                    .header("Retry-After", String.valueOf(rle.getRetryAfterSeconds()))
                    .entity(error)
                    .build();
        }

        if (exception instanceof ConstraintViolationException cve) {
            String msg = cve.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .collect(Collectors.joining(", "));
            ErrorResponse error = new ErrorResponse(msg, "validation.constraint_violation", 400);
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }

        if (exception instanceof BadRequestException) {
            String errorCode = resolveBadRequestErrorCode(exception.getMessage());
            ErrorResponse error = new ErrorResponse(exception.getMessage(), errorCode, 400);
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }

        if (exception instanceof NotAuthorizedException) {
            String errorCode = resolveUnauthorizedErrorCode(exception.getMessage());
            ErrorResponse error = new ErrorResponse(exception.getMessage(), errorCode, 401);
            return Response.status(Response.Status.UNAUTHORIZED).entity(error).build();
        }

        if (exception instanceof NotFoundException) {
            String errorCode = resolveNotFoundErrorCode(exception.getMessage());
            ErrorResponse error = new ErrorResponse(exception.getMessage(), errorCode, 404);
            return Response.status(Response.Status.NOT_FOUND).entity(error).build();
        }

        if (exception instanceof ForbiddenException) {
            String errorCode = resolveForbiddenErrorCode(exception.getMessage());
            ErrorResponse error = new ErrorResponse(exception.getMessage(), errorCode, 403);
            return Response.status(Response.Status.FORBIDDEN).entity(error).build();
        }

        if (exception instanceof WebApplicationException wae) {
            ErrorResponse error = new ErrorResponse(exception.getMessage(), "error.unknown", wae.getResponse().getStatus());
            return Response.status(wae.getResponse().getStatus()).entity(error).build();
        }

        LOG.errorf("Unhandled exception occurred: %s", exception.getMessage());
        LOG.debug("Stack trace:", exception);
        ErrorResponse error = new ErrorResponse("Internal server error", "error.internal", 500);
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
    }

    private String resolveBadRequestErrorCode(String message) {
        if (message == null) return "error.bad_request";

        if (message.contains("Email already registered")) return "auth.email_already_registered";
        if (message.contains("Invalid email or password")) return "auth.invalid_credentials";
        if (message.contains("Invalid or expired token")) return "auth.invalid_or_expired_token";
        if (message.contains("Invalid current password")) return "user.invalid_current_password";
        if (message.contains("Invalid password")) return "user.invalid_password";
        if (message.contains("Cannot share with yourself")) return "share.cannot_share_with_self";
        if (message.contains("already shared")) return "share.already_shared";
        if (message.contains("workoutIds must match")) return "workout.reorder_mismatch";
        if (message.contains("conflictId required")) return "import.conflict_id_required";
        if (message.contains("ativa") || message.contains("active session")) return "session.already_active";
        if (message.contains("finalizada") || message.contains("already ended")) return "session.already_ended";

        return "error.bad_request";
    }

    private String resolveUnauthorizedErrorCode(String message) {
        if (message == null) return "auth.unauthorized";

        if (message.contains("Token is required")) return "auth.token_required";
        if (message.contains("Invalid token signature")) return "auth.invalid_token_signature";
        if (message.contains("Malformed token")) return "auth.malformed_token";
        if (message.contains("Invalid token issuer")) return "auth.invalid_token_issuer";
        if (message.contains("Token missing expiration")) return "auth.token_missing_expiration";
        if (message.contains("Token expired too long ago")) return "auth.token_expired_too_long";
        if (message.contains("Token missing subject")) return "auth.token_missing_subject";
        if (message.contains("Invalid subject")) return "auth.invalid_token_subject";
        if (message.contains("User no longer exists")) return "auth.user_no_longer_exists";

        return "auth.unauthorized";
    }

    private String resolveNotFoundErrorCode(String message) {
        if (message == null) return "error.not_found";

        if (message.contains("User not found")) return "user.not_found";
        if (message.contains("Workout not found") || message.contains("Treino")) return "workout.not_found";
        if (message.contains("Exercise not found")) return "exercise.not_found";
        if (message.contains("active session") || message.contains("ativa")) return "session.not_found";
        if (message.contains("encontrada") || message.contains("pertence")) return "session.not_found";

        return "error.not_found";
    }

    private String resolveForbiddenErrorCode(String message) {
        if (message == null) return "error.forbidden";

        if (message.contains("workout") || message.contains("Workout")) return "workout.forbidden";
        if (message.contains("exercise") || message.contains("Exercise")) return "exercise.forbidden";
        if (message.contains("share") || message.contains("Share")) return "share.forbidden";

        return "error.forbidden";
    }
}
