package org.organizadorTreinos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BulkShareResult {

    private int shared;
    private int alreadyShared;
    private List<String> notFound;
}
