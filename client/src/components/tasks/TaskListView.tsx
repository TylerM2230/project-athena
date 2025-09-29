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
  Zap,
  Brain,
  Battery,
  Focus
} from 'lucide-react';
import { Task } from '../../types';

interface Props {
  tasks: Task[];
  sortBy: 'created' | 'priority' | 'deadline';
  onTaskUpdate: (task: Task, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskSelect: (task: Task) => void;
}

export function TaskListView({
  tasks,
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

  // Neurodivergent-friendly helper functions
  const getCognitiveLoad = (task: Task): 'low' | 'medium' | 'high' => {
    const title = task.title.toLowerCase();
    const description = (task.description || '').toLowerCase();

    // High cognitive load indicators
    const highLoadKeywords = ['create', 'design', 'plan', 'research', 'analyze', 'develop', 'build', 'write', 'strategize'];
    const mediumLoadKeywords = ['review', 'update', 'organize', 'prepare', 'schedule', 'coordinate'];
    const lowLoadKeywords = ['check', 'call', 'email', 'file', 'copy', 'send', 'delete'];

    const hasHighLoad = highLoadKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));
    const hasMediumLoad = mediumLoadKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));
    const hasLowLoad = lowLoadKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));

    if (hasHighLoad || task.priority === 'high') return 'high';
    if (hasLowLoad) return 'low';
    return 'medium';
  };

  const getEnergyRequirement = (task: Task): 'low' | 'medium' | 'high' => {
    const cognitiveLoad = getCognitiveLoad(task);
    const hasDeadline = !!task.dueDate;
    const isInProgress = task.status === 'in-progress';

    if (cognitiveLoad === 'high' || (hasDeadline && isOverdue(task.dueDate))) return 'high';
    if (cognitiveLoad === 'medium' || hasDeadline || isInProgress) return 'medium';
    return 'low';
  };

  const getFocusLevel = (task: Task): 'quick' | 'focused' | 'deep' => {
    const title = task.title.toLowerCase();
    const description = (task.description || '').toLowerCase();

    // Quick focus: simple, routine tasks
    const quickKeywords = ['check', 'call', 'email', 'send', 'file', 'copy', 'delete', 'review'];
    // Deep focus: complex, creative tasks
    const deepKeywords = ['create', 'design', 'plan', 'research', 'analyze', 'develop', 'build', 'write'];

    const isQuick = quickKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));
    const isDeep = deepKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));

    if (isQuick || task.title.length < 20) return 'quick';
    if (isDeep || task.priority === 'high') return 'deep';
    return 'focused';
  };

  const getCognitiveLoadColor = (load: 'low' | 'medium' | 'high') => {
    switch (load) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/30';
    }
  };

  const getEnergyColor = (energy: 'low' | 'medium' | 'high') => {
    switch (energy) {
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'medium': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'low': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
    }
  };

  const getFocusColor = (focus: 'quick' | 'focused' | 'deep') => {
    switch (focus) {
      case 'deep': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'focused': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30';
      case 'quick': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    }
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
    const isCollapsed = collapsedTasks.has(task.id);
    const hasSubTasks = subTasks.length > 0;

    const cognitiveLoad = getCognitiveLoad(task);
    const energyRequirement = getEnergyRequirement(task);
    const focusLevel = getFocusLevel(task);

    return (
      <div className={level > 0 ? 'ml-6' : ''}>
        <div className={`border border-term-border rounded-xl mb-4 p-5 transition-all duration-300 hover:shadow-md ${
          task.status === 'done' ? 'opacity-70 bg-term-bg' : 'bg-term-bg-alt hover:bg-term-bg'
        }`}>
          {/* Main task content */}
          <div className="flex items-start gap-4">
            {/* Expandable indicator and status */}
            <div className="flex items-center gap-2 mt-1">
              {hasSubTasks && (
                <button
                  onClick={() => toggleTaskCollapse(task.id)}
                  className="text-term-text-dim hover:text-term-text transition-colors"
                  title={isCollapsed ? 'Expand subtasks' : 'Collapse subtasks'}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              )}

              <button
                onClick={() => updateTaskStatus(task, task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in-progress' : 'done')}
                className="hover:scale-110 transition-transform"
                title="Toggle task status"
              >
                {getStatusIcon(task.status)}
              </button>
            </div>

            {/* Task content */}
            <div className="flex-1 min-w-0">
              {/* Title and priority */}
              <div className="flex items-center gap-3 mb-2">
                <h3 className={`font-medium text-lg ${
                  task.status === 'done' ? 'line-through text-term-text-dim' : 'text-term-text'
                }`}>
                  {task.title}
                </h3>

                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border ${getPriorityColor(task.priority)}`}>
                  {getPriorityIcon(task.priority)}
                  {task.priority}
                </div>
              </div>

              {/* Neurodivergent-friendly indicators */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border ${getCognitiveLoadColor(cognitiveLoad)}`} title="Cognitive load required">
                  <Brain className="h-3 w-3" />
                  {cognitiveLoad} load
                </div>

                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border ${getEnergyColor(energyRequirement)}`} title="Energy level needed">
                  <Battery className="h-3 w-3" />
                  {energyRequirement} energy
                </div>

                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border ${getFocusColor(focusLevel)}`} title="Focus type required">
                  <Focus className="h-3 w-3" />
                  {focusLevel} focus
                </div>

                {hasSubTasks && (
                  <span className="text-xs text-term-text-dim font-medium px-2 py-1 bg-term-border/30 rounded-md">
                    {subTasks.length} subtask{subTasks.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Description */}
              {task.description && (
                <p className="text-sm text-term-text-dim mb-3 leading-relaxed">{task.description}</p>
              )}

              {/* Due date */}
              {task.dueDate && (
                <div className={`flex items-center text-xs font-medium ${
                  isOverdue(task.dueDate) ? 'text-red-400' : 'text-term-text-dim'
                }`}>
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(task.dueDate)} {isOverdue(task.dueDate) && '(overdue)'}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onTaskSelect(task)}
                className="p-2 text-term-text-dim hover:text-term-accent hover:bg-term-accent/10 rounded-lg transition-all"
                title="Get Athena's strategic guidance"
              >
                <MessageCircle className="h-4 w-4" />
              </button>

              <select
                value={task.status}
                onChange={(e) => updateTaskStatus(task, e.target.value as Task['status'])}
                className="text-xs bg-term-bg border border-term-border text-term-text font-medium px-2 py-1 rounded-md focus:ring-2 focus:ring-term-accent/50 focus:border-term-accent"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <button
                onClick={() => onTaskDelete(task.id)}
                className="p-2 text-term-text-dim hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {hasSubTasks && !isCollapsed && (
          <div className="subtasks-container ml-4 border-l-2 border-term-border/30 pl-4">
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
      <div className="bg-term-bg-alt border border-term-border rounded-xl p-12 text-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-medium text-term-text">Your strategic space awaits</h3>
            <p className="text-term-text-dim">Ready to transform chaos into empowered action?</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-term-bg border border-term-border rounded-lg">
                <div className="text-term-accent mb-2">
                  <Target className="h-6 w-6 mx-auto" />
                </div>
                <h4 className="font-medium text-sm text-term-text mb-1">Start with Goals</h4>
                <p className="text-xs text-term-text-dim">Create meaningful objectives that align with your vision</p>
              </div>

              <div className="p-4 bg-term-bg border border-term-border rounded-lg">
                <div className="text-term-accent mb-2">
                  <Brain className="h-6 w-6 mx-auto" />
                </div>
                <h4 className="font-medium text-sm text-term-text mb-1">Get Athena's Guidance</h4>
                <p className="text-xs text-term-text-dim">Let wisdom help you break down overwhelming tasks</p>
              </div>

              <div className="p-4 bg-term-bg border border-term-border rounded-lg">
                <div className="text-term-accent mb-2">
                  <Focus className="h-6 w-6 mx-auto" />
                </div>
                <h4 className="font-medium text-sm text-term-text mb-1">Match Your Energy</h4>
                <p className="text-xs text-term-text-dim">Tasks designed for your cognitive load and focus needs</p>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-term-text font-medium">Ready to begin?</p>
              <p className="text-xs text-term-text-dim mt-1">Click "new task" above or start by sharing what's on your mind</p>
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