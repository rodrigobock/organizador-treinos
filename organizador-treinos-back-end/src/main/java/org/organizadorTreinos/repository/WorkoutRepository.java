package org.organizadorTreinos.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.organizadorTreinos.entity.Workout;
import org.organizadorTreinos.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class WorkoutRepository implements PanacheRepository<Workout> {

    public List<Workout> findByUser(User user) {
        return find("user", user).list();
    }

    public Optional<Workout> findByIdAndUser(UUID id, User user) {
        return find("id = ?1 and user = ?2", id, user).firstResultOptional();
    }

    public List<Workout> findPublicWorkouts() {
        return find("isPublic", true).list();
    }

    public Optional<Workout> findByIdWithUser(UUID id) {
        return find("id", id).firstResultOptional();
    }

    public void deleteByIdAndUser(UUID id, User user) {
        delete("id = ?1 and user = ?2", id, user);
    }
}
