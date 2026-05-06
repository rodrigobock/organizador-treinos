package org.organizadorTreinos.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreateExerciseRequest {

    @NotBlank(message = "Exercise name is required")
    private String name;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
