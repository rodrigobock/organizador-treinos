package org.organizadorTreinos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.organizadorTreinos.dto.request.ImportWorkoutItem;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportAnalyzeResultItem {

    private ImportWorkoutItem workout;
    private String status; // "clean" | "duplicate"
    private UUID conflictId;
    private Double similarity;
}
