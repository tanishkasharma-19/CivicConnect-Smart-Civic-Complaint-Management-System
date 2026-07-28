package com.nagarvaani.model;

import com.nagarvaani.enums.ComplaintStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "status_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusHistory {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", nullable = false)
    private ComplaintStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false)
    private ComplaintStatus newStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;


    @CreationTimestamp
    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;



}