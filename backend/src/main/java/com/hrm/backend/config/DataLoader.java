package com.hrm.backend.config;

import com.hrm.backend.entity.Role;
import com.hrm.backend.entity.User;
import com.hrm.backend.entity.UserRole;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class DataLoader implements CommandLineRunner {

    @PersistenceContext
    private EntityManager entityManager;

    private final PasswordEncoder passwordEncoder;


    public DataLoader(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Check if roles already exist
        List<Role> existingRoles = entityManager.createQuery("SELECT r FROM Role r", Role.class).getResultList();
        if (!existingRoles.isEmpty()) {
            System.out.println("Data already exists, skipping seeding...");
            return;
        }

        // Create roles
        Role adminRole = createRole("ROLE_ADMIN", "Quản trị viên hệ thống");
        Role managerRole = createRole("ROLE_MANAGER", "Quản lý");
        Role hrRole = createRole("ROLE_HR", "Nhân sự");
        Role employeeRole = createRole("ROLE_EMPLOYEE", "Nhân viên");

        // Create demo users
        createUser("admin", "admin@company.com", "123456", adminRole);
        createUser("manager", "manager@company.com", "12345678", managerRole);
        createUser("hr", "hr@company.com", "123456", hrRole);
        createUser("employee", "employee@company.com", "123456", employeeRole);

        System.out.println("=".repeat(50));
        System.out.println("Demo data loaded successfully!");
        System.out.println("=".repeat(50));
        System.out.println("Demo accounts (password: 123456):");
        System.out.println("  - admin@company.com (Admin)");
        System.out.println("  - manager@company.com (Manager)");
        System.out.println("  - hr@company.com (HR)");
        System.out.println("  - employee@company.com (Employee)");
        System.out.println("=".repeat(50));
    }

    private Role createRole(String name, String description) {
        Role role = new Role();
        role.setName(name);
        role.setDescription(description);
        role.setVoided(false);
        entityManager.persist(role);
        System.out.println("Created role: " + name);
        return role;
    }

    private void createUser(String username, String email, String password, Role role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setVoided(false);

        // Create UserRole and associate with user
        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);
        userRole.setVoided(false);

        Set<UserRole> roles = new HashSet<>();
        roles.add(userRole);
        user.setRoles(roles);

        entityManager.persist(user);
        System.out.println("Created user: " + email);
    }
}
