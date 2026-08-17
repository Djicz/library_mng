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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

//    @Column(nullable = false)
//    private String status; // "AVAILABLE", "BORROWED"
    @Column(nullable = false)
    private int quantity;
    public Book() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
//    public String getStatus() { return status; }
//    public void setStatus(String status) { this.status = status; }
    public int getQuantity() {return quantity;}
    public void setQuantity(int quantity) {this.quantity = quantity;}
}
