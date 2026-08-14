package com.library.management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.library.management.service.NotificationJobService;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/manager/dashboard")
public class DashboardController {

    @Autowired
    private NotificationJobService notificationJobService;

    @GetMapping
    public ResponseEntity<Map<String, String>> managerDashboard() {
        return ResponseEntity.ok(Collections.singletonMap("message", "Welcome to Manager Dashboard"));
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
}
