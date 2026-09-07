package com.library.borrow.dto;

import java.time.LocalDate;
import java.util.UUID;

public class BorrowRequestDTO {
    private UUID userId;
    private UUID bookId;
    private LocalDate dueDate;

    public BorrowRequestDTO() {}

    public BorrowRequestDTO(UUID userId, UUID bookId, LocalDate dueDate) {
        this.userId = userId;
        this.bookId = bookId;
        this.dueDate = dueDate;
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getBookId() { return bookId; }
    public void setBookId(UUID bookId) { this.bookId = bookId; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
}
