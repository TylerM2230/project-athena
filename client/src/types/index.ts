export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  treeCollapsed?: boolean;
  treePositionX?: number;
  treePositionY?: number;
}


export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  parentId?: string;
}


export interface DashboardStats {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  tasksCompletedThisWeek: number;
}

export interface TaskDistribution {
  [date: string]: Task[];
}

export interface PeriodTasksResponse {
  tasks: Task[];
  startDate: string;
  endDate: string;
  period: string;
}

export type TimePeriod = 'week' | 'month' | 'quarter';

export interface TaskUrgency {
  level: 'overdue' | 'urgent' | 'high' | 'medium' | 'low';
  daysUntilDue?: number;
  isOverdue: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: 'vision' | 'long-term' | 'short-term' | 'sprint';
  status: 'active' | 'achieved' | 'on-hold' | 'archived';
  priority: 'high' | 'medium' | 'low';
  targetDate?: string;
  parentId?: string; // For goal hierarchies
  createdAt: string;
  updatedAt: string;
  progress?: number; // 0-100
  metrics?: string[]; // Success indicators
}

export interface CreateGoalRequest {
  title: string;
  description?: string;
  type: 'vision' | 'long-term' | 'short-term' | 'sprint';
  priority?: 'high' | 'medium' | 'low';
  targetDate?: string;
  parentId?: string;
  metrics?: string[];
}

export interface GoalWithTasks extends Goal {
  linkedTasks: Task[];
  subGoals: Goal[];
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: 'learning' | 'health' | 'creativity' | 'productivity' | 'personal';
  targetFrequency: 'daily' | 'weekly';
  targetCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  icon?: string;
  reminderTime?: string;
  goalId?: string;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string;
  status: 'completed' | 'skipped' | 'partial';
  notes?: string;
  completionTime?: string;
  value?: number;
  createdAt: string;
  updatedAt: string;
}

export interface HabitStreak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  lastCompleted?: string;
}

export interface CreateHabitRequest {
  title: string;
  description?: string;
  category: 'learning' | 'health' | 'creativity' | 'productivity' | 'personal';
  targetFrequency?: 'daily' | 'weekly';
  targetCount?: number;
  icon?: string;
  reminderTime?: string;
  goalId?: string;
}

export interface CompleteHabitRequest {
  status: 'completed' | 'skipped' | 'partial';
  notes?: string;
  value?: number;
}

export interface HabitWithEntry extends Habit {
  todayEntry?: HabitEntry;
  streak?: HabitStreak;
}

export interface HabitStats {
  totalHabits: number;
  todayCompleted: number;
  weeklyCompletionRate: number;
  activeStreaks: number;
}

export type HabitCategory = 'learning' | 'health' | 'creativity' | 'productivity' | 'personal';