import { GoogleGenerativeAI } from '@google/generative-ai';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SocraticSession {
  taskId: string;
  taskTitle: string;
  taskDescription?: string;
  messages: ConversationMessage[];
  phase: 'questioning' | 'planning' | 'completed';
  apiKey?: string;
}

class AiGuideService {
  private genAI: GoogleGenerativeAI | null = null;
  private activeSessions: Map<string, SocraticSession> = new Map();

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      console.warn('Gemini API key not configured. AI Guide will use fallback mode.');
    }
  }

  private getSystemPrompt(): string {
    return `You are Athena, a calm, patient, and insightful Socratic guide. Your purpose is to help users who feel overwhelmed break down large tasks into smaller, manageable steps.

Your rules are:
1. **Never give the full solution.** Your role is to ask guiding questions, not to do the work.
2. **Always ask one open-ended question at a time.** Avoid asking multiple questions in a single response.
3. **Keep your tone encouraging and non-judgmental.** Use phrases like "That's a great starting point," or "Let's explore that a bit more."
4. **Base your next question on the user's previous answer.** Make the conversation feel natural and adaptive.
5. **Focus on clarifying goals, identifying first steps, challenging assumptions, and uncovering potential obstacles.**
6. If the user seems stuck, suggest a different angle (e.g., "What if we thought about this from the end and worked backwards?").
7. **Only when the user explicitly asks for a plan** (e.g., "can you make a plan for me," "summarize this into steps"), should you provide a clear, actionable list of sub-tasks based on the entire conversation. Format this plan using markdown with headings and bullet points.

Question types to use strategically:
- **Clarify the Goal**: "What does the finished version of this task look like to you?"
- **Challenge Assumptions**: "What resources are you assuming you'll have for this?"
- **Explore Steps**: "What is the very first physical action someone would need to take?"
- **Identify Roadblocks**: "What part of this feels the most difficult or uncertain to you right now?"
- **Examine Alternatives**: "If you only had half the time, what would be the most essential parts to complete?"

Remember: You are a guide, not a doer. Help users discover their own path forward.`;
  }


  async startSocraticSession(taskId: string, taskTitle: string, taskDescription?: string, apiKey?: string): Promise<{ sessionId: string; question: string }> {
    const sessionId = `${taskId}-${Date.now()}`;
    
    const session: SocraticSession = {
      taskId,
      taskTitle,
      taskDescription,
      messages: [],
      phase: 'questioning',
      apiKey: apiKey?.trim()
    };

    this.activeSessions.set(sessionId, session);

    let initialQuestion: string;
    let currentGenAI = this.genAI;

    // Use client-provided API key if available
    if (apiKey && apiKey.trim()) {
      try {
        currentGenAI = new GoogleGenerativeAI(apiKey.trim());
      } catch (error) {
        console.warn('Invalid client API key, falling back to server config:', error);
        currentGenAI = this.genAI;
      }
    }

    if (currentGenAI) {
      try {
        const model = currentGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const contextPrompt = `Task: "${taskTitle}"${taskDescription ? `\nDescription: "${taskDescription}"` : ''}

This user has a task they find overwhelming. Start the Socratic dialogue by asking one thoughtful, open-ended question that will help them begin to break this down. Choose from clarifying the goal, exploring first steps, or understanding what makes this feel overwhelming.`;

        const result = await model.generateContent({
          contents: [
            { role: "user", parts: [{ text: this.getSystemPrompt() }] },
            { role: "user", parts: [{ text: contextPrompt }] }
          ],
        });

        initialQuestion = result.response.text().trim();
      } catch (error) {
        console.error('Error generating initial question:', error);
        initialQuestion = this.getFallbackQuestion(taskTitle);
      }
    } else {
      initialQuestion = this.getFallbackQuestion(taskTitle);
    }

    session.messages.push({
      role: 'assistant',
      content: initialQuestion,
      timestamp: new Date()
    });

    return { sessionId, question: initialQuestion };
  }

  private getFallbackQuestion(taskTitle: string): string {
    // Simple logic to pick appropriate fallback question
    if (taskTitle.toLowerCase().includes('write') || taskTitle.toLowerCase().includes('plan')) {
      return "What does the finished version of this task look like to you?";
    } else if (taskTitle.toLowerCase().includes('learn') || taskTitle.toLowerCase().includes('study')) {
      return "What's the very first physical action you would need to take?";
    } else {
      return "What part of this feels the most difficult or uncertain right now?";
    }
  }

  async continueConversation(sessionId: string, userMessage: string): Promise<{ question: string; canGeneratePlan: boolean }> {
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

    let nextQuestion: string;
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
      } catch (error) {
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
      } catch (error) {
        console.error('Error generating follow-up question:', error);
        nextQuestion = this.getFallbackFollowUp(session.messages.length);
      }
    } else {
      nextQuestion = this.getFallbackFollowUp(session.messages.length);
    }

    session.messages.push({
      role: 'assistant',
      content: nextQuestion,
      timestamp: new Date()
    });

    return { question: nextQuestion, canGeneratePlan };
  }

  private getFallbackFollowUp(messageCount: number): string {
    const fallbacks = [
      "That's helpful context. What would be the very next concrete step you could take?",
      "Interesting. What part of what you described feels most achievable right now?",
      "I can see you're thinking this through. What resources or support do you already have available?",
      "That makes sense. If you could only focus on one aspect to start, what would it be?",
      "Good insight. What would success look like for just the first small piece of this?",
      "That's a great start. What would need to happen for you to feel confident taking the first step?"
    ];
    
    return fallbacks[Math.min(messageCount - 2, fallbacks.length - 1)] || fallbacks[0];
  }

  async generatePlan(sessionId: string): Promise<{ question: string; canGeneratePlan: boolean; plan?: any }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.phase = 'planning';

    let planContent: string;
    let currentGenAI = this.genAI;
    
    // Use session API key if available
    if (session.apiKey) {
      try {
        currentGenAI = new GoogleGenerativeAI(session.apiKey);
      } catch (error) {
        console.warn('Invalid session API key, falling back to server config:', error);
        currentGenAI = this.genAI;
      }
    }

    if (currentGenAI) {
      try {
        const model = currentGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Build conversation context
        const conversationSummary = session.messages
          .filter(msg => msg.role === 'user')
          .map(msg => msg.content)
          .join('\n');

        const planPrompt = `Based on our Socratic dialogue about the task "${session.taskTitle}", generate a structured action plan. 

Key insights from our conversation:
${conversationSummary}

Create a plan with:
1. Clear, actionable sub-tasks
2. Logical sequence/dependencies
3. Realistic scope based on what the user revealed
4. Each task should be specific enough that the user knows exactly what to do

Format as a JSON array of tasks with this structure:
{
  "tasks": [
    {
      "title": "Short, clear task title",
      "description": "More detailed description of what to do",
      "priority": "high|medium|low",
      "estimatedTime": "rough time estimate",
      "dependencies": "what needs to be done first (optional)"
    }
  ],
  "summary": "Brief explanation of the overall approach"
}

Remember: This should reflect what THEY discovered through our conversation, not what you think they should do.`;

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
        } catch (parseError) {
          // Fallback to text-based plan
          return { question: "Plan generated! Please review the suggested tasks below.", canGeneratePlan: true };
        }
      } catch (error) {
        console.error('Error generating plan:', error);
        return this.getFallbackPlan(session);
      }
    } else {
      return this.getFallbackPlan(session);
    }
  }

  private getFallbackPlan(session: SocraticSession): { question: string; canGeneratePlan: boolean; plan?: any } {
    const fallbackTasks = [
      {
        title: "Define the first concrete step",
        description: `Based on our discussion about "${session.taskTitle}", identify the very first action you can take.`,
        priority: "high",
        estimatedTime: "15-30 minutes"
      },
      {
        title: "Gather necessary resources",
        description: "Collect the tools, information, or materials you identified as needed.",
        priority: "medium", 
        estimatedTime: "30-60 minutes"
      },
      {
        title: "Create a detailed plan",
        description: "Break down the main task into smaller, specific actions based on what you learned about yourself.",
        priority: "medium",
        estimatedTime: "45 minutes"
      }
    ];

    const fallbackPlan = {
      tasks: fallbackTasks,
      summary: "A basic action plan to help you get started. Customize these tasks based on your specific situation."
    };

    return { question: `Starting plan created with ${fallbackPlan.tasks.length} tasks! You can customize them below.`, canGeneratePlan: true, plan: fallbackPlan };
  }

  getSession(sessionId: string): SocraticSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  endSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
  }

  // Clean up old sessions (call periodically)
  cleanupOldSessions(): void {
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