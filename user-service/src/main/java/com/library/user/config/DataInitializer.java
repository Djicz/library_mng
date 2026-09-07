package com.library.user.config;

import com.library.user.entity.User;
import com.library.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setDisplayName("Quản Trị Viên");
                admin.setRole("MANAGER");
                admin.setStatus("AVAILABLE");
                userRepository.save(admin);
            }

            if (userRepository.findByUsername("user").isEmpty()) {
                User borrower = new User();
                borrower.setUsername("user");
                borrower.setPassword(passwordEncoder.encode("user123"));
                borrower.setDisplayName("Nguyễn Văn Đọc");
                borrower.setRole("BORROWER");
                borrower.setStatus("AVAILABLE");
                userRepository.save(borrower);
            }
        };
    }
}
