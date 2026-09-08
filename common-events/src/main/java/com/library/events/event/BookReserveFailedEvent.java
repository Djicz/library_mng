package com.library.events.event;

import java.util.UUID;

public class BookReserveFailedEvent {
    private String sagaId;
    private UUID bookId;
    private String reason;

    public BookReserveFailedEvent() {}

    public BookReserveFailedEvent(String sagaId, UUID bookId, String reason) {
        this.sagaId = sagaId;
        this.bookId = bookId;
        this.reason = reason;
    }

    public String getSagaId() { return sagaId; }
    public void setSagaId(String sagaId) { this.sagaId = sagaId; }

    public UUID getBookId() { return bookId; }
    public void setBookId(UUID bookId) { this.bookId = bookId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
