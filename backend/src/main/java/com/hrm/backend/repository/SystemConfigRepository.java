package com.hrm.backend.repository;

import com.hrm.backend.entity.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SystemConfigRepository
        extends JpaRepository<SystemConfig, UUID>, JpaSpecificationExecutor<SystemConfig> {

    Optional<SystemConfig> findByConfigKey(String configKey);

    Optional<SystemConfig> findByConfigKeyAndVoidedFalse(String configKey);

    boolean existsByConfigKey(String configKey);

    List<SystemConfig> findByVoidedFalse();

    List<SystemConfig> findByVoidedFalseOrderByConfigKeyAsc();

    List<SystemConfig> findByConfigTypeAndVoidedFalse(Integer configType);
}
