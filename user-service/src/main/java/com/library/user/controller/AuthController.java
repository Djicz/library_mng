package com.library.user.controller;

import com.library.user.Exception.AppException;
import com.library.user.Exception.ErrCode;
import com.library.user.dto.ApiResponse;
import com.library.user.dto.JwtResponse;
import com.library.user.dto.LoginRequest;
import com.library.user.dto.RegisterRequest;
import com.library.user.entity.User;
import com.library.user.repository.UserRepository;
import com.library.user.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new AppException(ErrCode.USER_NOTFOUND));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new AppException(ErrCode.WRONG_PASSWORD);
        }

        if ("UNAVAILABLE".equalsIgnoreCase(user.getStatus())) {
            throw new AppException(ErrCode.ACCOUNT_LOCKED);
        }

        String jwt = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return ResponseEntity.ok(new JwtResponse(jwt, user.getRole(), user.getUsername(), user.getId()));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> registerAcc(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            throw new AppException(ErrCode.USER_EXISTED);
        }
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setDisplayName(registerRequest.getDisplayName());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole("BORROWER");
        user.setStatus("AVAILABLE");
        return ResponseEntity.ok(new ApiResponse<>(1, "Đăng ký thành công", userRepository.save(user)));
    }
}
