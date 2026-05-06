package org.organizadorTreinos.controller;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.organizadorTreinos.dto.response.UserResponse;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.service.UserService;

import java.util.UUID;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserController {

    @Inject
    UserService userService;

    @Inject
    UserRepository userRepository;

    @Inject
    JsonWebToken jwt;

    @GET
    @Path("/me")
    @RolesAllowed("users")
    public Response getCurrentUser() {
        String userId = jwt.getSubject();
        UserResponse response = userService.getUserById(UUID.fromString(userId));
        return Response.ok(response).build();
    }

    @PUT
    @Path("/me")
    @RolesAllowed("users")
    public Response updateCurrentUser(UserUpdateRequest request) {
        String userId = jwt.getSubject();
        UserResponse response = userService.updateUser(UUID.fromString(userId), request.getName());
        return Response.ok(response).build();
    }

    public static class UserUpdateRequest {
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
