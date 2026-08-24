package com.library.management.repository;

import com.library.management.entity.BorrowRecord;
import com.library.management.entity.User;
import org.aspectj.apache.bcel.classfile.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    List<BorrowRecord> findByUser(User user);
    List<BorrowRecord> findByReturnDateIsNull();
    void deleteByBookId(UUID bookId);
    Optional<BorrowRecord> findById(Long id);
}
