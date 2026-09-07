package com.library.management.controller.GlobalExceptionHandler;

public class BookNotFoundException extends RuntimeException {
    public BookNotFoundException(String message) {
        super(message);
    }
}
