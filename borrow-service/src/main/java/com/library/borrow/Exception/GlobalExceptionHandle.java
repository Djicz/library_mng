package com.library.borrow.Exception;

import com.library.borrow.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandle {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandle.class);

    @ExceptionHandler(AppException.class)
    public ResponseEntity<?> handleAppException(AppException appException) {
        ErrCode errCode = appException.getErrCode();
        ApiResponse<?> apiResponse = new ApiResponse<>();
        apiResponse.setCode(errCode.getCode());
        apiResponse.setMessage(errCode.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception ex) {
        log.error("[BORROW-SERVICE ERROR] Unhandled Exception:", ex);
        ApiResponse<?> apiResponse = new ApiResponse<>();
        apiResponse.setCode(9999);
        apiResponse.setMessage("Lỗi xử lý mượn sách: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
    }
}
