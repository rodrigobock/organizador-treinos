package org.organizadorTreinos.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.organizadorTreinos.entity.WorkoutTemplate;

import java.util.List;

@ApplicationScoped
public class WorkoutTemplateRepository implements PanacheRepository<WorkoutTemplate> {

    public List<WorkoutTemplate> findByGoal(String goal) {
        return find("goal", goal).list();
    }

    public List<WorkoutTemplate> findAllOrderedByGoal() {
        return find("order by goal asc, name asc").list();
    }
}
