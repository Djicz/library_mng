package com.library.borrow.saga;

import com.library.borrow.dto.BorrowRequestDTO;
import com.library.borrow.entity.BorrowRecord;
import com.library.borrow.repository.BorrowRecordRepository;
import com.library.events.dto.BorrowStatus;
import com.library.events.event.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class BorrowSagaOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(BorrowSagaOrchestrator.class);

    @Autowired
    private BorrowRecordRepository borrowRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * BƯỚC 0: TẠO YÊU CẦU MƯỢN SÁCH Ở TRẠNG THÁI PENDING (CHỜ THỦ THƯ DUYỆT)
     */
    @Transactional
    public BorrowRecord createPendingBorrow(BorrowRequestDTO request) {
        String sagaId = UUID.randomUUID().toString();
        log.info("[CHOREOGRAPHY - BorrowService] === TIẾP NHẬN ĐƠN MƯỢN PENDING: {} ===", sagaId);

        BorrowRecord record = new BorrowRecord();
        record.setSagaId(sagaId);
        record.setUserId(request.getUserId());
        record.setBookId(request.getBookId());
        record.setBorrowDate(LocalDate.now());
        record.setDueDate(request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(14));
        record.setStatus(BorrowStatus.PENDING);
        return borrowRepository.save(record);
    }

    /**
     * BƯỚC 1: KÍCH HOẠT SAGA CHOREOGRAPHY -> PHÁT EVENT 'borrow.event.created'
     */
    @Transactional
    public BorrowRecord startApprovedSaga(BorrowRecord record) {
        log.info("[CHOREOGRAPHY - BorrowService] === PHÁT SỰ KIỆN 'borrow.event.created' CHO SAGA: {} ===", record.getSagaId());

        record.setStatus(BorrowStatus.IN_PROGRESS);
        borrowRepository.save(record);

        BorrowCreatedEvent event = new BorrowCreatedEvent(
                record.getSagaId(), record.getUserId(), record.getBookId(), record.getDueDate()
        );
        kafkaTemplate.send("borrow.event.created", record.getSagaId(), event);

        return record;
    }

    /**
     * Khởi tạo và chạy trực tiếp Saga (cho Admin)
     */
    @Transactional
    public BorrowRecord initiateBorrowSaga(BorrowRequestDTO request) {
        BorrowRecord record = createPendingBorrow(request);
        return startApprovedSaga(record);
    }

    /**
     * SỰ KIỆN 1: Lắng nghe 'book.event.reserved' từ book-service
     */
    @Transactional
    @KafkaListener(topics = "book.event.reserved", groupId = "borrow-choreography-group")
    public void onBookReserved(BookReservedEvent event) {
        log.info("[CHOREOGRAPHY - BorrowService] Sách đã giữ kho thành công cho sagaId: {}", event.getSagaId());

        BorrowRecord record = borrowRepository.findBySagaId(event.getSagaId()).orElse(null);
        if (record != null) {
            record.setStatus(BorrowStatus.BOOK_RESERVED);
            borrowRepository.save(record);
        }
    }

    /**
     * SỰ KIỆN 2: Lắng nghe 'user.event.validated' từ user-service -> HOÀN TẤT THÀNH CÔNG!
     */
    @Transactional
    @KafkaListener(topics = "user.event.validated", groupId = "borrow-choreography-group")
    public void onUserValidated(UserValidatedEvent event) {
        log.info("[CHOREOGRAPHY - BorrowService] === HOÀN TẤT SAGA CHOREOGRAPHY THÀNH CÔNG: APPROVED! sagaId: {} ===", 
                event.getSagaId());

        BorrowRecord record = borrowRepository.findBySagaId(event.getSagaId()).orElse(null);
        if (record != null) {
            record.setStatus(BorrowStatus.APPROVED);
            borrowRepository.save(record);
        }
    }

    /**
     * SỰ KIỆN 3: Lắng nghe 'user.event.validation-failed' từ user-service -> USER NỢ QUÁ HẠN!
     */
    @Transactional
    @KafkaListener(topics = "user.event.validation-failed", groupId = "borrow-choreography-group")
    public void onUserValidationFailed(UserValidationFailedEvent event) {
        log.warn("[CHOREOGRAPHY - BorrowService] === SAGA ROLLBACK: USER NỢ QUÁ HẠN! sagaId: {} ===", event.getSagaId());

        BorrowRecord record = borrowRepository.findBySagaId(event.getSagaId()).orElse(null);
        if (record != null) {
            record.setStatus(BorrowStatus.REJECTED_OVERDUE);
            record.setRejectReason(event.getReason());
            borrowRepository.save(record);
        }
    }

    /**
     * SỰ KIỆN 4: Lắng nghe 'book.event.reserve-failed' từ book-service -> HẾT SÁCH KHO!
     */
    @Transactional
    @KafkaListener(topics = "book.event.reserve-failed", groupId = "borrow-choreography-group")
    public void onBookReserveFailed(BookReserveFailedEvent event) {
        log.warn("[CHOREOGRAPHY - BorrowService] === SAGA THẤT BẠI: HẾT SÁCH TRONG KHO! sagaId: {} ===", event.getSagaId());

        BorrowRecord record = borrowRepository.findBySagaId(event.getSagaId()).orElse(null);
        if (record != null) {
            record.setStatus(BorrowStatus.REJECTED_OUT_OF_STOCK);
            record.setRejectReason(event.getReason());
            borrowRepository.save(record);
        }
    }

    /**
     * SỰ KIỆN 5: Lắng nghe 'book.event.compensated' từ book-service
     */
    @Transactional
    @KafkaListener(topics = "book.event.compensated", groupId = "borrow-choreography-group")
    public void onBookCompensated(BookCompensatedEvent event) {
        log.info("[CHOREOGRAPHY - BorrowService] Đã nhận xác nhận hoàn kho cho sagaId: {}", event.getSagaId());
    }
}
