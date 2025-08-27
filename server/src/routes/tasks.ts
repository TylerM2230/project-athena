import express from 'express';
import { db } from '../models/database.js';

const router = express.Router();

// Get all tasks
router.get('/', (_, res) => {
  try {
    const tasks = db.getTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task
router.get('/:id', (req, res) => {
  try {
    const task = db.getTask(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create task
router.post('/', (req, res) => {
  try {
    const { title, description, priority = 'medium', dueDate, parentId } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = db.createTask({
      title,
      description,
      status: 'todo',
      priority,
      dueDate,
      parentId
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', (req, res) => {
  try {
    const { title, description, status, priority, dueDate, parentId } = req.body;
    
    const task = db.updateTask(req.params.id, {
      title,
      description,
      status,
      priority,
      dueDate,
      parentId
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', (req, res) => {
  try {
    const success = db.deleteTask(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get task's linked notes
router.get('/:id/notes', (req, res) => {
  try {
    const notes = db.getTaskNotes(req.params.id);
    res.json(notes);
  } catch (error) {
    console.error('Error fetching task notes:', error);
    res.status(500).json({ error: 'Failed to fetch task notes' });
  }
});

// Link note to task
router.post('/:id/notes/:noteId', (req, res) => {
  try {
    const success = db.linkTaskNote(req.params.id, req.params.noteId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(400).json({ error: 'Link already exists or invalid IDs' });
    }
  } catch (error) {
    console.error('Error linking task note:', error);
    res.status(500).json({ error: 'Failed to link task note' });
  }
});

export default router;