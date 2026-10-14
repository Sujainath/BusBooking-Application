package com.ontimetravels.busbookingsystem.service;

import com.ontimetravels.busbookingsystem.entity.Booking;
import com.ontimetravels.busbookingsystem.entity.BusSchedule;
import com.ontimetravels.busbookingsystem.entity.Cancellation;
import com.ontimetravels.busbookingsystem.repository.BookingRepository;
import com.ontimetravels.busbookingsystem.repository.CancellationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class CancellationService {

    private final BookingRepository bookingRepository;
    private final CancellationRepository cancellationRepository;

    public CancellationService(
            BookingRepository bookingRepository,
            CancellationRepository cancellationRepository) {

        this.bookingRepository = bookingRepository;
        this.cancellationRepository = cancellationRepository;
    }

    @Transactional
    public Cancellation cancelBooking(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Booking not found"
                        ));

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new IllegalArgumentException(
                    "Booking is already cancelled"
            );
        }

        if (cancellationRepository
                .findByBookingId(bookingId)
                .isPresent()) {

            throw new IllegalArgumentException(
                    "Cancellation already processed"
            );
        }

        BusSchedule schedule = booking.getSchedule();

        LocalDate travelDate = schedule.getTravelDate();
        LocalTime departureTime = schedule.getDepartureTime();

        LocalDateTime departureDateTime =
                LocalDateTime.of(
                        travelDate,
                        departureTime
                );

        LocalDateTime cancellationDeadline =
                departureDateTime.minusHours(8);

        if (LocalDateTime.now().isAfter(cancellationDeadline)) {
            throw new IllegalArgumentException(
                    "Cancellation is allowed only until 8 hours before departure"
            );
        }

        BigDecimal bookingAmount = booking.getTotalAmount();

        BigDecimal cancellationFee =
                bookingAmount
                        .multiply(BigDecimal.valueOf(10))
                        .divide(BigDecimal.valueOf(100));

        BigDecimal refundAmount =
                bookingAmount.subtract(cancellationFee);

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        Cancellation cancellation = Cancellation.builder()
                .booking(booking)
                .bookingAmount(bookingAmount)
                .cancellationFee(cancellationFee)
                .refundAmount(refundAmount)
                .build();

        return cancellationRepository.save(cancellation);
    }

    // ==============================
    // ADMIN CANCELLATION MANAGEMENT
    // ==============================

    public List<Cancellation> getAllCancellations() {

        return cancellationRepository.findAll();
    }

    public Cancellation getCancellationById(Long cancellationId) {

        return cancellationRepository.findById(cancellationId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Cancellation not found: " + cancellationId
                        ));
    }
}