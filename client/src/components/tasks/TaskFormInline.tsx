import { useState, useRef, useEffect } from 'react';
import { Plus, X, Flag, ArrowRight, Lightbulb } from 'lucide-react';
import { CreateTaskRequest } from '../../types';

interface Props {
  onSubmit: (task: CreateTaskRequest) => Promise<void>;
  onCancel: () => void;
  parentId?: string;
}

const TASK_TEMPLATES = [
  { 
    title: 'Meeting preparation',
    description: 'Prepare agenda, review materials, confirm attendees',
    priority: 'medium' as const
  },
  { 
    title: 'Code review',
    description: 'Review pull request, test changes, provide feedback',
    priority: 'medium' as const
  },
  {
    title: 'Research task',
    description: 'Gather information, analyze options, document findings',
    priority: 'low' as const
  },
  {
    title: 'Bug investigation',
    description: 'Reproduce issue, identify root cause, plan fix',
    priority: 'high' as const
  }
];

export function TaskFormInline({ onSubmit, onCancel, parentId }: Props) {
  const [task, setTask] = useState<CreateTaskRequest>({ 
    title: '', 
    description: '', 
    priority: 'medium',
    parentId 
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState('');
  
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task.title.trim()) {
      setTitleError('Task title is required');
      titleInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(task);
      // Reset form
      setTask({ 
        title: '', 
        description: '', 
        priority: 'medium',
        parentId 
      });
      setIsExpanded(false);
      setTitleError('');
      onCancel();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleTitleChange = (value: string) => {
    setTask({ ...task, title: value });
    if (titleError) setTitleError('');
  };

  const applyTemplate = (template: typeof TASK_TEMPLATES[0]) => {
    setTask({
      ...task,
      title: template.title,
      description: template.description,
      priority: template.priority
    });
    setShowTemplates(false);
    setIsExpanded(true);
  };

  const getPriorityColor = (priority: CreateTaskRequest['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-400 text-red-400 bg-red-400/10';
      case 'medium': return 'border-yellow-400 text-yellow-400 bg-yellow-400/10';
      case 'low': return 'border-green-400 text-green-400 bg-green-400/10';
      default: return 'border-term-border text-term-text bg-term-bg';
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main input row */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <input
              ref={titleInputRef}
              type="text"
              value={task.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full input-cyber ${titleError ? 'border-red-400 focus:border-red-400' : ''}`}
              placeholder="What needs to be done? (Ctrl+Enter to save, Esc to cancel)"
              disabled={isSubmitting}
            />
            {titleError && (
              <p className="text-red-400 text-xs mt-1 font-mono">{titleError}</p>
            )}
          </div>

          {/* Quick priority selector */}
          <div className="flex items-center gap-1">
            {(['low', 'medium', 'high'] as const).map((priority) => (
              <button
                key={priority}
                type="button"
                onClick={() => setTask({ ...task, priority })}
                className={`p-2 rounded border transition-colors ${
                  task.priority === priority 
                    ? getPriorityColor(priority)
                    : 'border-term-border text-term-text-dim hover:border-term-text-dim'
                }`}
                title={`Set ${priority} priority`}
              >
                <Flag className="h-3 w-3" />
              </button>
            ))}
          </div>

          {/* Template button */}
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="p-2 border border-term-border text-term-text-dim hover:text-term-accent hover:border-term-accent rounded transition-colors"
            title="Use template"
          >
            <Lightbulb className="h-4 w-4" />
          </button>

          {/* Expand button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 border border-term-border text-term-text-dim hover:text-term-text rounded transition-colors"
            title="More options"
          >
            <ArrowRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              type="submit"
              disabled={isSubmitting || !task.title.trim()}
              className="btn-primary px-3 py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary px-3 py-2 text-xs"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Templates dropdown */}
        {showTemplates && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-term-bg-alt border border-term-border rounded-lg shadow-lg">
            <div className="p-3">
              <h4 className="text-sm font-mono text-term-text mb-2">Quick Templates</h4>
              <div className="space-y-1">
                {TASK_TEMPLATES.map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="w-full text-left p-2 rounded hover:bg-term-bg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono text-term-text">{template.title}</span>
                      <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(template.priority)}`}>
                        {template.priority}
                      </span>
                    </div>
                    <p className="text-xs text-term-text-dim font-mono mt-1">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Expanded options */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-term-bg-alt rounded-lg border border-term-border">
            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-mono text-term-text mb-2">Description</label>
              <div className="mb-2 text-xs font-mono text-term-text-dim">
                <p>Use @note-title to reference notes and provide context for AI guidance</p>
              </div>
              <textarea
                value={task.description}
                onChange={(e) => setTask({ ...task, description: e.target.value })}
                className="w-full input-cyber resize-none"
                placeholder="Describe your task... use @note-title to reference notes"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {/* Priority (detailed) */}
            <div>
              <label className="block text-sm font-mono text-term-text mb-2">Priority</label>
              <select
                value={task.priority || 'medium'}
                onChange={(e) => setTask({ ...task, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full input-cyber"
                disabled={isSubmitting}
              >
                <option value="low">Low - Can wait</option>
                <option value="medium">Medium - Normal priority</option>
                <option value="high">High - Urgent</option>
              </select>
            </div>

            {/* Due date */}
            <div>
              <label className="block text-sm font-mono text-term-text mb-2">Due Date</label>
              <input
                type="date"
                value={task.dueDate || ''}
                onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
                className="w-full input-cyber"
                disabled={isSubmitting}
              />
            </div>

            {/* Keyboard shortcuts help */}
            <div className="md:col-span-2 text-xs text-term-text-dim font-mono space-y-1">
              <p><kbd className="bg-term-border px-1 rounded">Ctrl+Enter</kbd> - Save task</p>
              <p><kbd className="bg-term-border px-1 rounded">Esc</kbd> - Cancel</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}