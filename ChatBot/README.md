# AVA — Production-Grade Gemini-Only AI Voice Chatbot Backend

AVA is an enterprise-grade AI chatbot backend built with **Java 24**, **Spring Boot 3.4.3**, **Spring AI 2.0.1**, **MySQL 8+**, and **Flyway**.

It uses **Google Gemini as its SINGLE and EXCLUSIVE AI Provider**. No OpenAI, Anthropic, Mistral, Groq, Ollama, ElevenLabs, or Azure AI dependencies exist in this system.

---

## 🏛️ Architecture Overview

```text
                                CLIENT (Web / Mobile)
                                          │
                         REST / SSE (Streaming) / Multipart
                                          │
                                          ▼
                                Spring Boot 3.4 (Java 24)
                                          │
       ┌──────────────────────────────────┼──────────────────────────────────┐
       │                                  │                                  │
       ▼                                  ▼                                  ▼
 Spring Security (JWT)             Conversation Engine                Voice Controller
       │                                  │                                  │
 Authenticated Principal                  │                           Gemini Multimodal STT
       │                                  ▼                                  │
       └────────────────────────> Context Builder <──────────────────────────┘
                                          │
                        (System Prompt + User Memories +
                         Summary + Sliding Window Context)
                                          │
                                          ▼
                                  GeminiChatService
                               (Spring AI Google GenAI)
                                          │
                                          ▼
                                  Google Gemini API
                                          │
                       ┌──────────────────┴──────────────────┐
                       │                                     │
                       ▼                                     ▼
             Tool Calling Execution                 SSE Streaming / Chat
           (Calculator, Weather, Time)             (with Usage Tracking)
```

---

## 🚀 Key Features

1. **Java 24 First**: Fully optimized for Java 24 (`records`, modern pattern matching, modern switch statements, sealed abstractions).
2. **Single AI Provider — Google Gemini API**:
   - Text generation (`gemini-2.5-flash` / configurable).
   - Server-Sent Events (SSE) streaming (`POST /api/v1/conversations/{id}/messages/stream`).
   - Multimodal Audio Input (Speech-To-Text directly via Gemini audio understanding).
   - Speech Synthesis (TTS WAV audio response payload).
   - Function / Tool Calling (whitelisted `CalculatorTool`, `WeatherTool`, `TimeTool`).
   - Structured Output for persistent memory extraction.
   - Autonomous conversation title generation and summarization.
3. **Multi-Tier Context & Memory Engine**:
   - System instruction guidelines.
   - Persistent user memory (`user_memories` table: `PREFERENCE`, `FACT`, `INSTRUCTION`, `PROFILE`).
   - Background conversation summarization (`conversation_summaries` table) when messages exceed threshold.
   - Sliding-window recent message history (configurable up to `MAX_CONTEXT_MESSAGES`).
4. **Security & Data Isolation**:
   - JWT stateless authentication with HMAC-SHA signing.
   - Rotating refresh tokens with revocation support.
   - BCrypt password hashing.
   - Strict user data isolation (every database query verifies authenticated user ownership).
   - Complete GDPR / data deletion support (`DELETE /api/v1/users/me/data`).
5. **Production Hardening & Observability**:
   - Flyway database migrations (`V1` through `V8`).
   - Token-bucket Rate Limiter (`RateLimitService`).
   - Correlation ID tracking (`X-Request-Id`) across logs and HTTP responses.
   - Spring Boot Actuator with custom `GeminiHealthIndicator`.
   - OpenAPI 3 / Swagger UI documentation at `/swagger-ui.html`.
   - 100% Mock-backed unit and controller test suite (runs offline without external API access).

---

## 🛠️ Technology Stack

| Component | Technology | Version |
| :--- | :--- | :--- |
| **Language** | Java | 24 |
| **Framework** | Spring Boot | 3.4.3 |
| **AI Integration** | Spring AI Google GenAI Starter | 2.0.1 |
| **Database** | MySQL | 8.4 LTS |
| **Migration** | Flyway | 10.20.1 |
| **Security** | Spring Security & JJWT | 0.12.6 |
| **API Docs** | Springdoc OpenAPI UI | 2.8.5 |
| **Containerization** | Docker & Docker Compose | Multi-stage Alpine JRE 24 |

---

## 📡 API Endpoints

### 1. Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Register a new account.
- `POST /api/v1/auth/login` — Log in and receive JWT access token & rotating refresh token.
- `POST /api/v1/auth/refresh` — Rotate refresh token and issue new access token.
- `POST /api/v1/auth/logout` — Invalidate refresh token.
- `GET /api/v1/auth/me` — Retrieve current authenticated user profile.
- `DELETE /api/v1/users/me/data` — Delete user account and all personal conversations, messages, and memories.

### 2. Conversations (`/api/v1/conversations`)
- `POST /api/v1/conversations` — Create a new conversation.
- `GET /api/v1/conversations?archived=false&page=0&size=20` — Paginated list of conversations.
- `GET /api/v1/conversations/{id}` — Get conversation details.
- `PATCH /api/v1/conversations/{id}` — Rename title or update archived status.
- `DELETE /api/v1/conversations/{id}` — Delete conversation and all its messages.

### 3. Chat & Streaming (`/api/v1/conversations/{id}/messages`)
- `POST /api/v1/conversations/{id}/messages` — Send a message and receive Gemini's assistant response.
- `POST /api/v1/conversations/{id}/messages/stream` — Stream response tokens via Server-Sent Events (SSE).
- `GET /api/v1/conversations/{id}/messages?page=0&size=50` — Paginated message history.

### 4. Voice & Multimodal Audio (`/api/v1/voice`)
- `POST /api/v1/voice/chat` (multipart: `audio`, `conversationId`) — Transcribe user speech, query Gemini, and return assistant response with audio payload.
- `POST /api/v1/voice/transcribe` (multipart: `audio`) — Transcribe speech to text using Gemini multimodal input.
- `POST /api/v1/voice/synthesize` — Synthesize text to WAV audio format.

### 5. Persistent Memories (`/api/v1/memories`)
- `GET /api/v1/memories` — List long-term facts and preferences extracted by Gemini.
- `DELETE /api/v1/memories/{id}` — Delete a specific memory item.
- `DELETE /api/v1/memories` — Clear all user memories.

### 6. Search (`/api/v1/search`)
- `GET /api/v1/search/conversations?q=spring&limit=10` — Search across conversation titles and message contents.

---

## 💻 Running the Application

### Option 1: Docker Compose (Recommended)

1. Set your Gemini API key:
   ```bash
   cp .env.example .env
   # Edit .env and set your GEMINI_API_KEY
   ```
2. Start MySQL and AVA Backend:
   ```bash
   docker compose up --build -d
   ```
3. Open Swagger UI in your browser:
   ```text
   http://localhost:8080/swagger-ui.html
   ```

### Option 2: Local Development with Maven

1. Start MySQL 8 locally (or run `docker compose up mysql -d`).
2. Export your Gemini API key:
   ```powershell
   $env:GEMINI_API_KEY="your-google-gemini-api-key"
   ```
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

---

## 🧪 Testing

Run the automated test suite:
```bash
mvn clean test
```

All 26 automated unit and controller tests use offline mocks for Gemini API boundaries, guaranteeing test determinism without live internet access or consuming API quotas.
