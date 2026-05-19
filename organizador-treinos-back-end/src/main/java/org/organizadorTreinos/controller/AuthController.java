package org.organizadorTreinos.controller;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.NewCookie;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.organizadorTreinos.dto.request.ForgotPasswordRequest;
import org.organizadorTreinos.dto.request.LoginRequest;
import org.organizadorTreinos.dto.request.ResetPasswordRequest;
import org.organizadorTreinos.dto.request.SignupRequest;
import org.organizadorTreinos.dto.response.AuthResponse;
import org.organizadorTreinos.dto.response.UserResponse;
import org.organizadorTreinos.service.AuthService;
import org.organizadorTreinos.service.RateLimitService;

import io.vertx.core.http.HttpServerRequest;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthController {

    private static final int ACCESS_TOKEN_MAX_AGE = 1800;
    private static final int REFRESH_TOKEN_MAX_AGE = 7 * 24 * 3600;

    @Inject
    AuthService authService;

    @Inject
    RateLimitService rateLimitService;

    @Context
    HttpServerRequest httpRequest;

    @ConfigProperty(name = "app.cookie.secure", defaultValue = "true")
    boolean cookieSecure;

    @ConfigProperty(name = "app.cookie.samesite", defaultValue = "NONE")
    String cookieSameSite;

    @POST
    @Path("/signup")
    public Response signup(@Valid SignupRequest request,
                           @HeaderParam("Accept-Language") String acceptLanguage) {
        rateLimitService.checkSignup(resolveClientIp());
        String locale = resolveLocale(acceptLanguage, request.getPreferredLocale());
        AuthResponse authResponse = authService.signup(request, locale);
        return buildAuthResponse(Response.status(Response.Status.CREATED), authResponse);
    }

    @POST
    @Path("/login")
    public Response login(@Valid LoginRequest request) {
        rateLimitService.checkLogin(request.getEmail());
        AuthResponse authResponse = authService.login(request);
        return buildAuthResponse(Response.ok(), authResponse);
    }

    @POST
    @Path("/refresh")
    public Response refresh(@CookieParam("refresh_token") String refreshTokenCookie) {
        if (refreshTokenCookie == null || refreshTokenCookie.isBlank()) {
            throw new NotAuthorizedException("Missing refresh token");
        }
        AuthResponse authResponse = authService.refresh(refreshTokenCookie);
        return buildAuthResponse(Response.ok(), authResponse);
    }

    @POST
    @Path("/logout")
    public Response logout() {
        NewCookie.SameSite sameSite = NewCookie.SameSite.valueOf(cookieSameSite);
        NewCookie clearAccess = new NewCookie.Builder("access_token")
                .value("").httpOnly(true).secure(cookieSecure).sameSite(sameSite).path("/").maxAge(0).build();
        NewCookie clearRefresh = new NewCookie.Builder("refresh_token")
                .value("").httpOnly(true).secure(cookieSecure).sameSite(sameSite).path("/auth/refresh").maxAge(0).build();
        return Response.ok().cookie(clearAccess, clearRefresh).build();
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

    private Response buildAuthResponse(Response.ResponseBuilder builder, AuthResponse authResponse) {
        NewCookie.SameSite sameSite = NewCookie.SameSite.valueOf(cookieSameSite);
        NewCookie accessCookie = new NewCookie.Builder("access_token")
                .value(authResponse.getToken())
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(ACCESS_TOKEN_MAX_AGE)
                .build();

        NewCookie refreshCookie = new NewCookie.Builder("refresh_token")
                .value(authResponse.getRefreshToken())
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(sameSite)
                .path("/auth/refresh")
                .maxAge(REFRESH_TOKEN_MAX_AGE)
                .build();

        UserResponse userResponse = authResponse.getUser();
        return builder.cookie(accessCookie, refreshCookie).entity(userResponse).build();
    }

    private String resolveLocale(String acceptLanguage, String preferredLocale) {
        if (preferredLocale != null && !preferredLocale.isBlank()) {
            return preferredLocale.trim().startsWith("en") ? "en" : "pt-BR";
        }
        if (acceptLanguage != null && !acceptLanguage.isBlank()) {
            return acceptLanguage.trim().startsWith("en") ? "en" : "pt-BR";
        }
        return "pt-BR";
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
