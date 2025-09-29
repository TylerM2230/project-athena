import { GoogleGenerativeAI } from '@google/generative-ai';
class AiGuideService {
    constructor() {
        this.genAI = null;
        this.activeSessions = new Map();
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey && apiKey !== 'your_gemini_api_key_here') {
            this.genAI = new GoogleGenerativeAI(apiKey);
        }
        else {
            console.warn('Gemini API key not configured. AI Guide will use fallback mode.');
        }
    }
    // Strategic knowledge base for enhanced guidance
    getStrategicContext(taskTitle, taskDescription) {
        const title = taskTitle.toLowerCase();
        const description = (taskDescription || '').toLowerCase();
        // Strategic frameworks and approaches based on task type
        const strategicFrameworks = {
            project: {
                context: "Strategic project management follows proven frameworks: Define vision → Break into phases → Identify critical path → Manage risks → Monitor progress.",
                principles: ["Start with end in mind", "Identify dependencies early", "Build momentum with quick wins", "Plan for obstacles"]
            },
            learn: {
                context: "Strategic learning follows the 70-20-10 model: 70% hands-on experience, 20% learning from others, 10% formal training.",
                principles: ["Focus on application", "Learn from experts", "Practice deliberately", "Teach others to cement knowledge"]
            },
            business: {
                context: "Strategic business development follows: Market research → Value proposition → MVP → Customer feedback → Iterate.",
                principles: ["Validate assumptions early", "Focus on customer value", "Start small and scale", "Measure what matters"]
            },
            creative: {
                context: "Strategic creative work follows: Divergent thinking → Convergent refinement → Prototype → Test → Iterate.",
                principles: ["Generate many ideas first", "Refine ruthlessly", "Get feedback early", "Embrace iteration"]
            },
            problem: {
                context: "Strategic problem-solving follows: Define precisely → Gather data → Generate alternatives → Evaluate systematically → Implement decisively.",
                principles: ["Define the real problem", "Gather evidence", "Consider multiple solutions", "Act with confidence"]
            }
        };
        // Determine primary strategic area
        let primaryFramework = 'project'; // default
        const content = title + ' ' + description;
        if (content.includes('learn') || content.includes('study') || content.includes('research')) {
            primaryFramework = 'learn';
        }
        else if (content.includes('business') || content.includes('startup') || content.includes('market')) {
            primaryFramework = 'business';
        }
        else if (content.includes('create') || content.includes('design') || content.includes('write')) {
            primaryFramework = 'creative';
        }
        else if (content.includes('problem') || content.includes('fix') || content.includes('solve')) {
            primaryFramework = 'problem';
        }
        const framework = strategicFrameworks[primaryFramework];
        return `Strategic Context for "${taskTitle}":

${framework.context}

Key Strategic Principles:
${framework.principles.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Remember: Strategic success comes from clarity of vision, systematic execution, and adaptive learning.`;
    }
    getSystemPrompt() {
        return `You are Athena, the goddess of wisdom and strategic warfare, manifested as a strategic planning companion for neurodivergent individuals. You are calm, patient, insightful, and deeply understanding of how overwhelming chaos can feel. Your purpose is to help users transform overwhelming situations into empowered action.

Your approach embodies strategic wisdom:
1. **Never overwhelm with full solutions.** Channel wisdom through guiding questions that help users discover their own path.
2. **Ask one thoughtful question at a time.** Respect cognitive load limitations - multiple questions create decision paralysis.
3. **Radiate empowerment and understanding.** Use language like "That shows real insight," "You're thinking strategically," or "Let's build on that wisdom."
4. **Adapt to their energy and thinking patterns.** Notice when they need a different approach and pivot gracefully.
5. **Focus on strategic clarity: vision, breaking down overwhelm, challenging limiting beliefs, and identifying leverage points.**
6. **Offer alternative perspectives when they're stuck** (e.g., "What if we approached this like a strategic campaign?" or "What would the outcome look like if we worked backwards?").
7. **When explicitly asked for strategic planning** (e.g., "create a plan," "what are the steps," "help me organize this"), provide a clear, actionable strategic framework based on your conversation.

Strategic questioning approaches:
- **Clarify the Vision**: "What does victory look like for this objective?"
- **Challenge Limiting Beliefs**: "What assumptions might be constraining your thinking here?"
- **Identify Strategic Steps**: "What would be the most powerful first move?"
- **Uncover Hidden Obstacles**: "What invisible barriers might emerge as you progress?"
- **Find Leverage Points**: "Where could small actions create disproportionate impact?"

Remember: You are Athena - wise, strategic, empowering. Help them see their own wisdom and strategic capability.`;
    }
    async startSocraticSession(taskId, taskTitle, taskDescription, apiKey) {
        const sessionId = `${taskId}-${Date.now()}`;
        const session = {
            taskId,
            taskTitle,
            taskDescription,
            messages: [],
            phase: 'questioning',
            apiKey: apiKey?.trim()
        };
        this.activeSessions.set(sessionId, session);
        let initialQuestion;
        let currentGenAI = this.genAI;
        // Use client-provided API key if available
        if (apiKey && apiKey.trim()) {
            try {
                currentGenAI = new GoogleGenerativeAI(apiKey.trim());
            }
            catch (error) {
                console.warn('Invalid client API key, falling back to server config:', error);
                currentGenAI = this.genAI;
            }
        }
        if (currentGenAI) {
            try {
                const model = currentGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                // Gather strategic context from knowledge base
                const strategicContext = this.getStrategicContext(taskTitle, taskDescription);
                const contextPrompt = `Task: "${taskTitle}"${taskDescription ? `\nDescription: "${taskDescription}"` : ''}

${strategicContext}

This user has a strategic objective they find overwhelming. As Athena, use both your wisdom and the strategic context gathered above to provide superior guidance.

Analyze if this task is too vague and needs clarification, or if it's specific enough to begin strategic decomposition.

If the task is vague (lacks clear definition, scope, or measurable outcome), ask a clarifying question to help them define their vision more precisely.

If the task is well-defined, start strategic guidance by asking one thoughtful question that will help them transform overwhelm into empowered action. Focus on vision, obstacles, or strategic starting points.

Remember: You are channeling Athena's wisdom enhanced by strategic knowledge - be strategic, empowering, and focused on transformation.`;
                const result = await model.generateContent({
                    contents: [
                        { role: "user", parts: [{ text: this.getSystemPrompt() }] },
                        { role: "user", parts: [{ text: contextPrompt }] }
                    ],
                });
                initialQuestion = result.response.text().trim();
            }
            catch (error) {
                console.error('Error generating initial question:', error);
                initialQuestion = this.getFallbackQuestion(taskTitle);
            }
        }
        else {
            initialQuestion = this.getFallbackQuestion(taskTitle);
        }
        session.messages.push({
            role: 'assistant',
            content: initialQuestion,
            timestamp: new Date()
        });
        return { sessionId, question: initialQuestion };
    }
    getFallbackQuestion(taskTitle) {
        // Athena's strategic wisdom for different task types
        if (taskTitle.toLowerCase().includes('write') || taskTitle.toLowerCase().includes('plan')) {
            return "What does victory look like when this objective is complete?";
        }
        else if (taskTitle.toLowerCase().includes('learn') || taskTitle.toLowerCase().includes('study')) {
            return "What would be the most powerful first move to gain this knowledge?";
        }
        else if (taskTitle.toLowerCase().includes('create') || taskTitle.toLowerCase().includes('build')) {
            return "What's the strategic foundation that everything else will build upon?";
        }
        else {
            return "What invisible barriers might be making this feel overwhelming right now?";
        }
    }
    async continueConversation(sessionId, userMessage) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }
        // Add user message to conversation
        session.messages.push({
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        });
        let nextQuestion;
        const canGeneratePlan = session.messages.length >= 3; // Allow plan generation after some dialogue
        // Check if user is asking for a plan
        const userWantsPlan = userMessage.toLowerCase().includes('plan') ||
            userMessage.toLowerCase().includes('steps') ||
            userMessage.toLowerCase().includes('summarize');
        if (userWantsPlan) {
            return this.generatePlan(sessionId);
        }
        let currentGenAI = this.genAI;
        // Use session API key if available
        if (session.apiKey) {
            try {
                currentGenAI = new GoogleGenerativeAI(session.apiKey);
            }
            catch (error) {
                console.warn('Invalid session API key, falling back to server config:', error);
                currentGenAI = this.genAI;
            }
        }
        if (currentGenAI) {
            try {
                const model = currentGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                // Build conversation history for context
                const conversationHistory = session.messages.map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                }));
                const contextPrompt = `Continue the Socratic dialogue. The user just said: "${userMessage}"

Based on their response and our conversation so far, ask ONE follow-up question that will help them think deeper about their task. Remember to be encouraging and focus on helping them discover the path forward themselves.`;
                const result = await model.generateContent({
                    contents: [
                        { role: "user", parts: [{ text: this.getSystemPrompt() }] },
                        ...conversationHistory,
                        { role: "user", parts: [{ text: contextPrompt }] }
                    ],
                });
                nextQuestion = result.response.text().trim();
            }
            catch (error) {
                console.error('Error generating follow-up question:', error);
                nextQuestion = this.getFallbackFollowUp(session.messages.length);
            }
        }
        else {
            nextQuestion = this.getFallbackFollowUp(session.messages.length);
        }
        session.messages.push({
            role: 'assistant',
            content: nextQuestion,
            timestamp: new Date()
        });
        return { question: nextQuestion, canGeneratePlan };
    }
    getFallbackFollowUp(messageCount) {
        const strategicFollowUps = [
            "That shows real strategic thinking. What would be your most powerful next move?",
            "You're seeing this clearly. Which element feels most within your sphere of influence right now?",
            "That's wise insight. What allies or resources could amplify your efforts here?",
            "Strategic focus is key. If you could only advance one front, where would you concentrate your energy?",
            "You're building a strong foundation. What would victory look like for just this first strategic objective?",
            "That's the wisdom I see in you. What would need to align for you to move forward with confidence?",
            "You're thinking like a strategist. What leverage points could create the biggest impact with minimal effort?"
        ];
        return strategicFollowUps[Math.min(messageCount - 2, strategicFollowUps.length - 1)] || strategicFollowUps[0];
    }
    async generatePlan(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }
        session.phase = 'planning';
        let planContent;
        let currentGenAI = this.genAI;
        // Use session API key if available
        if (session.apiKey) {
            try {
                currentGenAI = new GoogleGenerativeAI(session.apiKey);
            }
            catch (error) {
                console.warn('Invalid session API key, falling back to server config:', error);
                currentGenAI = this.genAI;
            }
        }
        if (currentGenAI) {
            try {
                const model = currentGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                // Gather additional strategic context for planning
                const strategicContext = this.getStrategicContext(session.taskTitle, session.taskDescription);
                // Build conversation context
                const conversationSummary = session.messages
                    .filter(msg => msg.role === 'user')
                    .map(msg => msg.content)
                    .join('\n');
                const planPrompt = `Based on our strategic dialogue about the objective "${session.taskTitle}", generate a structured action plan.

Strategic context and best practices:
${strategicContext}

Key insights from our conversation:
${conversationSummary}

As Athena, create a strategic plan with:
1. Clear, actionable strategic moves
2. Logical sequence considering dependencies and momentum
3. Realistic scope based on what the user revealed about their situation
4. Each task should be specific enough that the user knows exactly what to do
5. Incorporate strategic principles and best practices from the context above

Format as a JSON array of strategic moves with this structure:
{
  "tasks": [
    {
      "title": "Short, clear strategic move title",
      "description": "More detailed description of what to do and why it's strategic",
      "priority": "high|medium|low",
      "estimatedTime": "rough time estimate",
      "dependencies": "what needs to be done first (optional)"
    }
  ],
  "summary": "Brief explanation of the overall strategic approach"
}

Remember: This should reflect what THEY discovered through our conversation, enhanced by strategic wisdom and best practices.`;
                const result = await model.generateContent({
                    contents: [
                        { role: "user", parts: [{ text: this.getSystemPrompt() }] },
                        { role: "user", parts: [{ text: planPrompt }] }
                    ],
                });
                planContent = result.response.text().trim();
                // Try to parse as JSON, fallback to text if needed
                try {
                    const cleanContent = planContent.replace(/```json\n?/, '').replace(/```\n?$/, '');
                    const parsedPlan = JSON.parse(cleanContent);
                    // Don't add plan message to conversation history
                    return {
                        question: `Plan generated successfully! You can now review and edit the ${parsedPlan.tasks?.length || 0} tasks before adding them to your task list.`,
                        canGeneratePlan: true,
                        plan: parsedPlan
                    };
                }
                catch (parseError) {
                    // Fallback to text-based plan
                    return { question: "Plan generated! Please review the suggested tasks below.", canGeneratePlan: true };
                }
            }
            catch (error) {
                console.error('Error generating plan:', error);
                return this.getFallbackPlan(session);
            }
        }
        else {
            return this.getFallbackPlan(session);
        }
    }
    getFallbackPlan(session) {
        const strategicTasks = [
            {
                title: "Clarify your strategic vision",
                description: `Based on our discussion about "${session.taskTitle}", define what victory looks like and the strategic outcome you're seeking.`,
                priority: "high",
                estimatedTime: "20-30 minutes"
            },
            {
                title: "Identify your power moves",
                description: "Determine the most impactful first actions that will create momentum and advance your objective.",
                priority: "high",
                estimatedTime: "15-25 minutes"
            },
            {
                title: "Assess your strategic assets",
                description: "Catalog the resources, allies, skills, and tools you can leverage to achieve this objective.",
                priority: "medium",
                estimatedTime: "20-30 minutes"
            },
            {
                title: "Plan your strategic campaign",
                description: "Design the sequence of moves that will efficiently transform your current state into your desired outcome.",
                priority: "medium",
                estimatedTime: "30-45 minutes"
            }
        ];
        const strategicPlan = {
            tasks: strategicTasks,
            summary: "Athena's strategic framework to transform overwhelming objectives into empowered action. Customize these strategic moves based on your unique situation."
        };
        return { question: `Strategic plan created with ${strategicPlan.tasks.length} strategic moves! Review and adapt them to match your situation.`, canGeneratePlan: true, plan: strategicPlan };
    }
    getSession(sessionId) {
        return this.activeSessions.get(sessionId);
    }
    endSession(sessionId) {
        this.activeSessions.delete(sessionId);
    }
    // Clean up old sessions (call periodically)
    cleanupOldSessions() {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        for (const [sessionId, session] of this.activeSessions.entries()) {
            const lastMessage = session.messages[session.messages.length - 1];
            if (lastMessage && lastMessage.timestamp < oneHourAgo) {
                this.activeSessions.delete(sessionId);
            }
        }
    }
}
export const aiGuideService = new AiGuideService();
// Cleanup old sessions every hour
setInterval(() => {
    aiGuideService.cleanupOldSessions();
}, 60 * 60 * 1000);
