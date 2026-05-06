package org.organizadorTreinos.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreateWorkoutRequest {

    @NotBlank(message = "Workout name is required")
    private String name;

    private Boolean isPublic = false;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }
}
