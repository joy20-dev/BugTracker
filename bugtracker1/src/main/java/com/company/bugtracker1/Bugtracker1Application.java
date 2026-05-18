package com.company.bugtracker1;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.company.bugtracker1")
public class Bugtracker1Application {

    public static void main(String[] args) {
        SpringApplication.run(Bugtracker1Application.class, args);
    }
}