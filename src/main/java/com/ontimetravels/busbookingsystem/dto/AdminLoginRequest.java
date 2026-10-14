
package com.ontimetravels.busbookingsystem.dto;

public class AdminLoginRequest {

    private String adminName;
    private String adminKey;

    public AdminLoginRequest() {
    }

    public AdminLoginRequest(
            String adminName,
            String adminKey) {
        this.adminName = adminName;
        this.adminKey = adminKey;
    }

    public String getAdminName() {
        return adminName;
    }

    public void setAdminName(String adminName) {
        this.adminName = adminName;
    }

    public String getAdminKey() {
        return adminKey;
    }

    public void setAdminKey(String adminKey) {
        this.adminKey = adminKey;
    }
}
