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
    <div className="bg-term-bg-alt border border-term-border rounded-lg p-4">
      {/* Filter header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-term-accent" />
          <span className="text-sm font-mono text-term-text">Filters & Sorting</span>
          {hasActiveFilters() && (
            <span className="px-2 py-1 bg-term-accent text-term-bg text-xs font-mono rounded">
              {filteredCount}/{taskCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-mono text-term-text-dim hover:text-term-text transition-colors"
            >
              clear all
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-term-text-dim hover:text-term-text transition-colors"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick filters (always visible) */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Smart filters */}
        <button
          onClick={() => updateFilter('readyToStart', !filters.readyToStart)}
          className={`px-3 py-1 text-xs font-mono rounded border transition-colors ${
            filters.readyToStart
              ? 'bg-green-400/20 border-green-400 text-green-400'
              : 'border-term-border text-term-text-dim hover:border-term-text-dim hover:text-term-text'
          }`}
        >
          <Zap className="h-3 w-3 inline mr-1" />
          Ready to Start
        </button>

        <button
          onClick={() => updateFilter('quickWins', !filters.quickWins)}
          className={`px-3 py-1 text-xs font-mono rounded border transition-colors ${
            filters.quickWins
              ? 'bg-blue-400/20 border-blue-400 text-blue-400'
              : 'border-term-border text-term-text-dim hover:border-term-text-dim hover:text-term-text'
          }`}
        >
          <Target className="h-3 w-3 inline mr-1" />
          Quick Wins
        </button>

        {/* Due date filters */}
        <button
          onClick={() => updateFilter('dueDate', filters.dueDate === 'overdue' ? 'all' : 'overdue')}
          className={`px-3 py-1 text-xs font-mono rounded border transition-colors ${
            filters.dueDate === 'overdue'
              ? 'bg-red-400/20 border-red-400 text-red-400'
              : 'border-term-border text-term-text-dim hover:border-term-text-dim hover:text-term-text'
          }`}
        >
          <AlertCircle className="h-3 w-3 inline mr-1" />
          Overdue
        </button>

        <button
          onClick={() => updateFilter('dueDate', filters.dueDate === 'today' ? 'all' : 'today')}
          className={`px-3 py-1 text-xs font-mono rounded border transition-colors ${
            filters.dueDate === 'today'
              ? 'bg-amber-400/20 border-amber-400 text-amber-400'
              : 'border-term-border text-term-text-dim hover:border-term-text-dim hover:text-term-text'
          }`}
        >
          <Calendar className="h-3 w-3 inline mr-1" />
          Due Today
        </button>
      </div>

      {/* Sorting controls (always visible) */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-term-text">Sort:</label>
          <select
            value={sorting.sortBy}
            onChange={(e) => updateSort('sortBy', e.target.value)}
            className="text-xs bg-term-bg border border-term-border text-term-text font-mono px-2 py-1 rounded"
          >
            <option value="smart">Smart (AI-driven)</option>
            <option value="priority">Priority</option>
            <option value="deadline">Deadline</option>
            <option value="created">Created</option>
          </select>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => updateSort('sortOrder', sorting.sortOrder === 'asc' ? 'desc' : 'asc')}
            className="text-xs font-mono text-term-text-dim hover:text-term-text px-2 py-1 border border-term-border rounded transition-colors"
            title={`Sort ${sorting.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sorting.sortOrder === 'asc' ? '↑' : '↓'}
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

      {/* Today's Focus section */}
      {sorting.sortBy === 'smart' && (
        <div className="mt-4 pt-4 border-t border-term-border">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-term-accent" />
            <span className="text-sm font-mono text-term-text">Today's Focus</span>
          </div>
          <p className="text-xs font-mono text-term-text-dim">
            Smart sorting considers priority, deadlines, dependencies, and your current context to suggest the most important tasks to work on right now.
          </p>
        </div>
      )}
    </div>
  );
}