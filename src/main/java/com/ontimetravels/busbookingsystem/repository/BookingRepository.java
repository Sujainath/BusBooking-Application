package com.ontimetravels.busbookingsystem.repository;

import com.ontimetravels.busbookingsystem.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findByUserIdOrderByBookedAtDesc(Long userId);

    List<Booking> findByScheduleIdAndStatus(
            Long scheduleId,
            Booking.BookingStatus status
    );

    long countByStatus(Booking.BookingStatus status);

    @Query("""
            SELECT COALESCE(SUM(b.totalAmount), 0)
            FROM Booking b
            WHERE b.status =
            com.ontimetravels.busbookingsystem.entity.Booking.BookingStatus.CONFIRMED
            """)
    BigDecimal calculateTotalRevenue();
}