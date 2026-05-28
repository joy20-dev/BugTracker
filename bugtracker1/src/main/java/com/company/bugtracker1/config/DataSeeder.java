package com.company.bugtracker1.config;

import com.company.bugtracker1.project.entity.Project;
import com.company.bugtracker1.project.repository.ProjectRepository;
import com.company.bugtracker1.sla.entity.PriorityLevel;
import com.company.bugtracker1.sla.entity.SLAPolicy;
import com.company.bugtracker1.sla.entity.SLAType;
import com.company.bugtracker1.sla.repository.SLAPolicyRepository;
import com.company.bugtracker1.user.entity.Role;
import com.company.bugtracker1.user.entity.User;
import com.company.bugtracker1.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Component
@Slf4j
public class DataSeeder {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final SLAPolicyRepository slaPolicyRepository;
    private final PasswordEncoder passwordEncoder;
    private final TransactionTemplate transactionTemplate;

    public DataSeeder(UserRepository userRepository,
                      ProjectRepository projectRepository,
                      SLAPolicyRepository slaPolicyRepository,
                      PasswordEncoder passwordEncoder,
                      PlatformTransactionManager transactionManager) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.slaPolicyRepository = slaPolicyRepository;
        this.passwordEncoder = passwordEncoder;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        transactionTemplate.execute(status -> {
            seed();
            return null;
        });
    }

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

        if (!projectRepository.existsByProjectCode("BUG")) {
            projectRepository.save(Project.builder()
                    .projectCode("BUG")
                    .projectName("Bug Tracker Core")
                    .description("Core bug tracker project")
                    .build());
            log.info("Project BUG created");
        }

        if (!projectRepository.existsByProjectCode("WEB")) {
            projectRepository.save(Project.builder()
                    .projectCode("WEB")
                    .projectName("Web UI Project")
                    .description("Frontend bug tracking project")
                    .build());
            log.info("Project WEB created");
        }

        userRepository.findByEmail("manager@bugtracker.com").ifPresent(manager -> {
            projectRepository.findByProjectCode("BUG").ifPresent(project -> {
                projectRepository.addUserToProject(project.getId(), manager.getId());
            });
        });

        userRepository.findByEmail("engineer@bugtracker.com").ifPresent(engineer -> {
            projectRepository.findByProjectCode("BUG").ifPresent(project -> {
                projectRepository.addUserToProject(project.getId(), engineer.getId());
            });
        });

        // Create SLA policies for BUG project
        projectRepository.findByProjectCode("BUG").ifPresent(project -> {
            createSLAPoliciesForProject(project);
        });

        // Create SLA policies for WEB project
        projectRepository.findByProjectCode("WEB").ifPresent(project -> {
            createSLAPoliciesForProject(project);
        });
    }

    private void createSLAPoliciesForProject(Project project) {
        for (PriorityLevel priority : PriorityLevel.values()) {
            // RESPONSE SLA
            if (!slaPolicyRepository.findByProjectIdAndPriorityLevelAndSlaType(project.getId(), priority, SLAType.RESPONSE).isPresent()) {
                slaPolicyRepository.save(SLAPolicy.builder()
                        .project(project)
                        .priorityLevel(priority)
                        .slaType(SLAType.RESPONSE)
                        .slaMinutes(priority.getResponseSlaMinutes())
                        .includeWeekends(true)
                        .includeBusinessHoursOnly(false)
                        .businessHoursStart("09:00")
                        .businessHoursEnd("18:00")
                        .isActive(true)
                        .build());
                log.info("Created RESPONSE SLA policy for project: {}, priority: {}", project.getProjectCode(), priority);
            }

            // RESOLUTION SLA
            if (!slaPolicyRepository.findByProjectIdAndPriorityLevelAndSlaType(project.getId(), priority, SLAType.RESOLUTION).isPresent()) {
                slaPolicyRepository.save(SLAPolicy.builder()
                        .project(project)
                        .priorityLevel(priority)
                        .slaType(SLAType.RESOLUTION)
                        .slaMinutes(priority.getResolutionSlaMinutes())
                        .includeWeekends(true)
                        .includeBusinessHoursOnly(false)
                        .businessHoursStart("09:00")
                        .businessHoursEnd("18:00")
                        .isActive(true)
                        .build());
                log.info("Created RESOLUTION SLA policy for project: {}, priority: {}", project.getProjectCode(), priority);
            }
        }
    }
}