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

    @PUT
    @Path("/me/password")
    @RolesAllowed("users")
    public Response changePassword(ChangePasswordRequest request) {
        String userId = jwt.getSubject();
        userService.changePassword(UUID.fromString(userId), request.getOldPassword(), request.getNewPassword());
        return Response.ok().build();
    }

    @DELETE
    @Path("/me")
    @RolesAllowed("users")
    public Response deleteCurrentUser(DeleteUserRequest request) {
        String userId = jwt.getSubject();
        userService.deleteUser(UUID.fromString(userId), request.getPassword());
        return Response.noContent().build();
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

    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;

        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class DeleteUserRequest {
        private String password;

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
