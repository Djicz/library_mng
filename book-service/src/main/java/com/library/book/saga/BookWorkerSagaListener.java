package com.library.book.saga;

import com.library.book.entity.Book;
import com.library.book.repository.BookRepository;
import com.library.events.event.BookCompensatedEvent;
import com.library.events.event.BookReserveFailedEvent;
import com.library.events.event.BookReservedEvent;
import com.library.events.event.BorrowCreatedEvent;
import com.library.events.event.UserValidationFailedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class BookWorkerSagaListener {

    private static final Logger log = LoggerFactory.getLogger(BookWorkerSagaListener.class);

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * BƯỚC 1: Lắng nghe sự kiện mượn sách được tạo (BorrowCreatedEvent) từ borrow-service
     */
    @Transactional
    @KafkaListener(topics = "borrow.event.created", groupId = "book-choreography-group")
    public void onBorrowCreated(BorrowCreatedEvent event) {
        log.info("[CHOREOGRAPHY - BookService] Nhận sự kiện 'borrow.event.created' cho sagaId: {}, bookId: {}", 
                event.getSagaId(), event.getBookId());

        Optional<Book> bookOpt = bookRepository.findById(event.getBookId());
        if (bookOpt.isPresent()) {
            Book book = bookOpt.get();
            if (book.getQuantity() >= 1) {
                book.setQuantity(book.getQuantity() - 1);
                bookRepository.save(book);
                log.info("[CHOREOGRAPHY - BookService] Trừ kho THÀNH CÔNG cho sagaId: {}. Tồn kho còn: {}", 
                        event.getSagaId(), book.getQuantity());

                // Phát sự kiện BookReservedEvent -> user-service sẽ lắng nghe tiếp
                BookReservedEvent reservedEvent = new BookReservedEvent(
                        event.getSagaId(), event.getUserId(), event.getBookId(), 1, event.getDueDate()
                );
                kafkaTemplate.send("book.event.reserved", event.getSagaId(), reservedEvent);
            } else {
                log.warn("[CHOREOGRAPHY - BookService] HẾT SÁCH KHO cho sagaId: {}", event.getSagaId());
                BookReserveFailedEvent failedEvent = new BookReserveFailedEvent(
                        event.getSagaId(), event.getBookId(), "Hết sách trong kho (Số lượng = 0)"
                );
                kafkaTemplate.send("book.event.reserve-failed", event.getSagaId(), failedEvent);
            }
        } else {
            log.error("[CHOREOGRAPHY - BookService] Không tìm thấy sách ID: {}", event.getBookId());
            BookReserveFailedEvent failedEvent = new BookReserveFailedEvent(
                    event.getSagaId(), event.getBookId(), "Không tìm thấy thông tin sách"
            );
            kafkaTemplate.send("book.event.reserve-failed", event.getSagaId(), failedEvent);
        }
    }

    /**
     * GIAO DỊCH BÙ TRỪ: Lắng nghe sự kiện User kiểm tra thất bại (UserValidationFailedEvent) từ user-service
     */
    @Transactional
    @KafkaListener(topics = "user.event.validation-failed", groupId = "book-choreography-group")
    public void onUserValidationFailed(UserValidationFailedEvent event) {
        log.warn("[CHOREOGRAPHY - BookService - COMPENSATE] Nhận sự kiện 'user.event.validation-failed'. Hoàn kho (+1) cho sagaId: {}, bookId: {}", 
                event.getSagaId(), event.getBookId());

        Optional<Book> bookOpt = bookRepository.findById(event.getBookId());
        if (bookOpt.isPresent()) {
            Book book = bookOpt.get();
            book.setQuantity(book.getQuantity() + 1);
            bookRepository.save(book);
            log.info("[CHOREOGRAPHY - BookService - COMPENSATE] Đã hoàn lại sách vào kho. Tồn kho mới: {}", book.getQuantity());
        }

        BookCompensatedEvent compensatedEvent = new BookCompensatedEvent(event.getSagaId(), event.getBookId(), 1);
        kafkaTemplate.send("book.event.compensated", event.getSagaId(), compensatedEvent);
    }
}
