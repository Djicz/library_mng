package com.library.borrow.service;

import com.library.borrow.Exception.AppException;
import com.library.borrow.Exception.ErrCode;
import com.library.borrow.entity.BorrowRecord;
import com.library.borrow.repository.BorrowRecordRepository;
import com.library.events.dto.BorrowStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BorrowService {

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    public List<BorrowRecord> getAllBorrowRecords() {
        return borrowRecordRepository.findAll();
    }

    public List<BorrowRecord> getBorrowRecordsByUser(UUID userId) {
        return borrowRecordRepository.findByUserId(userId);
    }

    public Optional<BorrowRecord> getById(Long id) {
        return borrowRecordRepository.findById(id);
    }

    @Transactional
    public BorrowRecord returnBook(Long recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException(ErrCode.BORROW_RECORD_NOTFOUND));

        if (record.getReturnDate() == null) {
            record.setReturnDate(LocalDate.now());
            borrowRecordRepository.save(record);
        }
        return record;
    }

    @Transactional
    public BorrowRecord approveRequest(Long id) {
        BorrowRecord record = borrowRecordRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrCode.BORROW_RECORD_NOTFOUND));
        record.setStatus(BorrowStatus.APPROVED);
        return borrowRecordRepository.save(record);
    }

    @Transactional
    public BorrowRecord rejectRequest(Long id, String reason) {
        BorrowRecord record = borrowRecordRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrCode.BORROW_RECORD_NOTFOUND));
        record.setStatus(BorrowStatus.REJECTED_OVERDUE);
        record.setRejectReason(reason);
        return borrowRecordRepository.save(record);
    }

    public long countActiveBorrows() {
        return borrowRecordRepository.findAll().stream()
                .filter(r -> r.getReturnDate() == null && r.getStatus() == BorrowStatus.APPROVED)
                .count();
    }
}
