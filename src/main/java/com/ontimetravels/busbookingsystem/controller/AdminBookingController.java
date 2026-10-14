
package com.ontimetravels.busbookingsystem.controller;

import com.ontimetravels.busbookingsystem.dto.AdminBookingResponse;
import com.ontimetravels.busbookingsystem.entity.Booking;
import com.ontimetravels.busbookingsystem.entity.BookingSeat;
import com.ontimetravels.busbookingsystem.repository.BookingSeatRepository;
import com.ontimetravels.busbookingsystem.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class AdminBookingController {

    private final BookingService bookingService;
    private final BookingSeatRepository bookingSeatRepository;

    public AdminBookingController(
            BookingService bookingService,
            BookingSeatRepository bookingSeatRepository) {
        this.bookingService = bookingService;
        this.bookingSeatRepository = bookingSeatRepository;
    }

    @GetMapping
    public ResponseEntity<List<AdminBookingResponse>> getAllBookings() {

        List<AdminBookingResponse> bookings =
                bookingService.getAllBookings()
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<AdminBookingResponse> getBookingById(
            @PathVariable Long bookingId) {

        Booking booking =
                bookingService.getBookingById(bookingId);

        return ResponseEntity.ok(toResponse(booking));
    }

    private AdminBookingResponse toResponse(Booking booking) {

        List<BookingSeat> seats =
                bookingSeatRepository.findByBookingId(booking.getId());

        return new AdminBookingResponse(
                booking.getId(),
                booking.getBookingReference(),
                booking.getUser().getFullName(),
                booking.getUser().getEmail(),
                booking.getSchedule().getSource(),
                booking.getSchedule().getDestination(),
                booking.getSchedule().getTravelDate(),
                booking.getSchedule().getDepartureTime(),
                booking.getSchedule().getArrivalTime(),
                seats.stream()
                        .map(seat -> seat.getSeat().getSeatNumber())
                        .toList(),
                seats.stream()
                        .map(BookingSeat::getPassengerName)
                        .toList(),
                booking.getTotalAmount(),
                booking.getStatus().name(),
                booking.getBookedAt()
        );
    }
}
