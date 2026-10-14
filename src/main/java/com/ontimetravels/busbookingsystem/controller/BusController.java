package com.ontimetravels.busbookingsystem.controller;

import com.ontimetravels.busbookingsystem.entity.Bus;
import com.ontimetravels.busbookingsystem.service.BusService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buses")
@CrossOrigin(origins = "*")
public class BusController {

    private final BusService busService;

    public BusController(BusService busService) {
        this.busService = busService;
    }

    @PostMapping
    public ResponseEntity<Bus> createBus(
            @RequestBody Bus bus) {

        Bus savedBus = busService.saveBus(bus);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedBus);
    }

    @GetMapping
    public ResponseEntity<List<Bus>> getActiveBuses() {

        return ResponseEntity.ok(
                busService.getActiveBuses()
        );
    }

    @GetMapping("/all")
    public ResponseEntity<List<Bus>> getAllBuses() {

        return ResponseEntity.ok(
                busService.getAllBuses()
        );
    }

    @GetMapping("/{busId}")
    public ResponseEntity<Bus> getBusById(
            @PathVariable Long busId) {

        return ResponseEntity.ok(
                busService.getBusById(busId)
        );
    }

    @PutMapping("/{busId}")
    public ResponseEntity<Bus> updateBus(
            @PathVariable Long busId,
            @RequestBody Bus updatedBus) {

        return ResponseEntity.ok(
                busService.updateBus(
                        busId,
                        updatedBus
                )
        );
    }

    @PatchMapping("/{busId}/status")
    public ResponseEntity<Bus> updateBusStatus(
            @PathVariable Long busId,
            @RequestParam boolean active) {

        return ResponseEntity.ok(
                busService.updateBusStatus(
                        busId,
                        active
                )
        );
    }
}