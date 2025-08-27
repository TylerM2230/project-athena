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
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-mono text-term-text">
          active items
        </h2>
        <span className="text-xs font-mono text-term-text-dim">
          {tasks.length}
        </span>
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
        <div className="text-center py-8 space-y-2 animate-fade-in">
          <div className="text-term-accent font-mono text-2xl animate-bounce-subtle">○</div>
          <p className="text-term-text-dim font-mono">no items</p>
          <p className="text-xs text-term-text-dim font-mono">
            nothing scheduled or in progress
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div 
              key={task.id}
              className="flex items-start justify-between py-3 px-2 -mx-2 rounded-lg border-b border-term-border last:border-b-0 
                         hover:bg-term-bg-alt/50 hover:scale-[1.02] transition-all duration-200 animate-fade-in cursor-pointer group"
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
      
      {tasks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-term-border">
          <p className="text-xs font-mono text-term-text-dim">
            Legend: <span className="text-term-error">!</span> overdue • 
            <span className="text-term-error"> ●</span> urgent • 
            <span className="text-term-warning"> ●</span> high • 
            <span className="text-term-info"> ○</span> medium • 
            <span className="text-term-text-dim"> ·</span> low
          </p>
        </div>
      )}
    </div>
  );
}