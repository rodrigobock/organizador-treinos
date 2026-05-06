package org.organizadorTreinos.controller;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.organizadorTreinos.dto.response.WorkoutSessionResponse;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.service.WorkoutSessionService;

import java.util.UUID;

@Path("/workouts/{workoutId}/sessions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("users")
public class WorkoutSessionController {

    @Inject
    WorkoutSessionService sessionService;

    @Inject
    UserRepository userRepository;

    @Inject
    JsonWebToken jwt;

    private User getCurrentUser() {
        String userId = jwt.getSubject();
        return userRepository.find("id", UUID.fromString(userId))
                .firstResultOptional().orElseThrow(() -> new NotFoundException("User not found"));
    }

    @POST
    @Path("/start")
    public Response startSession(@PathParam("workoutId") UUID workoutId) {
        User user = getCurrentUser();
        WorkoutSessionResponse response = sessionService.startSession(workoutId, user);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @PATCH
    @Path("/{sessionId}/end")
    public Response endSession(@PathParam("workoutId") UUID workoutId,
                               @PathParam("sessionId") UUID sessionId) {
        User user = getCurrentUser();
        WorkoutSessionResponse response = sessionService.endSession(workoutId, sessionId, user);
        return Response.ok(response).build();
    }

    @GET
    @Path("/active")
    public Response getActiveSession(@PathParam("workoutId") UUID workoutId) {
        User user = getCurrentUser();
        return sessionService.getActiveSession(workoutId, user)
                .map(r -> Response.ok(r).build())
                .orElse(Response.noContent().build());
    }
}
