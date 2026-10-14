package com.ontimetravels.busbookingsystem.dto;

import com.ontimetravels.busbookingsystem.entity.BookingSeat;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BookingRequest {

    private Long userId;

    private Long scheduleId;

    private List<Long> seatIds;

    private List<String> passengerNames;

    private List<BookingSeat.PassengerGender> passengerGenders;
}