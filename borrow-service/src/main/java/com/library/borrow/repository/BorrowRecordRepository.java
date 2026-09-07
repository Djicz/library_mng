package com.library.borrow.repository;

import com.library.borrow.entity.BorrowRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    Optional<BorrowRecord> findBySagaId(String sagaId);
    List<BorrowRecord> findByUserId(UUID userId);
}
