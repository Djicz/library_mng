package com.library.borrow.controller;

import com.library.borrow.entity.BorrowRecord;
import com.library.borrow.service.BorrowService;
import com.library.events.dto.BorrowStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    @Autowired
    private BorrowService borrowService;

    @GetMapping
    public List<BorrowRecord> getPendingRequests() {
        return borrowService.getAllBorrowRecords().stream()
                .filter(r -> r.getStatus() == BorrowStatus.PENDING)
                .collect(Collectors.toList());
    }
}
