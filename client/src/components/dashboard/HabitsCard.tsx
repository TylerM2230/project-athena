import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Flame, BookOpen, Heart, Palette, Zap, User, ExternalLink } from 'lucide-react';
import { HabitWithEntry } from '../../types';

interface HabitsCardProps {
  habits: HabitWithEntry[];
  loading: boolean;
  onComplete: (habitId: string, status: 'completed' | 'skipped' | 'partial') => void;
}

const categoryIcons = {
  learning: BookOpen,
  health: Heart,
  creativity: Palette,
  productivity: Zap,
  personal: User
};

const categoryColors = {
  learning: 'text-term-info',
  health: 'text-term-success',
  creativity: 'text-term-warning',
  productivity: 'text-term-accent',
  personal: 'text-term-text'
};

export function HabitsCard({ habits, loading, onComplete }: HabitsCardProps) {
  const [completingHabit, setCompletingHabit] = useState<string | null>(null);

  const handleQuickComplete = async (habitId: string, status: 'completed' | 'skipped' | 'partial') => {
    setCompletingHabit(habitId);
    try {
      await onComplete(habitId, status);
    } finally {
      setCompletingHabit(null);
    }
  };

  const getStatusSymbol = (habit: HabitWithEntry): string => {
    if (habit.todayEntry?.status === 'completed') return '✓';
    if (habit.todayEntry?.status === 'partial') return '◐';
    if (habit.todayEntry?.status === 'skipped') return '✗';
    return '○';
  };

  const getStatusClass = (habit: HabitWithEntry): string => {
    if (habit.todayEntry?.status === 'completed') return 'text-term-success';
    if (habit.todayEntry?.status === 'partial') return 'text-term-warning';
    if (habit.todayEntry?.status === 'skipped') return 'text-term-error';
    return 'text-term-text-dim';
  };

  const pendingHabits = habits.filter(h => !h.todayEntry || h.todayEntry.status !== 'completed');
  const completedHabits = habits.filter(h => h.todayEntry?.status === 'completed');
  const completionRate = habits.length > 0 ? (completedHabits.length / habits.length) * 100 : 0;

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-mono text-term-text">daily habits</h2>
          {completedHabits.length > 0 && (
            <span className="text-lg animate-bounce-subtle">🔥</span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-term-text-dim bg-term-bg-alt px-2 py-1 rounded">
            {completedHabits.length} / {habits.length}
          </span>
          <Link
            to="/habits"
            className="text-term-accent hover:text-term-text transition-colors"
            title="View all habits"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Progress Bar */}
      {habits.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-mono text-term-text-dim mb-2">
            <span>today's progress</span>
            <span>{Math.round(completionRate)}%</span>
          </div>
          <div className="h-2 bg-term-bg-alt rounded-full overflow-hidden">
            <div
              className="h-full bg-term-accent transition-all duration-500 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-term-border rounded"></div>
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-term-border max-w-xs"></div>
                <div className="h-2 bg-term-border w-16"></div>
              </div>
              <div className="w-6 h-6 bg-term-border rounded"></div>
            </div>
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-12 space-y-3 animate-fade-in">
          <div className="text-term-accent font-mono text-3xl">○</div>
          <p className="text-term-text font-mono text-lg">no habits yet</p>
          <p className="text-sm text-term-text-dim font-mono">
            start building powerful daily routines
          </p>
          <Link
            to="/habits"
            className="btn-primary inline-flex items-center space-x-2 mt-4"
          >
            <Flame className="h-4 w-4" />
            <span>create habits</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Pending Habits */}
          {pendingHabits.slice(0, 3).map((habit, index) => {
            const CategoryIcon = categoryIcons[habit.category];
            const isCompleting = completingHabit === habit.id;

            return (
              <div
                key={habit.id}
                className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg border border-transparent
                           hover:border-term-border/50 hover:bg-term-bg-alt/30 transition-all duration-200 animate-fade-in group"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <CategoryIcon className={`h-4 w-4 ${categoryColors[habit.category]}`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-mono text-term-text text-sm truncate">
                      {habit.icon} {habit.title}
                    </h3>
                    <p className="text-xs font-mono text-term-text-dim capitalize">
                      {habit.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <span className={`text-sm font-mono ${getStatusClass(habit)}`}>
                    {getStatusSymbol(habit)}
                  </span>

                  {!habit.todayEntry && (
                    <button
                      onClick={() => handleQuickComplete(habit.id, 'completed')}
                      disabled={isCompleting}
                      className="p-1 rounded border border-transparent text-term-text-dim hover:border-term-success hover:text-term-success transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      title="Mark as completed"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Show completed habits count if any */}
          {completedHabits.length > 0 && (
            <div className="pt-3 border-t border-term-border/50">
              <div className="flex items-center justify-between text-xs font-mono text-term-text-dim">
                <span className="flex items-center space-x-2">
                  <span className="text-term-success">✓</span>
                  <span>{completedHabits.length} completed today</span>
                </span>
                <span className="text-term-accent">
                  {completedHabits.length > 3 ? '🔥' : completedHabits.length > 1 ? '⭐' : '○'}
                </span>
              </div>
            </div>
          )}

          {/* Show link to full habits page if there are more */}
          {habits.length > 3 && (
            <div className="pt-3 border-t border-term-border/50">
              <Link
                to="/habits"
                className="text-xs font-mono text-term-accent hover:text-term-text transition-colors flex items-center space-x-1"
              >
                <span>view all {habits.length} habits</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      {habits.length > 0 && (
        <div className="mt-6 pt-4 border-t border-term-border/50">
          <div className="text-xs font-mono text-term-text-dim space-x-4">
            <span><span className="text-term-success">✓</span> completed</span>
            <span><span className="text-term-warning">◐</span> partial</span>
            <span><span className="text-term-error">✗</span> skipped</span>
            <span><span className="text-term-text-dim">○</span> pending</span>
          </div>
        </div>
      )}
    </div>
  );
}