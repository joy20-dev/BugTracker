package com.company.bugtracker1.auth.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.company.bugtracker1.auth.dto.AuthDto;
import com.company.bugtracker1.config.JwtService;
import com.company.bugtracker1.exception.ConflictException;
import com.company.bugtracker1.user.entity.Role;
import com.company.bugtracker1.user.entity.User;
import com.company.bugtracker1.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered: " + request.email());
        }
        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.SUPPORT_ENGINEER)
                .build();
        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved);
        log.info("New user registered: {}", saved.getEmail());
        return AuthDto.AuthResponse.of(token, saved.getId(), saved.getName(), saved.getEmail(), saved.getRole());
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        User user = userRepository.findByEmail(request.email())
                .orElseThrow();
        String token = jwtService.generateToken(user);
        log.info("User logged in: {}", user.getEmail());
        return AuthDto.AuthResponse.of(token, user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}