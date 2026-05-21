package org.organizadorTreinos.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.organizadorTreinos.entity.Gender;
import org.organizadorTreinos.entity.TemplateCategory;
import org.organizadorTreinos.entity.WorkoutTemplate;
import java.util.List;

@ApplicationScoped
public class WorkoutTemplateRepository implements PanacheRepository<WorkoutTemplate> {

    public List<WorkoutTemplate> findByCategory(TemplateCategory category) {
        return find("category", category).list();
    }

    public List<WorkoutTemplate> findByCategoryAndGender(TemplateCategory category, Gender gender) {
        return find("category = ?1 AND (gender = ?2 OR gender = 'UNISEX')", category, gender).list();
    }

    public List<WorkoutTemplate> findAllForGender(Gender gender) {
        return find("gender = ?1 OR gender = 'UNISEX' order by category asc, name asc", gender).list();
    }

    public List<WorkoutTemplate> findAllOrdered() {
        return find("order by category asc, name asc").list();
    }
}
