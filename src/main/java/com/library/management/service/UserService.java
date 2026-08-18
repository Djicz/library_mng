package com.library.management.service;

import com.library.management.controller.GlobalExceptionHandler.UserNotFoundException;
import com.library.management.entity.User;
import com.library.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    public User getUser(UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng"));
        return user;
    }
    public User updateUser(UUID id, User user) {
        User user1 = getUser(id);
        user1.setDisplayName(user.getDisplayName());
        return userRepository.save(user1);
    }
    @Transactional
    public void deleteUser(UUID id) {
        userRepository.deleteById(id);
    }
    public User lockUser(UUID id) {
        User user = getUser(id);
        if(user.getStatus().equals("AVAILABLE")) {
            user.setStatus("UNAVAILABLE");
        }
        else {
            user.setStatus("AVAILABLE");
        }
        return userRepository.save(user);
    }
    public User resetPassword(UUID id) {
        User user = getUser(id);
        user.setPassword(passwordEncoder.encode("123456"));
        return userRepository.save(user);
    }
}
