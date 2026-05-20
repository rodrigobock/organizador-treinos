package org.organizadorTreinos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateWorkoutRequest {

    @NotBlank(message = "Workout name is required")
    @Size(max = 255, message = "Workout name must not exceed 255 characters")
    private String name;

    private Boolean isPublic = false;
}
