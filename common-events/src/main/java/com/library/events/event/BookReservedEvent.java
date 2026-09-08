package com.library.events.event;

import java.time.LocalDate;
import java.util.UUID;

public class BookReservedEvent {
    private String sagaId;
    private UUID userId;
    private UUID bookId;
    private int quantity;
    private LocalDate dueDate;

    public BookReservedEvent() {}

    public BookReservedEvent(String sagaId, UUID userId, UUID bookId, int quantity, LocalDate dueDate) {
        this.sagaId = sagaId;
        this.userId = userId;
        this.bookId = bookId;
        this.quantity = quantity;
        this.dueDate = dueDate;
    }

    public String getSagaId() { return sagaId; }
    public void setSagaId(String sagaId) { this.sagaId = sagaId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getBookId() { return bookId; }
    public void setBookId(UUID bookId) { this.bookId = bookId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
}
