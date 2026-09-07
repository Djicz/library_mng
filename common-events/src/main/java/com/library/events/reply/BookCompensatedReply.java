package com.library.events.reply;

import java.io.Serializable;

public class BookCompensatedReply implements Serializable {
    private String sagaId;
    private boolean success;

    public BookCompensatedReply() {}

    public BookCompensatedReply(String sagaId, boolean success) {
        this.sagaId = sagaId;
        this.success = success;
    }

    public String getSagaId() { return sagaId; }
    public void setSagaId(String sagaId) { this.sagaId = sagaId; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
}
