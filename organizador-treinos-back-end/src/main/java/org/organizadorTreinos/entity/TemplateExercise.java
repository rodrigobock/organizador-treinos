package org.organizadorTreinos.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "template_exercises", indexes = {
    @Index(name = "idx_template_exercises_template_id", columnList = "template_id")
})
public class TemplateExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private WorkoutTemplate template;

    @NotBlank(message = "Exercise name is required")
    @Column(nullable = false)
    private String name;

    @Column
    private Integer sets;

    @Column
    private Integer reps;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;
}
