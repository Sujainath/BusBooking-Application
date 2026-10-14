
package com.ontimetravels.busbookingsystem.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public record AdminBookingResponse(
        Long bookingId,
        String bookingReference,
        String customerName,
        String customerEmail,
        String source,
        String destination,
        LocalDate travelDate,
        LocalTime departureTime,
        LocalTime arrivalTime,
        List<String> seatNumbers,
        List<String> passengerNames,
        BigDecimal totalAmount,
        String status,
        LocalDateTime bookedAt
) {
}
