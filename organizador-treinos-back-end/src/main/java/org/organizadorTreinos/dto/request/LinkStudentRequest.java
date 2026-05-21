package org.organizadorTreinos.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LinkStudentRequest {

    @Email(message = "Email must be valid")
    @NotBlank(message = "Student email is required")
    private String email;
}
