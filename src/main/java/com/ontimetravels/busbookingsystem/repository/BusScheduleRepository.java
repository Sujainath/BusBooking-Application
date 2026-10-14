package com.ontimetravels.busbookingsystem.repository;

import com.ontimetravels.busbookingsystem.entity.BusSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BusScheduleRepository extends JpaRepository<BusSchedule, Long> {

    List<BusSchedule> findByTravelDateGreaterThanEqualAndActiveTrue(
            LocalDate travelDate
    );

    List<BusSchedule> findBySourceIgnoreCaseAndDestinationIgnoreCaseAndTravelDate(
            String source,
            String destination,
            LocalDate travelDate
    );
}