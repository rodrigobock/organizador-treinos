package org.organizadorTreinos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseResponse {
    private UUID id;
    private String name;
    private Boolean completed;
    private Integer sets;
    private Integer repsMin;
    private Integer repsMax;
    private Double weight;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
