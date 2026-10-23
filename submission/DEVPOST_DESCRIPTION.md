# NEXUS AI — The Intelligent Student Operating System
## Build, Ship, Shape: Amazon Developer Hackathon (Alexa+ Track)

> **"Turn ambition into action."**

---

### 💡 Inspiration & The Academic Problem

Students today face an overload of unstructured demands: disparate assignment deadlines, unexpected quiz dates, complex project milestones, and unpredictable daily free hours. A common cry for help sounds like:

> *"I have a Java exam on Friday, a database assignment on Thursday, and only two hours available each evening. Help me prepare."*

Traditional calendar and to-do apps are static repositories: they force the student to manually break down topics, calculate hours, detect overlaps, and key in individual slots.

**NEXUS AI** was born to solve this. Acting as an autonomous academic operating system, NEXUS AI listens to natural language student goals, scans existing deadlines, resolves calendar conflicts, drafts an actionable study plan, requests human approval, and invokes **standards-compliant Model Context Protocol (MCP)** tools to persist real study sessions and deliverables into the student's database.

---

### 🚀 What It Does

NEXUS AI turns vague student ambitions into structured, executable academic workflows:

1. **Mission Control (Flagship Autonomous Workflow):** An interactive multi-step orchestration engine that guides goals through a deterministic state machine: `UNDERSTANDING` &rarr; `PLANNING` &rarr; `CHECKING_CONFLICTS` &rarr; `AWAITING_APPROVAL` &rarr; `EXECUTING` &rarr; `COMPLETED`.
2. **Human Approval Safety Gate:** The AI proposes actions visually—never silently mutating the student's schedule without explicit confirmation.
3. **12 Standards-Compliant MCP Tools:** Direct Streamable HTTP / SSE Model Context Protocol endpoints backing tasks, calendar slots, conflict detection, and productivity analytics.
4. **Command Center Dashboard:** High-contrast dark glassmorphism interface with live focus metrics, dynamic 7-day activity Recharts curves, upcoming deadlines, and real-time MCP health indicators.
5. **AI Assistant:** Conversational assistant with tool calling visibility, argument introspection, code rendering, and voice input simulation.
6. **Task & Schedule Management:** Comprehensive task CRUD with priority tagging and a 7-day schedule timetable with calendar navigation.
7. **SQL-Backed Dynamic Analytics:** Authentic velocity calculation, course distribution, and productivity score derived directly from database focus logs.
8. **Live MCP Telemetry & Playground:** Full audit log viewer and interactive test console allowing judges and developers to dispatch JSON-RPC 2.0 tool requests directly.

---

### 🛠️ Architecture & Technical Stack

- **Backend:**
  - **Java 25 LTS** with modern records, virtual-thread readiness, and robust typing.
  - **Spring Boot 3.4.1** providing high-performance REST controllers and dependency injection.
  - **Streamable HTTP MCP Server** implementing the JSON-RPC 2.0 Model Context Protocol over `/mcp` and `/mcp/sse`.
  - **Spring Data JPA & Hibernate** for persistence.
  - **MySQL 8.4 LTS** with **Flyway** schema migrations.
  - **Spring Boot Actuator** for health checks and metrics.
  - **17 Automated JUnit 5 / MockMvc tests** verifying 100% of core flows.

- **Frontend:**
  - **Next.js 15+ (App Router)** with **React 19** and **TypeScript strict mode**.
  - **Tailwind CSS v4** featuring custom neon tokens (`#070B17`, `#8B5CF6`, `#22D3EE`).
  - **Motion (Framer Motion)** for fluid layout animations.
  - **Recharts** for dual-line activity areas and course distribution charts.
  - **Lucide Icons** for crisp UI iconography.

- **DevOps & Containers:**
  - **Docker Compose** orchestrating frontend, backend, and MySQL 8.4 containers.
  - Multi-stage Dockerfiles optimized for speed and security.

---

### 🔌 Model Context Protocol (MCP) Tools Implemented

NEXUS AI implements 12 distinct, fully functional MCP tools:
1. `create_task`: Adds assignments with estimated duration, priority, and deadlines.
2. `list_tasks`: Retrieves active or completed assignments with course/priority filters.
3. `update_task`: Edits task attributes.
4. `complete_task`: Marks deliverables finished and updates completion timestamps.
5. `delete_task`: Deletes assignments safely.
6. `get_upcoming_deadlines`: Scans tasks due within N days.
7. `create_study_session`: Schedules focused study blocks in the calendar.
8. `list_study_sessions`: Retrieves scheduled timetable blocks.
9. `reschedule_study_session`: Shifts study blocks to alternative windows.
10. `detect_schedule_conflicts`: Analyzes date ranges for overlapping commitments.
11. `generate_study_plan`: Synthesizes day-by-day milestone sessions.
12. `get_productivity_summary`: Returns real SQL-aggregated focus hours and progress.

---

### 🏆 Accomplishments We Are Proud Of

- **Zero Mock Data Deception:** All metrics, tasks, calendar blocks, and analytics are computed live from database rows.
- **Real Human Approval Gate:** Destructive or mutating operations require affirmative student confirmation before invoking MCP execution.
- **Streamable HTTP Conformance:** Tested against real MCP client JSON-RPC handshakes with complete audit logging.
- **Ultra-Compact Archive Size:** The entire clean repository archive measures **under 3 MB**, well beneath the 35 MB hackathon ceiling.

---

### 🔮 What's Next for NEXUS AI

- Direct Alexa+ Smart Display skill integration using AWS Lambda and Amazon Bedrock knowledge bases.
- Calendar sync with Google Calendar, Canvas LMS, and Microsoft Teams.
- Spaced-repetition flashcard generation synchronized with active study blocks.
