import express from 'express';
import { db } from '../models/database.js';
const router = express.Router();
// Get all goals
router.get('/', async (_, res) => {
    try {
        const goals = await db.getGoals();
        res.json(goals);
    }
    catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});
// Get goals by type
router.get('/type/:type', async (req, res) => {
    try {
        const { type } = req.params;
        if (!['vision', 'long-term', 'short-term', 'sprint'].includes(type)) {
            return res.status(400).json({ error: 'Invalid goal type' });
        }
        const goals = await db.getGoalsByType(type);
        res.json(goals);
    }
    catch (error) {
        console.error('Error fetching goals by type:', error);
        res.status(500).json({ error: 'Failed to fetch goals by type' });
    }
});
// Get single goal with tasks and subgoals
router.get('/:id', async (req, res) => {
    try {
        const goalWithData = await db.getGoalWithTasks(req.params.id);
        if (!goalWithData) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        res.json(goalWithData);
    }
    catch (error) {
        console.error('Error fetching goal:', error);
        res.status(500).json({ error: 'Failed to fetch goal' });
    }
});
// Create goal
router.post('/', async (req, res) => {
    try {
        const { title, description, type = 'short-term', priority = 'medium', targetDate, parentId, metrics } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        if (!['vision', 'long-term', 'short-term', 'sprint'].includes(type)) {
            return res.status(400).json({ error: 'Invalid goal type' });
        }
        const goal = await db.createGoal({
            title,
            description,
            type,
            status: 'active',
            priority,
            targetDate,
            parentId,
            metrics
        });
        res.status(201).json(goal);
    }
    catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
});
// Update goal
router.put('/:id', async (req, res) => {
    try {
        const { title, description, type, status, priority, targetDate, parentId, progress, metrics } = req.body;
        const goal = await db.updateGoal(req.params.id, {
            title,
            description,
            type,
            status,
            priority,
            targetDate,
            parentId,
            progress,
            metrics
        });
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        res.json(goal);
    }
    catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ error: 'Failed to update goal' });
    }
});
// Delete goal
router.delete('/:id', async (req, res) => {
    try {
        const success = await db.deleteGoal(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});
export default router;
