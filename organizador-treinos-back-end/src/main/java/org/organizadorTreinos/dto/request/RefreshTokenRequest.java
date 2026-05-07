package org.organizadorTreinos.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RefreshTokenRequest {

    @NotBlank(message = "Token is required")
    private String token;
}
