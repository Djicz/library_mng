package com.library.management.controller;

import com.library.management.entity.Category;
import com.library.management.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/manager/category")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;
    @GetMapping()
    public ResponseEntity<List<Category>> allCate() {
        return ResponseEntity.ok(categoryService.getAllCate());
    }
}
