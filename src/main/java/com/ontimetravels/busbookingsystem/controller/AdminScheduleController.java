
package com.ontimetravels.busbookingsystem.controller;

import com.ontimetravels.busbookingsystem.entity.BusSchedule;
import com.ontimetravels.busbookingsystem.service.BusScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/schedules")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class AdminScheduleController {

    private final BusScheduleService busScheduleService;

    public AdminScheduleController(
            BusScheduleService busScheduleService) {
        this.busScheduleService = busScheduleService;
    }

    @GetMapping
    public ResponseEntity<List<BusSchedule>> getAllSchedules() {
        return ResponseEntity.ok(
                busScheduleService.getAllSchedules());
    }

    @GetMapping("/{scheduleId}")
    public ResponseEntity<BusSchedule> getScheduleById(
            @PathVariable Long scheduleId) {
        return ResponseEntity.ok(
                busScheduleService.getScheduleById(scheduleId));
    }

    @PostMapping
    public ResponseEntity<BusSchedule> createSchedule(
            @RequestBody BusSchedule schedule) {
        BusSchedule savedSchedule =
                busScheduleService.saveSchedule(schedule);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedSchedule);
    }

    @PutMapping("/{scheduleId}")
    public ResponseEntity<BusSchedule> updateSchedule(
            @PathVariable Long scheduleId,
            @RequestBody BusSchedule updatedSchedule) {
        return ResponseEntity.ok(
                busScheduleService.updateSchedule(
                        scheduleId, updatedSchedule));
    }

    @PatchMapping("/{scheduleId}/status")
    public ResponseEntity<BusSchedule> updateScheduleStatus(
            @PathVariable Long scheduleId,
            @RequestParam boolean active) {
        return ResponseEntity.ok(
                busScheduleService.updateScheduleStatus(
                        scheduleId, active));
    }
}
