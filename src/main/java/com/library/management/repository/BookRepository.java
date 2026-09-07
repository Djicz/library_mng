package com.library.management.repository;

import com.library.management.entity.Book;
import com.library.management.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookRepository extends JpaRepository<Book, UUID> {
    List<Book> findByNameContainingIgnoreCase(String name);
    List<Book> findByCategoryContainingIgnoreCase(Category cate);
}
