package com.library.management.config;

import com.library.management.entity.User;
import com.library.management.repository.BookRepository;
import com.library.management.repository.UserRepository;
import com.library.management.entity.Book;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private BookRepository bookRepository;
    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("MANAGER");
            userRepository.save(admin);
            System.out.println("Đã khởi tạo admin!");
        }

        if (userRepository.findByUsername("user").isEmpty()) {
            User user = new User();
            user.setUsername("user");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRole("BORROWER");
            userRepository.save(user);
            System.out.println("Đã khởi tại user!");
        }
        if(bookRepository.findAll().isEmpty()){
            Book book = new Book();
            book.setName("Test Book");
            book.setCategory("Test");
            book.setStatus("AVAILABLE");
            bookRepository.save(book);
            System.out.println("Đã khởi tại test book!");
        }
    }
}
