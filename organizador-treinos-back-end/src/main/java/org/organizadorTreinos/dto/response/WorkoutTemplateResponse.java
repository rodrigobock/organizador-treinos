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
    private String goal;
    private List<TemplateExerciseResponse> exercises;
    private LocalDateTime createdAt;
}
