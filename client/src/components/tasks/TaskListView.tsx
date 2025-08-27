import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  FileText, 
  Link2, 
  Trash2, 
  MessageCircle,
  CheckCircle2, 
  Circle, 
  Clock,
  AlertCircle,
  Target,
  Zap
} from 'lucide-react';
import { Task, Note } from '../../types';

interface Props {
  tasks: Task[];
  taskNotes: Record<string, Note[]>;
  sortBy: 'created' | 'priority' | 'deadline';
  onTaskUpdate: (task: Task, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskSelect: (task: Task) => void;
}

export function TaskListView({ 
  tasks, 
  taskNotes, 
  sortBy, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskSelect 
}: Props) {
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());

  const sortTasks = (taskList: Task[]) => {
    return [...taskList].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          if (priorityDiff !== 0) return priorityDiff;
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'deadline':
          if (!a.dueDate && !b.dueDate) {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          }
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          const deadlineDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          if (deadlineDiff !== 0) return deadlineDiff;
          const priorityOrder2 = { 'high': 3, 'medium': 2, 'low': 1 };
          return (priorityOrder2[b.priority] || 0) - (priorityOrder2[a.priority] || 0);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-400/50 bg-red-400/10';
      case 'medium': return 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10';
      case 'low': return 'text-green-400 border-green-400/50 bg-green-400/10';
      default: return 'text-term-text-dim border-term-border bg-term-bg';
    }
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-3 w-3" />;
      case 'medium': return <Target className="h-3 w-3" />;
      case 'low': return <Zap className="h-3 w-3" />;
      default: return null;
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-amber-400" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const toggleTaskCollapse = (taskId: string) => {
    setCollapsedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const updateTaskStatus = (task: Task, newStatus: Task['status']) => {
    onTaskUpdate(task, { status: newStatus });
  };

  const rootTasks = sortTasks(tasks.filter(task => !task.parentId));
  const getSubTasks = (parentId: string) => sortTasks(tasks.filter(task => task.parentId === parentId));

  const TaskComponent = ({ task, level = 0 }: { task: Task; level?: number }) => {
    const subTasks = getSubTasks(task.id);
    const linkedNotes = taskNotes[task.id] || [];
    const isCollapsed = collapsedTasks.has(task.id);
    const hasSubTasks = subTasks.length > 0;
    
    return (
      <div className={level > 0 ? 'ml-8' : ''}>
        <div className="border border-term-border rounded-lg mb-3 hover:bg-term-bg-alt transition-colors duration-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center flex-1">
              {hasSubTasks && (
                <button
                  onClick={() => toggleTaskCollapse(task.id)}
                  className="mr-2 text-term-text-dim hover:text-term-text transition-colors"
                  title={isCollapsed ? 'Expand subtasks' : 'Collapse subtasks'}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              )}
              
              {getStatusIcon(task.status)}
              
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-mono ${task.status === 'done' ? 'line-through text-term-text-dim' : 'text-term-text'}`}>
                    {task.title}
                  </h3>
                  
                  {/* Enhanced priority badge */}
                  <div className={`flex items-center gap-1 text-xs font-mono px-2 py-1 rounded border ${getPriorityColor(task.priority)}`}>
                    {getPriorityIcon(task.priority)}
                    {task.priority}
                  </div>

                  {hasSubTasks && (
                    <span className="text-xs text-term-text-dim font-mono">
                      ({subTasks.length} subtask{subTasks.length !== 1 ? 's' : ''})
                    </span>
                  )}
                </div>

                {task.description && (
                  <p className="text-sm text-term-text-dim mt-1 font-mono">{task.description}</p>
                )}
                
                {task.dueDate && (
                  <div className={`flex items-center mt-2 text-xs font-mono ${isOverdue(task.dueDate) ? 'text-red-400' : 'text-term-text-dim'}`}>
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(task.dueDate)} {isOverdue(task.dueDate) && '(overdue)'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {linkedNotes.length > 0 && (
                <div className="flex items-center mr-3">
                  <FileText className="h-4 w-4 text-term-accent mr-1" />
                  <span className="text-xs text-term-accent font-mono">{linkedNotes.length}</span>
                </div>
              )}
              
              <button
                onClick={() => onTaskSelect(task)}
                className="text-term-text-dim hover:text-term-accent font-mono text-sm mr-3 transition-colors"
                title="AI guidance to break down this task"
              >
                <MessageCircle className="h-4 w-4" />
              </button>

              <button
                onClick={() => onTaskDelete(task.id)}
                className="text-term-text-dim hover:text-red-400 font-mono text-sm mr-3 transition-colors"
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <select
                value={task.status}
                onChange={(e) => updateTaskStatus(task, e.target.value as Task['status'])}
                className="text-xs bg-term-bg border border-term-border text-term-text font-mono px-2 py-1 rounded"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          
          {linkedNotes.length > 0 && (
            <div className="border-t border-term-border px-4 py-3">
              <div className="text-xs text-term-text-dim font-mono mb-2">linked notes:</div>
              <div className="flex flex-wrap gap-2">
                {linkedNotes.map((note) => (
                  <div key={note.id} className="flex items-center bg-term-bg border border-term-accent text-term-accent px-2 py-1 rounded text-xs font-mono">
                    <Link2 className="h-3 w-3 mr-1" />
                    {note.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {hasSubTasks && !isCollapsed && (
          <div className="subtasks-container">
            {subTasks.map(subTask => (
              <TaskComponent key={subTask.id} task={subTask} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (rootTasks.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="space-y-4">
          <p className="text-term-text-dim font-mono">no tasks yet</p>
          <div className="space-y-2">
            <p className="text-sm text-term-text font-mono">get started with task management:</p>
            <div className="space-y-1 text-xs text-term-text-dim font-mono">
              <p>• click "new task" to create your first task</p>
              <p>• use the "chat" button for ai assistance</p>
              <p>• use @note-title in descriptions to auto-link notes</p>
              <p>• break down complex tasks into subtasks</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {rootTasks.map(task => (
        <TaskComponent key={task.id} task={task} />
      ))}
    </div>
  );
}