
package com.ontimetravels.busbookingsystem.service;

import com.ontimetravels.busbookingsystem.entity.Bus;
import com.ontimetravels.busbookingsystem.entity.BusSchedule;
import com.ontimetravels.busbookingsystem.repository.BusRepository;
import com.ontimetravels.busbookingsystem.repository.BusScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class BusScheduleService {

    private final BusScheduleRepository busScheduleRepository;
    private final ScheduleGenerationService scheduleGenerationService;
    private final BusRepository busRepository;

    public BusScheduleService(
            BusScheduleRepository busScheduleRepository,
            ScheduleGenerationService scheduleGenerationService,
            BusRepository busRepository) {

        this.busScheduleRepository = busScheduleRepository;
        this.scheduleGenerationService = scheduleGenerationService;
        this.busRepository = busRepository;
    }

    @Transactional
    public BusSchedule saveSchedule(BusSchedule schedule) {
        validateSchedule(schedule);

        if (schedule.getBus() == null
                || schedule.getBus().getId() == null) {
            throw new IllegalArgumentException(
                    "Please select a valid bus");
        }

        Long busId = schedule.getBus().getId();

        Bus bus = busRepository.findById(busId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Bus not found: " + busId));

        if (!bus.isActive()) {
            throw new IllegalArgumentException(
                    "Cannot create a schedule for an inactive bus");
        }

        schedule.setBus(bus);
        schedule.setSource(schedule.getSource().trim());
        schedule.setDestination(schedule.getDestination().trim());
        schedule.setArrivalTime(
                calculateArrivalTime(schedule.getDepartureTime()));
        schedule.setActive(true);

        return busScheduleRepository.save(schedule);
    }

    public List<BusSchedule> getAvailableSchedules() {
        return busScheduleRepository
                .findByTravelDateGreaterThanEqualAndActiveTrue(
                        LocalDate.now());
    }

    public List<BusSchedule> searchSchedules(
            String source,
            String destination,
            LocalDate travelDate) {

        if (travelDate == null) {
            throw new IllegalArgumentException(
                    "Travel date is required");
        }

        if (travelDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Past dates are not allowed");
        }

        return scheduleGenerationService.generateSchedules(
                source, destination, travelDate);
    }

    public List<BusSchedule> getAllSchedules() {
        return busScheduleRepository.findAll();
    }

    public BusSchedule getScheduleById(Long scheduleId) {
        return busScheduleRepository.findById(scheduleId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Schedule not found: " + scheduleId));
    }

    @Transactional
    public BusSchedule updateSchedule(
            Long scheduleId,
            BusSchedule updatedSchedule) {

        validateSchedule(updatedSchedule);

        BusSchedule existingSchedule = getScheduleById(scheduleId);

        existingSchedule.setSource(
                updatedSchedule.getSource().trim());
        existingSchedule.setDestination(
                updatedSchedule.getDestination().trim());
        existingSchedule.setTravelDate(
                updatedSchedule.getTravelDate());
        existingSchedule.setDepartureTime(
                updatedSchedule.getDepartureTime());
        existingSchedule.setArrivalTime(
                calculateArrivalTime(
                        updatedSchedule.getDepartureTime()));

        // Preserve the existing bus association.
        return busScheduleRepository.save(existingSchedule);
    }

    @Transactional
    public BusSchedule updateScheduleStatus(
            Long scheduleId,
            boolean active) {

        BusSchedule schedule = getScheduleById(scheduleId);
        schedule.setActive(active);

        return busScheduleRepository.save(schedule);
    }

    private void validateSchedule(BusSchedule schedule) {
        if (schedule == null) {
            throw new IllegalArgumentException(
                    "Schedule details are required");
        }

        if (schedule.getSource() == null
                || schedule.getSource().isBlank()) {
            throw new IllegalArgumentException(
                    "Source is required");
        }

        if (schedule.getDestination() == null
                || schedule.getDestination().isBlank()) {
            throw new IllegalArgumentException(
                    "Destination is required");
        }

        if (schedule.getSource().trim()
                .equalsIgnoreCase(schedule.getDestination().trim())) {
            throw new IllegalArgumentException(
                    "Source and destination cannot be the same");
        }

        if (schedule.getTravelDate() == null) {
            throw new IllegalArgumentException(
                    "Travel date is required");
        }

        if (schedule.getTravelDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Travel date cannot be in the past");
        }

        if (schedule.getDepartureTime() == null) {
            throw new IllegalArgumentException(
                    "Departure time is required");
        }
    }

    private LocalTime calculateArrivalTime(
            LocalTime departureTime) {
        return departureTime.plusHours(10);
    }
}
