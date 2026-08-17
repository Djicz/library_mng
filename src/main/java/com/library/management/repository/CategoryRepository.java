package com.library.management.repository;

import com.library.management.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public class CategoryRepository extends JpaRepository<Category, UUID> {
    
}
