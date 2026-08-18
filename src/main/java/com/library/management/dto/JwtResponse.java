package com.library.management.dto;

import java.util.UUID;

public class JwtResponse {
    private String token;
    private String role;
    private String username;
    private UUID id;

    public JwtResponse(String token, String role, String username, UUID id) {
        this.token = token;
        this.role = role;
        this.username = username;
        this.id = id;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }
}
