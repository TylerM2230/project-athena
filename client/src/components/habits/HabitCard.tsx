import { useState } from 'react';
import { Check, X, Minus, BookOpen, Heart, Palette, Zap, User, MoreHorizontal } from 'lucide-react';
import { HabitWithEntry } from '../../types';

interface HabitCardProps {
  habit: HabitWithEntry;
  onComplete: (habitId: string, status: 'completed' | 'skipped' | 'partial', notes?: string) => void;
  onEdit: (habit: HabitWithEntry) => void;
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

export function HabitCard({ habit, onComplete, onEdit }: HabitCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'completed' | 'skipped' | 'partial' | null>(null);

  const CategoryIcon = categoryIcons[habit.category];
  const isCompleted = habit.todayEntry?.status === 'completed';
  const isSkipped = habit.todayEntry?.status === 'skipped';
  const isPartial = habit.todayEntry?.status === 'partial';

  const handleStatusClick = (status: 'completed' | 'skipped' | 'partial') => {
    if (habit.todayEntry?.status === status) {
      // If already this status, toggle it off (no action needed since it's already recorded)
      return;
    }

    setSelectedStatus(status);
    if (status === 'completed') {
      onComplete(habit.id, status);
      setSelectedStatus(null);
    } else {
      setShowNotes(true);
    }
  };

  const handleSubmitWithNotes = () => {
    if (selectedStatus) {
      onComplete(habit.id, selectedStatus, notes.trim() || undefined);
      setShowNotes(false);
      setNotes('');
      setSelectedStatus(null);
    }
  };

  const getStatusSymbol = () => {
    if (isCompleted) return '✓';
    if (isPartial) return '◐';
    if (isSkipped) return '✗';
    return '○';
  };

  const getStatusColor = () => {
    if (isCompleted) return 'text-term-success';
    if (isPartial) return 'text-term-warning';
    if (isSkipped) return 'text-term-error';
    return 'text-term-text-dim';
  };

  const getStreakDisplay = () => {
    // Simplified streak display - in a real implementation this would fetch from the API
    if (isCompleted) return '🔥1'; // Current day completed
    return '○';
  };

  return (
    <>
      <div className="card group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <CategoryIcon className={`h-5 w-5 ${categoryColors[habit.category]}`} />
            <div>
              <h3 className="font-mono text-term-text font-medium">{habit.title}</h3>
              <p className="text-xs font-mono text-term-text-dim capitalize">
                {habit.category} • {habit.targetFrequency}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`text-lg font-mono ${getStatusColor()}`}>
              {getStatusSymbol()}
            </span>
            <span className="text-xs font-mono text-term-text-dim">
              {getStreakDisplay()}
            </span>
          </div>
        </div>

        {habit.description && (
          <p className="text-sm font-mono text-term-text-dim mb-4 line-clamp-2">
            {habit.description}
          </p>
        )}

        {habit.todayEntry?.notes && (
          <div className="mb-4 p-3 bg-term-bg-alt rounded-lg border border-term-border/50">
            <p className="text-xs font-mono text-term-text-dim mb-1">today's note:</p>
            <p className="text-sm font-mono text-term-text">{habit.todayEntry.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Complete Button */}
            <button
              onClick={() => handleStatusClick('completed')}
              disabled={isCompleted}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                isCompleted
                  ? 'bg-term-success border-term-success text-term-bg'
                  : 'border-term-border text-term-text-dim hover:border-term-success hover:text-term-success'
              }`}
              title="Mark as completed"
            >
              <Check className="h-4 w-4" />
            </button>

            {/* Partial Button */}
            <button
              onClick={() => handleStatusClick('partial')}
              disabled={isPartial}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                isPartial
                  ? 'bg-term-warning border-term-warning text-term-bg'
                  : 'border-term-border text-term-text-dim hover:border-term-warning hover:text-term-warning'
              }`}
              title="Mark as partially completed"
            >
              <Minus className="h-4 w-4" />
            </button>

            {/* Skip Button */}
            <button
              onClick={() => handleStatusClick('skipped')}
              disabled={isSkipped}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                isSkipped
                  ? 'bg-term-error border-term-error text-term-bg'
                  : 'border-term-border text-term-text-dim hover:border-term-error hover:text-term-error'
              }`}
              title="Mark as skipped"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => onEdit(habit)}
            className="p-2 rounded-lg border border-term-border text-term-text-dim hover:border-term-text-dim hover:text-term-text transition-colors opacity-0 group-hover:opacity-100"
            title="Edit habit"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notes Modal */}
      {showNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-term-bg border border-term-border rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-mono text-term-text mb-4">
              {selectedStatus === 'skipped' ? 'why skip today?' : 'partial completion notes'}
            </h3>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={selectedStatus === 'skipped' ? 'optional reason...' : 'what did you accomplish?'}
              className="input-cyber w-full h-24 resize-none mb-4"
            />

            <div className="flex space-x-3">
              <button
                onClick={handleSubmitWithNotes}
                className="btn-primary flex-1"
              >
                confirm
              </button>
              <button
                onClick={() => {
                  setShowNotes(false);
                  setNotes('');
                  setSelectedStatus(null);
                }}
                className="btn-secondary"
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}