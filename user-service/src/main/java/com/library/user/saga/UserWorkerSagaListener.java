package com.library.user.saga;

import com.library.events.event.BookReservedEvent;
import com.library.events.event.UserValidatedEvent;
import com.library.events.event.UserValidationFailedEvent;
import com.library.user.repository.UserBorrowHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class UserWorkerSagaListener {

    private static final Logger log = LoggerFactory.getLogger(UserWorkerSagaListener.class);

    @Autowired
    private UserBorrowHistoryRepository historyRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * BƯỚC 2: Lắng nghe sự kiện sách đã được giữ (BookReservedEvent) từ book-service
     */
    @KafkaListener(topics = "book.event.reserved", groupId = "user-choreography-group")
    public void onBookReserved(BookReservedEvent event) {
        log.info("[CHOREOGRAPHY - UserService] Nhận sự kiện 'book.event.reserved' cho sagaId: {}, userId: {}", 
                event.getSagaId(), event.getUserId());

        // Kiểm tra xem User có cuốn sách nào có dueDate < hôm nay và chưa trả không
        boolean hasOverdue = historyRepository.existsByUserIdAndDueDateBeforeAndIsReturnedFalse(
                event.getUserId(), LocalDate.now()
        );

        if (hasOverdue) {
            log.warn("[CHOREOGRAPHY - UserService] PHÁT HIỆN USER CÓ SÁCH QUÁ HẠN! sagaId: {}, userId: {}", 
                    event.getSagaId(), event.getUserId());
            UserValidationFailedEvent failedEvent = new UserValidationFailedEvent(
                    event.getSagaId(), event.getUserId(), event.getBookId(), "Tài khoản đang có sách quá hạn chưa hoàn trả!"
            );
            // Phát sự kiện thất bại -> book-service và borrow-service đều sẽ lắng nghe
            kafkaTemplate.send("user.event.validation-failed", event.getSagaId(), failedEvent);
        } else {
            log.info("[CHOREOGRAPHY - UserService] User HỢP LỆ! sagaId: {}, userId: {}", 
                    event.getSagaId(), event.getUserId());
            UserValidatedEvent validatedEvent = new UserValidatedEvent(
                    event.getSagaId(), event.getUserId(), event.getBookId()
            );
            // Phát sự kiện thành công -> borrow-service sẽ cập nhật APPROVED
            kafkaTemplate.send("user.event.validated", event.getSagaId(), validatedEvent);
        }
    }
}
