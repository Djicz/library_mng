package com.library.borrow.controller;

import com.library.borrow.entity.BorrowRecord;
import com.library.borrow.service.BorrowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/manager/borrow", "/api/manager/borrows"})
public class ManagerBorrowController {

    @Autowired
    private BorrowService borrowService;

    @GetMapping({"", "/all"})
    public List<BorrowRecord> getAllBorrows() {
        return borrowService.getAllBorrowRecords();
    }

    @PostMapping("/approve/{id}")
    public ResponseEntity<BorrowRecord> approve(@PathVariable Long id) {
        return ResponseEntity.ok(borrowService.approveRequest(id));
    }

    @PostMapping("/reject/{id}")
    public ResponseEntity<BorrowRecord> reject(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String reason = (body != null && body.get("reason") != null) ? body.get("reason") : "Bị từ chối bởi quản trị viên";
        return ResponseEntity.ok(borrowService.rejectRequest(id, reason));
    }

    @PostMapping("/return/{id}")
    public ResponseEntity<BorrowRecord> returnBook(@PathVariable Long id) {
        return ResponseEntity.ok(borrowService.returnBook(id));
    }
}
