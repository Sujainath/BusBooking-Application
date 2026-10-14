package com.ontimetravels.busbookingsystem.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketSeatResponse {

    private String seatNumber;

    private String seatType;

    private String passengerName;

    private String passengerGender;

    private BigDecimal fare;
}