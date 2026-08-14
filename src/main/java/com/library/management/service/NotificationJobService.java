package com.library.management.service;

import com.library.management.entity.BorrowRecord;
import com.library.management.entity.Notification;
import com.library.management.repository.BorrowRecordRepository;
import com.library.management.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class NotificationJobService {

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    // Run every day at midnight (for demo, you can change cron to run more frequently)
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void processOverdueAndDueSoonNotifications() {
        List<BorrowRecord> activeRecords = borrowRecordRepository.findByReturnDateIsNull();
        LocalDate today = LocalDate.now();

        for (BorrowRecord record : activeRecords) {
            LocalDate dueDate = record.getDueDate();
            if (dueDate == null) {
                continue;
            }
            long daysBetween = ChronoUnit.DAYS.between(today, dueDate);

            String message = null;
            if (daysBetween < 0) {
                message = "Sách '" + record.getBook().getName() + "' của bạn đã quá hạn trả " + Math.abs(daysBetween) + " ngày!";
            } else if (daysBetween <= 2) {
                message = "Sách '" + record.getBook().getName() + "' chuẩn bị đến hạn trả vào ngày " + dueDate + " (" + daysBetween + " ngày nữa).";
            } else {
                message = "Bạn đang mượn sách '" + record.getBook().getName() + "'. Vui lòng trả trước ngày " + dueDate + ".";
            }

            if (message != null) {
                Notification notif = new Notification();
                notif.setUser(record.getUser());
                notif.setMessage(message);
                notif.setCreatedAt(LocalDateTime.now());
                notif.setRead(false);
                notificationRepository.save(notif);
            }
        }
    }
}
