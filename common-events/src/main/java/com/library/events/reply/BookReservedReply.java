package com.library.events.reply;

import java.io.Serializable;

public class BookReservedReply implements Serializable {
    private String sagaId;
    private boolean success;
    private String reason;

    public BookReservedReply() {}

    public BookReservedReply(String sagaId, boolean success, String reason) {
        this.sagaId = sagaId;
        this.success = success;
        this.reason = reason;
    }

    public String getSagaId() { return sagaId; }
    public void setSagaId(String sagaId) { this.sagaId = sagaId; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
