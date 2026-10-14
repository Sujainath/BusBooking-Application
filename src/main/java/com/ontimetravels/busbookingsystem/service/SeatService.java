package com.ontimetravels.busbookingsystem.service;

import com.ontimetravels.busbookingsystem.dto.SeatAvailabilityResponse;
import com.ontimetravels.busbookingsystem.entity.Booking;
import com.ontimetravels.busbookingsystem.entity.BookingSeat;
import com.ontimetravels.busbookingsystem.entity.Bus;
import com.ontimetravels.busbookingsystem.entity.BusSchedule;
import com.ontimetravels.busbookingsystem.entity.Seat;
import com.ontimetravels.busbookingsystem.repository.BookingSeatRepository;
import com.ontimetravels.busbookingsystem.repository.BusScheduleRepository;
import com.ontimetravels.busbookingsystem.repository.SeatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class SeatService {

    private final SeatRepository seatRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final BusScheduleRepository busScheduleRepository;
    private final FareService fareService;

    public SeatService(
            SeatRepository seatRepository,
            BookingSeatRepository bookingSeatRepository,
            BusScheduleRepository busScheduleRepository,
            FareService fareService) {

        this.seatRepository = seatRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.busScheduleRepository = busScheduleRepository;
        this.fareService = fareService;
    }

    /*
     * Create 46 seats for each bus.
     *
     * LOWER DECK
     * - 5 Single Sleeper
     * - 24 Seater
     *
     * UPPER DECK
     * - 5 Single Sleeper
     * - 12 Double Sleeper
     */
    public List<Seat> createSeatsForBus(Bus bus) {

        List<Seat> seats = new ArrayList<>();

        /*
         * Lower deck
         * Single sleeper: 5
         */
        addLowerSingleSleeperSeats(seats, bus);

        /*
         * Lower deck
         * Seater: 24
         */
        addSeaterSeats(seats, bus);

        /*
         * Upper deck
         * Single sleeper: 5
         */
        addUpperSingleSleeperSeats(seats, bus);

        /*
         * Upper deck
         * Double sleeper: 12
         */
        addDoubleSleeperSeats(seats, bus);

        return seatRepository.saveAll(seats);
    }

    /*
     * Get all active seats for a bus
     */
    public List<Seat> getSeatsByBus(Long busId) {

        return seatRepository.findByBusIdAndActiveTrue(busId);
    }

    /*
     * Get seat availability for a particular schedule
     */
    @Transactional(readOnly = true)
    public List<SeatAvailabilityResponse> getSeatAvailability(
            Long scheduleId) {

        BusSchedule schedule = busScheduleRepository
                .findById(scheduleId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Schedule not found: " + scheduleId
                        ));

        Long busId = schedule.getBus().getId();

        List<Seat> seats =
                seatRepository.findByBusIdAndActiveTrue(busId);

        List<BookingSeat> bookingSeats =
                bookingSeatRepository.findByScheduleId(scheduleId);

        /*
         * Store currently booked seat IDs.
         *
         * Cancelled bookings are ignored so that
         * cancelled seats become available again.
         */
        Set<Long> bookedSeatIds = new HashSet<>();

        /*
         * Store passenger gender for each booked seat.
         *
         * Example:
         *
         * SS05 -> MALE
         * SS06 -> FEMALE
         * DUB05 -> MALE
         *
         * This information will be sent to the frontend
         * so that the correct gender logo can be displayed.
         */
        Map<Long, String> bookedPassengerGenderBySeatId =
                new HashMap<>();

        for (BookingSeat bookingSeat : bookingSeats) {

            Booking booking = bookingSeat.getBooking();

            /*
             * Ignore cancelled bookings.
             */
            if (booking.getStatus()
                    == Booking.BookingStatus.CANCELLED) {
                continue;
            }

            Long seatId = bookingSeat.getSeat().getId();

            /*
             * Mark seat as booked.
             */
            bookedSeatIds.add(seatId);

            /*
             * Store passenger gender.
             *
             * MALE / FEMALE
             */
            if (bookingSeat.getPassengerGender() != null) {

                bookedPassengerGenderBySeatId.put(
                        seatId,
                        bookingSeat.getPassengerGender().name()
                );
            }
        }

        List<SeatAvailabilityResponse> response =
                new ArrayList<>();

        for (Seat seat : seats) {

            BigDecimal fare =
                    fareService.calculateFare(
                            seat.getSeatType(),
                            schedule.getTravelDate()
                    );

            boolean available =
                    !bookedSeatIds.contains(seat.getId());

            /*
             * Gender will be available only for
             * currently booked seats.
             *
             * Available seat -> null
             */
            String bookedPassengerGender =
                    bookedPassengerGenderBySeatId.get(
                            seat.getId()
                    );

            response.add(
                    SeatAvailabilityResponse.builder()
                            .seatId(seat.getId())
                            .seatNumber(seat.getSeatNumber())
                            .seatType(seat.getSeatType().name())
                            .deck(seat.getDeck().name())
                            .fare(fare)
                            .available(available)
                            .bookedPassengerGender(
                                    bookedPassengerGender
                            )
                            .build()
            );
        }

        return response;
    }

    /*
     * LOWER DECK
     *
     * 24 Seater seats
     *
     * SS01 - SS24
     */
    private void addSeaterSeats(
            List<Seat> seats,
            Bus bus) {

        for (int i = 1; i <= 24; i++) {

            seats.add(
                    Seat.builder()
                            .bus(bus)
                            .seatNumber(
                                    "SS" + String.format("%02d", i)
                            )
                            .seatType(Seat.SeatType.SEATER)
                            .deck(Seat.Deck.LOWER)
                            .active(true)
                            .build()
            );
        }
    }

    /*
     * LOWER DECK
     *
     * 5 Single Sleeper seats
     *
     * LB01 - LB05
     */
    private void addLowerSingleSleeperSeats(
            List<Seat> seats,
            Bus bus) {

        for (int i = 1; i <= 5; i++) {

            seats.add(
                    Seat.builder()
                            .bus(bus)
                            .seatNumber(
                                    "LB" + String.format("%02d", i)
                            )
                            .seatType(Seat.SeatType.SINGLE_SLEEPER)
                            .deck(Seat.Deck.LOWER)
                            .active(true)
                            .build()
            );
        }
    }

    /*
     * UPPER DECK
     *
     * 5 Single Sleeper seats
     *
     * UB01 - UB05
     */
    private void addUpperSingleSleeperSeats(
            List<Seat> seats,
            Bus bus) {

        for (int i = 1; i <= 5; i++) {

            seats.add(
                    Seat.builder()
                            .bus(bus)
                            .seatNumber(
                                    "UB" + String.format("%02d", i)
                            )
                            .seatType(Seat.SeatType.SINGLE_SLEEPER)
                            .deck(Seat.Deck.UPPER)
                            .active(true)
                            .build()
            );
        }
    }

    /*
     * UPPER DECK
     *
     * 12 Double Sleeper seats
     *
     * DUB01 - DUB12
     */
    private void addDoubleSleeperSeats(
            List<Seat> seats,
            Bus bus) {

        for (int i = 1; i <= 12; i++) {

            seats.add(
                    Seat.builder()
                            .bus(bus)
                            .seatNumber(
                                    "DUB" + String.format("%02d", i)
                            )
                            .seatType(Seat.SeatType.DOUBLE_SLEEPER)
                            .deck(Seat.Deck.UPPER)
                            .active(true)
                            .build()
            );
        }
    }
}