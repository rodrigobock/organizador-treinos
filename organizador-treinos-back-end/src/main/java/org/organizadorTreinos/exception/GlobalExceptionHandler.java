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
        if (exception instanceof ConstraintViolationException cve) {
            String msg = cve.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .collect(Collectors.joining(", "));
            ErrorResponse error = new ErrorResponse(msg, 400);
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }

        if (exception instanceof BadRequestException) {
            ErrorResponse error = new ErrorResponse(exception.getMessage(), 400);
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }

        if (exception instanceof NotAuthorizedException) {
            ErrorResponse error = new ErrorResponse(exception.getMessage(), 401);
            return Response.status(Response.Status.UNAUTHORIZED).entity(error).build();
        }

        if (exception instanceof NotFoundException) {
            ErrorResponse error = new ErrorResponse(exception.getMessage(), 404);
            return Response.status(Response.Status.NOT_FOUND).entity(error).build();
        }

        if (exception instanceof ForbiddenException) {
            ErrorResponse error = new ErrorResponse(exception.getMessage(), 403);
            return Response.status(Response.Status.FORBIDDEN).entity(error).build();
        }

        if (exception instanceof WebApplicationException wae) {
            ErrorResponse error = new ErrorResponse(exception.getMessage(), wae.getResponse().getStatus());
            return Response.status(wae.getResponse().getStatus()).entity(error).build();
        }

        LOG.error("Unhandled exception", exception);
        ErrorResponse error = new ErrorResponse("Internal server error", 500);
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
    }
}
