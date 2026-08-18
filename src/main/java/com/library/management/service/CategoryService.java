package com.library.management.service;

import com.library.management.controller.GlobalExceptionHandler.CategoryNotFoundException;
import com.library.management.dto.CategoryRequest;
import com.library.management.entity.Category;
import com.library.management.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;
    public List<Category> getAllCate() {
        return categoryRepository.findAll();
    }
    public Category addNewCate(CategoryRequest categoryRequest) {
        Category category = new Category();
        category.setName(categoryRequest.getName());
        return categoryRepository.save(category);
    }
    @Transactional
    public void deleteCate(UUID id) {
        categoryRepository.deleteById(id);
    }
    public Category updateCate(UUID id,CategoryRequest categoryRequest) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new CategoryNotFoundException("Ô nô"));
        category.setName(categoryRequest.getName());
        return categoryRepository.save(category);
    }
}
