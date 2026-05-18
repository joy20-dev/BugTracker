package com.company.bugtracker1.user.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import com.company.bugtracker1.user.dto.UserDto;
import com.company.bugtracker1.user.entity.User;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {

    UserDto.UserResponse toResponse(User user);

    UserDto.UserSummary toSummary(User user);
}