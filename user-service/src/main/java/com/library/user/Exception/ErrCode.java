package com.library.user.Exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ErrCode {
    USER_NOTFOUND(1001, "Không tìm thấy người dùng"),
    USER_EXISTED(1002, "Tài khoản đã tồn tại"),
    WRONG_PASSWORD(1003, "Sai mật khẩu"),
    ACCOUNT_LOCKED(1004, "Tài khoản này đã bị khóa, vui lòng liên hệ admin để biết thêm chi tiết"),
    UNAUTHORIZED(1005, "Chưa xác thực hoặc không có quyền truy cập"),
    NOTIFICATION_NOTFOUND(1006, "Không tìm thấy thông báo"),
    UNCATEGORIZED_EXCEPTION(9999, "Lỗi không xác định")
    ;
    private int code;
    private String message;
}
