package com.ontimetravels.busbookingsystem.service;

import com.ontimetravels.busbookingsystem.dto.TicketResponse;
import com.ontimetravels.busbookingsystem.dto.TicketSeatResponse;
import com.ontimetravels.busbookingsystem.entity.Booking;
import com.ontimetravels.busbookingsystem.entity.BookingSeat;
import com.ontimetravels.busbookingsystem.entity.Cancellation;
import com.ontimetravels.busbookingsystem.repository.BookingRepository;
import com.ontimetravels.busbookingsystem.repository.BookingSeatRepository;
import com.ontimetravels.busbookingsystem.repository.CancellationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final CancellationRepository cancellationRepository;

    public TicketService(
            BookingRepository bookingRepository,
            BookingSeatRepository bookingSeatRepository,
            CancellationRepository cancellationRepository) {

        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.cancellationRepository = cancellationRepository;
    }

    public TicketResponse getTicket(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Booking not found"
                        ));

        List<BookingSeat> bookingSeats =
                bookingSeatRepository.findByBookingId(bookingId);

        List<TicketSeatResponse> seats = bookingSeats.stream()
                .map(bookingSeat ->
                        TicketSeatResponse.builder()
                                .seatNumber(
                                        bookingSeat.getSeat()
                                                .getSeatNumber()
                                )
                                .seatType(
                                        bookingSeat.getSeat()
                                                .getSeatType()
                                                .name()
                                )
                                .passengerName(
                                        bookingSeat.getPassengerName()
                                )
                                .passengerGender(
                                        bookingSeat.getPassengerGender()
                                                .name()
                                )
                                .fare(bookingSeat.getFare())
                                .build()
                )
                .toList();

        String passengerName = bookingSeats.isEmpty()
                ? null
                : bookingSeats.get(0).getPassengerName();

        TicketResponse.TicketResponseBuilder ticket =
                TicketResponse.builder()
                        .bookingReference(
                                booking.getBookingReference()
                        )
                        .passengerName(passengerName)
                        .busName(
                                booking.getSchedule()
                                        .getBus()
                                        .getBusName()
                        )
                        .busNumber(
                                booking.getSchedule()
                                        .getBus()
                                        .getBusNumber()
                        )
                        .busType(
                                booking.getSchedule()
                                        .getBus()
                                        .getBusType()
                        )
                        .source(
                                booking.getSchedule()
                                        .getSource()
                        )
                        .destination(
                                booking.getSchedule()
                                        .getDestination()
                        )
                        .travelDate(
                                booking.getSchedule()
                                        .getTravelDate()
                        )
                        .departureTime(
                                booking.getSchedule()
                                        .getDepartureTime()
                        )
                        .arrivalTime(
                                booking.getSchedule()
                                        .getArrivalTime()
                        )
                        .seats(seats)
                        .totalAmount(
                                booking.getTotalAmount()
                        )
                        .status(
                                booking.getStatus().name()
                        )
                        .cancellationMessage(
                                "Cancellation allowed until 8 hours before departure"
                        );

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {

            Cancellation cancellation =
                    cancellationRepository
                            .findByBookingId(bookingId)
                            .orElse(null);

            if (cancellation != null) {

                ticket
                        .cancellationFee(
                                cancellation.getCancellationFee()
                        )
                        .refundAmount(
                                cancellation.getRefundAmount()
                        )
                        .cancelledAt(
                                cancellation.getCancelledAt()
                        );
            }
        }

        return ticket.build();
    }
}