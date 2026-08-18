package com.library.management.controller;

import com.library.management.entity.User;
import com.library.management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/manager/user")
public class UserController {
    @Autowired
    private UserService userService;
    @GetMapping("/get-all-users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    @GetMapping("/get-user/{id}")
    public ResponseEntity<?> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUser(id));
    }
    @PutMapping("update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable UUID id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().body("Xóa thành công");
    }
    @PutMapping("/lock/{id}")
    public ResponseEntity<?> lockUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.lockUser(id));
    }
    @PutMapping("/reset-password/{id}")
    public ResponseEntity<?> resetPassword(@PathVariable UUID id) {
        userService.resetPassword(id);
        return ResponseEntity.ok().body("Reset password thành công, mật khẩu mới là: 123456");
    }
}
