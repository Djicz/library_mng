package com.library.events.command;

import java.io.Serializable;
import java.util.UUID;

public class CompensateBookCommand implements Serializable {
    private String sagaId;
    private UUID bookId;
    private int quantity;
    private String reason;

    public CompensateBookCommand() {}

    public CompensateBookCommand(String sagaId, UUID bookId, int quantity, String reason) {
        this.sagaId = sagaId;
        this.bookId = bookId;
        this.quantity = quantity;
        this.reason = reason;
    }

    public String getSagaId() { return sagaId; }
    public void setSagaId(String sagaId) { this.sagaId = sagaId; }

    public UUID getBookId() { return bookId; }
    public void setBookId(UUID bookId) { this.bookId = bookId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
