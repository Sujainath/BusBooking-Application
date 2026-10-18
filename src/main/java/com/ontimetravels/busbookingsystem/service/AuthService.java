
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

    private static final String ADMIN_NAME = "sujainath";
    private static final String ADMIN_KEY_ENV = "ADMIN_KEY";

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

        if (request == null
                || request.getAdminName() == null
                || !ADMIN_NAME.equals(
                        request.getAdminName()
                                .trim()
                                .toLowerCase(Locale.ROOT))) {

            throw new IllegalArgumentException(
                    "Invalid admin name"
            );
        }

        String expectedKey = System.getenv(ADMIN_KEY_ENV);

        if (expectedKey == null
                || expectedKey.isBlank()
                || request.getAdminKey() == null
                || !expectedKey.equals(request.getAdminKey())) {

            throw new IllegalArgumentException(
                    "Invalid admin key"
            );
        }

        String token = jwtService.generateToken(
                0L,
                "admin",
                User.Role.ADMIN.name()
        );

        return new LoginResponse(
                token,
                0L,
                "Admin",
                "admin",
                User.Role.ADMIN.name()
        );
    }

    public User register(User user) {
        return userService.registerUser(user);
    }
}
