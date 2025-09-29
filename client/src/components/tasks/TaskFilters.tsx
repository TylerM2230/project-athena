import { useState } from 'react';
import { 
  Filter, 
  ChevronDown, 
  Calendar, 
  Zap, 
  Target,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Task } from '../../types';

export interface FilterOptions {
  status: Task['status'] | 'all';
  priority: Task['priority'] | 'all';
  dueDate: 'all' | 'overdue' | 'today' | 'thisWeek' | 'noDate';
  readyToStart: boolean;
  quickWins: boolean; // Tasks that are easy/quick
  energyLevel: 'all' | 'high' | 'medium' | 'low';
}

export interface SortOptions {
  sortBy: 'created' | 'priority' | 'deadline' | 'smart';
  sortOrder: 'asc' | 'desc';
}

interface Props {
  filters: FilterOptions;
  sorting: SortOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onSortingChange: (sorting: SortOptions) => void;
  taskCount: number;
  filteredCount: number;
}

export function TaskFilters({ 
  filters, 
  sorting, 
  onFiltersChange, 
  onSortingChange, 
  taskCount, 
  filteredCount 
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateSort = (key: keyof SortOptions, value: any) => {
    onSortingChange({ ...sorting, [key]: value });
  };

  const hasActiveFilters = () => {
    return (
      filters.status !== 'all' ||
      filters.priority !== 'all' ||
      filters.dueDate !== 'all' ||
      filters.readyToStart ||
      filters.quickWins ||
      filters.energyLevel !== 'all'
    );
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status: 'all',
      priority: 'all',
      dueDate: 'all',
      readyToStart: false,
      quickWins: false,
      energyLevel: 'all'
    });
  };

  return (
    <div className="bg-term-bg/30 border border-term-border/50 rounded-md p-3">
      {/* Compact header with quick actions */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3 flex-1">
          {/* Sort controls - more prominent since they're most used */}
          <div className="flex items-center gap-2">
            <select
              value={sorting.sortBy}
              onChange={(e) => updateSort('sortBy', e.target.value)}
              className="text-xs bg-term-bg border border-term-border/70 text-term-text font-mono px-2 py-1 rounded focus:border-term-accent/50"
            >
              <option value="smart">Smart</option>
              <option value="priority">Priority</option>
              <option value="deadline">Deadline</option>
              <option value="created">Created</option>
            </select>

            <button
              onClick={() => updateSort('sortOrder', sorting.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-xs font-mono text-term-text-dim hover:text-term-text px-1.5 py-1 hover:bg-term-bg/50 rounded transition-colors"
              title={`Sort ${sorting.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sorting.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* Quick filter pills - smaller and more subtle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => updateFilter('readyToStart', !filters.readyToStart)}
              className={`px-2 py-0.5 text-xs font-mono rounded-full transition-colors ${
                filters.readyToStart
                  ? 'bg-green-400/15 text-green-400 border border-green-400/30'
                  : 'text-term-text-dim hover:text-term-text hover:bg-term-bg/40'
              }`}
            >
              <Zap className="h-2.5 w-2.5 inline mr-1" />
              Ready
            </button>

            <button
              onClick={() => updateFilter('quickWins', !filters.quickWins)}
              className={`px-2 py-0.5 text-xs font-mono rounded-full transition-colors ${
                filters.quickWins
                  ? 'bg-blue-400/15 text-blue-400 border border-blue-400/30'
                  : 'text-term-text-dim hover:text-term-text hover:bg-term-bg/40'
              }`}
            >
              <Target className="h-2.5 w-2.5 inline mr-1" />
              Quick
            </button>

            <button
              onClick={() => updateFilter('dueDate', filters.dueDate === 'overdue' ? 'all' : 'overdue')}
              className={`px-2 py-0.5 text-xs font-mono rounded-full transition-colors ${
                filters.dueDate === 'overdue'
                  ? 'bg-red-400/15 text-red-400 border border-red-400/30'
                  : 'text-term-text-dim hover:text-term-text hover:bg-term-bg/40'
              }`}
            >
              <AlertCircle className="h-2.5 w-2.5 inline mr-1" />
              Overdue
            </button>

            <button
              onClick={() => updateFilter('dueDate', filters.dueDate === 'today' ? 'all' : 'today')}
              className={`px-2 py-0.5 text-xs font-mono rounded-full transition-colors ${
                filters.dueDate === 'today'
                  ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30'
                  : 'text-term-text-dim hover:text-term-text hover:bg-term-bg/40'
              }`}
            >
              <Calendar className="h-2.5 w-2.5 inline mr-1" />
              Today
            </button>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {hasActiveFilters() && (
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-term-accent/20 text-term-accent text-xs font-mono rounded">
                {filteredCount}
              </span>
              <button
                onClick={clearAllFilters}
                className="text-xs font-mono text-term-text-dim hover:text-term-text transition-colors"
              >
                clear
              </button>
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-term-text-dim hover:text-term-text transition-colors p-1"
            title="More filters"
          >
            <Filter className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-term-border grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status filter */}
          <div>
            <label className="block text-xs font-mono text-term-text mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full text-xs bg-term-bg border border-term-border text-term-text font-mono px-2 py-1 rounded"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <label className="block text-xs font-mono text-term-text mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => updateFilter('priority', e.target.value)}
              className="w-full text-xs bg-term-bg border border-term-border text-term-text font-mono px-2 py-1 rounded"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Due date filter */}
          <div>
            <label className="block text-xs font-mono text-term-text mb-2">Due Date</label>
            <select
              value={filters.dueDate}
              onChange={(e) => updateFilter('dueDate', e.target.value)}
              className="w-full text-xs bg-term-bg border border-term-border text-term-text font-mono px-2 py-1 rounded"
            >
              <option value="all">All Due Dates</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="thisWeek">Due This Week</option>
              <option value="noDate">No Due Date</option>
            </select>
          </div>

          {/* Energy level filter */}
          <div>
            <label className="block text-xs font-mono text-term-text mb-2">Energy Level</label>
            <select
              value={filters.energyLevel}
              onChange={(e) => updateFilter('energyLevel', e.target.value)}
              className="w-full text-xs bg-term-bg border border-term-border text-term-text font-mono px-2 py-1 rounded"
            >
              <option value="all">All Energy Levels</option>
              <option value="high">High Energy Tasks</option>
              <option value="medium">Medium Energy Tasks</option>
              <option value="low">Low Energy Tasks</option>
            </select>
          </div>
        </div>
      )}

      {/* Smart sorting hint - more subtle */}
      {sorting.sortBy === 'smart' && !isExpanded && (
        <div className="mt-2 pt-2 border-t border-term-border/30">
          <p className="text-xs font-mono text-term-text-dim text-center">
            Smart sorting active — tasks prioritized by AI
          </p>
        </div>
      )}
    </div>
  );
}