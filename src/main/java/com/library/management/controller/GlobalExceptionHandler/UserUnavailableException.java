package com.library.management.controller.GlobalExceptionHandler;

public class UserUnavailableException extends RuntimeException {
    public UserUnavailableException(String message) {
        super(message);
    }
}
