package org.organizadorTreinos.controller;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.organizadorTreinos.dto.request.CreateWorkoutRequest;
import org.organizadorTreinos.dto.request.ImportAnalyzeRequest;
import org.organizadorTreinos.dto.request.ImportConfirmItem;
import org.organizadorTreinos.dto.response.ImportAnalyzeResultItem;
import org.organizadorTreinos.dto.response.ImportResultResponse;
import org.organizadorTreinos.dto.response.WorkoutResponse;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.service.WorkoutService;

import java.util.List;
import java.util.UUID;

@Path("/workouts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class WorkoutController {

    @Inject
    WorkoutService workoutService;

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
    public Response createWorkout(@Valid CreateWorkoutRequest request) {
        User user = getCurrentUser();
        WorkoutResponse response = workoutService.createWorkout(user, request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @GET
    @RolesAllowed("users")
    public Response getUserWorkouts() {
        User user = getCurrentUser();
        List<WorkoutResponse> workouts = workoutService.getUserWorkouts(user);
        return Response.ok(workouts).build();
    }

    @GET
    @Path("/shared")
    @RolesAllowed("users")
    public Response getSharedWorkouts() {
        User user = getCurrentUser();
        List<WorkoutResponse> workouts = workoutService.getSharedWorkouts(user);
        return Response.ok(workouts).build();
    }

    @GET
    @Path("/public")
    public Response getPublicWorkouts() {
        List<WorkoutResponse> workouts = workoutService.getPublicWorkouts();
        return Response.ok(workouts).build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed("users")
    public Response getWorkout(@PathParam("id") UUID id) {
        User user = getCurrentUser();
        WorkoutResponse response = workoutService.getWorkout(id, user);
        return Response.ok(response).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("users")
    public Response updateWorkout(@PathParam("id") UUID id, @Valid CreateWorkoutRequest request) {
        User user = getCurrentUser();
        WorkoutResponse response = workoutService.updateWorkout(id, user, request);
        return Response.ok(response).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("users")
    public Response deleteWorkout(@PathParam("id") UUID id) {
        User user = getCurrentUser();
        workoutService.deleteWorkout(id, user);
        return Response.noContent().build();
    }

    @POST
    @Path("/import/analyze")
    @RolesAllowed("users")
    public Response analyzeImport(@Valid ImportAnalyzeRequest request) {
        User user = getCurrentUser();
        List<ImportAnalyzeResultItem> results = workoutService.analyzeImport(user, request);
        return Response.ok(results).build();
    }

    @POST
    @Path("/import/confirm")
    @RolesAllowed("users")
    public Response confirmImport(@Valid List<ImportConfirmItem> items) {
        User user = getCurrentUser();
        ImportResultResponse result = workoutService.confirmImport(user, items);
        return Response.ok(result).build();
    }
}
