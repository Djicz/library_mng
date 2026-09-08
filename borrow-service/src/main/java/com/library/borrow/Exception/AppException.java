package com.library.borrow.Exception;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class AppException extends RuntimeException {
    private ErrCode errCode;

    public AppException(ErrCode errCode) {
        super(errCode.getMessage());
        this.errCode = errCode;
    }
}
