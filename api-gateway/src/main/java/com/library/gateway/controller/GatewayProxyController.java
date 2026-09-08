package com.library.gateway.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.util.Enumeration;

@RestController
public class GatewayProxyController {

    private final RestClient restClient = RestClient.create();

    @Value("${service.user.url:http://localhost:8081}")
    private String userServiceUrl;

    @Value("${service.book.url:http://localhost:8082}")
    private String bookServiceUrl;

    @Value("${service.borrow.url:http://localhost:8083}")
    private String borrowServiceUrl;

    // 1. User & Auth & Profile & Notification Routes -> User Service (8081)
    @RequestMapping(value = {
            "/api/auth",
            "/api/auth/**",
            "/api/users",
            "/api/users/**",
            "/api/profile",
            "/api/profile/**",
            "/api/notifications",
            "/api/notifications/**"
    }, method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH})
    public ResponseEntity<byte[]> proxyUser(HttpServletRequest request) throws IOException {
        return forward(request, userServiceUrl);
    }

    // 2. Book & Category Routes -> Book Service (8082)
    @RequestMapping(value = {
            "/api/books",
            "/api/books/**",
            "/api/categories",
            "/api/categories/**",
            "/api/manager/category",
            "/api/manager/category/**",
            "/api/manager/books",
            "/api/manager/books/**"
    }, method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH})
    public ResponseEntity<byte[]> proxyBook(HttpServletRequest request) throws IOException {
        return forward(request, bookServiceUrl);
    }

    // 3. Borrow, Manager Borrow, Requests & Dashboard Routes -> Borrow Service (8083)
    @RequestMapping(value = {
            "/api/borrows",
            "/api/borrows/**",
            "/api/borrower",
            "/api/borrower/**",
            "/api/manager/borrow",
            "/api/manager/borrow/**",
            "/api/manager/borrows",
            "/api/manager/borrows/**",
            "/api/requests",
            "/api/requests/**",
            "/api/dashboard",
            "/api/dashboard/**",
            "/api/manager/dashboard",
            "/api/manager/dashboard/**"
    }, method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH})
    public ResponseEntity<byte[]> proxyBorrow(HttpServletRequest request) throws IOException {
        return forward(request, borrowServiceUrl);
    }

    private ResponseEntity<byte[]> forward(HttpServletRequest request, String targetBaseUrl) throws IOException {
        String fullPath = request.getRequestURI();
        if (request.getQueryString() != null) {
            fullPath += "?" + request.getQueryString();
        }
        String targetUrl = targetBaseUrl + fullPath;

        HttpMethod method = HttpMethod.valueOf(request.getMethod());
        byte[] body = request.getInputStream().readAllBytes();

        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            if (!headerName.equalsIgnoreCase("host") && !headerName.equalsIgnoreCase("content-length")) {
                headers.add(headerName, request.getHeader(headerName));
            }
        }

        try {
            return restClient.method(method)
                    .uri(targetUrl)
                    .headers(httpHeaders -> httpHeaders.addAll(headers))
                    .body(body)
                    .retrieve()
                    .toEntity(byte[].class);
        } catch (org.springframework.web.client.HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsByteArray());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(("Gateway Error: " + ex.getMessage()).getBytes());
        }
    }
}
