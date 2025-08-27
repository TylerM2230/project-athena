export function getCurrentWeekDates(): { start: Date; end: Date; days: Date[] } {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  
  return { start: weekStart, end: weekEnd, days };
}

export function getCurrentMonthDates(): { start: Date; end: Date; days: Date[] } {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // Get the first day of the week that contains the first day of the month
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(monthStart.getDate() - monthStart.getDay());
  
  // Get the last day of the week that contains the last day of the month
  const calendarEnd = new Date(monthEnd);
  calendarEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));
  
  const days: Date[] = [];
  const currentDate = new Date(calendarStart);
  
  while (currentDate <= calendarEnd) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return { start: monthStart, end: monthEnd, days };
}

export function getPeriodDates(period: 'week' | 'month' | 'quarter'): { start: Date; end: Date; days: Date[] } {
  const now = new Date();
  
  switch (period) {
    case 'week':
      return getCurrentWeekDates();
      
    case 'month':
      return getCurrentMonthDates();
      
    case 'quarter':
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
      
      const days: Date[] = [];
      const currentDate = new Date(quarterStart);
      
      while (currentDate <= quarterEnd) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return { start: quarterStart, end: quarterEnd, days };
      
    default:
      return getCurrentWeekDates();
  }
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

export function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return formatDateISO(date) === formatDateISO(today);
}

export function isOverdue(dueDate: string): boolean {
  const today = new Date();
  const due = new Date(dueDate);
  return due < today;
}

export function getDaysUntilDue(dueDate: string): number {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getUrgencyLevel(dueDate?: string, priority?: string, status?: string): 
  'overdue' | 'urgent' | 'high' | 'medium' | 'low' {
  if (dueDate && isOverdue(dueDate)) return 'overdue';
  if (status === 'in-progress' && priority === 'high') return 'urgent';
  if (priority === 'high') return 'high';
  if (status === 'in-progress') return 'medium';
  if (dueDate && getDaysUntilDue(dueDate) <= 3) return 'medium';
  return 'low';
}