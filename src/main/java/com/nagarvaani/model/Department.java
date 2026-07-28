package com.nagarvaani.model;


import com.nagarvaani.enums.ComplaintCategory;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    private String email;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private ComplaintCategory categoryType;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
