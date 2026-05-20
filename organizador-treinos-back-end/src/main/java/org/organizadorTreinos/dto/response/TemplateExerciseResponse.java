package org.organizadorTreinos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemplateExerciseResponse {

    private Long id;
    private String name;
    private Integer sets;
    private Integer reps;
    private Integer orderIndex;
}
