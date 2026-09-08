package com.library.borrow.controller;

import com.library.borrow.dto.ApiResponse;
import com.library.borrow.entity.BorrowRecord;
import com.library.borrow.service.BorrowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager/borrow")
public class ManagerBorrowController {

    @Autowired
    private BorrowService borrowService;

    @GetMapping("/all")
    public List<BorrowRecord> getAllBorrows() {
        return borrowService.getAllBorrowRecords();
    }

    @PostMapping("/assign")
    public ResponseEntity<ApiResponse<BorrowRecord>> assignBorrow(@RequestBody com.library.borrow.dto.BorrowRequestDTO request) {
        return ResponseEntity.ok(new ApiResponse<>(1, "Tạo phiếu mượn và kích hoạt Saga thành công", borrowService.createDirectBorrow(request)));
    }

    @PostMapping("/approve/{id}")
    public ResponseEntity<ApiResponse<BorrowRecord>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(1, "Phê duyệt mượn sách thành công", borrowService.approveRequest(id)));
    }

    @PostMapping("/reject/{id}")
    public ResponseEntity<ApiResponse<BorrowRecord>> reject(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String reason = (body != null && body.get("reason") != null) ? body.get("reason") : "Bị từ chối bởi quản trị viên";
        return ResponseEntity.ok(new ApiResponse<>(1, "Từ chối mượn sách thành công", borrowService.rejectRequest(id, reason)));
    }

    @PostMapping("/return/{id}")
    public ResponseEntity<ApiResponse<BorrowRecord>> returnBook(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(1, "Trả sách thành công", borrowService.returnBook(id)));
    }
}
