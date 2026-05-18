package com.company.bugtracker1.ticket.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import com.company.bugtracker1.project.mapper.ProjectMapper;
import com.company.bugtracker1.ticket.dto.TicketDto;
import com.company.bugtracker1.ticket.entity.Ticket;
import com.company.bugtracker1.user.mapper.UserMapper;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {ProjectMapper.class, UserMapper.class})
public interface TicketMapper {

    @Mapping(source = "project", target = "project")
    @Mapping(source = "assignedTo", target = "assignedTo")
    @Mapping(source = "createdBy", target = "createdBy")
    TicketDto.TicketResponse toResponse(Ticket ticket);
}