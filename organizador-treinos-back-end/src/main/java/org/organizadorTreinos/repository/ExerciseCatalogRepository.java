package org.organizadorTreinos.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.organizadorTreinos.entity.ExerciseCatalog;
import java.util.List;

@ApplicationScoped
public class ExerciseCatalogRepository implements PanacheRepository<ExerciseCatalog> {

    public List<String> searchByName(String query) {
        if (query == null || query.isBlank()) {
            return find("order by name asc").page(0, 20).list()
                .stream().map(ExerciseCatalog::getName).toList();
        }
        return find("lower(name) like lower(?1) order by name asc", "%" + query.toLowerCase() + "%")
            .page(0, 10).list()
            .stream().map(ExerciseCatalog::getName).toList();
    }
}
