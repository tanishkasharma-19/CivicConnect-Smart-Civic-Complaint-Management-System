package com.nagarvaani.repository;

import com.nagarvaani.model.Complaint;
import com.nagarvaani.model.Upvote;
import com.nagarvaani.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UpvoteRepository extends JpaRepository<Upvote, Long> {

    Optional<Upvote> findByComplaintAndUser(Complaint complaint, User user);

    long countByComplaint(Complaint complaint);

}