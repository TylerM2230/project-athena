import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
class DatabaseService {
    constructor(dbPath = 'athena.db') {
        this.db = new Database(dbPath);
        this.init();
    }
    init() {
        // Create tables
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'todo',
        priority TEXT NOT NULL DEFAULT 'medium',
        due_date TEXT,
        parent_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (parent_id) REFERENCES tasks(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS task_note_links (
        task_id TEXT NOT NULL,
        note_id TEXT NOT NULL,
        PRIMARY KEY (task_id, note_id),
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks(parent_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
    `);
        // Remove urgency column if it exists (migration)
        try {
            // Check if urgency column exists
            const columns = this.db.prepare("PRAGMA table_info(tasks)").all();
            const hasUrgency = columns.some(col => col.name === 'urgency');
            if (hasUrgency) {
                // Create new table without urgency column
                this.db.exec(`
          CREATE TABLE tasks_new (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'todo',
            priority TEXT NOT NULL DEFAULT 'medium',
            due_date TEXT,
            parent_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (parent_id) REFERENCES tasks(id) ON DELETE CASCADE
          );
        `);
                // Copy data without urgency column
                this.db.exec(`
          INSERT INTO tasks_new (id, title, description, status, priority, due_date, parent_id, created_at, updated_at)
          SELECT id, title, description, status, priority, due_date, parent_id, created_at, updated_at
          FROM tasks;
        `);
                // Drop old table and rename new one
                this.db.exec(`DROP TABLE tasks;`);
                this.db.exec(`ALTER TABLE tasks_new RENAME TO tasks;`);
                // Recreate indexes
                this.db.exec(`
          CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks(parent_id);
          CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
        `);
            }
        }
        catch (error) {
            console.error('Migration error:', error);
        }
    }
    // Task methods
    createTask(task) {
        const id = uuidv4();
        const now = new Date().toISOString();
        const newTask = {
            ...task,
            id,
            createdAt: now,
            updatedAt: now
        };
        const stmt = this.db.prepare(`
      INSERT INTO tasks (id, title, description, status, priority, due_date, parent_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(newTask.id, newTask.title, newTask.description || null, newTask.status, newTask.priority, newTask.dueDate || null, newTask.parentId || null, newTask.createdAt, newTask.updatedAt);
        return newTask;
    }
    getTasks() {
        const stmt = this.db.prepare(`
      SELECT id, title, description, status, priority, due_date as dueDate, 
             parent_id as parentId, created_at as createdAt, updated_at as updatedAt
      FROM tasks ORDER BY created_at DESC
    `);
        return stmt.all();
    }
    getTask(id) {
        const stmt = this.db.prepare(`
      SELECT id, title, description, status, priority, due_date as dueDate,
             parent_id as parentId, created_at as createdAt, updated_at as updatedAt
      FROM tasks WHERE id = ?
    `);
        return stmt.get(id);
    }
    updateTask(id, updates) {
        const current = this.getTask(id);
        if (!current)
            return undefined;
        const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
        const stmt = this.db.prepare(`
      UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?,
                       due_date = ?, parent_id = ?, updated_at = ?
      WHERE id = ?
    `);
        stmt.run(updated.title, updated.description || null, updated.status, updated.priority, updated.dueDate || null, updated.parentId || null, updated.updatedAt, id);
        return updated;
    }
    deleteTask(id) {
        const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    // Note methods
    createNote(note) {
        const id = uuidv4();
        const now = new Date().toISOString();
        const newNote = {
            ...note,
            id,
            createdAt: now,
            updatedAt: now
        };
        const stmt = this.db.prepare(`
      INSERT INTO notes (id, title, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
        stmt.run(newNote.id, newNote.title, newNote.content, newNote.createdAt, newNote.updatedAt);
        return newNote;
    }
    getNotes() {
        const stmt = this.db.prepare(`
      SELECT id, title, content, created_at as createdAt, updated_at as updatedAt
      FROM notes ORDER BY updated_at DESC
    `);
        return stmt.all();
    }
    getNote(id) {
        const stmt = this.db.prepare(`
      SELECT id, title, content, created_at as createdAt, updated_at as updatedAt
      FROM notes WHERE id = ?
    `);
        return stmt.get(id);
    }
    updateNote(id, updates) {
        const current = this.getNote(id);
        if (!current)
            return undefined;
        const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
        const stmt = this.db.prepare(`
      UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?
    `);
        stmt.run(updated.title, updated.content, updated.updatedAt, id);
        return updated;
    }
    deleteNote(id) {
        const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    // Task-Note linking methods
    linkTaskNote(taskId, noteId) {
        const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO task_note_links (task_id, note_id) VALUES (?, ?)
    `);
        const result = stmt.run(taskId, noteId);
        return result.changes > 0;
    }
    getTaskNotes(taskId) {
        const stmt = this.db.prepare(`
      SELECT n.id, n.title, n.content, n.created_at as createdAt, n.updated_at as updatedAt
      FROM notes n
      JOIN task_note_links tnl ON n.id = tnl.note_id
      WHERE tnl.task_id = ?
    `);
        return stmt.all(taskId);
    }
    // Dashboard-specific methods
    getAttentionTasks() {
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);
        const stmt = this.db.prepare(`
      SELECT id, title, description, status, priority, due_date as dueDate,
             parent_id as parentId, created_at as createdAt, updated_at as updatedAt
      FROM tasks
      WHERE status != 'done'
        AND (
          priority = 'high'
          OR status = 'in-progress'
          OR (due_date IS NOT NULL AND due_date <= ?)
          OR (due_date IS NOT NULL AND due_date <= ? AND due_date >= ?)
        )
      ORDER BY 
        CASE 
          WHEN due_date IS NOT NULL AND due_date < ? THEN 1  -- Overdue
          WHEN priority = 'high' AND status = 'in-progress' THEN 2
          WHEN priority = 'high' THEN 3
          WHEN status = 'in-progress' THEN 4
          WHEN due_date IS NOT NULL AND due_date <= ? THEN 5  -- Due soon
          ELSE 6
        END,
        due_date ASC NULLS LAST,
        created_at DESC
      LIMIT 10
    `);
        const nowISO = now.toISOString().split('T')[0];
        const threeDaysISO = threeDaysFromNow.toISOString().split('T')[0];
        return stmt.all(nowISO, threeDaysISO, nowISO, nowISO, threeDaysISO);
    }
    getWeeklyTasks(startDate, endDate) {
        const stmt = this.db.prepare(`
      SELECT id, title, description, status, priority, due_date as dueDate,
             parent_id as parentId, created_at as createdAt, updated_at as updatedAt
      FROM tasks
      WHERE due_date IS NOT NULL 
        AND due_date >= ? 
        AND due_date <= ?
      ORDER BY due_date ASC, priority DESC
    `);
        return stmt.all(startDate, endDate);
    }
    getDashboardStats() {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const tasksStmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
        SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as inProgress,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
      FROM tasks
    `);
        const notesStmt = this.db.prepare(`SELECT COUNT(*) as total FROM notes`);
        const weeklyCompletedStmt = this.db.prepare(`
      SELECT COUNT(*) as completed
      FROM tasks
      WHERE status = 'done' 
        AND updated_at >= ?
    `);
        const taskStats = tasksStmt.get();
        const noteStats = notesStmt.get();
        const weeklyStats = weeklyCompletedStmt.get(weekStart.toISOString());
        return {
            totalTasks: taskStats.total || 0,
            todoTasks: taskStats.todo || 0,
            inProgressTasks: taskStats.inProgress || 0,
            doneTasks: taskStats.done || 0,
            totalNotes: noteStats.total || 0,
            tasksCompletedThisWeek: weeklyStats.completed || 0,
        };
    }
    close() {
        this.db.close();
    }
}
export const db = new DatabaseService();
