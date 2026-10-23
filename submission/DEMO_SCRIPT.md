# NEXUS AI — 3-Minute Hackathon Demo Script
## Alexa+ Track — Build, Ship, Shape: Amazon Developer Hackathon

---

### [0:00 – 0:20] Introduce the Student Problem
- **Visual:** Presenter on screen or opening slide showing an overloaded student calendar with exams, labs, and deadlines overlapping.
- **Narrator (Spoken):**
  > "Every student knows this feeling: You have an impending Java exam on Friday, a database assignment due Thursday, and only two hours of free time each evening. Traditional to-do apps leave you stranded, forcing you to manually calculate hours, slice up topics, and key in calendar slots. What if your academic universe could organize itself autonomously through AI and standardized tool protocols? Meet **NEXUS AI — The Intelligent Student Operating System**."

---

### [0:20 – 0:45] Show the NEXUS Dashboard
- **Visual:** Screen switches to the **Overview Dashboard** (`http://localhost:3000`). Show the deep-space dark theme, animated holographic 3D orb with the glowing 'N' insignia, the 4 real-time stat cards (Active Tasks: 12, Focus Time: 18h, Progress: 87%), and the dual Recharts activity curve.
- **Narrator (Spoken):**
  > "Here is the NEXUS command center. Everything you see here is backed by real SQL database rows — no hardcoded metrics or fake success toasts. Notice our live 7-Day Schedule timeline, active assignments, and the green 'All Healthy' indicator for our Model Context Protocol server. But the true game-changer is our flagship innovation: **Mission Control**."

---

### [0:45 – 1:15] Give Mission Control a Complex Study Goal
- **Visual:** Click on **Mission Control** in the sidebar. Show the goal input area.
- **Action:** Paste the realistic student challenge:
  `"I have a Java exam on Friday, a database assignment on Thursday, and only two hours available each evening. Help me prepare."`
- **Action:** Set Daily Focus Commitment to `2.0` hours and Target Date to 5 days out. Click **Initiate Autonomous Planning**.
- **Narrator (Spoken):**
  > "Watch our autonomous state machine engage. NEXUS doesn't just guess—it transitions through real backend phases: Understanding your intent, scanning existing database deadlines, and evaluating your calendar for conflicts. Notice our Conflict Detection banner: It spotted overlapping sessions on Thursday and automatically shifted study slots to open afternoon windows to keep your schedule achievable."

---

### [1:15 – 1:45] Show the Proposed Plan & Human Approval Gate
- **Visual:** Scroll to the **Proposed Plan Preview** card. Highlight the structured daily milestone blocks: Day 1 Concurrency, Day 2 Records, Day 3 Memory Management, and the final deliverable. Highlight the glowing **Human Approval Gate** alert box.
- **Narrator (Spoken):**
  > "Crucially, NEXUS enforces a strict safety boundary: It shows a visual preview of proposed time blocks and *never* silently mutates your schedule without your explicit consent. We review the plan, see the conflict resolution, and click **Approve & Execute via MCP**."

---

### [1:45 – 2:15] Real MCP Tool Executions & Database-Backed Results
- **Visual:** Click the green approval button. The state transitions to `EXECUTING` and then `COMPLETED`. An execution summary appears showing real operations executed.
- **Action:** Navigate to **MCP Activity** in the sidebar (`/mcp-activity`).
- **Narrator (Spoken):**
  > "Behind the scenes, NEXUS dispatched standardized JSON-RPC 2.0 calls over our Streamable HTTP MCP server: `create_task` and `create_study_session`. In our live MCP Telemetry log, you see each tool invocation, the exact duration in milliseconds, correlation IDs, and raw JSON payloads. Nothing is simulated; this is true protocol-level tool orchestration."

---

### [2:15 – 2:40] Show Schedule, Analytics, and Persistence
- **Visual:** Click **Study Planner** (`/planner`) to show the newly scheduled study blocks populated into the 7-day calendar. Then click **Analytics** (`/analytics`) to show the updated focus hours, subject distribution, and progress metrics.
- **Narrator (Spoken):**
  > "Instantly, our Study Planner timetable reflects the newly scheduled blocks. Over in Analytics, our velocity charts and subject distribution recalculate dynamically from our database focus logs. Even if we restart the application or Docker stack, all data remains persistently stored."

---

### [2:40 – 2:55] Explain Technical Architecture & Impact
- **Visual:** Briefly display the architectural flow diagram: User &rarr; AI Agent &rarr; Streamable HTTP MCP Server &rarr; Spring Boot 3.4 / Java 25 &rarr; MySQL 8.4 Database.
- **Narrator (Spoken):**
  > "Architecturally, NEXUS AI is built with Java 25 LTS, Spring Boot 3.4, a 12-tool Model Context Protocol server over Streamable HTTP, Next.js 15 with Tailwind CSS v4, and MySQL 8.4. It operates reliably with external LLMs or self-contained deterministic heuristics."

---

### [2:55 – 3:00] Closing
- **Visual:** Return to the hero screen with the glowing orb and the tagline: *"Turn ambition into action."*
- **Narrator (Spoken):**
  > "NEXUS AI: Transforming unstructured academic stress into calm, structured achievement. Thank you!"
