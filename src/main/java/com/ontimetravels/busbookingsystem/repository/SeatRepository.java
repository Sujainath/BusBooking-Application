package com.ontimetravels.busbookingsystem.repository;

import com.ontimetravels.busbookingsystem.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByBusIdAndActiveTrue(Long busId);

    List<Seat> findByBusIdAndSeatTypeAndActiveTrue(
            Long busId,
            Seat.SeatType seatType
    );
}