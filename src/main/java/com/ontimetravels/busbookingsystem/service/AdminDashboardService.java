package com.ontimetravels.busbookingsystem.service;

import com.ontimetravels.busbookingsystem.dto.AdminDashboardResponse;
import com.ontimetravels.busbookingsystem.entity.Booking;
import com.ontimetravels.busbookingsystem.repository.BookingRepository;
import com.ontimetravels.busbookingsystem.repository.BusRepository;
import com.ontimetravels.busbookingsystem.repository.BusScheduleRepository;
import com.ontimetravels.busbookingsystem.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final BusRepository busRepository;
    private final BusScheduleRepository busScheduleRepository;
    private final BookingRepository bookingRepository;

    public AdminDashboardService(
            UserRepository userRepository,
            BusRepository busRepository,
            BusScheduleRepository busScheduleRepository,
            BookingRepository bookingRepository) {

        this.userRepository = userRepository;
        this.busRepository = busRepository;
        this.busScheduleRepository = busScheduleRepository;
        this.bookingRepository = bookingRepository;
    }

    public AdminDashboardResponse getDashboardSummary() {

        long totalUsers = userRepository.count();

        long totalBuses = busRepository.count();

        long totalSchedules = busScheduleRepository.count();

        long totalBookings = bookingRepository.count();

        long confirmedBookings =
                bookingRepository.countByStatus(
                        Booking.BookingStatus.CONFIRMED
                );

        long cancelledBookings =
                bookingRepository.countByStatus(
                        Booking.BookingStatus.CANCELLED
                );

        BigDecimal totalRevenue =
                bookingRepository.calculateTotalRevenue();

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalBuses(totalBuses)
                .totalSchedules(totalSchedules)
                .totalBookings(totalBookings)
                .confirmedBookings(confirmedBookings)
                .cancelledBookings(cancelledBookings)
                .totalRevenue(totalRevenue)
                .build();
    }
}