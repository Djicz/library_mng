package com.library.management.config;

import com.library.management.entity.Category;
import com.library.management.entity.User;
import com.library.management.repository.BookRepository;
import com.library.management.repository.CategoryRepository;
import com.library.management.repository.UserRepository;
import com.library.management.entity.Book;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private BookRepository bookRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.findByUsername("admin").isPresent()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("MANAGER");
            userRepository.save(admin);
            System.out.println("Đã khởi tạo admin");
        }
        else {
            System.out.println("Đã tồn tại admin");
        }

        if (!userRepository.findByUsername("user").isPresent()) {
            User user = new User();
            user.setUsername("user");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRole("BORROWER");
            userRepository.save(user);
            System.out.println("Đã khởi tạo user");
        }
        else {
            List<User> us = userRepository.findAll();
            System.out.println("Đã tồn tại " + us.size() + " User");
        }
        if (!categoryRepository.findByName("Test").isPresent()) {
            Category category = new Category();
            category.setName("Test");
            categoryRepository.save(category);
            System.out.println("Đã khởi tạo category test");
        }
        else {
            System.out.println("Đã tồn tại category test");
        }
        if(bookRepository.findAll().isEmpty()){
            Book book = new Book();
            book.setName("Test Book");
            book.setCategory(categoryRepository.findByName("Test").get());
            book.setQuantity(1);
            bookRepository.save(book);
            System.out.println("Đã khởi tạo test book");
        }
        else {
            List<Book> bk = bookRepository.findAll();
            System.out.println("Đã tồn tại " + bk.size() + " Book");
        }
    }
}
