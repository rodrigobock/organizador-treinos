package org.organizadorTreinos.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.organizadorTreinos.entity.PersonalTrainerStudent;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class PersonalTrainerStudentRepository implements PanacheRepository<PersonalTrainerStudent> {

    public List<PersonalTrainerStudent> findByTrainer(UUID trainerId) {
        return find("trainer.id", trainerId).list();
    }

    public Optional<PersonalTrainerStudent> findByTrainerAndStudent(UUID trainerId, UUID studentId) {
        return find("trainer.id = ?1 AND student.id = ?2", trainerId, studentId).firstResultOptional();
    }
}
