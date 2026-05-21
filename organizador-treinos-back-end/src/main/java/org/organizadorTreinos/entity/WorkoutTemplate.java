package org.organizadorTreinos.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "workout_templates", indexes = {
    @Index(name = "idx_workout_templates_category", columnList = "category"),
    @Index(name = "idx_workout_templates_gender", columnList = "gender")
})
public class WorkoutTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Template name is required")
    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TemplateCategory category = TemplateCategory.INTERMEDIATE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender = Gender.UNISEX;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true,
               fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    private List<TemplateExercise> exercises = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
