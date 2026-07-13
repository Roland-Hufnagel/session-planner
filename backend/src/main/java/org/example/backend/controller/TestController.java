package org.example.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController("/api")
public class TestController {

    @GetMapping("/test")
    public String test() {
        return "This is a test";
    }
}
