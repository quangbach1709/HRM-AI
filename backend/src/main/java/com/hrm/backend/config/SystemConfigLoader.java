package com.hrm.backend.config;

import com.hrm.backend.entity.SystemConfig;
import com.hrm.backend.repository.SystemConfigRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Loads all system configurations into memory on application startup.
 * Provides static accessors for fast config value retrieval.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SystemConfigLoader {

    private final SystemConfigRepository repository;

    // Thread-safe map to store all configurations
    private static final ConcurrentHashMap<String, SystemConfig> CONFIG_CACHE = new ConcurrentHashMap<>();

    /**
     * Load all configurations on application startup
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("Loading system configurations into cache...");
        loadConfigs();
    }

    /**
     * Load or reload all configurations from database
     */
    public void refresh() {
        log.info("Refreshing system configuration cache...");
        loadConfigs();
    }

    private void loadConfigs() {
        try {
            // Clear existing cache
            CONFIG_CACHE.clear();

            // Load all active configs from database
            List<SystemConfig> configs = repository.findByVoidedFalse();

            // Populate cache
            for (SystemConfig config : configs) {
                if (config.getConfigKey() != null) {
                    CONFIG_CACHE.put(config.getConfigKey(), config);
                }
            }

            log.info("Loaded {} system configurations into cache", CONFIG_CACHE.size());
        } catch (Exception e) {
            log.error("Error loading system configurations: {}", e.getMessage(), e);
        }
    }

    // ===== STATIC ACCESSORS =====

    /**
     * Get config value by key
     * 
     * @param key The config key
     * @return The config value, or null if not found
     */
    public static String getValue(String key) {
        SystemConfig config = CONFIG_CACHE.get(key);
        return config != null ? config.getConfigValue() : null;
    }

    /**
     * Get config value by key with default value
     * 
     * @param key          The config key
     * @param defaultValue Default value if not found
     * @return The config value, or defaultValue if not found
     */
    public static String getValue(String key, String defaultValue) {
        String value = getValue(key);
        return value != null ? value : defaultValue;
    }

    /**
     * Get config value as Integer
     * 
     * @param key The config key
     * @return The config value as Integer, or null if not found or not parseable
     */
    public static Integer getIntValue(String key) {
        String value = getValue(key);
        if (value != null) {
            try {
                return Integer.parseInt(value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Get config value as Integer with default
     * 
     * @param key          The config key
     * @param defaultValue Default value if not found
     * @return The config value as Integer, or defaultValue if not found
     */
    public static Integer getIntValue(String key, Integer defaultValue) {
        Integer value = getIntValue(key);
        return value != null ? value : defaultValue;
    }

    /**
     * Get config value as Boolean
     * 
     * @param key The config key
     * @return The config value as Boolean, or null if not found
     */
    public static Boolean getBoolValue(String key) {
        String value = getValue(key);
        if (value != null) {
            return "true".equalsIgnoreCase(value) || "1".equals(value) || "yes".equalsIgnoreCase(value);
        }
        return null;
    }

    /**
     * Get config value as Boolean with default
     * 
     * @param key          The config key
     * @param defaultValue Default value if not found
     * @return The config value as Boolean, or defaultValue if not found
     */
    public static Boolean getBoolValue(String key, Boolean defaultValue) {
        Boolean value = getBoolValue(key);
        return value != null ? value : defaultValue;
    }

    /**
     * Get full SystemConfig object by key
     * 
     * @param key The config key
     * @return The SystemConfig object, or null if not found
     */
    public static SystemConfig getConfig(String key) {
        return CONFIG_CACHE.get(key);
    }

    /**
     * Check if a config key exists
     * 
     * @param key The config key
     * @return true if exists, false otherwise
     */
    public static boolean hasKey(String key) {
        return CONFIG_CACHE.containsKey(key);
    }

    /**
     * Get number of configs in cache
     * 
     * @return The number of cached configs
     */
    public static int getCacheSize() {
        return CONFIG_CACHE.size();
    }

    /**
     * Get all cached config keys
     * 
     * @return Set of all config keys
     */
    public static Set<String> getAllKeys() {
        return CONFIG_CACHE.keySet();
    }
}
