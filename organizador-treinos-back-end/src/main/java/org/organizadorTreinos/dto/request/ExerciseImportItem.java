package org.organizadorTreinos.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ExerciseImportItem {

    @NotBlank(message = "Exercise name is required")
    private String name;

    private Boolean completed = false;
}
