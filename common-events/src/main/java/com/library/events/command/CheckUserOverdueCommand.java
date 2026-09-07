package com.library.events.command;

import java.io.Serializable;
import java.util.UUID;

public class CheckUserOverdueCommand implements Serializable {
    private String sagaId;
    private UUID userId;

    public CheckUserOverdueCommand() {}

    public CheckUserOverdueCommand(String sagaId, UUID userId) {
        this.sagaId = sagaId;
        this.userId = userId;
    }

    public String getSagaId() { return sagaId; }
    public void setSagaId(String sagaId) { this.sagaId = sagaId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
}
