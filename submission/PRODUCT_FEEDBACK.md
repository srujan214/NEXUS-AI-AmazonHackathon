# NEXUS AI — Product & Developer Feedback Report
## Build, Ship, Shape: Amazon Developer Hackathon (Alexa+ Track)

---

### 1. Developer Ecosystem & Tools Evaluated

During the engineering of **NEXUS AI**, the team engaged deeply with several modern development tools and standards:
- **Model Context Protocol (MCP) Specification (2024-11-05 / 2025-11-25 revisions):** Used to expose standardized tool endpoints (`/mcp`, `/mcp/sse`) for agentic AI architectures.
- **Java 25 LTS & Spring Boot 3.4.1:** Core backend foundation paired with Spring AI, Hibernate ORM, and Spring Boot Actuator.
- **MySQL 8.4 LTS & Flyway 10:** Production relational database and schema migrations.
- **Next.js 15 (App Router) & React 19:** Server components and dynamic client pages.
- **Tailwind CSS v4:** Modern CSS engine utilizing new `@import "tailwindcss";` mechanics.

---

### 2. Strengths & What Worked Exceptionally Well

1. **Model Context Protocol as a Universal Tool Interface:**
   - Decoupling tool schemas (`tools/list`) and execution (`tools/call`) from specific LLM prompt formats allowed the backend to serve both the web UI assistant and external MCP clients (such as Claude Desktop or Alexa+ backends) using identical business logic.
   - Streaming transport over HTTP and SSE provides clean separation between tool execution latency and client-side UI rendering.

2. **State Machine-Driven Orchestration (Mission Control):**
   - Structuring academic planning as an explicit multi-step state machine (`UNDERSTANDING` &rarr; `PLANNING` &rarr; `CHECKING_CONFLICTS` &rarr; `AWAITING_APPROVAL` &rarr; `EXECUTING` &rarr; `COMPLETED`) prevents unpredictable hallucinations and ensures 100% reproducible execution.
   - The human approval gate acts as an intuitive safety barrier against destructive calendar mutations.

3. **Tailwind CSS v4 & Glassmorphic Component Aesthetics:**
   - Tailwind v4's high-speed CSS engine and CSS variables enabled responsive, high-contrast dark theme styling with zero stylesheet bloat.

---

### 3. Friction Points & Technical Workarounds

1. **Java Bytecode Compatibility with Spring Framework ASM:**
   - *Friction:* Compiling strictly with target major version 69 (pure Java 25 bytecode) triggered an `IllegalArgumentException: Unsupported class file major version 69` in Spring's internal ASM ClassReader during classpath scanning.
   - *Workaround:* Configured Maven properties to compile with bytecode release target 21 (`<java.version>21</java.version>`) while running seamlessly on the Oracle JDK 25 LTS runtime (`Java version 25.0.4.1`). This preserved all modern JVM virtual-thread advantages without breaking Spring's annotation scanner.

2. **MCP Specification Evolving Standards:**
   - *Friction:* Earlier MCP client implementations expected bidirectional STDIO pipes, while modern web and cloud deployments (including Alexa+ remote agents) demand Streamable HTTP / Server-Sent Events (SSE).
   - *Workaround:* Implemented dual transports in `McpController`: standard JSON-RPC 2.0 `POST /mcp` for synchronous streamable queries alongside `GET /mcp/sse` and `POST /mcp/message` for long-lived push streaming.

3. **Deterministic AI Fallback Requirement:**
   - *Friction:* Hackathon reviewers or local judges may test the application without entering an external Amazon Bedrock or Google Gemini API key.
   - *Workaround:* Engineered a dual-mode AI service: When API keys are supplied via environment variables or the Settings page, the agent queries live LLMs. When no key is present, the built-in deterministic heuristic engine analyzes the prompt and executes real MCP tools directly, guaranteeing an out-of-the-box working experience without dead buttons or error walls.

---

### 4. Recommendations for Amazon Developer Tooling

- Provide an official Amazon Bedrock Java MCP SDK starter to accelerate enterprise Spring Boot integrations.
- Offer an interactive Alexa+ MCP client simulator in the Amazon Developer Console to facilitate end-to-end cloud handshake verification before skill publishing.
