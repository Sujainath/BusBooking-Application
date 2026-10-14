package com.ontimetravels.busbookingsystem.repository;

import com.ontimetravels.busbookingsystem.entity.Booking;
import com.ontimetravels.busbookingsystem.entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {

    List<BookingSeat> findByScheduleId(Long scheduleId);

    List<BookingSeat> findByBookingId(Long bookingId);

    @Query("""
            SELECT COUNT(bs) > 0
            FROM BookingSeat bs
            WHERE bs.schedule.id = :scheduleId
              AND bs.seat.id = :seatId
              AND bs.booking.status <> :status
            """)
    boolean existsActiveBookingForSeat(
            @Param("scheduleId") Long scheduleId,
            @Param("seatId") Long seatId,
            @Param("status") Booking.BookingStatus status
    );
}