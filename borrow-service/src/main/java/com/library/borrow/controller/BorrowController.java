package com.library.borrow.controller;

import com.library.borrow.dto.BorrowRequestDTO;
import com.library.borrow.entity.BorrowRecord;
import com.library.borrow.repository.BorrowRecordRepository;
import com.library.borrow.saga.BorrowSagaOrchestrator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/borrows")
public class BorrowController {

    @Autowired
    private BorrowSagaOrchestrator sagaOrchestrator;

    @Autowired
    private BorrowRecordRepository borrowRepository;

    /**
     * Kích hoạt Saga mượn sách bất đồng bộ
     */
    @PostMapping
    public ResponseEntity<BorrowRecord> requestBorrow(@RequestBody BorrowRequestDTO request) {
        BorrowRecord record = sagaOrchestrator.initiateBorrowSaga(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(record);
    }

    /**
     * Kiểm tra trạng thái hiện tại của Saga theo sagaId (Polling)
     */
    @GetMapping("/saga/{sagaId}")
    public ResponseEntity<BorrowRecord> getSagaStatus(@PathVariable String sagaId) {
        return borrowRepository.findBySagaId(sagaId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Lấy danh sách phiếu mượn của một User
     */
    @GetMapping("/user/{userId}")
    public List<BorrowRecord> getUserBorrows(@PathVariable UUID userId) {
        return borrowRepository.findByUserId(userId);
    }
}
