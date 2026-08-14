package com.library.management.repository;

import com.library.management.entity.BorrowRecord;
import com.library.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    List<BorrowRecord> findByUser(User user);
    List<BorrowRecord> findByReturnDateIsNull();
    void deleteByBookId(UUID bookId);
}
