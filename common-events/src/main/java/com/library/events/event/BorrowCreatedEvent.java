package com.library.events.event;

import java.time.LocalDate;
import java.util.UUID;

public class BorrowCreatedEvent {
    private String sagaId;
    private UUID userId;
    private UUID bookId;
    private LocalDate dueDate;

    public BorrowCreatedEvent() {}

    public BorrowCreatedEvent(String sagaId, UUID userId, UUID bookId, LocalDate dueDate) {
        this.sagaId = sagaId;
        this.userId = userId;
        this.bookId = bookId;
        this.dueDate = dueDate;
    }

    public String getSagaId() { return sagaId; }
    public void setSagaId(String sagaId) { this.sagaId = sagaId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getBookId() { return bookId; }
    public void setBookId(UUID bookId) { this.bookId = bookId; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
}
