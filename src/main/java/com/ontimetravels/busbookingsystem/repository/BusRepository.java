package com.ontimetravels.busbookingsystem.repository;

import com.ontimetravels.busbookingsystem.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BusRepository extends JpaRepository<Bus, Long> {

    List<Bus> findByActiveTrue();
}