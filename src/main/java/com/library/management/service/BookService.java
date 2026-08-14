package com.library.management.service;

import com.library.management.entity.Book;
import com.library.management.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import java.util.UUID;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book saveBook(Book book) {
        if(book.getStatus() == null) {
            book.setStatus("AVAILABLE");
        }
        return bookRepository.save(book);
    }

    public List<Book> searchBooks(String term) {
        return bookRepository.findByNameContainingIgnoreCase(term);
    }

    public Optional<Book> getBookById(UUID id) {
        return bookRepository.findById(id);
    }

    public void deleteBook(UUID id) {
        bookRepository.deleteById(id);
    }

    public void deleteAllBook() {
        bookRepository.deleteAll();
    }
}
