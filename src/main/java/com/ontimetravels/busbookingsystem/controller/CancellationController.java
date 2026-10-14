package com.ontimetravels.busbookingsystem.controller;

import com.ontimetravels.busbookingsystem.entity.Cancellation;
import com.ontimetravels.busbookingsystem.service.CancellationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cancellations")
@CrossOrigin(origins = "*")
public class CancellationController {

    private final CancellationService cancellationService;

    public CancellationController(
            CancellationService cancellationService) {

        this.cancellationService = cancellationService;
    }

    @PostMapping("/{bookingId}")
    public ResponseEntity<Cancellation> cancelBooking(
            @PathVariable Long bookingId) {

        Cancellation cancellation =
                cancellationService.cancelBooking(bookingId);

        return ResponseEntity.ok(cancellation);
    }

    // ==============================
    // ADMIN CANCELLATION MANAGEMENT
    // ==============================

    @GetMapping("/all")
    public ResponseEntity<List<Cancellation>> getAllCancellations() {

        return ResponseEntity.ok(
                cancellationService.getAllCancellations()
        );
    }

    @GetMapping("/{cancellationId}")
    public ResponseEntity<Cancellation> getCancellationById(
            @PathVariable Long cancellationId) {

        return ResponseEntity.ok(
                cancellationService.getCancellationById(
                        cancellationId
                )
        );
    }
}