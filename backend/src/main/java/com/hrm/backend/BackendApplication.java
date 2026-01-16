package com.hrm.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

// Tách biệt package scan cho JPA và MongoDB repositories để tránh xung đột
@EnableJpaRepositories(basePackages = "com.hrm.backend.repository")
@EnableMongoRepositories(basePackages = "com.hrm.backend.repository.mongo")
@EnableScheduling // Bật tính năng scheduled jobs
@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SpringApplication.run(BackendApplication.class, args);
    }

}
