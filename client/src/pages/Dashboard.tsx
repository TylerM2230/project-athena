import { useEffect, useState } from 'react';
import { Task, HabitWithEntry } from '../types';
import { AttentionTasksCard } from '../components/dashboard/AttentionTasksCard';
import { TimeCountdownCard } from '../components/dashboard/TimeCountdownCard';
import { HabitsCard } from '../components/dashboard/HabitsCard';

export function Dashboard() {
  const [attentionTasks, setAttentionTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<HabitWithEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [attentionRes, habitsRes] = await Promise.all([
          fetch('/api/dashboard/attention-tasks'),
          fetch('/api/habits/dashboard/today')
        ]);

        const [attentionData, habitsData] = await Promise.all([
          attentionRes.json(),
          habitsRes.json()
        ]);

        setAttentionTasks(attentionData);
        setHabits(habitsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCompleteHabit = async (habitId: string, status: 'completed' | 'skipped' | 'partial') => {
    try {
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Refresh habits data
        const habitsRes = await fetch('/api/habits/dashboard/today');
        const habitsData = await habitsRes.json();
        setHabits(habitsData);
      }
    } catch (error) {
      console.error('Failed to complete habit:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in text-center">
        <h1 className="title-terminal">overview</h1>
        <p className="subtitle-terminal">
          focus on what matters today
        </p>
      </div>

      {/* Time Countdown Section */}
      <div className="animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <TimeCountdownCard />
      </div>

      {/* Active Tasks Section */}
      <div className="animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        <AttentionTasksCard
          tasks={attentionTasks}
          loading={loading}
        />
      </div>

      {/* Daily Habits Section */}
      <div className="animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
        <HabitsCard
          habits={habits}
          loading={loading}
          onComplete={handleCompleteHabit}
        />
      </div>
    </div>
  );
}