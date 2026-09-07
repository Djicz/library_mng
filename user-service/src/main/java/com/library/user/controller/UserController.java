package com.library.user.controller;

import com.library.user.entity.User;
import com.library.user.entity.UserBorrowHistory;
import com.library.user.repository.UserBorrowHistoryRepository;
import com.library.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserBorrowHistoryRepository historyRepository;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable UUID id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userRepository.save(user));
    }

    /**
     * Endpoint test: Thêm 1 bản ghi quá hạn cho User để test luồng Saga Rollback!
     */
    @PostMapping("/{id}/simulate-overdue")
    public ResponseEntity<String> simulateOverdueBook(@PathVariable UUID id, @RequestParam UUID bookId) {
        UserBorrowHistory history = new UserBorrowHistory(
                id, 
                bookId, 
                LocalDate.now().minusDays(5), // Quá hạn 5 ngày trước
                false
        );
        historyRepository.save(history);
        return ResponseEntity.ok("Đã tạo giả lập 1 sách quá hạn 5 ngày cho User: " + id);
    }
}
