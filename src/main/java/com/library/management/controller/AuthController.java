package com.library.management.controller;

import org.springframework.security.authentication.BadCredentialsException;
import com.library.management.controller.GlobalExceptionHandler.UserUnavailableException;
import com.library.management.dto.JwtResponse;
import com.library.management.dto.LoginRequest;
import com.library.management.dto.RegisterRequest;
import com.library.management.entity.User;
import com.library.management.repository.UserRepository;
import com.library.management.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("Error: User not found."));

            if (user.getStatus().equals("UNAVAILABLE")) {
                throw new UserUnavailableException("Tài khoản này đã bị khóa, vui lòng liên hệ admin để biết thêm chi tiết");
            }
            String jwt = jwtUtil.generateToken(user.getUsername(), user.getRole());

            return ResponseEntity.ok(new JwtResponse(jwt, user.getRole(), user.getUsername(), user.getId()));
        }
        catch(BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sai mật khẩu");
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerAcc(@RequestBody RegisterRequest registerRequest) {
        if(userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tài khoản đã tồn tại");
        }
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setDisplayName(registerRequest.getDisplayName());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole("BORROWER");
        user.setStatus("AVAILABLE");
        return ResponseEntity.ok(userRepository.save(user));
    }
}
