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

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  parentId?: string;
}

export interface CreateNoteRequest {
  title: string;
  content?: string;
}

export interface DashboardStats {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  totalNotes: number;
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