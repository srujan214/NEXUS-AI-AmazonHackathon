# NEXUS AI — System Architecture & Technical Specification
## Build, Ship, Shape: Amazon Developer Hackathon (Alexa+ Track)

---

### 1. High-Level System Architecture

NEXUS AI is built as a modular 3-tier reactive system:

```mermaid
graph TD
    subgraph ClientLayer["Frontend Client Layer (Next.js 15 / React 19)"]
        UI["Modern Glassmorphic UI (#070B17, #8B5CF6, #22D3EE)"]
        Pages["8 Pages: /dashboard, /missions, /assistant, /tasks, /planner, /analytics, /mcp, /settings"]
        ClientAPI["Typed API & MCP Client (Fetch / TanStack Query)"]
    end

    subgraph BackendLayer["Backend Application Layer (Java 25 / Spring Boot 3.4)"]
        RESTControllers["REST Controllers (/api/*)"]
        MCPServer["Streamable HTTP MCP Server (/mcp, /mcp/sse, /mcp/message)"]
        MissionEngine["Mission Control State Machine Engine"]
        AIAssistant["AI Agent Service (Bedrock / Gemini / Heuristic Fallback)"]
        MCPToolRegistry["12 MCP Tools Registry"]
        Auditor["MCP Telemetry & Audit Logger"]
        DomainServices["Domain Services (Task, Schedule, Analytics, Settings)"]
        Repositories["Spring Data JPA Repositories"]
    end

    subgraph DataLayer["Persistence Layer"]
        MySQL[(MySQL 8.4 LTS / Flyway Migrations / H2 Dev)]
    end

    UI --> ClientAPI
    Pages --> ClientAPI
    ClientAPI -->|JSON REST| RESTControllers
    ClientAPI -->|JSON-RPC 2.0 / SSE| MCPServer
    RESTControllers --> DomainServices
    RESTControllers --> MissionEngine
    MissionEngine --> MCPToolRegistry
    AIAssistant --> MCPToolRegistry
    MCPToolRegistry --> Auditor
    MCPToolRegistry --> DomainServices
    DomainServices --> Repositories
    Auditor --> Repositories
    Repositories --> MySQL
```

---

### 2. The Mission Control Flagship Workflow

The core differentiator of NEXUS AI is its stateful, autonomous academic planning pipeline:

```mermaid
stateDiagram-v2
    [*] --> UNDERSTANDING: Student Submits High-Level Goal
    UNDERSTANDING --> PLANNING: Parse Intent & Academic Deadlines
    PLANNING --> CHECKING_CONFLICTS: Query Existing Calendar & Deliverables
    CHECKING_CONFLICTS --> AWAITING_APPROVAL: Detect Overlaps & Optimize Open Slots
    AWAITING_APPROVAL --> EXECUTING: Student Clicks "Approve via MCP"
    AWAITING_APPROVAL --> CANCELLED: Student Clicks "Decline / Cancel"
    EXECUTING --> COMPLETED: Real MCP Tools Invoked (create_task, create_study_session)
    EXECUTING --> FAILED: Rollback on Tool Execution Failure
    COMPLETED --> [*]
    CANCELLED --> [*]
```

---

### 3. Model Context Protocol (MCP) Streamable HTTP Flow

NEXUS AI adheres strictly to the Model Context Protocol (2024-11-05 / 2025-11-25 specifications) via Streamable HTTP and SSE:

```mermaid
sequenceDiagram
    autonumber
    participant Client as Client (Web Console / Alexa+ Host)
    participant Endpoint as Streamable HTTP (/mcp)
    participant Registry as MCP Tool Registry
    participant Auditor as Telemetry & Audit Logger
    participant DB as MySQL 8.4 Database

    Client->>Endpoint: POST /mcp {"jsonrpc": "2.0", "method": "initialize"}
    Endpoint-->>Client: {"protocolVersion": "2025-11-25", "serverInfo": {"name": "nexus-mcp-server"}}

    Client->>Endpoint: POST /mcp {"jsonrpc": "2.0", "method": "tools/list"}
    Endpoint-->>Client: List of 12 Tool Definitions with JSON Schemas

    Client->>Endpoint: POST /mcp {"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "create_task", "arguments": {...}}}
    Endpoint->>Registry: Dispatch to registered tool handler
    Registry->>DB: Persist Task Entity (Title, Subject, DueDate, Priority)
    Registry->>Auditor: Log duration (ms), correlation ID, raw JSON payload
    Auditor->>DB: Insert into mcp_tool_execution_logs
    Endpoint-->>Client: {"jsonrpc": "2.0", "result": {"content": [{"type": "text", "text": "{...}"}]}}
```

---

### 4. Database Schema Entity Relationships

The relational schema is managed through **Flyway migration `V1__init_schema.sql`** and enforced via foreign key constraints:

```mermaid
erDiagram
    SYSTEM_SETTINGS {
        bigint id PK
        varchar student_name
        varchar student_email
        varchar academic_major
        int weekly_focus_goal_hours
        varchar ai_provider
        varchar ai_model
        boolean has_custom_api_key
        varchar api_key_masked
        timestamp updated_at
    }

    TASKS {
        bigint id PK
        varchar title
        text description
        varchar subject
        varchar priority
        varchar status
        timestamp due_date
        int estimated_minutes
        timestamp completed_at
        timestamp created_at
        timestamp updated_at
    }

    STUDY_SESSIONS {
        bigint id PK
        varchar title
        varchar subject
        timestamp start_time
        timestamp end_time
        int duration_minutes
        varchar status
        bigint task_id FK
        text notes
        timestamp created_at
    }

    FOCUS_LOGS {
        bigint id PK
        varchar subject
        int minutes_focused
        date logged_date
        bigint session_id FK
        double efficiency_score
        timestamp created_at
    }

    MCP_TOOL_EXECUTION_LOGS {
        bigint id PK
        varchar tool_name
        varchar session_id
        text arguments_json
        text result_json
        varchar status
        bigint execution_duration_ms
        varchar client_info
        timestamp executed_at
    }

    MISSIONS {
        bigint id PK
        text goal
        varchar status
        timestamp target_date
        double daily_hours_available
        int conflicts_detected
        text conflict_details
        text proposed_plan_json
        text execution_summary_json
        timestamp created_at
        timestamp updated_at
    }

    MISSION_STEPS {
        bigint id PK
        bigint mission_id FK
        varchar step_name
        varchar status
        text details
        timestamp created_at
    }

    TASKS ||--o{ STUDY_SESSIONS : "links to"
    STUDY_SESSIONS ||--o{ FOCUS_LOGS : "logs"
    MISSIONS ||--|{ MISSION_STEPS : "contains"
```

---

### 5. Security Architecture

1. **Zero Client-Side Secret Exposure:** AI model credentials (`AI_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `AWS_ACCESS_KEY_ID`) are exclusively held in server-side environment variables or masked in the settings repository. No API key is ever embedded into frontend client bundles.
2. **Safe Local Fallback:** When no external credentials are present, the system defaults to deterministic heuristic execution, preventing credential leakage or runtime crashes.
3. **Audit Trail Immutability:** Every MCP operation records its correlation ID, duration, caller info, and raw input/output payloads in `mcp_tool_execution_logs`.
