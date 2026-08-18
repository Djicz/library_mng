package com.library.management.service;

import com.library.management.controller.GlobalExceptionHandler.BookNotFoundException;
import com.library.management.entity.Book;
import com.library.management.entity.Category;
import com.library.management.entity.User;
import com.library.management.repository.BookRepository;
import com.library.management.repository.BorrowRecordRepository;
import com.library.management.repository.CategoryRepository;
import com.library.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import java.util.UUID;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;
    @Autowired
    private BorrowRecordRepository borrowRecordRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CategoryRepository categoryRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book saveBook(Book book) {
//        if(book.getStatus() == null) {
//            book.setStatus("AVAILABLE");
//        }
        return bookRepository.save(book);
    }
    public List<Book> saveAllBooks(List<Book> lst) {
        return bookRepository.saveAll(lst);
    }
    public List<Book> searchBooks(String term) {
        if(bookRepository.findByNameContainingIgnoreCase(term).size() != 0) {
            return bookRepository.findByNameContainingIgnoreCase(term);
        }
        else if(bookRepository.findByCategoryContainingIgnoreCase(categoryRepository.findByName(term).get()).size() != 0) {
            return bookRepository.findByCategoryContainingIgnoreCase(categoryRepository.findByName(term).get());
        }
        else {
            Optional<User> userOpt = userRepository.findByUsername(term);
            if (userOpt.isPresent()) {
                return borrowRecordRepository.findByUser(userOpt.get())
                        .stream()
                        .map(record -> record.getBook())
                        .toList();
            }
            return List.of();
        }
    }

    public Optional<Book> getBookById(UUID id) {
        return bookRepository.findById(id);
    }

    public Book updateBook(UUID id, Book book) {
        Book bookz = bookRepository.findById(id).orElseThrow(() -> new BookNotFoundException("Không tìm thấy sách"));
        bookz.setName(book.getName());
        bookz.setQuantity(book.getQuantity());
        bookz.setCategory(book.getCategory());
        return bookRepository.save(bookz);
    }

    public void deleteBook(UUID id) {
        bookRepository.deleteById(id);
    }

    public void deleteAllBook() {
        bookRepository.deleteAll();
    }
}
