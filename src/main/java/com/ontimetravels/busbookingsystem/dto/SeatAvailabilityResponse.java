package com.ontimetravels.busbookingsystem.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatAvailabilityResponse {

    private Long seatId;
    private String seatNumber;
    private String seatType;
    private String deck;
    private BigDecimal fare;
    private boolean available;

    // Male / Female gender of the passenger who booked this seat
    private String bookedPassengerGender;
}