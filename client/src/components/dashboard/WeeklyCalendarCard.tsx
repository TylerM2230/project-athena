import { useState, useEffect } from 'react';
import { Task, TaskDistribution, TimePeriod } from '../../types';
import { getPeriodDates, getDayName, isToday, formatDateISO } from '../../utils/dateHelpers';

interface CalendarCardProps {
  loading: boolean;
}

export function WeeklyCalendarCard({ loading }: CalendarCardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [periodLoading, setPeriodLoading] = useState(false);
  
  const { days, start } = getPeriodDates(selectedPeriod);
  
  const fetchPeriodTasks = async (period: TimePeriod) => {
    setPeriodLoading(true);
    try {
      const response = await fetch(`/api/dashboard/period-tasks/${period}`);
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching period tasks:', error);
      setTasks([]);
    } finally {
      setPeriodLoading(false);
    }
  };

  const getTaskDistribution = (): TaskDistribution => {
    const distribution: TaskDistribution = {};
    
    days.forEach(day => {
      const dateKey = formatDateISO(day);
      distribution[dateKey] = tasks.filter(task => 
        task.dueDate === dateKey
      );
    });
    
    return distribution;
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    fetchPeriodTasks(period);
  };

  // Load initial data
  useEffect(() => {
    fetchPeriodTasks(selectedPeriod);
  }, []);

  const getDayClass = (day: Date, dayTasks: Task[]): string => {
    let classes = 'p-3 border border-term-border rounded text-center transition-colors hover:border-term-text-dim';
    
    if (isToday(day)) {
      classes += ' border-term-accent bg-term-bg-alt';
    } else {
      classes += ' bg-term-bg';
    }
    
    const hasHighPriority = dayTasks.some(t => t.priority === 'high');
    if (hasHighPriority && !isToday(day)) {
      classes += ' border-term-warning';
    }
    
    return classes;
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-term-warning';
      case 'medium': return 'bg-term-info';
      case 'low': return 'bg-term-text-dim';
      default: return 'bg-term-text-dim';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-mono text-term-text">
          calendar
        </h2>
        <div className="flex items-center space-x-2">
          <div className="flex border border-term-border rounded">
            {(['week', 'month', 'quarter'] as TimePeriod[]).map(period => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`px-2 py-1 text-xs font-mono transition-colors ${
                  selectedPeriod === period
                    ? 'bg-term-accent text-term-bg'
                    : 'text-term-text-dim hover:text-term-text hover:bg-term-bg-alt'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono text-term-text-dim">
            {start.toLocaleDateString('en-US', { 
              month: 'short', 
              year: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {loading || periodLoading ? (
        <div className="animate-pulse">
          <div className={`grid gap-2 ${
            selectedPeriod === 'week' ? 'grid-cols-7' : 
            selectedPeriod === 'month' ? 'grid-cols-7' : 
            'grid-cols-7 md:grid-cols-10'
          }`}>
            {Array.from({ length: selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 42 : 91 }).map((_, i) => (
              <div key={i} className={`bg-term-border rounded ${
                selectedPeriod === 'week' ? 'h-20' : 
                selectedPeriod === 'month' ? 'h-16' : 
                'h-12'
              }`}></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className={`grid gap-2 ${
            selectedPeriod === 'week' ? 'grid-cols-7' : 
            selectedPeriod === 'month' ? 'grid-cols-7' : 
            'grid-cols-7 md:grid-cols-10 lg:grid-cols-13'
          }`}>
            {days.map((day) => {
              const dateKey = formatDateISO(day);
              const dayTasks = getTaskDistribution()[dateKey] || [];
              const isCurrentMonth = selectedPeriod !== 'month' || day.getMonth() === new Date().getMonth();
              
              return (
                <div 
                  key={dateKey} 
                  className={`${getDayClass(day, dayTasks)} ${
                    selectedPeriod === 'week' ? 'min-h-[5rem]' : 
                    selectedPeriod === 'month' ? 'min-h-[4rem]' : 
                    'min-h-[3rem]'
                  } ${
                    !isCurrentMonth ? 'opacity-40' : ''
                  }`}
                >
                  {selectedPeriod === 'week' && (
                    <div className="font-mono text-xs font-medium mb-1">
                      {getDayName(day)}
                    </div>
                  )}
                  
                  <div className={`font-mono mb-1 ${
                    selectedPeriod === 'week' ? 'text-lg' : 'text-sm'
                  } ${isToday(day) ? 'text-term-accent' : 'text-term-text'}`}>
                    {day.getDate()}
                  </div>
                  
                  {dayTasks.length > 0 && (
                    <div className="space-y-1">
                      <div className="font-mono text-xs text-term-text">
                        {dayTasks.length}
                      </div>
                      {selectedPeriod === 'week' && (
                        <div className="flex justify-center space-x-1">
                          {dayTasks.slice(0, 3).map((task, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}
                              title={`${task.title} (${task.priority})`}
                            />
                          ))}
                          {dayTasks.length > 3 && (
                            <div className="w-2 h-2 rounded-full bg-term-text-dim opacity-50" />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {(() => {
            const todayKey = formatDateISO(new Date());
            const todayTasks = getTaskDistribution()[todayKey] || [];
            
            if (todayTasks.length > 0) {
              return (
                <div className="mt-4 pt-3 border-t border-term-border">
                  <h3 className="font-mono text-sm text-term-text mb-2">
                    today ({todayTasks.length})
                  </h3>
                  <div className="space-y-1">
                    {todayTasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                        <span className="font-mono text-xs text-term-text truncate">
                          {task.title}
                        </span>
                      </div>
                    ))}
                    {todayTasks.length > 3 && (
                      <div className="text-xs font-mono text-term-text-dim">
                        +{todayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </>
      )}
    </div>
  );
}