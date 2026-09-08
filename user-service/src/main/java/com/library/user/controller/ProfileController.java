package com.library.user.controller;

import com.library.user.Exception.AppException;
import com.library.user.Exception.ErrCode;
import com.library.user.dto.ApiResponse;
import com.library.user.entity.User;
import com.library.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<User>> getProfile(Authentication authentication) {
        if (authentication == null) {
            throw new AppException(ErrCode.UNAUTHORIZED);
        }
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new AppException(ErrCode.USER_NOTFOUND));
        return ResponseEntity.ok(new ApiResponse<>(1, null, user));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<User>> updateProfile(Authentication authentication, @RequestBody User updateData) {
        if (authentication == null) {
            throw new AppException(ErrCode.UNAUTHORIZED);
        }
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new AppException(ErrCode.USER_NOTFOUND));
        if (updateData.getDisplayName() != null) {
            user.setDisplayName(updateData.getDisplayName());
        }
        return ResponseEntity.ok(new ApiResponse<>(1, "Cập nhật thông tin thành công", userRepository.save(user)));
    }
}
