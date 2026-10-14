package com.ontimetravels.busbookingsystem.service;

import com.ontimetravels.busbookingsystem.entity.*;
import com.ontimetravels.busbookingsystem.repository.BookingRepository;
import com.ontimetravels.busbookingsystem.repository.BookingSeatRepository;
import com.ontimetravels.busbookingsystem.repository.SeatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final SeatRepository seatRepository;
    private final FareService fareService;

    public BookingService(
            BookingRepository bookingRepository,
            BookingSeatRepository bookingSeatRepository,
            SeatRepository seatRepository,
            FareService fareService) {

        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.seatRepository = seatRepository;
        this.fareService = fareService;
    }

    @Transactional
    public Booking createBooking(
            User user,
            BusSchedule schedule,
            List<Long> seatIds,
            List<String> passengerNames,
            List<BookingSeat.PassengerGender> passengerGenders) {

        /*
         * Basic validation
         */
        if (seatIds == null || seatIds.isEmpty()) {
            throw new IllegalArgumentException(
                    "At least one seat must be selected"
            );
        }

        /*
         * Maximum 6 seats per booking
         */
        if (seatIds.size() > 6) {
            throw new IllegalArgumentException(
                    "Maximum 6 seats allowed per booking"
            );
        }

        /*
         * Passenger details count must match
         * selected seat count
         */
        if (passengerNames == null
                || passengerGenders == null
                || seatIds.size() != passengerNames.size()
                || seatIds.size() != passengerGenders.size()) {

            throw new IllegalArgumentException(
                    "Seat and passenger details count must match"
            );
        }

        /*
         * =========================================
         * GENDER ADJACENCY RULE
         * =========================================
         *
         * Only single-seat bookings are checked.
         *
         * 1 seat  -> gender restriction applies
         * 2-6 seats -> no gender restriction
         *
         * LB / UB single sleeper -> no restriction
         */
        if (seatIds.size() == 1) {

            Seat selectedSeat =
                    seatRepository.findById(seatIds.get(0))
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Seat not found: "
                                                    + seatIds.get(0)
                                    )
                            );

            checkGenderAdjacency(
                    schedule,
                    selectedSeat,
                    passengerGenders.get(0)
            );
        }

        /*
         * Create booking
         */
        Booking booking = Booking.builder()
                .bookingReference(
                        generateBookingReference()
                )
                .user(user)
                .schedule(schedule)
                .totalAmount(BigDecimal.ZERO)
                .status(
                        Booking.BookingStatus.CONFIRMED
                )
                .build();

        Booking savedBooking =
                bookingRepository.save(booking);

        BigDecimal totalAmount =
                BigDecimal.ZERO;

        /*
         * Create booking seat records
         */
        for (int i = 0; i < seatIds.size(); i++) {

            Long seatId = seatIds.get(i);

            Seat seat =
                    seatRepository.findById(seatId)
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Seat not found: "
                                                    + seatId
                                    )
                            );

            /*
             * Seat must be active
             */
            if (!seat.isActive()) {

                throw new IllegalArgumentException(
                        "Seat is inactive: "
                                + seat.getSeatNumber()
                );
            }

            /*
             * Selected seat must belong to
             * the bus assigned to this schedule
             */
            if (!seat.getBus()
                    .getId()
                    .equals(schedule.getBus().getId())) {

                throw new IllegalArgumentException(
                        "Selected seat does not belong to this bus"
                );
            }

            /*
             * Prevent duplicate seat booking
             * for the same travel schedule
             */
            if (bookingSeatRepository
                    .existsActiveBookingForSeat(
                            schedule.getId(),
                            seat.getId(),
                            Booking.BookingStatus.CANCELLED
                    )) {

                throw new IllegalArgumentException(
                        "Seat already booked: "
                                + seat.getSeatNumber()
                );
            }

            /*
             * Calculate fare
             */
            BigDecimal fare =
                    fareService.calculateFare(
                            seat.getSeatType(),
                            schedule.getTravelDate()
                    );

            /*
             * Create booking seat
             */
            BookingSeat bookingSeat =
                    BookingSeat.builder()
                            .booking(savedBooking)
                            .schedule(schedule)
                            .seat(seat)
                            .fare(fare)
                            .passengerName(
                                    passengerNames.get(i)
                            )
                            .passengerGender(
                                    passengerGenders.get(i)
                            )
                            .build();

            bookingSeatRepository.save(
                    bookingSeat
            );

            totalAmount =
                    totalAmount.add(fare);
        }

        /*
         * Update total booking amount
         */
        savedBooking.setTotalAmount(
                totalAmount
        );

        return bookingRepository.save(
                savedBooking
        );
    }


    /*
     * =========================================
     * GENDER ADJACENCY CHECK
     * =========================================
     */
    private void checkGenderAdjacency(
            BusSchedule schedule,
            Seat selectedSeat,
            BookingSeat.PassengerGender passengerGender) {

        /*
         * LB / UB are single sleeper seats.
         *
         * They do not have an adjacent passenger,
         * so gender restriction is not required.
         */
        if (selectedSeat.getSeatType()
                == Seat.SeatType.SINGLE_SLEEPER) {

            return;
        }

        /*
         * Find the physically adjacent seat.
         *
         * Example:
         *
         * SS01 <-> SS02
         * SS03 <-> SS04
         *
         * DUB01 <-> DUB02
         * DUB03 <-> DUB04
         */
        String adjacentSeatNumber =
                getAdjacentSeatNumber(
                        selectedSeat.getSeatNumber()
                );

        /*
         * No adjacent seat
         */
        if (adjacentSeatNumber == null) {
            return;
        }

        /*
         * Get all bookings for this schedule
         */
        List<BookingSeat> bookedSeats =
                bookingSeatRepository
                        .findByScheduleId(
                                schedule.getId()
                        );

        /*
         * Check the adjacent seat
         */
        for (BookingSeat bookedSeat : bookedSeats) {

            /*
             * IMPORTANT:
             *
             * Cancelled bookings should NOT block
             * the selected passenger.
             */
            if (bookedSeat.getBooking()
                    .getStatus()
                    == Booking.BookingStatus.CANCELLED) {

                continue;
            }

            /*
             * We only care about the adjacent seat.
             */
            if (!bookedSeat.getSeat()
                    .getSeatNumber()
                    .equals(adjacentSeatNumber)) {

                continue;
            }

            /*
             * Different gender -> block booking
             */
            if (bookedSeat.getPassengerGender()
                    != passengerGender) {

                throw new IllegalArgumentException(
                        "Seat beside is occupied by a different gender"
                );
            }

            /*
             * Same gender -> allow booking
             */
            return;
        }
    }


    /*
     * =========================================
     * FIND ADJACENT SEAT
     * =========================================
     */
    private String getAdjacentSeatNumber(
            String seatNumber) {

        if (seatNumber == null) {
            return null;
        }

        /*
         * Seater seats
         *
         * SS01 <-> SS02
         * SS03 <-> SS04
         * SS05 <-> SS06
         */
        if (seatNumber.startsWith("SS")) {

            return getPairSeatNumber(
                    "SS",
                    seatNumber.substring(2)
            );
        }

        /*
         * Double sleeper seats
         *
         * DUB01 <-> DUB02
         * DUB03 <-> DUB04
         * DUB05 <-> DUB06
         */
        if (seatNumber.startsWith("DUB")) {

            return getPairSeatNumber(
                    "DUB",
                    seatNumber.substring(3)
            );
        }

        /*
         * LB / UB:
         *
         * No gender adjacency restriction.
         */
        if (seatNumber.startsWith("LB")
                || seatNumber.startsWith("UB")) {

            return null;
        }

        return null;
    }


    /*
     * =========================================
     * GET PAIRED SEAT NUMBER
     * =========================================
     */
    private String getPairSeatNumber(
            String prefix,
            String numberPart) {

        int number;

        try {

            number =
                    Integer.parseInt(
                            numberPart
                    );

        } catch (NumberFormatException exception) {

            return null;
        }

        /*
         * Odd -> next even
         *
         * 01 -> 02
         * 03 -> 04
         * 05 -> 06
         */
        if (number % 2 == 1) {

            return prefix
                    + String.format(
                    "%02d",
                    number + 1
            );
        }

        /*
         * Even -> previous odd
         *
         * 02 -> 01
         * 04 -> 03
         * 06 -> 05
         */
        return prefix
                + String.format(
                "%02d",
                number - 1
        );
    }


    /*
     * =========================================
     * ADMIN - GET ALL BOOKINGS
     * =========================================
     */
    public List<Booking> getAllBookings() {

        return bookingRepository.findAll();
    }


    /*
     * =========================================
     * ADMIN - GET ONE BOOKING
     * =========================================
     */
    public Booking getBookingById(
            Long bookingId) {

        return bookingRepository.findById(
                        bookingId
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Booking not found: "
                                        + bookingId
                        )
                );
    }


    /*
     * =========================================
     * USER - BOOKING HISTORY
     * =========================================
     */
    public List<Booking> getBookingHistory(
            Long userId) {

        return bookingRepository
                .findByUserIdOrderByBookedAtDesc(
                        userId
                );
    }


    /*
     * =========================================
     * BOOKING REFERENCE
     * =========================================
     */
    private String generateBookingReference() {

        return "OTT-"
                + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }
}