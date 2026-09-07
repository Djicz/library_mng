package com.library.management.controller;

import com.library.management.entity.BorrowRecord;
import com.library.management.entity.User;
import com.library.management.service.BorrowService;
import com.library.management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/manager/borrows")
public class ManagerBorrowController {

    @Autowired
    private BorrowService borrowService;
    
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<BorrowRecord>> viewBorrows(String search) {
        if(search != null && search.length() != 0) {
            return ResponseEntity.ok(borrowService.searchBorrow(search));
        }
        return ResponseEntity.ok(borrowService.getZBorrowRecords());
    }

    @PostMapping("/assign")
    public ResponseEntity<?> assignBook(@RequestBody Map<String, Object> payload) {
        String username = (String) payload.get("username");
        String bookIdStr = (String) payload.get("bookId");
        String dueDateStr = (String) payload.get("dueDate");
        
        UUID bookId = UUID.fromString(bookIdStr);
        LocalDate dueDate = LocalDate.parse(dueDateStr);

        User user = userService.findByUsername(username).orElse(null);
        if(user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        if(dueDate == null || dueDate.isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body("Invalid due date");
        }
        
        try {
            BorrowRecord record = borrowService.borrowBook(user, bookId, dueDate);
            return ResponseEntity.ok(record);
        } catch(Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(borrowService.approveRequest(id));
    }

    @PutMapping("/don/{id}")
    public ResponseEntity<?> doneRequest(@PathVariable Long id) {
        return ResponseEntity.ok(borrowService.doneRequest(id));
    }

    @PostMapping("/return/{recordId}")
    public ResponseEntity<?> returnBook(@PathVariable Long recordId) {
        borrowService.returnBook(recordId);
        return ResponseEntity.ok().build();
    }
}
