package com.library.book.Exception;

import lombok.Data;

@Data
public class AppException extends RuntimeException{
    ErrCode errCode;
    public AppException(ErrCode errCode) {
        super(errCode.getMessage());
        this.errCode = errCode;
    }
}
