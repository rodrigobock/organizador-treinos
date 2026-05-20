package org.organizadorTreinos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.organizadorTreinos.entity.WorkoutShare;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SharedByMeResponse {

    private UUID workoutId;
    private String workoutName;
    private List<ShareEntry> shares;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShareEntry {
        private UUID userId;
        private String email;
        private String name;
        private WorkoutShare.Permission permission;
        private LocalDateTime sharedAt;
        private LocalDateTime lastAccessedAt;
    }
}
