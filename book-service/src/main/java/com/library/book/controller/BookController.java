package com.library.book.controller;

import com.library.book.dto.ApiResponse;
import com.library.book.entity.Book;
import com.library.book.service.BookService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/books")
@AllArgsConstructor
public class BookController {
    private final BookService bookService;

    @GetMapping
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Book>> getBookById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse(1, null, bookService.getBookById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Book>> createBook(@RequestBody Book book) {
        return ResponseEntity.ok(new ApiResponse(1, null, bookService.saveBook(book)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Book>> updateBook(@PathVariable UUID id, @RequestBody Book book) {
        return ResponseEntity.ok(new ApiResponse(1, null, bookService.updateBook(id, book)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable UUID id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok(new ApiResponse(1, "Xóa sách thành công", null));
    }
}
