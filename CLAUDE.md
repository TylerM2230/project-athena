# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Project Athena is a personal productivity and knowledge management application with an AI-powered Socratic Guide. It's built as a full-stack TypeScript application with a React frontend and Express backend, using SQLite for local-first data storage.

### Architecture

- **Monorepo structure** with workspaces for `client/` and `server/`
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand for state management
- **Backend**: Express + TypeScript + SQLite (better-sqlite3) + Gemini AI integration
- **Database**: SQLite with hierarchical task structure and bi-directional note linking

## Common Development Commands

### Development
```bash
# Start both client and server in development mode
npm run dev

# Start individual services
npm run dev:client  # Frontend on http://localhost:3000
npm run dev:server  # Backend on http://localhost:5000
```

### Building
```bash
# Build both client and server
npm run build

# Build individual workspaces
npm run build --workspace=client
npm run build --workspace=server
```

### Testing and Linting
```bash
# Run tests for both workspaces
npm run test

# Run linting for both workspaces
npm run lint

# Individual workspace commands
npm run test --workspace=client
npm run lint --workspace=server
```

## Key System Architecture

### Data Models
Core entities defined in `server/src/models/database.ts` and `client/src/types/index.ts`:

- **Tasks**: Hierarchical structure with parent/child relationships, status tracking (todo/in-progress/done), priority levels, and due dates
- **Notes**: Content with bi-directional linking using `[[Note Title]]` syntax
- **Task-Note Links**: Many-to-many relationships between tasks and notes

### API Structure
RESTful endpoints in `server/src/routes/`:
- `/api/tasks` - Task CRUD operations with hierarchy support
- `/api/notes` - Note management with linking functionality  
- `/api/ai-guide` - Socratic questioning system for task decomposition

### AI Integration
- Uses Google's Gemini API for Socratic questioning
- Graceful fallback mode when API key unavailable
- Session-based conversation management
- Plan generation and task creation workflow

### Frontend Architecture
- React Router for navigation between Dashboard, Tasks, Notes, Knowledge Base, and Insights pages
- Zustand stores for state management
- Component structure in `client/src/components/` and `client/src/pages/`
- Lucide React for consistent iconography

## Development Guidelines

### Environment Setup
- Server requires optional `GEMINI_API_KEY` in `server/.env` for full AI functionality
- AI Guide works in fallback mode without API key
- SQLite database (`athena.db`) created automatically on first run

### Code Patterns
- TypeScript interfaces shared between client and server
- UUID-based entity IDs
- ISO timestamp strings for dates
- Hierarchical task queries using parent_id relationships
- Bi-directional note linking through content parsing

### Database Schema
- Tasks table with self-referential parent_id foreign key
- Notes table with full-text content
- task_note_links junction table for many-to-many relationships
- Proper indexing on parent_id, status, and title fields