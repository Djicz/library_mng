package com.library.management.controller;

import com.library.management.controller.GlobalExceptionHandler.BookNotFoundException;
import com.library.management.dto.BorrowRequest;
import com.library.management.entity.Book;
import com.library.management.entity.BorrowRecord;
import com.library.management.entity.User;
import com.library.management.service.BookService;
import com.library.management.service.BorrowService;
import com.library.management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/borrower/my-books")
public class BorrowController {

    @Autowired
    private BorrowService borrowService;
    
    @Autowired
    private UserService userService;
    @Autowired
    private BookService bookService;

    @GetMapping
    public ResponseEntity<List<BorrowRecord>> viewMyBooks(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username).orElse(null);
        if (user != null) {
            return ResponseEntity.ok(borrowService.getBorrowRecordsByUser(user));
        }
        return ResponseEntity.notFound().build();
    }
    @PostMapping("/borrow/{id}")
    public ResponseEntity<?> requestBorrow(@PathVariable UUID id, Authentication authentication, @RequestBody BorrowRequest borrowRequest) {
        String username = authentication.getName();
        User user = userService.findByUsername(username).orElse(null);
        Book book = bookService.getBookById(id).orElseThrow(() -> new BookNotFoundException("Không tìm thấy sách"));
        return ResponseEntity.ok(borrowService.requestBorrow(user, book, borrowRequest));
    }
    @PostMapping("/book/{id}")
    public ResponseEntity<?> requestBook(@PathVariable UUID id, Authentication authentication, @RequestBody BorrowRequest borrowRequest) {
        String username = authentication.getName();
        User user = userService.findByUsername(username).orElse(null);
        Book book = bookService.getBookById(id).orElseThrow(() -> new BookNotFoundException("Không tìm thấy sách"));
        return ResponseEntity.ok(borrowService.requestBook(user, book, borrowRequest));
    }
}
