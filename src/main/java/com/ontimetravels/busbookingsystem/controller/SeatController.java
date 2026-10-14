package com.ontimetravels.busbookingsystem.controller;

import com.ontimetravels.busbookingsystem.dto.SeatAvailabilityResponse;
import com.ontimetravels.busbookingsystem.entity.Seat;
import com.ontimetravels.busbookingsystem.service.SeatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@CrossOrigin(origins = "*")
public class SeatController {

    private final SeatService seatService;

    public SeatController(SeatService seatService) {
        this.seatService = seatService;
    }

    @GetMapping("/bus/{busId}")
    public ResponseEntity<List<Seat>> getBusSeats(
            @PathVariable Long busId) {

        return ResponseEntity.ok(
                seatService.getSeatsByBus(busId)
        );
    }

    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<List<SeatAvailabilityResponse>> getSeatAvailability(
            @PathVariable Long scheduleId) {

        return ResponseEntity.ok(
                seatService.getSeatAvailability(scheduleId)
        );
    }
}