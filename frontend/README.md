# AVA — Premium AI Chat Frontend

Production-grade, commercial-quality AI chatbot frontend built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Zustand**.

AVA connects directly to the **Spring Boot backend** (`http://localhost:8080/api/v1`) providing a ChatGPT-grade conversational experience with real-time SSE streaming, multimodal voice interaction, long-term memory management, and dark/light modes while maintaining its own distinct visual identity.

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                      AVA FRONTEND                      │
│            Next.js App Router (TypeScript)             │
│                                                        │
│  Chat UI & SSE Stream       Collapsible Sidebar        │
│  Voice Recording & Audio    Zustand Store Architecture │
│  Memory Explorer            Search Modal (Cmd+K)       │
│  Authentication & Security  Settings & Profile         │
└──────────────────────────┬─────────────────────────────┘
                           │  REST / SSE (Streaming) / Multipart
                           ▼
┌────────────────────────────────────────────────────────┐
│                  SPRING BOOT BACKEND                   │
│                                                        │
│  Spring Security (JWT)      Conversation Engine        │
│  Persistent User Memory     Voice Controller & STT/TTS │
│  Rate Limiting              Actuator & Metrics         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
                 Google Gemini API
```

### 🔒 Absolute Security Rule

- **The frontend NEVER calls Gemini directly.**
- Secrets such as `GEMINI_API_KEY`, JWT signing secrets, and database credentials remain exclusively on the Spring Boot backend.
- The browser communicates **only** with the Spring Boot backend over secure REST and Server-Sent Events (SSE).

---

## 🚀 Key Features

1. **Primary Chat Experience**:
   - ChatGPT-style workflow with AVA's original minimalist, intelligent aesthetic.
   - Clean spacing, typography, and responsive design across desktop, tablet, and mobile (320px to 4K).
   - Welcome view with brand emblem and interactive prompt cards.

2. **Server-Sent Events (SSE) Streaming**:
   - Progressive token streaming from `POST /api/v1/conversations/{id}/messages/stream`.
   - "AVA is thinking..." animated state.
   - Genuine "Stop generating" cancellation using native `AbortController`.
   - Smart auto-scrolling: smoothly follows output if near bottom, or displays a floating `↓ New messages` button if scrolled up.

3. **Message Design & Markdown Rendering**:
   - Inline message editing and resending for user messages.
   - Full GitHub Flavored Markdown (GFM): headings, blockquotes, lists, tables, and links.
   - Syntax-highlighted code blocks with language badge and one-click copy with visual checkmark.
   - Message toolbar: Copy, Regenerate, Like/Dislike feedback, and TTS Listen button.

4. **Multimodal Voice UI & Audio Synthesis**:
   - Browser `MediaRecorder` voice recording modal with live duration timer and ripple visualizer.
   - Sends recorded audio to `/api/v1/voice/transcribe` or `/api/v1/voice/chat`.
   - Built-in audio player for listening to synthesized WAV speech responses (`/api/v1/voice/synthesize`).

5. **Collapsible Sidebar & Global Search**:
   - Desktop sidebar with expanded and icon-only collapsed views.
   - Mobile responsive drawer with backdrop.
   - Chronological grouping: **Today**, **Yesterday**, **Previous 7 days**, **Older**.
   - Inline conversation renaming, archiving, and permanent deletion with confirmation modals.
   - Global debounced search (`Cmd+K` / `Ctrl+K`) querying `/api/v1/search/conversations`.

6. **Long-Term Memory Management (`/memory`)**:
   - View facts, preferences, instructions, and profile memories synthesized by Gemini.
   - Filter by memory type badge with importance indicators.
   - Delete individual memories or clear all with confirmation.

7. **Authentication & User Profile (`/login`, `/register`, `/profile`)**:
   - JWT authentication with automatic 401 token refresh queue (`/api/v1/auth/refresh`).
   - Profile management with GDPR-compliant permanent data deletion (`DELETE /api/v1/users/me/data`).

8. **Settings & Customization (`/settings`)**:
   - Dark, Light, and System themes (powered by `next-themes`).
   - Enter to send, show timestamps, stream responses toggle.
   - Voice autoplay and speech speed controls.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Radix UI Primitives, Lucide Icons |
| **State Management** | Zustand (with persistent client storage) |
| **Markdown** | React-Markdown, Remark-GFM |
| **Notifications** | Sonner |
| **Testing** | Vitest, @testing-library/react, jsdom |

---

## ⚙️ Environment Variables

Create `.env.local` in the `frontend` directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

For production deployment:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
```

---

## 💻 Getting Started

### Prerequisites

- **Node.js**: v20+ or v24+
- **npm**: v10+ or v11+
- **Spring Boot Backend**: Running on `http://localhost:8080`

### Installation

```bash
cd frontend
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Run Tests

```bash
npm test
```

### Build for Production

```bash
npm run build
npm start
```

---

## 📂 Project Structure

```text
src/
├── api/
│   ├── client.ts             # Central API client with 401 refresh queue & error parsing
│   ├── authApi.ts            # Registration, login, token refresh, logout, profile
│   ├── conversationApi.ts    # Conversation CRUD and archive operations
│   ├── messageApi.ts         # REST messaging and SSE stream reader
│   ├── voiceApi.ts           # Speech-to-Text, Text-to-Speech, and voice chat
│   ├── memoryApi.ts          # Persistent user memories management
│   └── searchApi.ts          # Debounced conversation & message search
├── types/
│   └── api.ts                # TypeScript types matching Spring Boot Java DTOs
├── store/
│   ├── authStore.ts          # Authentication state and tokens
│   ├── conversationStore.ts  # Conversations list, active session, optimistic updates
│   ├── chatStore.ts          # Active messages, streaming lifecycle, thinking state
│   └── settingsStore.ts      # Theme, shortcuts, and audio preferences
├── components/
│   ├── ui/                   # Button, Input, Modal, ConfirmModal, Avatar, Tooltip
│   ├── layout/               # AppLayout, Sidebar, MobileNav, SearchModal
│   ├── chat/                 # ChatContainer, MessageList, UserMessage, AssistantMessage,
│   │                         # CodeBlock, Composer, VoiceRecorderModal, AudioPlayer
│   ├── memory/               # MemoryView, category filters, memory cards
│   ├── settings/             # SettingsView, ProfileView
│   └── auth/                 # AuthGuard route protection
├── hooks/
│   ├── useStreamMessage.ts   # SSE streaming hook with AbortController
│   ├── useVoiceRecorder.ts   # Web Audio MediaRecorder hook
│   └── useDebounce.ts        # Search input debounce hook
└── app/
    ├── layout.tsx            # Theme provider, tooltips, toasts
    ├── page.tsx              # Root redirect to /chat
    ├── login/page.tsx        # Authentication login page
    ├── register/page.tsx     # User registration page
    ├── chat/page.tsx         # Welcome / new conversation
    ├── chat/[conversationId] # Active chat conversation session
    ├── memory/page.tsx       # Long-term memory page
    ├── settings/page.tsx     # Settings page
    └── profile/page.tsx      # User profile page
```
