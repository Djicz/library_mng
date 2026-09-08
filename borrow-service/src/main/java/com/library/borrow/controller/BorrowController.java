package com.library.borrow.controller;

import com.library.borrow.Exception.AppException;
import com.library.borrow.Exception.ErrCode;
import com.library.borrow.dto.ApiResponse;
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
     * Tạo yêu cầu mượn sách (Trạng thái PENDING - Chờ thủ thư phê duyệt)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BorrowRecord>> requestBorrow(@RequestBody BorrowRequestDTO request) {
        BorrowRecord record = sagaOrchestrator.createPendingBorrow(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(1, "Yêu cầu mượn sách đã được gửi và đang chờ quản trị viên phê duyệt", record));
    }

    /**
     * Kiểm tra trạng thái hiện tại của Saga theo sagaId (Polling)
     */
    @GetMapping("/saga/{sagaId}")
    public ResponseEntity<ApiResponse<BorrowRecord>> getSagaStatus(@PathVariable String sagaId) {
        BorrowRecord record = borrowRepository.findBySagaId(sagaId)
                .orElseThrow(() -> new AppException(ErrCode.BORROW_RECORD_NOTFOUND));
        return ResponseEntity.ok(new ApiResponse<>(1, null, record));
    }

    /**
     * Lấy danh sách phiếu mượn của một User
     */
    @GetMapping("/user/{userId}")
    public List<BorrowRecord> getUserBorrows(@PathVariable UUID userId) {
        return borrowRepository.findByUserId(userId);
    }
}
