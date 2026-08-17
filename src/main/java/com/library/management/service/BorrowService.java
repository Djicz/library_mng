package com.library.management.service;

import com.library.management.entity.Book;
import com.library.management.entity.BorrowRecord;
import com.library.management.entity.User;
import com.library.management.repository.BookRepository;
import com.library.management.repository.BorrowRecordRepository;
import com.library.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BorrowService {

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public BorrowRecord borrowBook(User user, java.util.UUID bookId, LocalDate dueDate) {
        Optional<Book> bookOpt = bookRepository.findById(bookId);
        if (bookOpt.isPresent()) {
            Book book = bookOpt.get();
            if (book.getQuantity() > 0) {
                book.setQuantity(book.getQuantity() - 1);
                bookRepository.save(book);

                BorrowRecord record = new BorrowRecord();
                record.setBook(book);
                record.setUser(user);
                record.setBorrowDate(LocalDate.now());
                record.setDueDate(dueDate);
                return borrowRecordRepository.save(record);
            } else {
                throw new RuntimeException("Book is not available");
            }
        }
        throw new RuntimeException("Book not found");
    }

    @Transactional
    public void returnBook(Long recordId) {
        Optional<BorrowRecord> recordOpt = borrowRecordRepository.findById(recordId);
        if (recordOpt.isPresent()) {
            BorrowRecord record = recordOpt.get();
            if (record.getReturnDate() == null) {
                record.setReturnDate(LocalDate.now());
                borrowRecordRepository.save(record);

                Book book = record.getBook();
                book.setQuantity(book.getQuantity() + 1);
                bookRepository.save(book);
            }
        }
    }

    public List<BorrowRecord> getBorrowRecordsByUser(User user) {
        return borrowRecordRepository.findByUser(user);
    }
    
    public List<BorrowRecord> getAllBorrowRecords() {
        return borrowRecordRepository.findAll();
    }
    @Transactional
    public void deleteBorrowBookData(UUID bookId) {
        borrowRecordRepository.deleteByBookId(bookId);
    }
    
    @Transactional
    public void deleteAll() {
        borrowRecordRepository.deleteAll();
    }
    @Transactional
    public List<BorrowRecord> searchBorrow(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            return borrowRecordRepository.findByUser(userOpt.get());
        }
        return List.of();
    }
}
