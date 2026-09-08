package com.library.user.Exception;

import com.library.user.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandle {
    @ExceptionHandler(AppException.class)
    public ResponseEntity<?> HandleException(AppException appException) {
        ErrCode errCode = appException.getErrCode();
        ApiResponse<?> apiResponse = new ApiResponse<>();
        apiResponse.setCode(errCode.getCode());
        apiResponse.setMessage(errCode.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
    }
}
