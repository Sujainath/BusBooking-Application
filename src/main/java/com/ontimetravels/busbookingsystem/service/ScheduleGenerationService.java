
package com.ontimetravels.busbookingsystem.service;

import com.ontimetravels.busbookingsystem.entity.Bus;
import com.ontimetravels.busbookingsystem.entity.BusSchedule;
import com.ontimetravels.busbookingsystem.repository.BusRepository;
import com.ontimetravels.busbookingsystem.repository.BusScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ScheduleGenerationService {

    private final BusRepository busRepository;
    private final BusScheduleRepository busScheduleRepository;
    private final SeatService seatService;
    private final PreBookedSeatService preBookedSeatService;

    public ScheduleGenerationService(
            BusRepository busRepository,
            BusScheduleRepository busScheduleRepository,
            SeatService seatService,
            PreBookedSeatService preBookedSeatService) {

        this.busRepository = busRepository;
        this.busScheduleRepository = busScheduleRepository;
        this.seatService = seatService;
        this.preBookedSeatService = preBookedSeatService;
    }

    @Transactional
    public List<BusSchedule> generateSchedules(
            String source,
            String destination,
            LocalDate travelDate) {

        if (source == null || source.isBlank()
                || destination == null || destination.isBlank()) {
            throw new IllegalArgumentException(
                    "Source and destination are required");
        }

        source = source.trim();
        destination = destination.trim();

        if (source.equalsIgnoreCase(destination)) {
            throw new IllegalArgumentException(
                    "Source and destination cannot be the same");
        }

        if (travelDate == null
                || travelDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Travel date cannot be in the past");
        }

        List<Bus> buses = ensureDefaultBuses();
        List<BusSchedule> schedules = new ArrayList<>();

        LocalTime[] departureTimes = {
                LocalTime.of(20, 0),
                LocalTime.of(21, 0),
                LocalTime.of(22, 0)
        };

        // Includes active and inactive schedules for this route/date.
        List<BusSchedule> routeSchedules =
                busScheduleRepository
                        .findBySourceIgnoreCaseAndDestinationIgnoreCaseAndTravelDate(
                                source,
                                destination,
                                travelDate
                        );

        for (int i = 0; i < buses.size(); i++) {

            Bus bus = buses.get(i);

            // Do not generate schedules for inactive buses.
            if (!bus.isActive()) {
                continue;
            }

            // Prefer an existing active schedule for this bus.
            BusSchedule existingActiveSchedule =
                    routeSchedules.stream()
                            .filter(schedule ->
                                    schedule.getBus().getId()
                                            .equals(bus.getId())
                                            && schedule.isActive())
                            .findFirst()
                            .orElse(null);

            if (existingActiveSchedule != null) {

                preBookedSeatService.createPreBookedSeats(
                        existingActiveSchedule);

                schedules.add(existingActiveSchedule);
                continue;
            }

            // If an inactive schedule exists for this bus,
            // do not recreate it as active.
            boolean scheduleAlreadyExists =
                    routeSchedules.stream()
                            .anyMatch(schedule ->
                                    schedule.getBus().getId()
                                            .equals(bus.getId()));

            if (scheduleAlreadyExists) {
                continue;
            }

            // Create a schedule only if none exists for this bus,
            // route and travel date.
            LocalTime departureTime = departureTimes[i];

            BusSchedule newSchedule = BusSchedule.builder()
                    .bus(bus)
                    .source(source)
                    .destination(destination)
                    .travelDate(travelDate)
                    .departureTime(departureTime)
                    .arrivalTime(departureTime.plusHours(10))
                    .active(true)
                    .build();

            BusSchedule savedSchedule =
                    busScheduleRepository.save(newSchedule);

            preBookedSeatService.createPreBookedSeats(savedSchedule);
            schedules.add(savedSchedule);
        }

        return schedules;
    }

    /**
     * Ensures the three default buses exist.
     * Existing buses retain their current active/inactive status.
     */
    private List<Bus> ensureDefaultBuses() {

        List<Bus> buses = new ArrayList<>();

        buses.add(getOrCreateBus("OT001", "KA01AB1001"));
        buses.add(getOrCreateBus("OT002", "KA01AB1002"));
        buses.add(getOrCreateBus("OT003", "KA01AB1003"));

        return buses;
    }

    /**
     * Creates a default bus only when it does not already exist.
     */
    private Bus getOrCreateBus(
            String busNumber,
            String registrationNumber) {

        return busRepository.findAll()
                .stream()
                .filter(bus ->
                        bus.getBusNumber().equalsIgnoreCase(busNumber))
                .findFirst()
                .orElseGet(() -> {

                    Bus bus = new Bus();

                    bus.setBusNumber(busNumber);
                    bus.setBusName("On time travels");
                    bus.setBusType("AC Sleeper/Seater");
                    bus.setRegistrationNumber(registrationNumber);
                    bus.setTotalSeats(46);
                    bus.setActive(true);

                    Bus savedBus = busRepository.save(bus);

                    // Create the seat layout for a newly created bus.
                    seatService.createSeatsForBus(savedBus);

                    return savedBus;
                });
    }

    /**
     * Ensures existing active schedules have their demo bookings.
     * Existing bookings are preserved.
     */
    @Transactional
    public void ensurePreBookedSeatsForExistingSchedules() {

        List<BusSchedule> schedules =
                busScheduleRepository.findAll();

        for (BusSchedule schedule : schedules) {

            if (schedule.isActive()
                    && schedule.getBus().isActive()) {

                preBookedSeatService.createPreBookedSeats(schedule);
            }
        }
    }
}
