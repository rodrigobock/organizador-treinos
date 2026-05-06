package org.organizadorTreinos.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class ImportAnalyzeRequest {

    @NotNull
    @Valid
    private List<ImportWorkoutItem> workouts;
}
