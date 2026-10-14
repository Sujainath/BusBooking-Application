package com.ontimetravels.busbookingsystem.service;

import com.ontimetravels.busbookingsystem.entity.Booking;
import com.ontimetravels.busbookingsystem.entity.BookingSeat;
import com.ontimetravels.busbookingsystem.entity.BusSchedule;
import com.ontimetravels.busbookingsystem.entity.Seat;
import com.ontimetravels.busbookingsystem.entity.User;
import com.ontimetravels.busbookingsystem.repository.BookingRepository;
import com.ontimetravels.busbookingsystem.repository.BookingSeatRepository;
import com.ontimetravels.busbookingsystem.repository.SeatRepository;
import com.ontimetravels.busbookingsystem.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PreBookedSeatService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final FareService fareService;

    private final Random random = new Random();

    public PreBookedSeatService(
            BookingRepository bookingRepository,
            BookingSeatRepository bookingSeatRepository,
            SeatRepository seatRepository,
            UserRepository userRepository,
            FareService fareService) {

        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.seatRepository = seatRepository;
        this.userRepository = userRepository;
        this.fareService = fareService;
    }

    @Transactional
    public void createPreBookedSeats(BusSchedule schedule) {

        /*
         * Get all existing booking-seat records
         * for this schedule.
         */
        List<BookingSeat> existingBookings =
                bookingSeatRepository.findByScheduleId(
                        schedule.getId()
                );

        /*
         * Count only active/confirmed bookings.
         * Cancelled seats are considered available again.
         */
        long activeBookedCount =
                existingBookings.stream()
                        .filter(bookingSeat ->
                                bookingSeat.getBooking().getStatus()
                                        != Booking.BookingStatus.CANCELLED)
                        .count();

        /*
         * If this schedule already has 30 or more
         * active booked seats, do nothing.
         */
        if (activeBookedCount >= 30) {
            return;
        }

        /*
         * Get all active seats for this bus.
         */
        List<Seat> seats =
                seatRepository.findByBusIdAndActiveTrue(
                        schedule.getBus().getId()
                );

        if (seats.isEmpty()) {
            return;
        }

        /*
         * Random target between 30 and 40.
         *
         * Example:
         * 30 booked -> 16 available
         * 35 booked -> 11 available
         * 40 booked ->  6 available
         */
        int targetBookedSeatCount =
                30 + random.nextInt(11);

        /*
         * Safety check so we never exceed
         * the actual number of seats.
         */
        targetBookedSeatCount =
                Math.min(
                        targetBookedSeatCount,
                        seats.size()
                );

        /*
         * Collect seat IDs that are already booked.
         */
        Set<Long> alreadyBookedSeatIds =
                existingBookings.stream()
                        .filter(bookingSeat ->
                                bookingSeat.getBooking().getStatus()
                                        != Booking.BookingStatus.CANCELLED)
                        .map(bookingSeat ->
                                bookingSeat.getSeat().getId())
                        .collect(Collectors.toSet());

        /*
         * Keep only seats that are still available.
         */
        List<Seat> availableSeats =
                seats.stream()
                        .filter(seat ->
                                !alreadyBookedSeatIds.contains(
                                        seat.getId()
                                ))
                        .collect(Collectors.toList());

        /*
         * Randomize the remaining seats so that
         * every bus/schedule gets a different pattern.
         */
        Collections.shuffle(
                availableSeats,
                random
        );

        /*
         * Calculate how many new demo bookings
         * are required.
         */
        int seatsToAdd =
                targetBookedSeatCount
                        - (int) activeBookedCount;

        /*
         * Safety check.
         */
        seatsToAdd =
                Math.min(
                        seatsToAdd,
                        availableSeats.size()
                );

        /*
         * Use one demo user for all pre-booked seats.
         */
        User demoUser = getDemoUser();

        /*
         * Create individual booking records
         * for the required number of seats.
         */
        for (int i = 0; i < seatsToAdd; i++) {

            Seat seat =
                    availableSeats.get(i);

            Booking booking =
                    Booking.builder()
                            .bookingReference(
                                    generateBookingReference()
                            )
                            .user(demoUser)
                            .schedule(schedule)
                            .totalAmount(BigDecimal.ZERO)
                            .status(
                                    Booking.BookingStatus.CONFIRMED
                            )
                            .build();

            Booking savedBooking =
                    bookingRepository.save(booking);

            BookingSeat.PassengerGender gender =
                    randomGender();

            BigDecimal fare =
                    fareService.calculateFare(
                            seat.getSeatType(),
                            schedule.getTravelDate()
                    );

            BookingSeat bookingSeat =
                    BookingSeat.builder()
                            .booking(savedBooking)
                            .schedule(schedule)
                            .seat(seat)
                            .fare(fare)
                            .passengerName(
                                    generatePassengerName(gender)
                            )
                            .passengerGender(gender)
                            .build();

            bookingSeatRepository.save(bookingSeat);

            savedBooking.setTotalAmount(fare);

            bookingRepository.save(savedBooking);
        }
    }

    private User getDemoUser() {

        return userRepository.findByEmail(
                "demo@ontimetravels.com"
        ).orElseGet(() -> {

            User user = new User();

            user.setFullName(
                    "On Time Travels Passenger"
            );

            user.setEmail(
                    "demo@ontimetravels.com"
            );

            user.setPhone(
                    "9999999999"
            );

            user.setPassword(
                    "demo"
            );

            user.setGender(
                    User.Gender.MALE
            );

            user.setRole(
                    User.Role.PASSENGER
            );

            user.setActive(true);

            return userRepository.save(user);
        });
    }

    private BookingSeat.PassengerGender randomGender() {

        return random.nextBoolean()
                ? BookingSeat.PassengerGender.MALE
                : BookingSeat.PassengerGender.FEMALE;
    }

    private String generatePassengerName(
            BookingSeat.PassengerGender gender) {

        String[] maleNames = {
                "Sampath",
                "Rohith",
                "Vel",
                "Vijay Kumar",
                "Akash",
                "Mohan",
                "Harsha",
                "Dinesh"
        };

        String[] femaleNames = {
                "Kavitha",
                "Renuga",
                "Saritha",
                "Vanitha",
                "Sangeetha",
                "Deeksha",
                "Sofia",
                "Kavya"
        };

        String[] names =
                gender == BookingSeat.PassengerGender.MALE
                        ? maleNames
                        : femaleNames;

        return names[
                random.nextInt(names.length)
                ];
    }

    private String generateBookingReference() {

        return "OTT-"
                + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }
}