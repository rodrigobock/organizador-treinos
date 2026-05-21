package org.organizadorTreinos.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import org.organizadorTreinos.dto.response.StudentResponse;
import org.organizadorTreinos.entity.PersonalTrainerStudent;
import org.organizadorTreinos.entity.User;
import org.organizadorTreinos.entity.UserRole;
import org.organizadorTreinos.repository.PersonalTrainerStudentRepository;
import org.organizadorTreinos.repository.UserRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
@Transactional
public class TrainerService {

    @Inject
    PersonalTrainerStudentRepository trainerStudentRepository;

    @Inject
    UserRepository userRepository;

    public StudentResponse linkStudent(UUID trainerId, String studentEmail) {
        User trainer = getTrainer(trainerId);

        if (studentEmail.equalsIgnoreCase(trainer.getEmail())) {
            throw new BadRequestException("Cannot link yourself as a student");
        }

        User student = userRepository.findByEmail(studentEmail.trim().toLowerCase())
            .orElseThrow(() -> new NotFoundException("User not found with this email"));

        if (trainerStudentRepository.findByTrainerAndStudent(trainerId, student.getId()).isPresent()) {
            throw new BadRequestException("Student already linked");
        }

        PersonalTrainerStudent link = new PersonalTrainerStudent();
        link.setTrainer(trainer);
        link.setStudent(student);
        trainerStudentRepository.persist(link);

        return new StudentResponse(student.getId(), student.getName(), student.getEmail(), link.getCreatedAt());
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<StudentResponse> getStudents(UUID trainerId) {
        getTrainer(trainerId);
        return trainerStudentRepository.findByTrainer(trainerId).stream()
            .map(link -> new StudentResponse(
                link.getStudent().getId(),
                link.getStudent().getName(),
                link.getStudent().getEmail(),
                link.getCreatedAt()
            ))
            .collect(Collectors.toList());
    }

    public void unlinkStudent(UUID trainerId, UUID studentId) {
        getTrainer(trainerId);
        PersonalTrainerStudent link = trainerStudentRepository
            .findByTrainerAndStudent(trainerId, studentId)
            .orElseThrow(() -> new NotFoundException("Student not linked to this trainer"));
        trainerStudentRepository.delete(link);
    }

    private User getTrainer(UUID trainerId) {
        User trainer = userRepository.find("id", trainerId)
            .firstResultOptional().orElseThrow(() -> new NotFoundException("User not found"));
        if (trainer.getRole() != UserRole.PERSONAL_TRAINER) {
            throw new ForbiddenException("Only personal trainers can manage students");
        }
        return trainer;
    }
}
