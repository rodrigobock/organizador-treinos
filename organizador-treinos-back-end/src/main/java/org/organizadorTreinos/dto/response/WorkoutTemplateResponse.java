package org.organizadorTreinos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutTemplateResponse {
    private Long id;
    private String name;
    private String description;
    private String category;
    private String gender;
    private String muscleGroup;
    private String equipmentRequired;
    private Integer estimatedDuration;
    private Integer weeklyFrequency;
    private List<TemplateExerciseResponse> exercises;
    private LocalDateTime createdAt;
}
