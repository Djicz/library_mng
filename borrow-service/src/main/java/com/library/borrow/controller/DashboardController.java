package com.library.borrow.controller;

import com.library.borrow.service.BorrowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/dashboard", "/api/manager/dashboard"})
public class DashboardController {

    @Autowired
    private BorrowService borrowService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBorrows", borrowService.getAllBorrowRecords().size());
        stats.put("activeBorrows", borrowService.countActiveBorrows());
        stats.put("message", "Welcome to Manager Dashboard");
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/borrow-count")
    public ResponseEntity<Map<String, Object>> countBorrow() {
        Map<String, Object> res = new HashMap<>();
        res.put("totalRecords", borrowService.getAllBorrowRecords().size());
        res.put("activeRecords", borrowService.countActiveBorrows());
        return ResponseEntity.ok(res);
    }
}
