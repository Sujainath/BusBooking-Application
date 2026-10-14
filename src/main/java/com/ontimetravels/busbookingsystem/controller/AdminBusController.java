
package com.ontimetravels.busbookingsystem.controller;

import com.ontimetravels.busbookingsystem.entity.Bus;
import com.ontimetravels.busbookingsystem.service.BusService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/buses")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class AdminBusController {

    private final BusService busService;

    public AdminBusController(BusService busService) {
        this.busService = busService;
    }

    // List all buses, including inactive buses
    @GetMapping
    public ResponseEntity<List<Bus>> getAllBuses() {
        return ResponseEntity.ok(busService.getAllBuses());
    }

    // Get one bus
    @GetMapping("/{busId}")
    public ResponseEntity<Bus> getBusById(
            @PathVariable Long busId) {

        return ResponseEntity.ok(
                busService.getBusById(busId)
        );
    }

    // Add a new bus
    @PostMapping
    public ResponseEntity<Bus> createBus(
            @RequestBody Bus bus) {

        Bus savedBus = busService.saveBus(bus);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedBus);
    }

    // Edit existing bus details
    @PutMapping("/{busId}")
    public ResponseEntity<Bus> updateBus(
            @PathVariable Long busId,
            @RequestBody Bus updatedBus) {

        return ResponseEntity.ok(
                busService.updateBus(busId, updatedBus)
        );
    }

    // Activate or deactivate a bus
    @PatchMapping("/{busId}/status")
    public ResponseEntity<Bus> updateBusStatus(
            @PathVariable Long busId,
            @RequestParam boolean active) {

        return ResponseEntity.ok(
                busService.updateBusStatus(busId, active)
        );
    }
}
