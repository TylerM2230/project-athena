import { DashboardStats } from '../../types';

interface SystemStatusCardProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export function SystemStatusCard({ stats, loading }: SystemStatusCardProps) {
  // const getStatusColor = (status: string): string => {
  //   switch (status) {
  //     case 'active': return 'text-term-accent';
  //     case 'ready': return 'text-term-info';
  //     default: return 'text-term-text-dim';
  //   }
  // };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-mono text-term-text">
          status
        </h2>
        <div className="flex items-center space-x-2">
          <span className="animate-cursor text-term-accent">●</span>
          <span className="text-xs font-mono text-term-accent">online</span>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="space-y-2">
            <div className="h-3 bg-term-border w-3/4"></div>
            <div className="h-3 bg-term-border w-1/2"></div>
            <div className="h-3 bg-term-border w-2/3"></div>
          </div>
        </div>
      ) : stats ? (
        <div className="space-y-4">
          {/* Task Statistics */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-mono text-sm text-term-text">tasks</span>
              <span className="font-mono text-sm text-term-text">
                {stats.totalTasks}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="text-center">
                <div className="font-mono text-term-text">{stats.todoTasks}</div>
                <div className="font-mono text-term-text-dim">todo</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-term-info">{stats.inProgressTasks}</div>
                <div className="font-mono text-term-text-dim">active</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-term-accent">{stats.doneTasks}</div>
                <div className="font-mono text-term-text-dim">done</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-term-border">
            <div className="flex justify-between items-center">
              <span className="font-mono text-sm text-term-text">notes</span>
              <span className="font-mono text-sm text-term-text">
                {stats.totalNotes}
              </span>
            </div>
          </div>

          {/* AI Guide Status */}
          <div className="pt-3 border-t border-term-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-mono text-sm text-term-text">ai guide</h3>
                <div className="text-xs font-mono text-term-text-dim mt-1">
                  socratic questioning available
                </div>
              </div>
              <div className="text-term-info text-xs font-mono flex items-center space-x-1">
                <span className="animate-pulse">●</span>
                <span>ready</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 space-y-2">
          <div className="text-term-error font-mono text-2xl">×</div>
          <p className="text-term-text-dim font-mono">failed to load</p>
        </div>
      )}
    </div>
  );
}