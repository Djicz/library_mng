package com.library.management.controller;

import com.library.management.entity.BorrowRecord;
import com.library.management.service.BorrowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/manager/request")
public class RequestController {
    @Autowired
    BorrowService borrowService;

    @GetMapping
    public ResponseEntity<?> getAllRequest() {
        List<BorrowRecord> borrowRecords = borrowService.getAllBorrowRecords();
        List<BorrowRecord> request = new ArrayList<>();
        for(BorrowRecord br: borrowRecords) {
            if(br.getUsBook() == 1) {
                request.add(br);
            }
        }
        return ResponseEntity.ok(request);
    }
    @GetMapping("/book")
    public ResponseEntity<?> getAllBooks() {
        List<BorrowRecord> borrowRecords = borrowService.getAllBorrowRecords();
        List<BorrowRecord> request = new ArrayList<>();
        for(BorrowRecord br : borrowRecords) {
            if(br.getUsBook() == 2) {
                request.add(br);
            }
        }
        return ResponseEntity.ok(request);
    }
    @GetMapping("/end")
    public ResponseEntity<?> getAllEnd() {
        List<BorrowRecord> borrowRecords = borrowService.getAllBorrowRecords();
        List<BorrowRecord> request = new ArrayList<>();
        for(BorrowRecord br : borrowRecords) {
            if(br.getUsBook() == 4) {
                request.add(br);
            }
        }
        return ResponseEntity.ok(request);
    }
}
