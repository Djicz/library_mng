package com.library.book.service;

import com.library.book.entity.Category;
import com.library.book.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category createCategory(String name) {
        return categoryRepository.save(new Category(name));
    }

    public Optional<Category> updateCategory(UUID id, String name) {
        return categoryRepository.findById(id).map(cate -> {
            cate.setName(name);
            return categoryRepository.save(cate);
        });
    }

    public void deleteCategory(UUID id) {
        categoryRepository.deleteById(id);
    }
}
