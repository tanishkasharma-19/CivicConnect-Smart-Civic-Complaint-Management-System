package com.nagarvaani.repository;
import com.nagarvaani.enums.ComplaintCategory;
import com.nagarvaani.enums.ComplaintStatus;
import com.nagarvaani.model.Complaint;
import com.nagarvaani.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint , Long>{
    List<Complaint> findByReportedBy(User user);

    List<Complaint> findByAssignedTo(User user);

    List<Complaint> findByStatus(ComplaintStatus status);

    List<Complaint> findByCategory(ComplaintCategory category);

}
