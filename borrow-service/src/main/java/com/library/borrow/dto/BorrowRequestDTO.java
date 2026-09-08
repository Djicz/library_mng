package com.library.borrow.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public class BorrowRequestDTO {
    private UUID userId;
    private UUID bookId;
    private LocalDate dueDate;
    private Integer borrowDays;

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

    public LocalDate getDueDate() {
        if (dueDate == null && borrowDays != null && borrowDays > 0) {
            return LocalDate.now().plusDays(borrowDays);
        }
        return dueDate != null ? dueDate : LocalDate.now().plusDays(14);
    }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public Integer getBorrowDays() { return borrowDays; }
    public void setBorrowDays(Integer borrowDays) { this.borrowDays = borrowDays; }
}
