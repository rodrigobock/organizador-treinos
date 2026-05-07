package org.organizadorTreinos.controller;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.organizadorTreinos.dto.request.ForgotPasswordRequest;
import org.organizadorTreinos.dto.request.LoginRequest;
import org.organizadorTreinos.dto.request.ResetPasswordRequest;
import org.organizadorTreinos.dto.request.SignupRequest;
import org.organizadorTreinos.dto.response.AuthResponse;
import org.organizadorTreinos.service.AuthService;
import org.organizadorTreinos.service.RateLimitService;

import io.vertx.core.http.HttpServerRequest;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthController {

    @Inject
    AuthService authService;

    @Inject
    RateLimitService rateLimitService;

    @Context
    HttpServerRequest httpRequest;

    @POST
    @Path("/signup")
    public Response signup(@Valid SignupRequest request) {
        rateLimitService.checkSignup(resolveClientIp());
        AuthResponse response = authService.signup(request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @POST
    @Path("/login")
    public Response login(@Valid LoginRequest request) {
        rateLimitService.checkLogin(request.getEmail());
        AuthResponse response = authService.login(request);
        return Response.ok(response).build();
    }

    @POST
    @Path("/forgot-password")
    public Response forgotPassword(@Valid ForgotPasswordRequest request) {
        rateLimitService.checkForgotPassword(request.getEmail());
        authService.forgotPassword(request);
        return Response.ok().build();
    }

    @POST
    @Path("/reset-password")
    public Response resetPassword(@Valid ResetPasswordRequest request) {
        authService.resetPassword(request);
        return Response.ok().build();
    }

    private String resolveClientIp() {
        if (httpRequest == null) {
            return "unknown";
        }
        String forwarded = httpRequest.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            int comma = forwarded.indexOf(',');
            return (comma > 0 ? forwarded.substring(0, comma) : forwarded).trim();
        }
        String realIp = httpRequest.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return httpRequest.remoteAddress() != null ? httpRequest.remoteAddress().host() : "unknown";
    }
}
