package com.ontimetravels.busbookingsystem.service;

import com.ontimetravels.busbookingsystem.entity.Seat;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;

@Service
public class FareService {

    public BigDecimal calculateFare(
            Seat.SeatType seatType,
            LocalDate travelDate) {

        BigDecimal baseFare;

        switch (seatType) {

            case SEATER ->
                    baseFare = BigDecimal.valueOf(700);

            case SINGLE_SLEEPER, DOUBLE_SLEEPER ->
                    baseFare = BigDecimal.valueOf(1100);

            default ->
                    throw new IllegalArgumentException(
                            "Unsupported seat type: " + seatType
                    );
        }

        if (isWeekend(travelDate)) {
            baseFare = baseFare.add(BigDecimal.valueOf(200));
        }

        return baseFare;
    }

    private boolean isWeekend(LocalDate date) {

        DayOfWeek day = date.getDayOfWeek();

        return day == DayOfWeek.FRIDAY
                || day == DayOfWeek.SATURDAY
                || day == DayOfWeek.SUNDAY;
    }
}