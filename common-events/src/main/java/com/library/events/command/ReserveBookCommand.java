package com.library.events.command;

import java.io.Serializable;
import java.util.UUID;

public class ReserveBookCommand implements Serializable {
    private String sagaId;
    private UUID bookId;
    private int quantity;

    public ReserveBookCommand() {}

    public ReserveBookCommand(String sagaId, UUID bookId, int quantity) {
        this.sagaId = sagaId;
        this.bookId = bookId;
        this.quantity = quantity;
    }

    public String getSagaId() { return sagaId; }
    public void setSagaId(String sagaId) { this.sagaId = sagaId; }

    public UUID getBookId() { return bookId; }
    public void setBookId(UUID bookId) { this.bookId = bookId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
