package com.ontimetravels.busbookingsystem.controller;

import com.ontimetravels.busbookingsystem.entity.Payment;
import com.ontimetravels.busbookingsystem.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/{bookingId}")
    public ResponseEntity<Payment> processPayment(
            @PathVariable Long bookingId) {

        Payment payment =
                paymentService.processPayment(bookingId);

        return ResponseEntity.ok(payment);
    }

    // ==============================
    // ADMIN PAYMENT MANAGEMENT
    // ==============================

    @GetMapping("/all")
    public ResponseEntity<List<Payment>> getAllPayments() {

        return ResponseEntity.ok(
                paymentService.getAllPayments()
        );
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<Payment> getPaymentById(
            @PathVariable Long paymentId) {

        return ResponseEntity.ok(
                paymentService.getPaymentById(paymentId)
        );
    }
}