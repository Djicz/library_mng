package com.library.user.controller;

import com.library.user.Exception.AppException;
import com.library.user.Exception.ErrCode;
import com.library.user.dto.ApiResponse;
import com.library.user.entity.Notification;
import com.library.user.entity.User;
import com.library.user.repository.NotificationRepository;
import com.library.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications(Authentication authentication) {
        if (authentication == null) {
            throw new AppException(ErrCode.UNAUTHORIZED);
        }
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new AppException(ErrCode.USER_NOTFOUND));
        
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(new ApiResponse<>(1, null, notifications));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(@PathVariable Long id) {
        Notification noti = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrCode.NOTIFICATION_NOTFOUND));
        noti.setRead(true);
        return ResponseEntity.ok(new ApiResponse<>(1, "Đã đánh dấu đã đọc", notificationRepository.save(noti)));
    }
}
