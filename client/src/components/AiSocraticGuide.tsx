import { useState, useRef, useEffect } from 'react';
import { Send, X, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Task } from '../types';
import { parseNoteMentions, fetchMentionedNotes, formatNotesForAI } from '../utils/noteParser';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GeneratedTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime?: string;
  dependencies?: string;
}

interface GeneratedPlan {
  tasks: GeneratedTask[];
  summary: string;
}

interface Props {
  task: Task;
  onClose: () => void;
  onTasksCreated: (tasks: Task[]) => void;
}

export function AiSocraticGuide({ task, onClose, onTasksCreated }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [canGeneratePlan, setCanGeneratePlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [editingTasks, setEditingTasks] = useState<GeneratedTask[]>([]);
  const [phase, setPhase] = useState<'questioning' | 'planning' | 'completed'>('questioning');
  const [referencedNotes, setReferencedNotes] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Auto-focus input when not loading
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  const startSession = async () => {
    setLoading(true);
    try {
      // Parse @ mentions from task description and fetch related notes
      const mentions = task.description ? parseNoteMentions(task.description) : [];
      const mentionedNotes = await fetchMentionedNotes(mentions);
      const noteContext = formatNotesForAI(mentionedNotes);
      
      // Store referenced note titles for display
      setReferencedNotes(mentionedNotes.map(note => note.title));
      
      const apiKey = localStorage.getItem('gemini_api_key');
      const response = await fetch('/api/ai-guide/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          taskTitle: task.title,
          taskDescription: (task.description || '') + noteContext,
          apiKey: apiKey || undefined
        })
      });

      const data = await response.json();

      if (data.sessionId) {
        setSessionId(data.sessionId);
        setMessages([{
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }]);
        setCanGeneratePlan(data.canGeneratePlan);
        setPhase(data.phase);
      } else if (data.fallback) {
        // Fallback mode
        setMessages([{
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error starting session:', error);
      setMessages([{
        role: 'assistant',
        content: "I'm having trouble connecting right now, but let's work through this together. What part of this task feels most overwhelming to you?",
        timestamp: new Date()
      }]);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || loading) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    
    // Add user message immediately
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      if (!sessionId) {
        // Fallback conversation
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "That's helpful to know. What would be the very first concrete step you could take to move forward?",
            timestamp: new Date()
          }]);
          setLoading(false);
          setCanGeneratePlan(true);
        }, 1000);
        return;
      }

      const response = await fetch('/api/ai-guide/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userMessage
        })
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }]);

      setCanGeneratePlan(data.canGeneratePlan);
      setPhase(data.phase);

      if (data.plan) {
        setGeneratedPlan(data.plan);
        setEditingTasks(data.plan.tasks);
        setPhase('planning');
        // Don't add plan generation message to chat history
        return;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble processing that. Could you tell me more about what you're thinking?",
        timestamp: new Date()
      }]);
    }
    
    setLoading(false);
  };

  const generatePlan = async () => {
    if (!sessionId) {
      // Fallback plan generation
      const fallbackPlan = {
        tasks: [
          {
            title: "Define the first concrete step",
            description: `Identify the very first action for: ${task.title}`,
            priority: 'high' as const
          },
          {
            title: "Gather necessary resources", 
            description: "Collect tools, information, or materials needed",
            priority: 'medium' as const
          }
        ],
        summary: "A basic starting plan based on our discussion"
      };
      
      setGeneratedPlan(fallbackPlan);
      setEditingTasks(fallbackPlan.tasks);
      setPhase('planning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai-guide/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();

      if (data.plan) {
        setGeneratedPlan(data.plan);
        setEditingTasks(data.plan.tasks);
        setPhase('planning');
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error generating plan:', error);
    }
    setLoading(false);
  };

  const updateTask = (index: number, field: keyof GeneratedTask, value: string) => {
    setEditingTasks(prev => prev.map((task, i) => 
      i === index ? { ...task, [field]: value } : task
    ));
  };

  const removeTask = (index: number) => {
    setEditingTasks(prev => prev.filter((_, i) => i !== index));
  };

  const addTask = () => {
    setEditingTasks(prev => [...prev, {
      title: '',
      description: '',
      priority: 'medium'
    }]);
  };

  const createTasks = async () => {
    const validTasks = editingTasks.filter(t => t.title.trim());
    
    if (validTasks.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai-guide/create-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          tasks: validTasks,
          parentTaskId: task.id
        })
      });

      const data = await response.json();
      
      if (data.createdTasks) {
        setPhase('completed');
        onTasksCreated(data.createdTasks);
        
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating tasks:', error);
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-term-bg/90 flex items-center justify-center z-50 p-4">
      <div className="modal-terminal w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-term-border">
          <div className="flex items-center">
            <span className="text-term-accent font-mono mr-3">ai</span>
            <div>
              <h2 className="text-lg font-mono text-term-text">socratic guide</h2>
              <p className="text-sm text-term-text-dim font-mono">breaking down: {task.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-term-text-dim hover:text-term-text font-mono">
            close
          </button>
        </div>

        {/* Referenced Notes Indicator */}
        {referencedNotes.length > 0 && (
          <div className="border-b border-term-border bg-term-bg-alt px-6 py-3">
            <div className="text-xs font-mono text-term-text-dim mb-1">referenced context:</div>
            <div className="flex flex-wrap gap-2">
              {referencedNotes.map((noteTitle, index) => (
                <div key={index} className="flex items-center bg-term-bg border border-term-accent text-term-accent px-2 py-1 rounded text-xs font-mono">
                  <span className="mr-1">@</span>
                  {noteTitle}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-xl px-4 py-3 backdrop-blur-sm ${
                message.role === 'user' 
                  ? 'bg-neon-gradient text-white shadow-neon-sm' 
                  : 'bg-void-800/80 text-neon-cyan-100 border border-void-600/30'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 opacity-70 ${
                  message.role === 'user' ? 'text-neon-cyan-100' : 'text-neon-cyan-300'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-2 font-mono text-term-text-dim">
                thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Plan Editor */}
        {phase === 'planning' && generatedPlan && (
          <div className="border-t border-term-border bg-term-bg-alt p-4 max-h-64 overflow-y-auto">
            <div className="flex items-center mb-4">
              <span className="text-term-accent font-mono mr-2">plan:</span>
              <h3 className="font-mono text-term-text">generated action plan</h3>
            </div>
            
            {generatedPlan.summary && (
              <p className="text-sm text-term-text-dim mb-4 font-mono">{generatedPlan.summary}</p>
            )}

            <div className="space-y-3">
              {editingTasks.map((task, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-void-800/60 rounded-xl border border-void-600/30 backdrop-blur-sm hover:border-neon-cyan-500/30 transition-all duration-300">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => updateTask(index, 'title', e.target.value)}
                      className="w-full text-sm font-medium border-none outline-none bg-transparent text-neon-cyan-100 placeholder-void-400"
                      placeholder="Task title..."
                    />
                    <textarea
                      value={task.description}
                      onChange={(e) => updateTask(index, 'description', e.target.value)}
                      className="w-full text-xs text-neon-cyan-300 border-none outline-none bg-transparent resize-none placeholder-void-400"
                      placeholder="Description..."
                      rows={2}
                    />
                  </div>
                  <select
                    value={task.priority}
                    onChange={(e) => updateTask(index, 'priority', e.target.value)}
                    className="text-xs input-cyber px-2 py-1"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <button
                    onClick={() => removeTask(index)}
                    className="text-neon-cyan-400 hover:text-plasma-pink-400 hover:shadow-neon-sm transition-all duration-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={addTask}
                className="w-full text-sm text-neon-cyan-300 border-2 border-dashed border-void-600 rounded-xl p-3 hover:border-neon-cyan-500/50 transition-all duration-300 bg-void-800/30"
              >
                + Add another task
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {phase === 'completed' && (
          <div className="border-t border-term-border bg-term-bg-alt p-4 text-center">
            <div className="text-term-accent font-mono mb-2">✓</div>
            <p className="text-term-text font-mono">tasks created successfully</p>
            <p className="text-sm text-term-text-dim font-mono">check your task list to see the new sub-tasks</p>
          </div>
        )}

        {/* Input and Actions */}
        {phase !== 'completed' && (
          <div className="border-t border-term-border p-4 space-y-4 bg-term-bg-alt">
            {canGeneratePlan && phase === 'questioning' && (
              <div className="flex justify-center">
                <button
                  onClick={generatePlan}
                  disabled={loading}
                  className="btn-secondary flex items-center"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Generate Action Plan
                </button>
              </div>
            )}

            {phase === 'planning' && editingTasks.length > 0 && (
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setPhase('questioning')}
                  className="btn-secondary"
                >
                  Continue Discussion
                </button>
                <button
                  onClick={createTasks}
                  disabled={loading}
                  className="btn-primary flex items-center"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Create {editingTasks.filter(t => t.title.trim()).length} Tasks
                </button>
              </div>
            )}

            {phase === 'questioning' && (
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  placeholder="Share your thoughts..."
                  className="flex-1 input-cyber"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !currentMessage.trim()}
                  className="btn-primary flex items-center px-4"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}