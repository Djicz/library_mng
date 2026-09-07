package com.library.user.repository;

import com.library.user.entity.UserBorrowHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface UserBorrowHistoryRepository extends JpaRepository<UserBorrowHistory, Long> {
    boolean existsByUserIdAndDueDateBeforeAndIsReturnedFalse(UUID userId, LocalDate date);
    List<UserBorrowHistory> findByUserId(UUID userId);
}
