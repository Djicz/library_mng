package com.library.events.reply;

import java.io.Serializable;
import java.util.UUID;

public class UserCheckedReply implements Serializable {
    private String sagaId;
    private UUID userId;
    private boolean eligible;
    private String reason;

    public UserCheckedReply() {}

    public UserCheckedReply(String sagaId, UUID userId, boolean eligible, String reason) {
        this.sagaId = sagaId;
        this.userId = userId;
        this.eligible = eligible;
        this.reason = reason;
    }

    public String getSagaId() { return sagaId; }
    public void setSagaId(String sagaId) { this.sagaId = sagaId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public boolean isEligible() { return eligible; }
    public void setEligible(boolean eligible) { this.eligible = eligible; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
