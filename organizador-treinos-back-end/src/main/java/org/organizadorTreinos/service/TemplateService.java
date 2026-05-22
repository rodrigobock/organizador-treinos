package org.organizadorTreinos.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import org.organizadorTreinos.dto.response.TemplateExerciseResponse;
import org.organizadorTreinos.dto.response.WorkoutResponse;
import org.organizadorTreinos.dto.response.WorkoutTemplateResponse;
import org.organizadorTreinos.entity.EquipmentRequired;
import org.organizadorTreinos.entity.Exercise;
import org.organizadorTreinos.entity.Gender;
import org.organizadorTreinos.entity.MuscleGroup;
import org.organizadorTreinos.entity.TemplateCategory;
import org.organizadorTreinos.entity.TemplateExercise;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.Workout;
import org.organizadorTreinos.entity.WorkoutTemplate;
import org.organizadorTreinos.repository.ExerciseRepository;
import org.organizadorTreinos.repository.UserRepository;
import org.organizadorTreinos.repository.WorkoutRepository;
import org.organizadorTreinos.repository.WorkoutTemplateRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
@Transactional
public class TemplateService {

    @Inject
    WorkoutTemplateRepository templateRepository;

    @Inject
    WorkoutRepository workoutRepository;

    @Inject
    ExerciseRepository exerciseRepository;

    @Inject
    UserRepository userRepository;

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<WorkoutTemplateResponse> listAll() {
        return templateRepository.findAllOrdered().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<WorkoutTemplateResponse> listByCategory(String category) {
        TemplateCategory cat = parseEnum(TemplateCategory.class, category);
        if (cat == null) return listAll();
        return templateRepository.findByCategory(cat).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<WorkoutTemplateResponse> listWithFilters(
            String categoryStr, String genderStr,
            String muscleGroupStr, String equipmentStr) {

        TemplateCategory category = parseEnum(TemplateCategory.class, categoryStr);
        Gender gender = parseEnum(Gender.class, genderStr);
        MuscleGroup muscleGroup = parseEnum(MuscleGroup.class, muscleGroupStr);
        EquipmentRequired equipment = parseEnum(EquipmentRequired.class, equipmentStr);

        return templateRepository.findWithFilters(category, gender, muscleGroup, equipment)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public WorkoutResponse importTemplate(Long templateId, UUID userId) {
        WorkoutTemplate template = templateRepository.findByIdOptional(templateId)
            .orElseThrow(() -> new NotFoundException("Template not found"));

        User user = userRepository.find("id", userId)
            .firstResultOptional()
            .orElseThrow(() -> new NotFoundException("User not found"));

        long count = workoutRepository.countByUser(user);

        Workout workout = new Workout();
        workout.setName(template.getName());
        workout.setUser(user);
        workout.setIsPublic(false);
        workout.setPosition((int) count);
        workoutRepository.persist(workout);

        if (count == 0) {
            user.setCurrentWorkoutId(workout.getId());
            userRepository.persist(user);
        }

        for (TemplateExercise templateExercise : template.getExercises()) {
            Exercise exercise = new Exercise();
            exercise.setName(templateExercise.getName());
            exercise.setSets(templateExercise.getSets());
            exercise.setRepsMin(templateExercise.getReps());
            exercise.setRepsMax(templateExercise.getReps());
            exercise.setWorkout(workout);
            exerciseRepository.persist(exercise);
        }

        return new WorkoutResponse(
            workout.getId(),
            workout.getName(),
            workout.getUser().getId(),
            workout.getUser().getName(),
            workout.getIsPublic(),
            workout.getCreatedAt(),
            workout.getUpdatedAt()
        );
    }

    private WorkoutTemplateResponse toResponse(WorkoutTemplate template) {
        List<TemplateExerciseResponse> exercises = template.getExercises().stream()
            .map(e -> new TemplateExerciseResponse(
                e.getId(),
                e.getName(),
                e.getSets(),
                e.getReps(),
                e.getOrderIndex()
            ))
            .collect(Collectors.toList());

        return new WorkoutTemplateResponse(
            template.getId(),
            template.getName(),
            template.getDescription(),
            template.getCategory().name(),
            template.getGender().name(),
            template.getMuscleGroup() != null ? template.getMuscleGroup().name() : null,
            template.getEquipmentRequired() != null ? template.getEquipmentRequired().name() : null,
            template.getEstimatedDuration(),
            template.getWeeklyFrequency(),
            exercises,
            template.getCreatedAt()
        );
    }

    private <T extends Enum<T>> T parseEnum(Class<T> clazz, String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Enum.valueOf(clazz, value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
