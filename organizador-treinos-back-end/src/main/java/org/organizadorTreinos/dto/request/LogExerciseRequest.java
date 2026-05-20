package org.organizadorTreinos.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LogExerciseRequest {

    @Min(value = 0, message = "Weight must be zero or greater")
    private Double weight;

    @Min(value = 1, message = "Reps must be at least 1")
    private Integer reps;

    @Min(value = 1, message = "Sets must be at least 1")
    private Integer sets;
}
