package com.ontimetravels.busbookingsystem.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {

    private String bookingReference;

    private String passengerName;

    private String busName;

    private String busNumber;

    private String busType;

    private String source;

    private String destination;

    private LocalDate travelDate;

    private LocalTime departureTime;

    private LocalTime arrivalTime;

    private List<TicketSeatResponse> seats;

    private BigDecimal totalAmount;

    private String status;

    private String cancellationMessage;

    private BigDecimal cancellationFee;

    private BigDecimal refundAmount;

    private LocalDateTime cancelledAt;
}