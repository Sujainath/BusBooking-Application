package com.ontimetravels.busbookingsystem.controller;

import com.ontimetravels.busbookingsystem.dto.BookingRequest;
import com.ontimetravels.busbookingsystem.entity.Booking;
import com.ontimetravels.busbookingsystem.entity.BusSchedule;
import com.ontimetravels.busbookingsystem.entity.User;
import com.ontimetravels.busbookingsystem.repository.BusScheduleRepository;
import com.ontimetravels.busbookingsystem.repository.UserRepository;
import com.ontimetravels.busbookingsystem.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final BusScheduleRepository busScheduleRepository;

    public BookingController(
            BookingService bookingService,
            UserRepository userRepository,
            BusScheduleRepository busScheduleRepository) {

        this.bookingService = bookingService;
        this.userRepository = userRepository;
        this.busScheduleRepository = busScheduleRepository;
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @RequestBody BookingRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        ));

        BusSchedule schedule =
                busScheduleRepository.findById(
                        request.getScheduleId()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Schedule not found"
                        ));

        Booking booking = bookingService.createBooking(
                user,
                schedule,
                request.getSeatIds(),
                request.getPassengerNames(),
                request.getPassengerGenders()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(booking);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingHistory(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                bookingService.getBookingHistory(userId)
        );
    }

    // ==============================
    // ADMIN BOOKING MANAGEMENT
    // ==============================

    @GetMapping("/all")
    public ResponseEntity<List<Booking>> getAllBookings() {

        return ResponseEntity.ok(
                bookingService.getAllBookings()
        );
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<Booking> getBookingById(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(
                bookingService.getBookingById(bookingId)
        );
    }
}