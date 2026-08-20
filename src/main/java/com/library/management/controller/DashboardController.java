package com.library.management.controller;

import com.library.management.entity.User;
import com.library.management.repository.UserRepository;
import com.library.management.service.BookService;
import com.library.management.service.BorrowService;
import com.library.management.service.UserService;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.library.management.service.NotificationJobService;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@RestController
@RequestMapping("/api/manager/dashboard")
public class DashboardController {

    @Autowired
    private NotificationJobService notificationJobService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private BookService bookService;
    @Autowired
    private BorrowService borrowService;

    @GetMapping
    public ResponseEntity<Map<String, String>> managerDashboard() {
        return ResponseEntity.ok(Collections.singletonMap("message", "Welcome to Manager Dashboard"));
    }

    @GetMapping("/user-count")
    public ResponseEntity<Integer> countUser() {
        return ResponseEntity.ok(userService.getAllUsers().size());
    }

    @GetMapping("/book-count")
    public ResponseEntity<Integer> countBook() {
        return ResponseEntity.ok(bookService.getAllBooks().size());
    }

    @GetMapping("/borrow-count")
    public ResponseEntity<List<Map<String, Object>>> countBorrow() {
        List<User> us = userService.getAllUsers();

        List<Map<String, Object>> results = new java.util.ArrayList<>();
        for (User u : us) {
            int count = borrowService.searchBorrow(u.getUsername()).size();
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("username", u.getUsername());
            map.put("displayName", u.getDisplayName());
            map.put("count", count);
            results.add(map);
        }

        // Sort descending by count
        results.sort((a, b) -> ((Integer) b.get("count")).compareTo((Integer) a.get("count")));

        return ResponseEntity.ok(results);
    }

    @PostMapping("/trigger-job")
    public ResponseEntity<?> triggerJob() {
        try {
            notificationJobService.processOverdueAndDueSoonNotifications();
            return ResponseEntity.ok(Collections.singletonMap("message", "Notification job triggered successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }
    // @GetMapping("get-user")
    // public ResponseEntity<?> getUser() {
    // return ResponseEntity.ok(userRepository.findAll());
    // }
}
