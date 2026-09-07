package com.library.book.config;

import com.library.book.entity.Book;
import com.library.book.entity.Category;
import com.library.book.repository.BookRepository;
import com.library.book.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initBooks(BookRepository bookRepository, CategoryRepository categoryRepository) {
        return args -> {
            if (categoryRepository.count() == 0) {
                Category it = categoryRepository.save(new Category("Công nghệ thông tin"));
                Category science = categoryRepository.save(new Category("Khoa học tự nhiên"));
                Category literature = categoryRepository.save(new Category("Văn học nghệ thuật"));

                if (bookRepository.count() == 0) {
                    bookRepository.save(new Book("Clean Code", "Robert C. Martin", 5, it));
                    bookRepository.save(new Book("Design Patterns", "Gang of Four", 3, it));
                    bookRepository.save(new Book("Vũ Trụ Trong Vỏ Hạt Dẻ", "Stephen Hawking", 4, science));
                    bookRepository.save(new Book("Nhà Giả Kim", "Paulo Coelho", 6, literature));
                }
            }
        };
    }
}
