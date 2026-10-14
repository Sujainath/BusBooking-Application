package com.ontimetravels.busbookingsystem.dto;

import com.ontimetravels.busbookingsystem.entity.User;

public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String gender;
    private User.Role role;

    public UserResponse() {
    }

    public UserResponse(User user) {
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.gender = user.getGender().name();
        this.role = user.getRole();
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getGender() {
        return gender;
    }

    public User.Role getRole() {
        return role;
    }
}