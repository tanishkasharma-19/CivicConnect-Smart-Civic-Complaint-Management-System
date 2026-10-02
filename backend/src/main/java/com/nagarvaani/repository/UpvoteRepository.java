package com.nagarvaani.repository;

import com.nagarvaani.model.Complaint;
import com.nagarvaani.model.Upvote;
import com.nagarvaani.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UpvoteRepository extends JpaRepository<Upvote, Long> {

    boolean existsByUserAndComplaint(User user, Complaint complaint);

    long countByComplaint(Complaint complaint);

    Optional<Upvote> findByUserAndComplaint(
            User user,
            Complaint complaint);
}