package org.organizadorTreinos.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "workout_share",
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
    @Column(nullable = false)
    private Permission permission;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum Permission {
        READ,   // View only
        EDIT    // Can modify
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Workout getWorkout() {
        return workout;
    }

    public void setWorkout(Workout workout) {
        this.workout = workout;
    }

    public User getSharedWithUser() {
        return sharedWithUser;
    }

    public void setSharedWithUser(User sharedWithUser) {
        this.sharedWithUser = sharedWithUser;
    }

    public Permission getPermission() {
        return permission;
    }

    public void setPermission(Permission permission) {
        this.permission = permission;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
