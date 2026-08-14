package com.library.management.entity;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "books")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String status; // "AVAILABLE", "BORROWED"

    public Book() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
