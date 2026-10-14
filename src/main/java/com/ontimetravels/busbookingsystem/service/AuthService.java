
package com.ontimetravels.busbookingsystem.service;

import com.ontimetravels.busbookingsystem.dto.AdminLoginRequest;
import com.ontimetravels.busbookingsystem.dto.LoginRequest;
import com.ontimetravels.busbookingsystem.dto.LoginResponse;
import com.ontimetravels.busbookingsystem.entity.User;
import com.ontimetravels.busbookingsystem.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserService userService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserService userService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password"
                        ));

        if (!user.isActive()) {
            throw new IllegalArgumentException(
                    "User account is inactive"
            );
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        return new LoginResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    public LoginResponse adminLogin(AdminLoginRequest request) {

        if (request.getAdminName() == null ||
                !"sujainath".equals(
                        request.getAdminName()
                                .trim()
                                .toLowerCase(Locale.ROOT))) {

            throw new IllegalArgumentException(
                    "Invalid admin name"
            );
        }

        if (!"2803".equals(request.getAdminKey())) {
            throw new IllegalArgumentException(
                    "Invalid admin key"
            );
        }

        User user = userRepository
                .findByEmail("arun2026@gmail.com")
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Admin account not found"
                        ));

        if (!user.isActive()) {
            throw new IllegalArgumentException(
                    "Admin account is inactive"
            );
        }

        if (user.getRole() != User.Role.ADMIN) {
            throw new IllegalArgumentException(
                    "Access denied. Admin account required"
            );
        }

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        return new LoginResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    public User register(User user) {
        return userService.registerUser(user);
    }
}
