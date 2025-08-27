import { useEffect, useState } from 'react';
import { Task, DashboardStats } from '../types';
import { AttentionTasksCard } from '../components/dashboard/AttentionTasksCard';
import { WeeklyCalendarCard } from '../components/dashboard/WeeklyCalendarCard';
import { SystemStatusCard } from '../components/dashboard/SystemStatusCard';
import { TimeCountdownCard } from '../components/dashboard/TimeCountdownCard';

export function Dashboard() {
  const [attentionTasks, setAttentionTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [attentionRes, statsRes] = await Promise.all([
          fetch('/api/dashboard/attention-tasks'),
          fetch('/api/dashboard/stats')
        ]);
        
        const [attentionData, statsData] = await Promise.all([
          attentionRes.json(),
          statsRes.json()
        ]);
        
        setAttentionTasks(attentionData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);



  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="title-terminal">overview</h1>
        <p className="subtitle-terminal">
          current state and scheduled items
        </p>
      </div>

      {/* Time Countdown */}
      <div className="animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <TimeCountdownCard />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Items */}
        <div className="xl:col-span-2 animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <AttentionTasksCard 
            tasks={attentionTasks} 
            loading={loading} 
          />
        </div>
        
        {/* System Status */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <SystemStatusCard 
            stats={stats} 
            loading={loading} 
          />
        </div>
      </div>

      {/* Calendar View */}
      <div className="animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
        <WeeklyCalendarCard loading={loading} />
      </div>
    </div>
  );
}