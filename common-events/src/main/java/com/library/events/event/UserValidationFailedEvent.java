package com.library.events.event;

import java.util.UUID;

public class UserValidationFailedEvent {
    private String sagaId;
    private UUID userId;
    private UUID bookId;
    private String reason;

    public UserValidationFailedEvent() {}

    public UserValidationFailedEvent(String sagaId, UUID userId, UUID bookId, String reason) {
        this.sagaId = sagaId;
        this.userId = userId;
        this.bookId = bookId;
        this.reason = reason;
    }

    public String getSagaId() { return sagaId; }
    public void setSagaId(String sagaId) { this.sagaId = sagaId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getBookId() { return bookId; }
    public void setBookId(UUID bookId) { this.bookId = bookId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
