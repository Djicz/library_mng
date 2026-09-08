package com.library.events.dto;

public enum BorrowStatus {
    PENDING,                       // Bước 0: Bạn đọc gửi yêu cầu, chờ thủ thư duyệt
    REJECTED,                      // Bị thủ thư từ chối (không cần chạy Saga)
    IN_PROGRESS,                   // Bước 1: Thủ thư đã duyệt, Saga khởi chạy trừ kho
    BOOK_RESERVED,                 // Bước 2: Đã trừ kho, đang check user
    APPROVED,                      // Bước 3: User hợp lệ -> Mượn thành công
    COMPENSATING,                  // Bù trừ: User quá hạn -> Đang hoàn lại kho
    REJECTED_OUT_OF_STOCK,         // Thất bại: Kho hết sách
    REJECTED_OVERDUE               // Thất bại: User nợ sách quá hạn (đã hoàn kho)
}

