package org.organizadorTreinos.controller;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.WorkoutShare;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.service.WorkoutShareService;

import java.util.UUID;

@Path("/workouts/{workoutId}/share")
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

    @POST
    @RolesAllowed("users")
    public Response shareWorkout(@PathParam("workoutId") UUID workoutId,
                                ShareRequest request) {
        User user = getCurrentUser();
        workoutShareService.shareWorkout(workoutId, request.getEmail(),
            request.getPermission(), user);
        return Response.status(Response.Status.CREATED).build();
    }

    @DELETE
    @Path("/{userId}")
    @RolesAllowed("users")
    public Response revokeShare(@PathParam("workoutId") UUID workoutId,
                               @PathParam("userId") UUID userId) {
        User user = getCurrentUser();
        workoutShareService.revokeShare(workoutId, userId, user);
        return Response.noContent().build();
    }

    public static class ShareRequest {
        @NotBlank(message = "Email is required")
        private String email;

        @NotNull(message = "Permission is required")
        private WorkoutShare.Permission permission;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public WorkoutShare.Permission getPermission() {
            return permission;
        }

        public void setPermission(WorkoutShare.Permission permission) {
            this.permission = permission;
        }
    }
}
