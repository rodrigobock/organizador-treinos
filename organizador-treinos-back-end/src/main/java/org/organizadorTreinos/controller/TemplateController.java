package org.organizadorTreinos.controller;

import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.organizadorTreinos.dto.response.WorkoutResponse;
import org.organizadorTreinos.dto.response.WorkoutTemplateResponse;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.service.TemplateService;

import java.util.List;
import java.util.UUID;

@Path("/templates")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TemplateController {

    @Inject
    TemplateService templateService;

    @Inject
    UserRepository userRepository;

    @Inject
    JsonWebToken jwt;

    @GET
    @PermitAll
    public Response listTemplates(@QueryParam("category") String category,
                                   @QueryParam("gender") String gender) {
        List<WorkoutTemplateResponse> templates;
        if (category != null && !category.isBlank()) {
            templates = templateService.listByCategory(category);
        } else if (gender != null && !gender.isBlank()) {
            templates = templateService.listByGender(gender);
        } else {
            templates = templateService.listAll();
        }
        return Response.ok(templates).build();
    }

    @POST
    @Path("/{id}/import")
    @RolesAllowed("users")
    public Response importTemplate(@PathParam("id") Long id) {
        String userId = jwt.getSubject();
        User user = userRepository.find("id", UUID.fromString(userId))
            .firstResultOptional()
            .orElseThrow(() -> new NotFoundException("User not found"));

        WorkoutResponse workout = templateService.importTemplate(id, user.getId());
        return Response.status(Response.Status.CREATED).entity(workout).build();
    }
}
