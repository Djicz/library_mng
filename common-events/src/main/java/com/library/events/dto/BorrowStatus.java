package com.library.events.dto;

public enum BorrowStatus {
    PENDING,                       // Chờ thủ thư duyệt
    IN_PROGRESS,                   // Đang thực hiện chuỗi sự kiện Saga
    BOOK_RESERVED,                 // Sách đã giữ kho, đang kiểm tra quá hạn
    APPROVED,                      // Mượn sách thành công
    COMPENSATING,                  // Đang rollback bù trừ
    REJECTED_OUT_OF_STOCK,         // Thất bại: Hết sách trong kho
    REJECTED_OVERDUE,              // Thất bại: Bạn đọc có sách nợ quá hạn
    REJECTED                       // Bị từ chối
}
