package com.company.bugtracker1.config;

import com.company.bugtracker1.user.entity.Role;
import com.company.bugtracker1.user.entity.User;
import com.company.bugtracker1.user.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void seed() {
        log.info("Running DataSeeder...");

        if (!userRepository.existsByEmail("admin@bugtracker.com")) {
            userRepository.save(User.builder()
                    .name("System Admin")
                    .email("admin@bugtracker.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build());
            log.info("Admin user created");
        }

        if (!userRepository.existsByEmail("manager@bugtracker.com")) {
            userRepository.save(User.builder()
                    .name("Test Manager")
                    .email("manager@bugtracker.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.MANAGER)
                    .build());
            log.info("Manager user created");
        }

        if (!userRepository.existsByEmail("engineer@bugtracker.com")) {
            userRepository.save(User.builder()
                    .name("Test Engineer")
                    .email("engineer@bugtracker.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.SUPPORT_ENGINEER)
                    .build());
            log.info("Engineer user created");
        }
    }
}