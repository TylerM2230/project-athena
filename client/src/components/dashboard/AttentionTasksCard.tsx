import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Task } from '../../types';
import { getUrgencyLevel, isOverdue, getDaysUntilDue } from '../../utils/dateHelpers';

interface AttentionTasksCardProps {
  tasks: Task[];
  loading: boolean;
}

export function AttentionTasksCard({ tasks, loading }: AttentionTasksCardProps) {
  const getUrgencySymbol = (task: Task): string => {
    const urgency = getUrgencyLevel(task.dueDate, task.priority, task.status);
    
    switch (urgency) {
      case 'overdue': return '!';
      case 'urgent': return '●';
      case 'high': return '●';
      case 'medium': return '○';
      case 'low': return '·';
      default: return '·';
    }
  };

  const getUrgencyClass = (task: Task): string => {
    const urgency = getUrgencyLevel(task.dueDate, task.priority, task.status);
    
    switch (urgency) {
      case 'overdue': return 'text-term-error animate-bounce-subtle';
      case 'urgent': return 'text-term-error animate-pulse';
      case 'high': return 'text-term-warning group-hover:animate-bounce-subtle';
      case 'medium': return 'text-term-info';
      case 'low': return 'text-term-text-dim';
      default: return 'text-term-text-dim';
    }
  };

  const getDueDateInfo = (task: Task): string => {
    if (!task.dueDate) return '';
    
    if (isOverdue(task.dueDate)) {
      const days = Math.abs(getDaysUntilDue(task.dueDate));
      return `overdue ${days}d`;
    }
    
    const days = getDaysUntilDue(task.dueDate);
    if (days === 0) return 'due today';
    if (days === 1) return 'due tomorrow';
    if (days <= 7) return `due ${days}d`;
    
    return '';
  };

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-mono text-term-text">
          active items
        </h2>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-term-text-dim bg-term-bg-alt px-2 py-1 rounded">
            {tasks.length}
          </span>
          <Link
            to="/tasks"
            className="text-term-accent hover:text-term-text transition-colors"
            title="View all tasks"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-term-border rounded-full"></div>
              <div className="h-3 bg-term-border flex-1 max-w-xs"></div>
              <div className="h-3 bg-term-border w-16"></div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 space-y-3 animate-fade-in">
          <div className="text-term-accent font-mono text-3xl animate-bounce-subtle">○</div>
          <p className="text-term-text font-mono text-lg">all clear</p>
          <p className="text-sm text-term-text-dim font-mono">
            no active items requiring attention
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className="flex items-start justify-between py-4 px-3 -mx-3 rounded-lg border border-transparent
                         hover:border-term-border/50 hover:bg-term-bg-alt/30 transition-all duration-200 animate-fade-in cursor-pointer group"
              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
            >
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <span className={`mt-1 ${getUrgencyClass(task)} font-mono text-sm`}>
                  {getUrgencySymbol(task)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-mono text-term-text truncate">
                      {task.title}
                    </h3>
                    {task.status === 'in-progress' && (
                      <span className="text-xs font-mono text-term-info">
                        active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs font-mono ${
                      task.priority === 'high' 
                        ? 'priority-high' 
                        : task.priority === 'medium'
                        ? 'priority-medium'
                        : 'priority-low'
                    }`}>
                      {task.priority}
                    </span>
                    {getDueDateInfo(task) && (
                      <>
                        <span className="text-xs font-mono text-term-text-dim">•</span>
                        <span className={`text-xs font-mono ${
                          isOverdue(task.dueDate!) 
                            ? 'text-term-error' 
                            : 'text-term-text-dim'
                        }`}>
                          {getDueDateInfo(task)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show link to full tasks page if there are tasks */}
      {tasks.length > 0 && (
        <div className="mt-6 pb-4 border-b border-term-border/50">
          <Link
            to="/tasks"
            className="text-xs font-mono text-term-accent hover:text-term-text transition-colors flex items-center space-x-1"
          >
            <span>view all tasks</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-term-border/50">
          <div className="text-xs font-mono text-term-text-dim space-x-4">
            <span><span className="text-term-error">!</span> overdue</span>
            <span><span className="text-term-error">●</span> urgent</span>
            <span><span className="text-term-warning">●</span> high</span>
            <span><span className="text-term-info">○</span> medium</span>
            <span><span className="text-term-text-dim">·</span> low</span>
          </div>
        </div>
      )}
    </div>
  );
}