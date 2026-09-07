package com.library.book.Exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
public enum ErrCode {
    BOOK_NOTFOUND(1001, "Không tìm thấy sách"),
    BOOK_EXISTED(1002, "Sách đã tồn tại")
    ;
    private int code;
    private String message;
}
