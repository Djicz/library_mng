package com.library.management.controller;

import com.library.management.entity.Book;
import com.library.management.entity.Category;
import com.library.management.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;
import com.library.management.service.BorrowService;
import java.util.List;
import java.util.UUID;

@RestController
@EnableMethodSecurity
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;
    @Autowired
    private BorrowService borrowService;
    @GetMapping
    public ResponseEntity<List<Book>> listBooks(@RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(bookService.searchBooks(search));
        } else {
            return ResponseEntity.ok(bookService.getAllBooks());
        }
    }
    @PreAuthorize("hasRole('MANAGER')")
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateBook(@PathVariable UUID id, @RequestBody Book book) {
        return ResponseEntity.ok(bookService.updateBook(id, book));
    }
    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping
    public ResponseEntity<Book> saveBook(@RequestBody Book book) {
        Book saved = bookService.saveBook(book);
        return ResponseEntity.ok(saved);
    }
    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping("/in-books")
    public ResponseEntity<List<Book>> saveAllBooks(@RequestBody List<Book> lst) {
        List<Book> saved = bookService.saveAllBooks(lst);
        return ResponseEntity.ok(saved);
    }
    @PreAuthorize("hasRole('MANAGER')")
    @DeleteMapping("/all")
    public ResponseEntity<?> deleteAllBooks() {
        borrowService.deleteAll();
        bookService.deleteAllBook();
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
    @PreAuthorize("hasRole('MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable UUID id) {
        borrowService.deleteBorrowBookData(id);
        bookService.deleteBook(id);
        return ResponseEntity.ok().build();
    }
}
