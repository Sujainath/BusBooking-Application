package com.ontimetravels.busbookingsystem.controller;

import com.ontimetravels.busbookingsystem.dto.AdminLoginRequest;
import com.ontimetravels.busbookingsystem.dto.LoginRequest;
import com.ontimetravels.busbookingsystem.dto.LoginResponse;
import com.ontimetravels.busbookingsystem.entity.User;
import com.ontimetravels.busbookingsystem.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/login")
    public ResponseEntity<LoginResponse> adminLogin(
            @RequestBody AdminLoginRequest request) {

        LoginResponse response =
                authService.adminLogin(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(
            @RequestBody User user) {

        User registeredUser =
                authService.register(user);

        return ResponseEntity.ok(registeredUser);
    }
}