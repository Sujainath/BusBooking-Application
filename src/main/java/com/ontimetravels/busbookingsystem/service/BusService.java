package com.ontimetravels.busbookingsystem.service;

import com.ontimetravels.busbookingsystem.entity.Bus;
import com.ontimetravels.busbookingsystem.repository.BusRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BusService {

    private final BusRepository busRepository;
    private final SeatService seatService;

    public BusService(
            BusRepository busRepository,
            SeatService seatService) {

        this.busRepository = busRepository;
        this.seatService = seatService;
    }

    public Bus saveBus(Bus bus) {

        bus.setActive(true);

        Bus savedBus = busRepository.save(bus);

        seatService.createSeatsForBus(savedBus);

        return savedBus;
    }

    public List<Bus> getActiveBuses() {
        return busRepository.findByActiveTrue();
    }

    public List<Bus> getAllBuses() {
        return busRepository.findAll();
    }

    public Bus getBusById(Long busId) {

        return busRepository.findById(busId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Bus not found: " + busId
                        ));
    }

    public Bus updateBus(Long busId, Bus updatedBus) {

        Bus existingBus = getBusById(busId);

        existingBus.setBusName(updatedBus.getBusName());
        existingBus.setBusType(updatedBus.getBusType());
        existingBus.setBusNumber(updatedBus.getBusNumber());
        existingBus.setRegistrationNumber(
                updatedBus.getRegistrationNumber()
        );
        existingBus.setTotalSeats(
                updatedBus.getTotalSeats()
        );

        return busRepository.save(existingBus);
    }

    public Bus updateBusStatus(
            Long busId,
            boolean active) {

        Bus bus = getBusById(busId);

        bus.setActive(active);

        return busRepository.save(bus);
    }
}