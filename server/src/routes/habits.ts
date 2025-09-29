import express from 'express';
import { db } from '../models/database.js';

const router = express.Router();

// Get all habits
router.get('/', async (_, res) => {
  try {
    const habits = await db.getHabits();
    res.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// Get single habit
router.get('/:id', async (req, res) => {
  try {
    const habit = await db.getHabit(req.params.id);
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json(habit);
  } catch (error) {
    console.error('Error fetching habit:', error);
    res.status(500).json({ error: 'Failed to fetch habit' });
  }
});

// Create habit
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      category = 'personal',
      targetFrequency = 'daily',
      targetCount = 1,
      icon,
      reminderTime,
      goalId
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!['learning', 'health', 'creativity', 'productivity', 'personal'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    if (!['daily', 'weekly'].includes(targetFrequency)) {
      return res.status(400).json({ error: 'Target frequency must be daily or weekly' });
    }

    const habit = await db.createHabit({
      title,
      description,
      category,
      targetFrequency,
      targetCount,
      isActive: true,
      icon,
      reminderTime,
      goalId
    });

    res.status(201).json(habit);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

// Update habit
router.put('/:id', async (req, res) => {
  try {
    const { title, description, category, targetFrequency, targetCount, isActive, icon, reminderTime, goalId } = req.body;

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (targetFrequency !== undefined) updates.targetFrequency = targetFrequency;
    if (targetCount !== undefined) updates.targetCount = targetCount;
    if (isActive !== undefined) updates.isActive = isActive;
    if (icon !== undefined) updates.icon = icon;
    if (reminderTime !== undefined) updates.reminderTime = reminderTime;
    if (goalId !== undefined) updates.goalId = goalId;

    const habit = await db.updateHabit(req.params.id, updates);
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    res.json(habit);
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

// Delete habit
router.delete('/:id', async (req, res) => {
  try {
    const success = await db.deleteHabit(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

// Complete habit for today
router.post('/:id/complete', async (req, res) => {
  try {
    const { status = 'completed', notes, value } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (!['completed', 'skipped', 'partial'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if entry already exists for today
    const existingEntry = await db.getTodaysHabitEntry(req.params.id);

    if (existingEntry) {
      // Update existing entry
      const updatedEntry = await db.updateHabitEntry(existingEntry.id, {
        status,
        notes,
        value,
        completionTime: status === 'completed' ? new Date().toISOString() : undefined
      });
      res.json(updatedEntry);
    } else {
      // Create new entry
      const entry = await db.createHabitEntry({
        habitId: req.params.id,
        date: today,
        status,
        notes,
        value,
        completionTime: status === 'completed' ? new Date().toISOString() : undefined
      });
      res.status(201).json(entry);
    }
  } catch (error) {
    console.error('Error completing habit:', error);
    res.status(500).json({ error: 'Failed to complete habit' });
  }
});

// Get habit entries (history)
router.get('/:id/entries', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const entries = await db.getHabitEntries(
      req.params.id,
      startDate as string,
      endDate as string
    );
    res.json(entries);
  } catch (error) {
    console.error('Error fetching habit entries:', error);
    res.status(500).json({ error: 'Failed to fetch habit entries' });
  }
});

// Get habit streak information
router.get('/:id/streak', async (req, res) => {
  try {
    const streak = await db.getHabitStreak(req.params.id);
    res.json(streak);
  } catch (error) {
    console.error('Error fetching habit streak:', error);
    res.status(500).json({ error: 'Failed to fetch habit streak' });
  }
});

// Get today's habits (for dashboard)
router.get('/dashboard/today', async (_, res) => {
  try {
    const todaysHabits = await db.getTodaysHabits();
    res.json(todaysHabits);
  } catch (error) {
    console.error('Error fetching today\'s habits:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s habits' });
  }
});

// Get habit statistics (for dashboard)
router.get('/dashboard/stats', async (_, res) => {
  try {
    const stats = await db.getHabitStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching habit stats:', error);
    res.status(500).json({ error: 'Failed to fetch habit stats' });
  }
});

export default router;