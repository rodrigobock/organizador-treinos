package org.organizadorTreinos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {
    private UUID id;
    private String name;
    private String email;
    private LocalDateTime linkedAt;
}
