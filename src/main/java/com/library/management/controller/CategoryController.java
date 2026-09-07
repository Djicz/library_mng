package com.library.management.controller;

import com.library.management.dto.CategoryRequest;
import com.library.management.entity.Category;
import com.library.management.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/manager/category")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;
    @GetMapping()
    public ResponseEntity<List<Category>> allCate() {
        return ResponseEntity.ok(categoryService.getAllCate());
    }
    @PostMapping("/add")
    public ResponseEntity<?> addNewCate(@RequestBody CategoryRequest categoryRequest) {
        try{return ResponseEntity.ok(categoryService.addNewCate(categoryRequest));}
        catch(Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PostMapping("/update/{id}")
    public ResponseEntity<?> updateCate(@PathVariable UUID id, @RequestBody CategoryRequest categoryRequest) {
        return ResponseEntity.ok(categoryService.updateCate(id, categoryRequest));
    }
    @DeleteMapping("/del/{id}")
    public ResponseEntity<?> deleteCate(@PathVariable UUID id) {
        try {
            categoryService.deleteCate(id);
            return ResponseEntity.ok("Xóa thành công");
        }
        catch(Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
