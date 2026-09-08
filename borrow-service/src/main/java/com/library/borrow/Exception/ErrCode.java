package com.library.borrow.Exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ErrCode {
    BORROW_RECORD_NOTFOUND(2001, "Không tìm thấy thông tin phiếu mượn"),
    BORROW_FAILED(2002, "Mượn sách không thành công"),
    UNCATEGORIZED_EXCEPTION(9999, "Lỗi không xác định")
    ;
    private int code;
    private String message;
}
