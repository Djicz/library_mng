package com.library.management.dto;

import java.util.UUID;

public class UserResponse {
    private String username;
    private UUID id;
    private String displayName;
    private String status;
    private String role;

    public UserResponse(String username, UUID id, String displayName, String status, String role) {
        this.username = username;
        this.id = id;
        this.displayName = displayName;
        this.status = status;
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
