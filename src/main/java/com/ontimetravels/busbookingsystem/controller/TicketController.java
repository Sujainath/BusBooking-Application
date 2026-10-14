package com.ontimetravels.busbookingsystem.controller;

import com.ontimetravels.busbookingsystem.dto.TicketResponse;
import com.ontimetravels.busbookingsystem.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<TicketResponse> getTicket(
            @PathVariable Long bookingId) {

        TicketResponse ticket =
                ticketService.getTicket(bookingId);

        return ResponseEntity.ok(ticket);
    }
}