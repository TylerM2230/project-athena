import express from 'express';
import { db } from '../models/database.js';

const router = express.Router();

// Get tasks requiring attention
router.get('/attention-tasks', async (_, res) => {
  try {
    const tasks = await db.getAttentionTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching attention tasks:', error);
    res.status(500).json({ error: 'Failed to fetch attention tasks' });
  }
});

// Get tasks for a specified time period
router.get('/period-tasks/:period', async (req, res) => {
  try {
    const { period } = req.params;
    const now = new Date();
    let startDate: string;
    let endDate: string;
    
    switch (period) {
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        startDate = weekStart.toISOString().split('T')[0];
        endDate = weekEnd.toISOString().split('T')[0];
        break;
        
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        startDate = monthStart.toISOString().split('T')[0];
        endDate = monthEnd.toISOString().split('T')[0];
        break;
        
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
        startDate = quarterStart.toISOString().split('T')[0];
        endDate = quarterEnd.toISOString().split('T')[0];
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid period. Use: week, month, or quarter' });
    }
    
    const tasks = await db.getWeeklyTasks(startDate, endDate);
    res.json({ tasks, startDate, endDate, period });
  } catch (error) {
    console.error('Error fetching period tasks:', error);
    res.status(500).json({ error: 'Failed to fetch period tasks' });
  }
});

// Keep the original weekly endpoint for backwards compatibility
router.get('/weekly-tasks', async (_, res) => {
  try {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const startDate = weekStart.toISOString().split('T')[0];
    const endDate = weekEnd.toISOString().split('T')[0];
    
    const tasks = await db.getWeeklyTasks(startDate, endDate);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching weekly tasks:', error);
    res.status(500).json({ error: 'Failed to fetch weekly tasks' });
  }
});

// Get dashboard statistics
router.get('/stats', async (_, res) => {
  try {
    const stats = await db.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;