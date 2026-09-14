package com.ava;

import org.springframework.ai.retry.autoconfigure.SpringAiRetryAutoConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(exclude = {SpringAiRetryAutoConfiguration.class})
@ConfigurationPropertiesScan
@EnableAsync
public class AvaApplication {

    static {
        loadDotEnv();
    }

    private static void loadDotEnv() {
        try {
            java.nio.file.Path envPath = java.nio.file.Paths.get(".env");
            if (java.nio.file.Files.exists(envPath)) {
                java.nio.file.Files.lines(envPath)
                        .map(String::trim)
                        .filter(line -> !line.isEmpty() && !line.startsWith("#") && line.contains("="))
                        .forEach(line -> {
                            int idx = line.indexOf('=');
                            String key = line.substring(0, idx).trim();
                            String val = line.substring(idx + 1).trim();
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, val);
                            }
                        });
            }
        } catch (Exception ignored) {
        }
    }

    private static void ensureDatabaseExists() {
        try {
            String dbUrl = System.getProperty("DATABASE_URL", System.getenv("DATABASE_URL"));
            String user = System.getProperty("DATABASE_USERNAME", System.getenv("DATABASE_USERNAME"));
            String pass = System.getProperty("DATABASE_PASSWORD", System.getenv("DATABASE_PASSWORD"));
            if (dbUrl != null && user != null && pass != null && dbUrl.startsWith("jdbc:mysql://")) {
                int queryIdx = dbUrl.indexOf('?');
                String cleanUrl = queryIdx != -1 ? dbUrl.substring(0, queryIdx) : dbUrl;
                int lastSlash = cleanUrl.lastIndexOf('/');
                if (lastSlash > "jdbc:mysql://".length()) {
                    String dbName = cleanUrl.substring(lastSlash + 1);
                    String serverUrl = cleanUrl.substring(0, lastSlash + 1) + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
                    try (java.sql.Connection conn = java.sql.DriverManager.getConnection(serverUrl, user, pass);
                         java.sql.Statement stmt = conn.createStatement()) {
                        stmt.executeUpdate("CREATE DATABASE IF NOT EXISTS `" + dbName + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                    }
                }
            }
        } catch (Exception ignored) {
        }
    }

    public static void main(String[] args) {
        ensureDatabaseExists();
        SpringApplication.run(AvaApplication.class, args);
    }
}
