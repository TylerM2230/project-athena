import { Task } from '../types';
import { FilterOptions, SortOptions } from '../components/tasks/TaskFilters';

export function filterTasks(tasks: Task[], filters: FilterOptions): Task[] {
  return tasks.filter(task => {
    // Status filter
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }

    // Due date filter
    if (filters.dueDate !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);

      switch (filters.dueDate) {
        case 'overdue':
          if (!task.dueDate || new Date(task.dueDate) >= today) return false;
          break;
        case 'today':
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          if (dueDate < today || dueDate >= tomorrow) return false;
          break;
        case 'thisWeek':
          if (!task.dueDate) return false;
          const dueDateWeek = new Date(task.dueDate);
          if (dueDateWeek < today || dueDateWeek >= weekEnd) return false;
          break;
        case 'noDate':
          if (task.dueDate) return false;
          break;
      }
    }

    // Ready to start filter (tasks with no dependencies or all dependencies completed)
    if (filters.readyToStart) {
      // For now, we'll consider a task ready if it has no parent or parent is done
      // In a more advanced implementation, this could check actual dependency relationships
      if (task.parentId) {
        const parentTask = tasks.find(t => t.id === task.parentId);
        if (parentTask && parentTask.status !== 'done') {
          return false;
        }
      }
    }

    // Quick wins filter (high priority or low effort tasks)
    if (filters.quickWins) {
      // For now, consider quick wins as high priority tasks or tasks with simple titles
      // In future, this could be based on estimated time or complexity
      const isQuickWin = 
        task.priority === 'high' || 
        task.title.length < 30 || // Simple assumption
        /^(fix|update|review|check|call|email|send)/i.test(task.title);
      
      if (!isQuickWin) return false;
    }

    // Energy level filter (based on task complexity and type)
    if (filters.energyLevel !== 'all') {
      const energyLevel = getTaskEnergyLevel(task);
      if (energyLevel !== filters.energyLevel) return false;
    }

    return true;
  });
}

export function sortTasks(tasks: Task[], sorting: SortOptions, allTasks: Task[]): Task[] {
  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (sorting.sortBy) {
      case 'smart':
        comparison = getSmartScore(b, allTasks) - getSmartScore(a, allTasks);
        break;
      
      case 'priority':
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        if (comparison === 0) {
          // Secondary sort by due date
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        break;

      case 'deadline':
        if (!a.dueDate && !b.dueDate) {
          // If both have no deadline, sort by priority
          const priorityOrder2 = { 'high': 3, 'medium': 2, 'low': 1 };
          comparison = (priorityOrder2[b.priority] || 0) - (priorityOrder2[a.priority] || 0);
        } else if (!a.dueDate) {
          comparison = 1;
        } else if (!b.dueDate) {
          comparison = -1;
        } else {
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          if (comparison === 0) {
            // Secondary sort by priority
            const priorityOrder3 = { 'high': 3, 'medium': 2, 'low': 1 };
            comparison = (priorityOrder3[b.priority] || 0) - (priorityOrder3[a.priority] || 0);
          }
        }
        break;

      case 'created':
      default:
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        break;
    }

    return sorting.sortOrder === 'asc' ? -comparison : comparison;
  });

  return sortedTasks;
}

function getSmartScore(task: Task, allTasks: Task[]): number {
  let score = 0;

  // Priority weight (40% of score)
  const priorityScores = { 'high': 40, 'medium': 20, 'low': 10 };
  score += priorityScores[task.priority] || 0;

  // Due date urgency (30% of score)
  if (task.dueDate) {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysUntilDue < 0) {
      // Overdue - very high urgency
      score += 30;
    } else if (daysUntilDue <= 1) {
      // Due today/tomorrow - high urgency
      score += 25;
    } else if (daysUntilDue <= 7) {
      // Due this week - medium urgency
      score += 15;
    } else if (daysUntilDue <= 30) {
      // Due this month - low urgency
      score += 5;
    }
  }

  // Status weight (20% of score)
  const statusScores = { 'in-progress': 20, 'todo': 10, 'done': 0 };
  score += statusScores[task.status] || 0;

  // Dependency readiness (10% of score)
  if (task.parentId) {
    const parentTask = allTasks.find(t => t.id === task.parentId);
    if (parentTask?.status === 'done') {
      score += 10; // Ready to start after dependency
    } else if (parentTask?.status === 'in-progress') {
      score += 5; // Dependency in progress
    }
    // No bonus if parent is not started
  } else {
    score += 10; // No dependencies - ready to start
  }

  return score;
}

function getTaskEnergyLevel(task: Task): 'high' | 'medium' | 'low' {
  // Simple heuristic based on task characteristics
  // In a real implementation, this could be user-defined or ML-based
  
  const title = task.title.toLowerCase();
  const description = (task.description || '').toLowerCase();
  
  // High energy keywords
  const highEnergyKeywords = ['create', 'design', 'plan', 'research', 'analyze', 'develop', 'build'];
  // Low energy keywords  
  const lowEnergyKeywords = ['review', 'read', 'check', 'update', 'fix', 'email', 'call', 'organize'];

  const hasHighEnergyKeywords = highEnergyKeywords.some(keyword => 
    title.includes(keyword) || description.includes(keyword)
  );
  
  const hasLowEnergyKeywords = lowEnergyKeywords.some(keyword => 
    title.includes(keyword) || description.includes(keyword)
  );

  if (hasHighEnergyKeywords && task.priority === 'high') {
    return 'high';
  } else if (hasLowEnergyKeywords || task.title.length < 20) {
    return 'low';
  } else {
    return 'medium';
  }
}

export function getTaskStats(tasks: Task[], filters: FilterOptions) {
  const filteredTasks = filterTasks(tasks, filters);
  
  return {
    total: tasks.length,
    filtered: filteredTasks.length,
    overdue: filteredTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length,
    dueToday: filteredTasks.filter(t => {
      if (!t.dueDate) return false;
      const today = new Date();
      const due = new Date(t.dueDate);
      return due.toDateString() === today.toDateString() && t.status !== 'done';
    }).length,
    inProgress: filteredTasks.filter(t => t.status === 'in-progress').length,
    readyToStart: filteredTasks.filter(t => {
      if (t.status !== 'todo') return false;
      if (!t.parentId) return true;
      const parent = tasks.find(p => p.id === t.parentId);
      return parent?.status === 'done';
    }).length
  };
}