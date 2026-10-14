package com.ontimetravels.busbookingsystem.controller;

import com.ontimetravels.busbookingsystem.entity.BusSchedule;
import com.ontimetravels.busbookingsystem.service.BusScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = "*")
public class BusScheduleController {

    private final BusScheduleService busScheduleService;

    public BusScheduleController(
            BusScheduleService busScheduleService) {

        this.busScheduleService = busScheduleService;
    }

    @PostMapping
    public ResponseEntity<BusSchedule> createSchedule(
            @RequestBody BusSchedule schedule) {

        BusSchedule savedSchedule =
                busScheduleService.saveSchedule(schedule);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedSchedule);
    }

    @GetMapping
    public ResponseEntity<List<BusSchedule>> getAvailableSchedules() {

        return ResponseEntity.ok(
                busScheduleService.getAvailableSchedules()
        );
    }

    @GetMapping("/search")
    public ResponseEntity<List<BusSchedule>> searchSchedules(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam LocalDate travelDate) {

        return ResponseEntity.ok(
                busScheduleService.searchSchedules(
                        source,
                        destination,
                        travelDate
                )
        );
    }

    @GetMapping("/all")
    public ResponseEntity<List<BusSchedule>> getAllSchedules() {

        return ResponseEntity.ok(
                busScheduleService.getAllSchedules()
        );
    }

    @GetMapping("/{scheduleId}")
    public ResponseEntity<BusSchedule> getScheduleById(
            @PathVariable Long scheduleId) {

        return ResponseEntity.ok(
                busScheduleService.getScheduleById(scheduleId)
        );
    }

    @PutMapping("/{scheduleId}")
    public ResponseEntity<BusSchedule> updateSchedule(
            @PathVariable Long scheduleId,
            @RequestBody BusSchedule updatedSchedule) {

        return ResponseEntity.ok(
                busScheduleService.updateSchedule(
                        scheduleId,
                        updatedSchedule
                )
        );
    }

    @PatchMapping("/{scheduleId}/status")
    public ResponseEntity<BusSchedule> updateScheduleStatus(
            @PathVariable Long scheduleId,
            @RequestParam boolean active) {

        return ResponseEntity.ok(
                busScheduleService.updateScheduleStatus(
                        scheduleId,
                        active
                )
        );
    }
}