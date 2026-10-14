package com.ontimetravels.busbookingsystem.controller;

import com.ontimetravels.busbookingsystem.dto.AdminDashboardResponse;
import com.ontimetravels.busbookingsystem.service.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(
            AdminDashboardService adminDashboardService) {

        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<AdminDashboardResponse> getDashboardSummary() {

        return ResponseEntity.ok(
                adminDashboardService.getDashboardSummary()
        );
    }
}