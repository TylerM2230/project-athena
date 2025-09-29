import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
class DatabaseService {
    constructor(dbPath = 'athena.json') {
        this.data = {
            tasks: [],
            goals: [],
            habits: [],
            habitEntries: []
        };
        this.dbPath = dbPath;
        this.loadFromFile();
    }
    loadFromFile() {
        try {
            if (fs.existsSync(this.dbPath)) {
                const fileData = fs.readFileSync(this.dbPath, 'utf-8');
                const loadedData = JSON.parse(fileData);
                this.data = {
                    tasks: loadedData.tasks || [],
                    goals: loadedData.goals || [],
                    habits: loadedData.habits || [],
                    habitEntries: loadedData.habitEntries || []
                };
            }
        }
        catch (error) {
            console.warn('Could not read database file, starting with empty database:', error);
            this.data = {
                tasks: [],
                goals: [],
                habits: [],
                habitEntries: []
            };
        }
    }
    saveToFile() {
        try {
            fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
        }
        catch (error) {
            console.error('Error saving database to file:', error);
        }
    }
    // Task methods
    async createTask(task) {
        const id = uuidv4();
        const now = new Date().toISOString();
        const newTask = {
            ...task,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.data.tasks.push(newTask);
        this.saveToFile();
        return newTask;
    }
    async getTasks() {
        return [...this.data.tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async getTask(id) {
        return this.data.tasks.find(task => task.id === id);
    }
    async updateTask(id, updates) {
        const taskIndex = this.data.tasks.findIndex(task => task.id === id);
        if (taskIndex === -1)
            return undefined;
        const updated = {
            ...this.data.tasks[taskIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.data.tasks[taskIndex] = updated;
        this.saveToFile();
        return updated;
    }
    async deleteTask(id) {
        const initialLength = this.data.tasks.length;
        this.data.tasks = this.data.tasks.filter(task => task.id !== id);
        if (this.data.tasks.length < initialLength) {
            this.saveToFile();
            return true;
        }
        return false;
    }
    // Dashboard-specific methods
    async getAttentionTasks() {
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);
        const nowISO = now.toISOString().split('T')[0];
        const threeDaysISO = threeDaysFromNow.toISOString().split('T')[0];
        return this.data.tasks
            .filter(task => {
            if (task.status === 'done')
                return false;
            return (task.priority === 'high' ||
                task.status === 'in-progress' ||
                (task.dueDate && task.dueDate <= threeDaysISO) ||
                (task.dueDate && task.dueDate < nowISO) // Overdue
            );
        })
            .sort((a, b) => {
            // Sort by priority: overdue > high priority + in-progress > high priority > in-progress > due soon
            const getPriority = (task) => {
                if (task.dueDate && task.dueDate < nowISO)
                    return 1; // Overdue
                if (task.priority === 'high' && task.status === 'in-progress')
                    return 2;
                if (task.priority === 'high')
                    return 3;
                if (task.status === 'in-progress')
                    return 4;
                if (task.dueDate && task.dueDate <= threeDaysISO)
                    return 5; // Due soon
                return 6;
            };
            const aPriority = getPriority(a);
            const bPriority = getPriority(b);
            if (aPriority !== bPriority)
                return aPriority - bPriority;
            // If same priority, sort by due date, then creation date
            if (a.dueDate && b.dueDate) {
                return a.dueDate.localeCompare(b.dueDate);
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
            .slice(0, 10);
    }
    async getWeeklyTasks(startDate, endDate) {
        return this.data.tasks
            .filter(task => task.dueDate && task.dueDate >= startDate && task.dueDate <= endDate)
            .sort((a, b) => {
            // First sort by due date
            const dueDateCompare = (a.dueDate || '').localeCompare(b.dueDate || '');
            if (dueDateCompare !== 0)
                return dueDateCompare;
            // Then by priority (high > medium > low)
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }
    async getDashboardStats() {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const tasks = this.data.tasks;
        const todoTasks = tasks.filter(task => task.status === 'todo').length;
        const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
        const doneTasks = tasks.filter(task => task.status === 'done').length;
        const tasksCompletedThisWeek = tasks.filter(task => task.status === 'done' &&
            new Date(task.updatedAt) >= weekStart).length;
        return {
            totalTasks: tasks.length,
            todoTasks,
            inProgressTasks,
            doneTasks,
            tasksCompletedThisWeek,
        };
    }
    // Goal management methods
    async createGoal(goal) {
        const id = uuidv4();
        const now = new Date().toISOString();
        const newGoal = {
            ...goal,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.data.goals.push(newGoal);
        this.saveToFile();
        return newGoal;
    }
    async getGoals() {
        return [...this.data.goals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async getGoal(id) {
        return this.data.goals.find(goal => goal.id === id);
    }
    async updateGoal(id, updates) {
        const goalIndex = this.data.goals.findIndex(goal => goal.id === id);
        if (goalIndex === -1)
            return undefined;
        const updated = {
            ...this.data.goals[goalIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.data.goals[goalIndex] = updated;
        this.saveToFile();
        return updated;
    }
    async deleteGoal(id) {
        const initialLength = this.data.goals.length;
        this.data.goals = this.data.goals.filter(goal => goal.id !== id);
        // Also remove any tasks linked to this goal
        this.data.tasks = this.data.tasks.filter(task => task.goalId !== id);
        if (this.data.goals.length < initialLength) {
            this.saveToFile();
            return true;
        }
        return false;
    }
    async getGoalWithTasks(goalId) {
        const goal = await this.getGoal(goalId);
        if (!goal)
            return undefined;
        const tasks = this.data.tasks.filter(task => task.goalId === goalId);
        const subGoals = this.data.goals.filter(subGoal => subGoal.parentId === goalId);
        return { goal, tasks, subGoals };
    }
    async getGoalsByType(type) {
        return this.data.goals
            .filter(goal => goal.type === type && goal.status === 'active')
            .sort((a, b) => {
            // Sort by priority, then by target date
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const priorityDiff = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
            if (priorityDiff !== 0)
                return priorityDiff;
            if (!a.targetDate && !b.targetDate)
                return 0;
            if (!a.targetDate)
                return 1;
            if (!b.targetDate)
                return -1;
            return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        });
    }
    // Habit methods
    async createHabit(habit) {
        const id = uuidv4();
        const now = new Date().toISOString();
        const newHabit = {
            ...habit,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.data.habits.push(newHabit);
        this.saveToFile();
        return newHabit;
    }
    async getHabits() {
        return [...this.data.habits]
            .filter(habit => habit.isActive)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async getHabit(id) {
        return this.data.habits.find(habit => habit.id === id);
    }
    async updateHabit(id, updates) {
        const habitIndex = this.data.habits.findIndex(habit => habit.id === id);
        if (habitIndex === -1)
            return undefined;
        const updated = {
            ...this.data.habits[habitIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.data.habits[habitIndex] = updated;
        this.saveToFile();
        return updated;
    }
    async deleteHabit(id) {
        const initialLength = this.data.habits.length;
        this.data.habits = this.data.habits.filter(habit => habit.id !== id);
        // Also remove all habit entries for this habit
        this.data.habitEntries = this.data.habitEntries.filter(entry => entry.habitId !== id);
        if (this.data.habits.length < initialLength) {
            this.saveToFile();
            return true;
        }
        return false;
    }
    // Habit entry methods
    async createHabitEntry(entry) {
        const id = uuidv4();
        const now = new Date().toISOString();
        const newEntry = {
            ...entry,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.data.habitEntries.push(newEntry);
        this.saveToFile();
        return newEntry;
    }
    async getHabitEntries(habitId, startDate, endDate) {
        let entries = this.data.habitEntries.filter(entry => entry.habitId === habitId);
        if (startDate) {
            entries = entries.filter(entry => entry.date >= startDate);
        }
        if (endDate) {
            entries = entries.filter(entry => entry.date <= endDate);
        }
        return entries.sort((a, b) => b.date.localeCompare(a.date));
    }
    async getTodaysHabitEntry(habitId) {
        const today = new Date().toISOString().split('T')[0];
        return this.data.habitEntries.find(entry => entry.habitId === habitId && entry.date === today);
    }
    async updateHabitEntry(id, updates) {
        const entryIndex = this.data.habitEntries.findIndex(entry => entry.id === id);
        if (entryIndex === -1)
            return undefined;
        const updated = {
            ...this.data.habitEntries[entryIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.data.habitEntries[entryIndex] = updated;
        this.saveToFile();
        return updated;
    }
    // Habit dashboard and analytics methods
    async getTodaysHabits() {
        const today = new Date().toISOString().split('T')[0];
        const habits = await this.getHabits();
        return habits.map(habit => {
            const todayEntry = this.data.habitEntries.find(entry => entry.habitId === habit.id && entry.date === today);
            return { ...habit, todayEntry };
        });
    }
    async getHabitStreak(habitId) {
        const entries = await this.getHabitEntries(habitId);
        const completedEntries = entries.filter(entry => entry.status === 'completed');
        // Calculate current streak
        let currentStreak = 0;
        const today = new Date();
        let checkDate = new Date(today);
        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const entry = entries.find(e => e.date === dateStr);
            if (entry && entry.status === 'completed') {
                currentStreak++;
            }
            else if (dateStr === today.toISOString().split('T')[0]) {
                // Today hasn't been completed yet, but don't break streak
                // Skip today and continue checking
            }
            else {
                break;
            }
            checkDate.setDate(checkDate.getDate() - 1);
            if (currentStreak > 365)
                break; // Safety limit
        }
        // Calculate longest streak
        let longestStreak = 0;
        let tempStreak = 0;
        const sortedDates = completedEntries
            .map(e => e.date)
            .sort()
            .reverse();
        for (let i = 0; i < sortedDates.length; i++) {
            const currentDate = new Date(sortedDates[i]);
            const nextDate = i < sortedDates.length - 1 ? new Date(sortedDates[i + 1]) : null;
            if (!nextDate || (currentDate.getTime() - nextDate.getTime()) === 24 * 60 * 60 * 1000) {
                tempStreak++;
            }
            else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        // Calculate completion rate (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentEntries = entries.filter(entry => new Date(entry.date) >= thirtyDaysAgo);
        const completionRate = recentEntries.length > 0
            ? (recentEntries.filter(e => e.status === 'completed').length / recentEntries.length) * 100
            : 0;
        const lastCompleted = completedEntries.length > 0 ? completedEntries[0].date : undefined;
        return {
            habitId,
            currentStreak,
            longestStreak,
            completionRate,
            lastCompleted
        };
    }
    async getHabitStats() {
        const habits = await this.getHabits();
        const today = new Date().toISOString().split('T')[0];
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekStartStr = weekStart.toISOString().split('T')[0];
        const todayCompleted = this.data.habitEntries.filter(entry => entry.date === today && entry.status === 'completed').length;
        const weeklyEntries = this.data.habitEntries.filter(entry => entry.date >= weekStartStr && entry.status === 'completed');
        const weeklyCompletionRate = habits.length > 0
            ? (weeklyEntries.length / (habits.length * 7)) * 100
            : 0;
        let activeStreaks = 0;
        for (const habit of habits) {
            const streak = await this.getHabitStreak(habit.id);
            if (streak.currentStreak > 0)
                activeStreaks++;
        }
        return {
            totalHabits: habits.length,
            todayCompleted,
            weeklyCompletionRate,
            activeStreaks
        };
    }
    async close() {
        this.saveToFile();
    }
}
export const db = new DatabaseService();
