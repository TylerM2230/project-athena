import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '../types';
import { formatDateISO } from '../utils/dateHelpers';

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Get calendar data for the current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Create calendar grid
  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    const date = new Date(firstDayOfMonth);
    date.setDate(date.getDate() - (firstDayOfWeek - i));
    calendarDays.push({ date, isCurrentMonth: false });
  }

  // Add days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    calendarDays.push({ date, isCurrentMonth: true });
  }

  // Add days from next month to complete the grid (6 rows of 7 days)
  const totalCells = 42;
  const remainingCells = totalCells - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(year, month + 1, i);
    calendarDays.push({ date, isCurrentMonth: false });
  }

  const fetchMonthTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();

      // Filter tasks to only those in the current month
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      const filteredTasks = (data || []).filter((task: Task) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= startDate && taskDate <= endDate;
      });

      setTasks(filteredTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthTasks();
  }, [currentDate]);

  const getTasksForDate = (date: Date): Task[] => {
    const dateKey = formatDateISO(date);
    return tasks.filter(task => task.dueDate === dateKey);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="title-terminal">calendar</h1>
            <p className="subtitle-terminal">
              {monthNames[month].toLowerCase()} {year}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-term-text-dim hover:text-term-text hover:bg-term-bg-alt rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-term-text-dim hover:text-term-text hover:bg-term-bg-alt rounded transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="card animate-slide-up">
        {/* Month indicator sidebar */}
        <div className="flex">
          <div className="w-20 flex items-center justify-center border-r-2 border-term-border mr-6 py-4">
            <div
              className="text-xl font-mono font-bold text-term-text tracking-wider transform -rotate-90 whitespace-nowrap"
            >
              {monthNames[month].substring(0, 3)}
            </div>
          </div>

          {/* Calendar content */}
          <div className="flex-1">

            {/* Day names header */}
            <div className="grid grid-cols-7 gap-3 mb-4">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-mono text-term-text-dim pb-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {loading ? (
              <div className="animate-pulse">
                <div className="grid grid-cols-7 gap-3">
                  {Array.from({ length: 42 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-term-border rounded-xl"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-3">
                {calendarDays.map((calendarDay, index) => {
                  const { date, isCurrentMonth } = calendarDay;
                  const dayTasks = getTasksForDate(date);
                  const hasHighPriorityTask = dayTasks.some(task => task.priority === 'high');
                  const todayStyle = isToday(date);

                  return (
                    <div
                      key={index}
                      className={`
                        aspect-square rounded-xl p-3 transition-all duration-200 hover:scale-105 cursor-pointer
                        border-2 relative
                        ${isCurrentMonth
                          ? todayStyle
                            ? 'bg-term-surface border-term-accent border-2 shadow-lg ring-1 ring-term-accent ring-opacity-30'
                            : hasHighPriorityTask
                              ? 'bg-term-warning bg-opacity-10 border-term-warning'
                              : 'bg-term-surface border-term-border hover:bg-term-bg-alt hover:border-term-text-dim'
                          : 'bg-term-bg border-term-border opacity-50'
                        }
                      `}
                    >
                      <div className="h-full flex flex-col">
                        {/* Date number */}
                        <div className={`
                          text-base font-mono font-bold mb-1 leading-none
                          ${!isCurrentMonth
                            ? 'text-term-text-dim opacity-60'
                            : todayStyle
                              ? 'text-term-bg bg-term-accent px-2 py-1 rounded-md shadow-sm'
                              : hasHighPriorityTask
                                ? 'text-term-warning'
                                : 'text-term-text'
                          }
                        `}>
                          {String(date.getDate()).padStart(2, '0')}
                        </div>

                        {/* Today indicator */}
                        {todayStyle && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-term-accent rounded-full animate-pulse"></div>
                        )}

                        {/* Tasks */}
                        {isCurrentMonth && dayTasks.length > 0 && (
                          <div className="flex-1 space-y-1">
                            {/* First task preview */}
                            {dayTasks.slice(0, 1).map((task, taskIndex) => (
                              <div
                                key={taskIndex}
                                className={`
                                  text-xs font-mono px-2 py-1 rounded truncate
                                  ${hasHighPriorityTask && task.priority === 'high'
                                    ? 'bg-term-warning bg-opacity-20 text-term-warning border border-term-warning border-opacity-30'
                                    : 'bg-term-bg-alt text-term-text border border-term-border'
                                  }
                                `}
                                title={`${task.title} - ${task.priority} priority`}
                              >
                                {task.title}
                              </div>
                            ))}

                            {/* Task count and priority indicators */}
                            <div className="flex items-center justify-between">
                              {dayTasks.length > 1 && (
                                <div className="text-xs font-mono text-term-text font-semibold">
                                  +{dayTasks.length - 1}
                                </div>
                              )}

                              {/* Priority indicators */}
                              <div className="flex space-x-1">
                                {dayTasks.slice(0, 3).map((task, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full shadow-sm ${
                                      task.priority === 'high' ? 'bg-term-warning' :
                                      task.priority === 'medium' ? 'bg-term-info' :
                                      'bg-term-text-dim'
                                    }`}
                                    title={`${task.priority} priority task`}
                                  />
                                ))}
                                {dayTasks.length > 3 && (
                                  <div className="w-2 h-2 rounded-full bg-term-text-dim opacity-50" />
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}