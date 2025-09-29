import express from 'express';
import { db } from '../models/database.js';
const router = express.Router();
// Get all tasks
router.get('/', async (_, res) => {
    try {
        const tasks = await db.getTasks();
        res.json(tasks);
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});
// Get single task
router.get('/:id', async (req, res) => {
    try {
        const task = await db.getTask(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    }
    catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});
// Create task
router.post('/', async (req, res) => {
    try {
        const { title, description, priority = 'medium', dueDate, parentId } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        const task = await db.createTask({
            title,
            description,
            status: 'todo',
            priority,
            dueDate,
            parentId
        });
        res.status(201).json(task);
    }
    catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});
// Update task
router.put('/:id', async (req, res) => {
    try {
        const { title, description, status, priority, dueDate, parentId } = req.body;
        const task = await db.updateTask(req.params.id, {
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
    }
    catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});
// Delete task
router.delete('/:id', async (req, res) => {
    try {
        const success = await db.deleteTask(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});
export default router;
