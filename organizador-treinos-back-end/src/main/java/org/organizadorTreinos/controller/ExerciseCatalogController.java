package org.organizadorTreinos.controller;

import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.organizadorTreinos.repository.ExerciseCatalogRepository;

import java.util.List;

@Path("/exercises")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ExerciseCatalogController {

    @Inject
    ExerciseCatalogRepository catalogRepository;

    @GET
    @Path("/suggestions")
    @PermitAll
    public Response getSuggestions(@QueryParam("q") String query) {
        List<String> suggestions = catalogRepository.searchByName(query);
        return Response.ok(suggestions).build();
    }
}
