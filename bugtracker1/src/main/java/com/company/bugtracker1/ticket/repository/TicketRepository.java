package com.company.bugtracker1.ticket.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.company.bugtracker1.ticket.entity.Ticket;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.project.projectCode = :code AND YEAR(t.generationDate) = :year")
    long countByProjectCodeAndYear(@Param("code") String code, @Param("year") int year);

    Optional<Ticket> findByTicketId(String ticketId);
}