package org.organizadorTreinos.dto.request;

import jakarta.validation.constraints.Min;
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

    @Min(value = 1, message = "Sets must be at least 1")
    private Integer sets;

    @Min(value = 1, message = "Reps min must be at least 1")
    private Integer repsMin;

    @Min(value = 1, message = "Reps max must be at least 1")
    private Integer repsMax;

    @Min(value = 0, message = "Weight must be zero or greater")
    private Double weight;
}
