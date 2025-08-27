# Project Athena

A personal productivity app with an AI-powered Socratic Guide that helps you break down overwhelming tasks through thoughtful questioning.

## What's Built

**Task & Knowledge Management**: Hierarchical tasks with status tracking, priority levels, and due dates. Create notes with `[[Note Title]]` linking that connects everything together.

**AI Socratic Guide**: Chat with Athena to decompose complex tasks. It asks clarifying questions to help you figure out next steps, then generates actionable plans you can customize and import.

**Local-First**: SQLite database keeps your data on your machine. The AI works even without an API key (with basic fallback mode).

**Coming Soon**: Desktop app via Tauri, cloud sync, better search, and analytics.

## Tech Stack

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand  
**Backend**: Express, SQLite, TypeScript  
**Desktop**: Tauri (in development)

## Project Structure

```
project-athena/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── types/          # TypeScript type definitions
│   │   └── hooks/          # Custom React hooks
│   ├── public/             # Static assets
│   └── dist/               # Built frontend files
├── server/                 # Express backend
│   ├── src/
│   │   ├── models/         # Database models and schemas
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   └── services/       # Business logic services
│   └── dist/               # Built backend files
├── docs/                   # Documentation
└── README.md
```

## Quick Start

Need Node.js 18+. Then:

```bash
git clone <repo-url>
cd project-athena
npm install
npm run dev
```

That's it. Visit `http://localhost:3000` to get started.

**Optional AI Setup**: Add `GEMINI_API_KEY=your_key` to `server/.env` for full AI features. Without it, you get basic Socratic questioning.

## How to Use

**Tasks**: Create tasks, break them into subtasks, set priorities and due dates. Click the chat icon on any task to decompose it with Athena's help.

**Notes**: Write notes with `[[Link Syntax]]` to connect ideas. Link notes to tasks for context.

**AI Guide**: When stuck on a complex task, chat with Athena. It'll ask questions like "What does success look like?" and "What's the first step?" to help you think through the problem, then generate a plan you can customize.

## Development

```bash
npm run build    # Build everything
npm run test     # Run tests
npm run lint     # Check code style
```

## Philosophy

Athena is your calm, wise guide for breaking down overwhelming work. The AI doesn't do tasks for you—it helps you figure out what to do next through thoughtful questions. Local-first means your data stays yours.