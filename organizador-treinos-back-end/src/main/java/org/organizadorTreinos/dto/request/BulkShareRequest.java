package org.organizadorTreinos.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.organizadorTreinos.entity.WorkoutShare;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class BulkShareRequest {

    @NotEmpty(message = "At least one email is required")
    private List<String> emails;

    @NotNull(message = "Permission is required")
    private WorkoutShare.Permission permission;
}
