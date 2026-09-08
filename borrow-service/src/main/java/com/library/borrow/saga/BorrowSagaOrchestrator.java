package com.library.borrow.saga;

import com.library.borrow.dto.BorrowRequestDTO;
import com.library.borrow.entity.BorrowRecord;
import com.library.borrow.repository.BorrowRecordRepository;
import com.library.events.command.CheckUserOverdueCommand;
import com.library.events.command.CompensateBookCommand;
import com.library.events.command.ReserveBookCommand;
import com.library.events.dto.BorrowStatus;
import com.library.events.reply.BookCompensatedReply;
import com.library.events.reply.BookReservedReply;
import com.library.events.reply.UserCheckedReply;
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
        log.info("[SAGA ORCHESTRATOR] === TIẾP NHẬN YÊU CẦU MƯỢN SÁCH (PENDING): {} ===", sagaId);

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
     * BƯỚC 1: ADMIN PHÊ DUYỆT -> KÍCH HOẠT SAGA & GỬI LỆNH TRỪ KHO SÁCH
     */
    @Transactional
    public BorrowRecord startApprovedSaga(BorrowRecord record) {
        log.info("[SAGA ORCHESTRATOR] === ADMIN ĐÃ DUYỆT. KÍCH HOẠT SAGA TRỪ KHO: {} ===", record.getSagaId());

        record.setStatus(BorrowStatus.IN_PROGRESS);
        borrowRepository.save(record);

        // Orchestrator phát Command 1: Trừ kho sách
        ReserveBookCommand cmd = new ReserveBookCommand(record.getSagaId(), record.getBookId(), 1);
        log.info("[SAGA ORCHESTRATOR] 1. Phát command trừ kho 'book.cmd.reserve' cho bookId: {}", record.getBookId());
        kafkaTemplate.send("book.cmd.reserve", record.getSagaId(), cmd);

        return record;
    }

    /**
     * Tự động khởi tạo và chạy Saga trực tiếp (nếu cần)
     */
    @Transactional
    public BorrowRecord initiateBorrowSaga(BorrowRequestDTO request) {
        BorrowRecord record = createPendingBorrow(request);
        return startApprovedSaga(record);
    }

    /**
     * BƯỚC 2: NHẬN PHẢN HỒI TRỪ KHO TỪ BOOK-SERVICE
     */
    @Transactional
    @KafkaListener(topics = "book.reply.reserved", groupId = "borrow-orchestrator-group")
    public void onBookReservedReply(BookReservedReply reply) {
        log.info("[SAGA ORCHESTRATOR] 2. Nhận kết quả trừ kho từ book-service. sagaId: {}, success: {}", 
                reply.getSagaId(), reply.isSuccess());

        BorrowRecord record = borrowRepository.findBySagaId(reply.getSagaId()).orElse(null);
        if (record == null) {
            log.error("[SAGA ORCHESTRATOR] Không tìm thấy saga record: {}", reply.getSagaId());
            return;
        }

        if (reply.isSuccess()) {
            record.setStatus(BorrowStatus.BOOK_RESERVED);
            borrowRepository.save(record);

            // Kho OK -> Tiếp tục phát Command 2: Kiểm tra User nợ quá hạn
            CheckUserOverdueCommand cmd = new CheckUserOverdueCommand(reply.getSagaId(), record.getUserId());
            log.info("[SAGA ORCHESTRATOR] 3. Phát command kiểm tra quá hạn 'user.cmd.check-overdue' cho userId: {}", record.getUserId());
            kafkaTemplate.send("user.cmd.check-overdue", reply.getSagaId(), cmd);
        } else {
            // Kho hết sách -> Thất bại sớm (Không cần bù trừ vì chưa trừ kho)
            record.setStatus(BorrowStatus.REJECTED_OUT_OF_STOCK);
            record.setRejectReason(reply.getReason());
            borrowRepository.save(record);
            log.warn("[SAGA ORCHESTRATOR] KẾT THÚC SAGA: Thất bại do hết sách trong kho! sagaId: {}", reply.getSagaId());
        }
    }

    /**
     * BƯỚC 3: NHẬN PHẢN HỒI CHECK QUÁ HẠN TỪ USER-SERVICE
     */
    @Transactional
    @KafkaListener(topics = "user.reply.checked", groupId = "borrow-orchestrator-group")
    public void onUserCheckedReply(UserCheckedReply reply) {
        log.info("[SAGA ORCHESTRATOR] 4. Nhận kết quả kiểm tra User từ user-service. sagaId: {}, eligible: {}", 
                reply.getSagaId(), reply.isEligible());

        BorrowRecord record = borrowRepository.findBySagaId(reply.getSagaId()).orElse(null);
        if (record == null) return;

        if (reply.isEligible()) {
            // User hợp lệ -> MƯỢN SÁCH THÀNH CÔNG HOÀN TOÀN!
            record.setStatus(BorrowStatus.APPROVED);
            borrowRepository.save(record);
            log.info("[SAGA ORCHESTRATOR] === HOÀN TẤT SAGA THÀNH CÔNG: APPROVED! sagaId: {} ===", reply.getSagaId());
        } else {
            // USER CÓ SÁCH QUÁ HẠN -> KÍCH HOẠT GIAO DỊCH BÙ TRỪ HOÀN KHO!
            record.setStatus(BorrowStatus.COMPENSATING);
            record.setRejectReason(reply.getReason());
            borrowRepository.save(record);

            log.warn("[SAGA ORCHESTRATOR] USER CÓ SÁCH QUÁ HẠN! Kích hoạt Bù Trừ 'book.cmd.compensate' (+1) cho sagaId: {}", reply.getSagaId());
            CompensateBookCommand compensateCmd = new CompensateBookCommand(
                    record.getSagaId(), record.getBookId(), 1, "USER_OVERDUE_REJECTED"
            );
            kafkaTemplate.send("book.cmd.compensate", record.getSagaId(), compensateCmd);
        }
    }

    /**
     * BƯỚC 4: NHẬN XÁC NHẬN BÙ TRỪ HOÀN KHO TỪ BOOK-SERVICE
     */
    @Transactional
    @KafkaListener(topics = "book.reply.compensated", groupId = "borrow-orchestrator-group")
    public void onBookCompensatedReply(BookCompensatedReply reply) {
        log.info("[SAGA ORCHESTRATOR] 5. Nhận xác nhận đã hoàn kho (+1). sagaId: {}", reply.getSagaId());

        BorrowRecord record = borrowRepository.findBySagaId(reply.getSagaId()).orElse(null);
        if (record != null) {
            record.setStatus(BorrowStatus.REJECTED_OVERDUE);
            borrowRepository.save(record);
            log.info("[SAGA ORCHESTRATOR] === SAGA ROLLBACK HOÀN TẤT: REJECTED_OVERDUE! sagaId: {} ===", reply.getSagaId());
        }
    }
}
