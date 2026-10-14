package com.ontimetravels.busbookingsystem.config;

import com.ontimetravels.busbookingsystem.service.ScheduleGenerationService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeData(
            ScheduleGenerationService scheduleGenerationService) {

        return args -> {
            scheduleGenerationService
                    .ensurePreBookedSeatsForExistingSchedules();
        };
    }
}