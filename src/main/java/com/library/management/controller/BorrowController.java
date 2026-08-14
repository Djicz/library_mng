package com.library.management.controller;

import com.library.management.entity.BorrowRecord;
import com.library.management.entity.User;
import com.library.management.service.BorrowService;
import com.library.management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrower/my-books")
public class BorrowController {

    @Autowired
    private BorrowService borrowService;
    
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<BorrowRecord>> viewMyBooks(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username).orElse(null);
        if (user != null) {
            return ResponseEntity.ok(borrowService.getBorrowRecordsByUser(user));
        }
        return ResponseEntity.notFound().build();
    }
}
