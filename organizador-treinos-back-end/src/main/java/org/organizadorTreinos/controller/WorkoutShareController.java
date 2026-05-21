package org.organizadorTreinos.controller;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.organizadorTreinos.dto.request.BulkShareRequest;
import org.organizadorTreinos.dto.response.BulkShareResult;
import org.organizadorTreinos.dto.response.SharedByMeResponse;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.service.WorkoutShareService;

import java.util.List;
import java.util.UUID;

@Path("/workouts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class WorkoutShareController {

    @Inject
    WorkoutShareService workoutShareService;

    @Inject
    UserRepository userRepository;

    @Inject
    JsonWebToken jwt;

    private User getCurrentUser() {
        String userId = jwt.getSubject();
        return userRepository.find("id", UUID.fromString(userId))
                .firstResultOptional().orElseThrow(() -> new NotFoundException("User not found"));
    }

    /**
     * POST /workouts/{id}/share
     * Bulk-share a workout with one or more users by email.
     * Body: { "emails": ["a@b.com", "c@d.com"], "permission": "READ" }
     */
    @POST
    @Path("/{workoutId}/share")
    @RolesAllowed("users")
    public Response shareWorkout(@PathParam("workoutId") UUID workoutId,
                                 @Valid BulkShareRequest request) {
        User user = getCurrentUser();
        if (user.getRole() != org.organizadorTreinos.entity.UserRole.PERSONAL_TRAINER) {
            throw new jakarta.ws.rs.ForbiddenException("Only personal trainers can manage workout shares");
        }
        BulkShareResult result = workoutShareService.shareWithMultiple(
                workoutId, request.getEmails(), request.getPermission(), user);
        return Response.status(Response.Status.CREATED).entity(result).build();
    }

    /**
     * DELETE /workouts/{workoutId}/share/{userId}
     * Revoke a specific user's access to a workout.
     */
    @DELETE
    @Path("/{workoutId}/share/{userId}")
    @RolesAllowed("users")
    public Response revokeShare(@PathParam("workoutId") UUID workoutId,
                                @PathParam("userId") UUID userId) {
        User user = getCurrentUser();
        if (user.getRole() != org.organizadorTreinos.entity.UserRole.PERSONAL_TRAINER) {
            throw new jakarta.ws.rs.ForbiddenException("Only personal trainers can manage workout shares");
        }
        workoutShareService.revokeAccess(workoutId, userId, user);
        return Response.noContent().build();
    }

    /**
     * GET /workouts/shared-by-me
     * List all workouts shared by the current user with sharing details per person.
     */
    @GET
    @Path("/shared-by-me")
    @RolesAllowed("users")
    public Response getSharedByMe() {
        User user = getCurrentUser();
        if (user.getRole() != org.organizadorTreinos.entity.UserRole.PERSONAL_TRAINER) {
            throw new jakarta.ws.rs.ForbiddenException("Only personal trainers can manage workout shares");
        }
        List<SharedByMeResponse> result = workoutShareService.getSharedByMe(user);
        return Response.ok(result).build();
    }
}
