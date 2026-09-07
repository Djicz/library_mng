package com.library.book.service;

import com.library.book.Exception.AppException;
import com.library.book.Exception.ErrCode;
import com.library.book.entity.Book;
import com.library.book.entity.Category;
import com.library.book.repository.BookRepository;
import com.library.book.repository.CategoryRepository;
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
    private CategoryRepository categoryRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Optional<Book> getBookById(UUID id) {
        return bookRepository.findById(id);
    }

    public Book saveBook(Book book) {
        if(bookRepository.findById(book.getId()).isPresent()){
            throw new AppException((ErrCode.BOOK_EXISTED));
        }
        return bookRepository.save(book);
    }

    public Book updateBook(UUID id, Book updatedBook) {
        Book res = bookRepository.findById(id).orElseThrow(() -> new AppException(ErrCode.BOOK_NOTFOUND));
        res.setQuantity(updatedBook.getQuantity());
        res.setAuthor(updatedBook.getAuthor());
        res.setCategory(updatedBook.getCategory());
        res.setTitle(updatedBook.getTitle());
        return bookRepository.save(res);
    }

    public void deleteBook(UUID id) {
        bookRepository.deleteById(id);
    }
}
