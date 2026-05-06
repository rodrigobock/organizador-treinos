package org.organizadorTreinos.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
public class ImportConfirmItem {

    @NotNull
    @Valid
    private ImportWorkoutItem workout;

    @NotNull
    @Pattern(regexp = "create|replace|skip", message = "action must be create, replace, or skip")
    private String action;

    private UUID conflictId;
}
