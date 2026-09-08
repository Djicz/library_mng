package com.library.events.event;

import java.util.UUID;

public class UserValidatedEvent {
    private String sagaId;
    private UUID userId;
    private UUID bookId;

    public UserValidatedEvent() {}

    public UserValidatedEvent(String sagaId, UUID userId, UUID bookId) {
        this.sagaId = sagaId;
        this.userId = userId;
        this.bookId = bookId;
    }

    public String getSagaId() { return sagaId; }
    public void setSagaId(String sagaId) { this.sagaId = sagaId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getBookId() { return bookId; }
    public void setBookId(UUID bookId) { this.bookId = bookId; }
}
