# Project Athena

A personal productivity and knowledge management application with an AI-powered Socratic Guide to help break down overwhelming tasks into manageable steps.

## Features

### ✅ Implemented (MVP)
- **Task Management System**
  - Create, update, delete tasks
  - Hierarchical task structure (parent/child tasks)
  - Task status tracking (todo, in-progress, done)
  - Priority levels (low, medium, high)
  - Due dates
- **Knowledge Management System**
  - Create and edit notes
  - Bi-directional linking using `[[Note Title]]` syntax
  - Search functionality across notes
  - Link visualization and navigation
- **AI-Powered Socratic Guide** 🎉
  - Interactive conversational interface
  - Context-aware question generation
  - Dynamic task decomposition through Socratic dialogue
  - Plan generation and editing workflow
  - Graceful fallback when API unavailable
- **Modern UI/UX**
  - Clean, minimalist design using Tailwind CSS
  - Responsive layout for desktop and mobile
  - Interactive components with React
- **Local-First Database**
  - SQLite integration with better-sqlite3
  - Task-Note linking system
  - Data persistence

### 🚧 In Development
- **Desktop Application**
  - Tauri-based native desktop app
  - Cross-platform support (Windows, macOS, Linux)
  - Local-first data storage

### 📋 Planned Features
- End-to-end encrypted cloud synchronization
- Advanced search and filtering
- Task templates and workflows
- Progress analytics and insights
- Export functionality (PDF, Markdown, etc.)

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **SQLite** with better-sqlite3
- **CORS** and **Helmet** for security

### Desktop (Planned)
- **Tauri** for native app packaging
- **Rust** backend integration

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

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd project-athena
```

2. Install dependencies:
```bash
npm install
```

3. Configure AI Guide (Optional):
To enable the full AI-powered Socratic Guide, get a Gemini API key from Google AI Studio and update the server environment:
```bash
echo "GEMINI_API_KEY=your_actual_api_key_here" >> server/.env
```

4. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

**Note**: The AI Guide works in fallback mode without an API key, providing basic Socratic questioning.

### API Endpoints

#### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/tasks/:id/notes` - Get notes linked to a task
- `POST /api/tasks/:id/notes/:noteId` - Link a note to a task

#### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Get a specific note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

#### AI Guide
- `POST /api/ai-guide/start` - Start a new Socratic session for a task
- `POST /api/ai-guide/continue` - Continue conversation with user input
- `POST /api/ai-guide/generate-plan` - Generate action plan from conversation
- `POST /api/ai-guide/create-tasks` - Create tasks from AI-generated plan
- `GET /api/ai-guide/session/:id` - Get conversation history
- `POST /api/ai-guide/end` - End a session

## Usage

### Creating Tasks
1. Navigate to the Tasks page
2. Click "New Task"
3. Enter task details (title, description, priority)
4. Use the AI Socratic Guide button to break down complex tasks (coming soon)

### Managing Knowledge
1. Go to the Notes page
2. Create notes with rich content
3. Use `[[Note Title]]` syntax to create bi-directional links
4. Link relevant notes to tasks for context

### Task Decomposition with AI Guide 🤖
1. Select any overwhelming task
2. Click the "Decompose with AI Guide" button (chat icon)
3. Engage in a thoughtful Socratic dialogue with Athena
4. Answer guiding questions that help clarify your approach:
   - "What does the finished version look like?"
   - "What's the first concrete step?"
   - "What feels most uncertain right now?"
5. Generate an actionable plan based on your insights
6. Edit and customize the generated sub-tasks
7. Import them directly into your task hierarchy

**Features**:
- Context-aware questioning based on your task
- Non-judgmental, encouraging guidance
- Plan editing before task creation
- Graceful fallback without API key

## Development

### Building
```bash
# Build client
npm run build --workspace=client

# Build server
npm run build --workspace=server

# Build both
npm run build
```

### Testing
```bash
npm run test
```

### Linting
```bash
npm run lint
```

## Contributing

This project follows the requirements outlined in the PRD.md. Key principles:
- Local-first architecture
- User privacy and data ownership
- Calm, focused UI design
- AI assistance without replacement of human decision-making

## License

[License details to be added]

## Product Vision

Project Athena aims to be the "calm, wise guide" that helps users transform overwhelming tasks into clear, actionable plans. By combining effective task management with intelligent AI guidance, we empower users to overcome executive function challenges and achieve their goals with confidence.

The name "Athena" reflects our commitment to wisdom, strategy, and thoughtful guidance rather than quick fixes or automated solutions. Our AI doesn't do the work for you – it helps you discover the path forward through Socratic questioning and gentle guidance.