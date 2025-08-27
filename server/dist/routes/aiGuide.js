import express from 'express';
import { aiGuideService } from '../services/aiGuide.js';
import { db } from '../models/database.js';
const router = express.Router();
// Start a new Socratic session for a task
router.post('/start', async (req, res) => {
    try {
        const { taskId, taskTitle, taskDescription, apiKey } = req.body;
        if (!taskId || !taskTitle) {
            return res.status(400).json({ error: 'taskId and taskTitle are required' });
        }
        // Verify task exists
        const task = db.getTask(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        const result = await aiGuideService.startSocraticSession(taskId, taskTitle, taskDescription, apiKey);
        res.json({
            sessionId: result.sessionId,
            message: result.question,
            canGeneratePlan: false,
            phase: 'questioning'
        });
    }
    catch (error) {
        console.error('Error starting Socratic session:', error);
        res.status(500).json({
            error: 'Failed to start AI guide session',
            fallback: true,
            message: "Let's start by exploring what makes this task feel overwhelming. What part of it feels the most unclear or difficult to you right now?"
        });
    }
});
// Continue conversation in an existing session
router.post('/continue', async (req, res) => {
    try {
        const { sessionId, message } = req.body;
        if (!sessionId || !message) {
            return res.status(400).json({ error: 'sessionId and message are required' });
        }
        const result = await aiGuideService.continueConversation(sessionId, message);
        res.json({
            sessionId,
            message: result.question,
            canGeneratePlan: result.canGeneratePlan,
            plan: 'plan' in result ? result.plan : undefined,
            phase: 'plan' in result ? 'planning' : 'questioning'
        });
    }
    catch (error) {
        console.error('Error continuing conversation:', error);
        res.status(500).json({
            error: 'Failed to continue conversation',
            fallback: true,
            message: "That's interesting. What would be the very next step you could take to move forward?"
        });
    }
});
// Generate action plan from conversation
router.post('/generate-plan', async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }
        const result = await aiGuideService.generatePlan(sessionId);
        res.json({
            sessionId,
            message: result.question,
            plan: result.plan,
            canGeneratePlan: true,
            phase: 'planning'
        });
    }
    catch (error) {
        console.error('Error generating plan:', error);
        res.status(500).json({
            error: 'Failed to generate plan',
            fallback: true,
            plan: {
                tasks: [
                    {
                        title: "Break down the task further",
                        description: "Take some time to think about the specific steps involved",
                        priority: "medium"
                    }
                ],
                summary: "Start with this basic step and build from there."
            }
        });
    }
});
// Create tasks from AI-generated plan
router.post('/create-tasks', async (req, res) => {
    try {
        const { sessionId, tasks, parentTaskId } = req.body;
        if (!sessionId || !tasks || !Array.isArray(tasks)) {
            return res.status(400).json({ error: 'sessionId and tasks array are required' });
        }
        // Verify parent task exists
        if (parentTaskId && !db.getTask(parentTaskId)) {
            return res.status(404).json({ error: 'Parent task not found' });
        }
        const createdTasks = [];
        for (const taskData of tasks) {
            if (taskData.title) {
                const newTask = db.createTask({
                    title: taskData.title,
                    description: taskData.description || '',
                    priority: taskData.priority || 'medium',
                    status: 'todo',
                    parentId: parentTaskId,
                    dueDate: taskData.dueDate
                });
                createdTasks.push(newTask);
            }
        }
        // End the session after creating tasks
        aiGuideService.endSession(sessionId);
        res.json({
            message: 'Tasks created successfully from AI guidance',
            createdTasks,
            sessionEnded: true
        });
    }
    catch (error) {
        console.error('Error creating tasks from plan:', error);
        res.status(500).json({ error: 'Failed to create tasks from plan' });
    }
});
// Get session conversation history
router.get('/session/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = aiGuideService.getSession(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json({
            sessionId,
            taskTitle: session.taskTitle,
            taskDescription: session.taskDescription,
            messages: session.messages,
            phase: session.phase
        });
    }
    catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({ error: 'Failed to fetch session' });
    }
});
// End a session
router.post('/end', (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }
        aiGuideService.endSession(sessionId);
        res.json({ message: 'Session ended successfully' });
    }
    catch (error) {
        console.error('Error ending session:', error);
        res.status(500).json({ error: 'Failed to end session' });
    }
});
export default router;
