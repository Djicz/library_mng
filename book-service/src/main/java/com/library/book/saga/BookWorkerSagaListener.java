package com.library.book.saga;

import com.library.book.entity.Book;
import com.library.book.repository.BookRepository;
import com.library.events.command.CompensateBookCommand;
import com.library.events.command.ReserveBookCommand;
import com.library.events.reply.BookCompensatedReply;
import com.library.events.reply.BookReservedReply;
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
     * BƯỚC 2: Nhận Command Trừ Kho từ Saga Orchestrator
     */
    @Transactional
    @KafkaListener(topics = "book.cmd.reserve", groupId = "book-inventory-group")
    public void handleReserveCommand(ReserveBookCommand cmd) {
        log.info("[BookWorker] Nhận lệnh trừ kho sagaId: {}, bookId: {}, qty: {}", cmd.getSagaId(), cmd.getBookId(), cmd.getQuantity());

        BookReservedReply reply = new BookReservedReply();
        reply.setSagaId(cmd.getSagaId());

        Optional<Book> bookOpt = bookRepository.findById(cmd.getBookId());
        if (bookOpt.isPresent()) {
            Book book = bookOpt.get();
            if (book.getQuantity() >= cmd.getQuantity()) {
                book.setQuantity(book.getQuantity() - cmd.getQuantity());
                bookRepository.save(book);
                reply.setSuccess(true);
                log.info("[BookWorker] Trừ kho THÀNH CÔNG cho sagaId: {}. Tồn kho mới: {}", cmd.getSagaId(), book.getQuantity());
            } else {
                reply.setSuccess(false);
                reply.setReason("Hết sách trong kho (Số lượng còn 0)");
                log.warn("[BookWorker] Hết kho cho sagaId: {}", cmd.getSagaId());
            }
        } else {
            reply.setSuccess(false);
            reply.setReason("Không tìm thấy sách với ID: " + cmd.getBookId());
            log.error("[BookWorker] Không tìm thấy sách: {}", cmd.getBookId());
        }

        kafkaTemplate.send("book.reply.reserved", cmd.getSagaId(), reply);
    }

    /**
     * GIAO DỊCH BÙ TRỪ: Nhận Command Bù Trừ Hoàn Kho từ Saga Orchestrator
     */
    @Transactional
    @KafkaListener(topics = "book.cmd.compensate", groupId = "book-inventory-group")
    public void handleCompensateCommand(CompensateBookCommand cmd) {
        log.info("[BookWorker - COMPENSATE] Nhận lệnh BÙ TRỪ HOÀN KHO sagaId: {}, bookId: {}, qty: {}", 
                cmd.getSagaId(), cmd.getBookId(), cmd.getQuantity());

        Optional<Book> bookOpt = bookRepository.findById(cmd.getBookId());
        if (bookOpt.isPresent()) {
            Book book = bookOpt.get();
            book.setQuantity(book.getQuantity() + cmd.getQuantity()); // Hoàn lại +1
            bookRepository.save(book);
            log.info("[BookWorker - COMPENSATE] Đã hoàn lại sách vào kho. Tồn kho mới: {}", book.getQuantity());
        }

        BookCompensatedReply reply = new BookCompensatedReply(cmd.getSagaId(), true);
        kafkaTemplate.send("book.reply.compensated", cmd.getSagaId(), reply);
    }
}
