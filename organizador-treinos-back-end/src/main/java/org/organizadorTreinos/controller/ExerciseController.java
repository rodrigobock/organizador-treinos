package org.organizadorTreinos.controller;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.organizadorTreinos.dto.request.CreateExerciseRequest;
import org.organizadorTreinos.dto.response.ExerciseResponse;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.service.ExerciseService;

import java.util.UUID;

@Path("/workouts/{workoutId}/exercises")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ExerciseController {

    @Inject
    ExerciseService exerciseService;

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
    public Response createExercise(@PathParam("workoutId") UUID workoutId,
                                  @Valid CreateExerciseRequest request) {
        User user = getCurrentUser();
        ExerciseResponse response = exerciseService.createExercise(workoutId, user, request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @PUT
    @Path("/{exerciseId}")
    @RolesAllowed("users")
    public Response updateExercise(@PathParam("workoutId") UUID workoutId,
                                  @PathParam("exerciseId") UUID exerciseId,
                                  @Valid CreateExerciseRequest request) {
        User user = getCurrentUser();
        ExerciseResponse response = exerciseService.updateExercise(workoutId, exerciseId, user, request);
        return Response.ok(response).build();
    }

    @PATCH
    @Path("/{exerciseId}/toggle")
    @RolesAllowed("users")
    public Response toggleExerciseCompletion(@PathParam("workoutId") UUID workoutId,
                                            @PathParam("exerciseId") UUID exerciseId) {
        User user = getCurrentUser();
        ExerciseResponse response = exerciseService.toggleExerciseCompletion(workoutId, exerciseId, user);
        return Response.ok(response).build();
    }

    @DELETE
    @Path("/{exerciseId}")
    @RolesAllowed("users")
    public Response deleteExercise(@PathParam("workoutId") UUID workoutId,
                                  @PathParam("exerciseId") UUID exerciseId) {
        User user = getCurrentUser();
        exerciseService.deleteExercise(workoutId, exerciseId, user);
        return Response.noContent().build();
    }
}
