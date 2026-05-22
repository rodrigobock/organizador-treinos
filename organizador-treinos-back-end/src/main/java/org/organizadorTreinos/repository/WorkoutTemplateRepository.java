package org.organizadorTreinos.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.organizadorTreinos.entity.EquipmentRequired;
import org.organizadorTreinos.entity.Gender;
import org.organizadorTreinos.entity.MuscleGroup;
import org.organizadorTreinos.entity.TemplateCategory;
import org.organizadorTreinos.entity.WorkoutTemplate;

import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class WorkoutTemplateRepository implements PanacheRepository<WorkoutTemplate> {

    public List<WorkoutTemplate> findAllOrdered() {
        return find("order by category asc, name asc").list();
    }

    public List<WorkoutTemplate> findByCategory(TemplateCategory category) {
        return find("category", category).list();
    }

    public List<WorkoutTemplate> findByCategoryAndGender(TemplateCategory category, Gender gender) {
        return find("category = ?1 AND (gender = ?2 OR gender = 'UNISEX')", category, gender).list();
    }

    public List<WorkoutTemplate> findAllForGender(Gender gender) {
        return find("gender = ?1 OR gender = 'UNISEX' order by category asc, name asc", gender).list();
    }

    public List<WorkoutTemplate> findWithFilters(
            TemplateCategory category, Gender gender,
            MuscleGroup muscleGroup, EquipmentRequired equipment) {

        List<String> conditions = new ArrayList<>();
        List<Object> params = new ArrayList<>();
        int i = 1;

        if (category != null) {
            conditions.add("category = ?" + i++);
            params.add(category);
        }
        if (gender != null) {
            conditions.add("(gender = ?" + i++ + " OR gender = 'UNISEX')");
            params.add(gender);
        }
        if (muscleGroup != null) {
            conditions.add("muscleGroup = ?" + i++);
            params.add(muscleGroup);
        }
        if (equipment != null) {
            conditions.add("equipmentRequired = ?" + i++);
            params.add(equipment);
        }

        String where = conditions.isEmpty() ? "1=1" : String.join(" AND ", conditions);
        return find(where + " order by category asc, name asc", params.toArray()).list();
    }
}
