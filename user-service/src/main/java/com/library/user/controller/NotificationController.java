package com.library.user.controller;

import com.library.user.entity.Notification;
import com.library.user.entity.User;
import com.library.user.repository.NotificationRepository;
import com.library.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        Optional<User> userOpt = userRepository.findByUsername(authentication.getName());
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(userOpt.get().getId()));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return notificationRepository.findById(id)
                .map(noti -> {
                    noti.setRead(true);
                    return ResponseEntity.ok(notificationRepository.save(noti));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
