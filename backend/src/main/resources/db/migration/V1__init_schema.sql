-- V1__init_schema.sql
-- NEXUS AI MySQL 8.4 Schema

CREATE TABLE IF NOT EXISTS system_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL DEFAULT 'Alex',
    student_email VARCHAR(100) DEFAULT 'alex@nexus.edu',
    academic_major VARCHAR(100) DEFAULT 'Computer Science',
    weekly_focus_goal_hours INT DEFAULT 20,
    ai_provider VARCHAR(50) DEFAULT 'GEMINI',
    ai_model VARCHAR(100) DEFAULT 'gemini-1.5-pro',
    has_custom_api_key BOOLEAN DEFAULT FALSE,
    api_key_masked VARCHAR(50),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    due_date TIMESTAMP NOT NULL,
    estimated_minutes INT DEFAULT 60,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tasks_status (status),
    INDEX idx_tasks_subject (subject),
    INDEX idx_tasks_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS study_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration_minutes INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    task_id BIGINT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sessions_start_time (start_time),
    INDEX idx_sessions_subject (subject),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS focus_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    minutes_focused INT NOT NULL,
    logged_date DATE NOT NULL,
    session_id BIGINT NULL,
    efficiency_score DOUBLE DEFAULT 1.0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_focus_date (logged_date),
    FOREIGN KEY (session_id) REFERENCES study_sessions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mcp_tool_execution_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tool_name VARCHAR(100) NOT NULL,
    session_id VARCHAR(100),
    arguments_json TEXT,
    result_json TEXT,
    status VARCHAR(20) NOT NULL,
    execution_duration_ms BIGINT NOT NULL,
    client_info VARCHAR(255),
    executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_mcp_tool_name (tool_name),
    INDEX idx_mcp_executed_at (executed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS missions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    goal TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'UNDERSTANDING',
    target_date TIMESTAMP NULL,
    daily_hours_available DOUBLE DEFAULT 2.0,
    conflicts_detected INT DEFAULT 0,
    conflict_details TEXT,
    proposed_plan_json TEXT,
    execution_summary_json TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_missions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mission_steps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mission_id BIGINT NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
