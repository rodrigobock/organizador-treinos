package org.organizadorTreinos.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class ImportWorkoutItem {

    @NotBlank(message = "Workout name is required")
    private String name;

    @NotNull
    @Valid
    private List<ExerciseImportItem> exercises;
}
