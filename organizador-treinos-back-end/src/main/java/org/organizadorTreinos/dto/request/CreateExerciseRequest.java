package org.organizadorTreinos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateExerciseRequest {

    @NotBlank(message = "Exercise name is required")
    @Size(max = 255, message = "Exercise name must not exceed 255 characters")
    private String name;
}
