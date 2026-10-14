package com.ontimetravels.busbookingsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @Column(nullable = false)
    private String seatNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatType seatType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Deck deck;

    @Column(nullable = false)
    private boolean active = true;

    public enum SeatType {
        SEATER,
        SINGLE_SLEEPER,
        DOUBLE_SLEEPER
    }

    public enum Deck {
        LOWER,
        UPPER
    }
}