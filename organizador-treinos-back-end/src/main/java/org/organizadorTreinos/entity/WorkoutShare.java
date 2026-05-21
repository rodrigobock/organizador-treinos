package org.organizadorTreinos.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "workout_shares",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"workout_id", "shared_with_user_id"})
    },
    indexes = {
        @Index(name = "idx_workout_share_workout_id", columnList = "workout_id"),
        @Index(name = "idx_workout_share_user_id", columnList = "shared_with_user_id")
    }
)
public class WorkoutShare {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_id", nullable = false)
    private Workout workout;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_with_user_id", nullable = false)
    private User sharedWithUser;

    @NotNull(message = "Permission is required")
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "workout_permission", nullable = false)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private Permission permission;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    @Column(name = "position", nullable = false)
    private Integer position = 0;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum Permission {
        READ,
        EDIT
    }
}
