# NEXUS AI — Engineering Friction Log

This log chronicles specific technical hurdles encountered during the development sprint, their underlying root causes, and the concrete engineering resolutions applied.

---

### Incident 1: Spring Boot ASM ClassReader Bytecode Major Version Conflict
- **Context:** Initial Maven compilation with `<java.version>25</java.version>` on Java JDK 25 LTS.
- **Symptom:** Unit tests failed during application context bootstrapping with:
  `org.springframework.core.type.classreading.ClassFormatException: ASM ClassReader failed to parse class file ... Caused by: java.lang.IllegalArgumentException: Unsupported class file major version 69`
- **Root Cause:** Spring Boot 3.4.1 embeds an ASM library version capable of parsing up to class file version 67/68 (Java 23/24). Java 25 bytecode emits class file version 69.
- **Resolution:** Adjusted compiler plugin release target in `pom.xml` to `21` (`<release>21</release>`), allowing javac on JDK 25 to generate binary-compatible class files while running completely on the high-performance JDK 25 HotSpot JVM.

---

### Incident 2: Lambda Effectively Final Constraint in Mission Control Conflict Detection
- **Context:** Implementing the calendar slot conflict detection algorithm in `MissionService.java`.
- **Symptom:** Maven build compilation error:
  `[ERROR] local variables referenced from a lambda expression must be final or effectively final`
- **Root Cause:** The `slotStart` and `slotEnd` variables were reassigned within a subsequent loop block to shift conflicting slots, violating Java's closure requirement for streams.
- **Resolution:** Extracted local immutable instances `final Instant checkStart = slotStart;` and `final Instant checkEnd = slotEnd;` prior to stream evaluation, cleanly preserving immutability.

---

### Incident 3: Test Suite Assertion Drift During MCP Expansion
- **Context:** Extending the Model Context Protocol tool registry from 4 baseline tools to all 12 mandatory hackathon tools.
- **Symptom:** `McpAndAiControllerTest` failed with `Expected: a collection with size <4> but: collection size was <12>`.
- **Root Cause:** Legacy test assertions hardcoded an expected length of 4 tools before the expanded toolset was introduced.
- **Resolution:** Updated test assertions to validate all 12 mandatory MCP tools (`create_task`, `list_tasks`, `update_task`, `complete_task`, `delete_task`, `get_upcoming_deadlines`, `create_study_session`, `list_study_sessions`, `reschedule_study_session`, `detect_schedule_conflicts`, `generate_study_plan`, `get_productivity_summary`).

---

### Incident 4: Cross-Origin Resource Sharing (CORS) & Reverse Proxy Mappings
- **Context:** Connecting Next.js App Router on port 3000 to Spring Boot on port 8080.
- **Symptom:** Browser fetch calls to `/api/tasks` and `/mcp` required handling both preflight `OPTIONS` and server-to-server container proxying in Docker.
- **Resolution:** Configured `WebConfig.java` to explicitly permit `http://localhost:3000` with credential support and configured `next.config.ts` rewrites to proxy `/api/:path*` and `/mcp/:path*` directly to the backend.
