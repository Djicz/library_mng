package com.library.user.saga;

import com.library.events.command.CheckUserOverdueCommand;
import com.library.events.reply.UserCheckedReply;
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
     * BƯỚC 3: Nhận Command Kiểm Tra Sách Quá Hạn từ Saga Orchestrator
     */
    @KafkaListener(topics = "user.cmd.check-overdue", groupId = "user-validator-group")
    public void handleCheckOverdueCommand(CheckUserOverdueCommand cmd) {
        log.info("[UserWorker] Nhận lệnh kiểm tra nợ quá hạn sagaId: {}, userId: {}", cmd.getSagaId(), cmd.getUserId());

        // Kiểm tra xem User có cuốn sách nào có dueDate < hôm nay và chưa trả không
        boolean hasOverdue = historyRepository.existsByUserIdAndDueDateBeforeAndIsReturnedFalse(
                cmd.getUserId(), LocalDate.now()
        );

        UserCheckedReply reply = new UserCheckedReply();
        reply.setSagaId(cmd.getSagaId());
        reply.setUserId(cmd.getUserId());

        if (hasOverdue) {
            reply.setEligible(false);
            reply.setReason("Tài khoản đang có sách quá hạn chưa hoàn trả!");
            log.warn("[UserWorker] PHÁT HIỆN USER CÓ SÁCH QUÁ HẠN! sagaId: {}, userId: {}", cmd.getSagaId(), cmd.getUserId());
        } else {
            reply.setEligible(true);
            reply.setReason("Tài khoản hợp lệ, không có sách quá hạn.");
            log.info("[UserWorker] User HỢP LỆ. sagaId: {}, userId: {}", cmd.getSagaId(), cmd.getUserId());
        }

        kafkaTemplate.send("user.reply.checked", cmd.getSagaId(), reply);
    }
}
