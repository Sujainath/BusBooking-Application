package com.ontimetravels.busbookingsystem.service;

import com.ontimetravels.busbookingsystem.entity.User;
import com.ontimetravels.busbookingsystem.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException(
                    "Email already registered"
            );
        }

        if (userRepository.existsByPhone(user.getPhone())) {
            throw new IllegalArgumentException(
                    "Phone number already registered"
            );
        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        user.setRole(User.Role.PASSENGER);
        user.setActive(true);

        return userRepository.save(user);
    }

    public List<User> getAllUsers() {

        return userRepository.findAll();
    }

    public User getUserById(Long userId) {

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found: " + userId
                        ));
    }

    public User updateUserStatus(
            Long userId,
            boolean active) {

        User user = getUserById(userId);

        user.setActive(active);

        return userRepository.save(user);
    }
}