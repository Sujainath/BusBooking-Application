package com.ontimetravels.busbookingsystem.repository;

import com.ontimetravels.busbookingsystem.entity.Cancellation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CancellationRepository
        extends JpaRepository<Cancellation, Long> {

    Optional<Cancellation> findByBookingId(Long bookingId);
}