package com.library.management.service;

import com.library.management.entity.Category;
import com.library.management.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;
    public List<Category> getAllCate() {
        return categoryRepository.findAll();
    }
}
