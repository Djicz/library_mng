package com.library.management.controller;

import com.library.management.entity.Notification;
import com.library.management.entity.User;
import com.library.management.repository.NotificationRepository;
import com.library.management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/borrower/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Notification>> viewNotifications(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username).orElse(null);
        if (user != null) {
            List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
            return ResponseEntity.ok(notifications);
        }
        return ResponseEntity.notFound().build();
    }
}
