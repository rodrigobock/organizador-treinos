package org.organizadorTreinos.controller;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.organizadorTreinos.dto.request.LinkStudentRequest;
import org.organizadorTreinos.dto.response.StudentResponse;
import org.organizadorTreinos.service.TrainerService;

import java.util.List;
import java.util.UUID;

@Path("/trainer")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TrainerController {

    @Inject
    TrainerService trainerService;

    @Inject
    JsonWebToken jwt;

    private UUID getCurrentUserId() {
        return UUID.fromString(jwt.getSubject());
    }

    @POST
    @Path("/students")
    @RolesAllowed("users")
    public Response linkStudent(@Valid LinkStudentRequest request) {
        StudentResponse student = trainerService.linkStudent(getCurrentUserId(), request.getEmail());
        return Response.status(Response.Status.CREATED).entity(student).build();
    }

    @GET
    @Path("/students")
    @RolesAllowed("users")
    public Response getStudents() {
        List<StudentResponse> students = trainerService.getStudents(getCurrentUserId());
        return Response.ok(students).build();
    }

    @DELETE
    @Path("/students/{studentId}")
    @RolesAllowed("users")
    public Response unlinkStudent(@PathParam("studentId") UUID studentId) {
        trainerService.unlinkStudent(getCurrentUserId(), studentId);
        return Response.noContent().build();
    }
}
