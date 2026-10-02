package com.nagarvaani.config;

import com.nagarvaani.enums.ComplaintCategory;
import com.nagarvaani.model.Department;
import com.nagarvaani.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/*
 * Runs once every time the backend starts.
 * Makes sure EVERY complaint category has a department in the database.
 * Departments that already exist are never touched, so names, emails and
 * phone numbers you edited in the admin panel are kept.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DepartmentSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;

    @Override
    public void run(String... args) {

        for (ComplaintCategory category : ComplaintCategory.values()) {

            if (departmentRepository.findByCategoryType(category).isPresent()) {
                continue;
            }

            try {
                departmentRepository.save(
                        Department.builder()
                                .name(defaultName(category))
                                .description(defaultDescription(category))
                                .categoryType(category)
                                .build()
                );

                log.info("Created default department for {}", category);

            } catch (Exception e) {
                log.error(
                        "Could not create the default department for {}. "
                                + "If the departments table has an old MySQL enum column, run: "
                                + "ALTER TABLE departments MODIFY category_type VARCHAR(30) NOT NULL;",
                        category, e
                );
            }
        }
    }

    private String defaultName(ComplaintCategory category) {
        return switch (category) {
            case ROAD -> "Road Department";
            case GARBAGE -> "Sanitation Department";
            case WATER -> "Water Supply Department";
            case ELECTRICITY -> "Electricity Department";
            case DRAINAGE -> "Drainage Department";
            case OTHER -> "General Department";
        };
    }

    private String defaultDescription(ComplaintCategory category) {
        return switch (category) {
            case ROAD -> "Handles road related complaints";
            case GARBAGE -> "Handles garbage and waste complaints";
            case WATER -> "Handles water supply complaints";
            case ELECTRICITY -> "Handles issues related to electricity";
            case DRAINAGE -> "Handles drainage and sewage complaints";
            case OTHER -> "Handles all other civic complaints";
        };
    }
}