package com.library.management.controller.GlobalExceptionHandler;

public class BadCredentialsException extends RuntimeException {
    public BadCredentialsException(String message) {
        super(message);
    }
}
