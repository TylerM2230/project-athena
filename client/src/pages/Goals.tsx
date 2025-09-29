import { useEffect, useState } from 'react';
import { Plus, Target, Compass, Zap, Eye, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Goal, CreateGoalRequest } from '../types';

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedType, setSelectedType] = useState<Goal['type'] | 'all'>('all');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: CreateGoalRequest) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData)
      });

      if (response.ok) {
        fetchGoals();
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Failed to create goal:', error);
      throw error;
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        fetchGoals();
      }
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal? This will also remove any linked tasks.')) {
      return;
    }

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchGoals();
      }
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const getTypeIcon = (type: Goal['type']) => {
    switch (type) {
      case 'vision': return <Eye className="h-4 w-4" />;
      case 'long-term': return <Compass className="h-4 w-4" />;
      case 'short-term': return <Target className="h-4 w-4" />;
      case 'sprint': return <Zap className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Goal['type']) => {
    switch (type) {
      case 'vision': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'long-term': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'short-term': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'sprint': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    }
  };

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'achieved': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'on-hold': return <Clock className="h-4 w-4 text-amber-400" />;
      case 'archived': return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default: return <Target className="h-4 w-4 text-blue-400" />;
    }
  };

  const filteredGoals = selectedType === 'all'
    ? goals
    : goals.filter(goal => goal.type === selectedType);

  const goalsByType = {
    vision: goals.filter(g => g.type === 'vision' && g.status === 'active'),
    longTerm: goals.filter(g => g.type === 'long-term' && g.status === 'active'),
    shortTerm: goals.filter(g => g.type === 'short-term' && g.status === 'active'),
    sprint: goals.filter(g => g.type === 'sprint' && g.status === 'active')
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-term-border w-3/4 mb-2"></div>
            <div className="h-3 bg-term-border w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="title-terminal">strategic goals</h1>
          <p className="subtitle-terminal">align your vision with actionable objectives across multiple time horizons</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          new goal
        </button>
      </div>

      {/* Goal Type Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
            selectedType === 'all'
              ? 'bg-term-accent text-term-bg border-term-accent'
              : 'border-term-border text-term-text-dim hover:border-term-text-dim hover:text-term-text'
          }`}
        >
          All Goals ({goals.length})
        </button>

        {(['vision', 'long-term', 'short-term', 'sprint'] as const).map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              selectedType === type
                ? 'bg-term-accent text-term-bg border-term-accent'
                : 'border-term-border text-term-text-dim hover:border-term-text-dim hover:text-term-text'
            }`}
          >
            {getTypeIcon(type)}
            {type.replace('-', ' ')} ({goalsByType[type.replace('-', '') as keyof typeof goalsByType].length})
          </button>
        ))}
      </div>

      {/* Strategic Overview */}
      {selectedType === 'all' && goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="h-5 w-5 text-purple-400" />
              <h3 className="font-medium text-term-text">Vision</h3>
            </div>
            <p className="text-2xl font-bold text-term-text">{goalsByType.vision.length}</p>
            <p className="text-xs text-term-text-dim">Long-term aspirations</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <Compass className="h-5 w-5 text-blue-400" />
              <h3 className="font-medium text-term-text">Long-term</h3>
            </div>
            <p className="text-2xl font-bold text-term-text">{goalsByType.longTerm.length}</p>
            <p className="text-xs text-term-text-dim">1-3 year objectives</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-5 w-5 text-green-400" />
              <h3 className="font-medium text-term-text">Short-term</h3>
            </div>
            <p className="text-2xl font-bold text-term-text">{goalsByType.shortTerm.length}</p>
            <p className="text-xs text-term-text-dim">3-12 month goals</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-5 w-5 text-orange-400" />
              <h3 className="font-medium text-term-text">Sprint</h3>
            </div>
            <p className="text-2xl font-bold text-term-text">{goalsByType.sprint.length}</p>
            <p className="text-xs text-term-text-dim">1-3 month sprints</p>
          </div>
        </div>
      )}

      {/* Create Goal Form */}
      {showCreateForm && (
        <GoalForm
          onSubmit={createGoal}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <div className="card text-center py-12">
          <div className="space-y-4">
            <Target className="h-12 w-12 text-term-accent mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-term-text mb-2">No goals yet</h3>
              <p className="text-term-text-dim">Create your first strategic goal to start building your vision</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create your first goal
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdate={updateGoal}
              onDelete={deleteGoal}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Goal Card Component
function GoalCard({
  goal,
  onUpdate,
  onDelete
}: {
  goal: Goal;
  onUpdate: (id: string, updates: Partial<Goal>) => void;
  onDelete: (id: string) => void;
}) {
  const getTypeIcon = (type: Goal['type']) => {
    switch (type) {
      case 'vision': return <Eye className="h-4 w-4" />;
      case 'long-term': return <Compass className="h-4 w-4" />;
      case 'short-term': return <Target className="h-4 w-4" />;
      case 'sprint': return <Zap className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Goal['type']) => {
    switch (type) {
      case 'vision': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'long-term': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'short-term': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'sprint': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    }
  };

  const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date();

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-medium ${getTypeColor(goal.type)}`}>
              {getTypeIcon(goal.type)}
              {goal.type.replace('-', ' ')}
            </div>

            <div className={`px-2 py-1 text-xs font-medium rounded ${
              goal.priority === 'high' ? 'bg-red-100 text-red-700' :
              goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {goal.priority}
            </div>

            {goal.targetDate && (
              <div className={`flex items-center gap-1 text-xs ${
                isOverdue ? 'text-red-400' : 'text-term-text-dim'
              }`}>
                <Clock className="h-3 w-3" />
                {new Date(goal.targetDate).toLocaleDateString()}
                {isOverdue && ' (overdue)'}
              </div>
            )}
          </div>

          <h3 className="text-lg font-medium text-term-text mb-2">{goal.title}</h3>

          {goal.description && (
            <p className="text-term-text-dim mb-3">{goal.description}</p>
          )}

          {goal.progress !== undefined && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-term-text-dim mb-1">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="w-full bg-term-border rounded-full h-2">
                <div
                  className="bg-term-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          )}

          {goal.metrics && goal.metrics.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-term-text-dim mb-1">Success metrics:</p>
              <div className="flex flex-wrap gap-1">
                {goal.metrics.map((metric, index) => (
                  <span key={index} className="text-xs bg-term-border text-term-text px-2 py-1 rounded">
                    {metric}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={goal.status}
            onChange={(e) => onUpdate(goal.id, { status: e.target.value as Goal['status'] })}
            className="text-xs bg-term-bg border border-term-border text-term-text px-2 py-1 rounded"
          >
            <option value="active">Active</option>
            <option value="achieved">Achieved</option>
            <option value="on-hold">On Hold</option>
            <option value="archived">Archived</option>
          </select>

          <button
            onClick={() => onDelete(goal.id)}
            className="text-term-text-dim hover:text-red-400 p-1 transition-colors"
            title="Delete goal"
          >
            <AlertCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Goal Form Component
function GoalForm({
  onSubmit,
  onCancel,
  initialData
}: {
  onSubmit: (goal: CreateGoalRequest) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<Goal>;
}) {
  const [formData, setFormData] = useState<CreateGoalRequest>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'short-term',
    priority: initialData?.priority || 'medium',
    targetDate: initialData?.targetDate || '',
    metrics: initialData?.metrics || []
  });

  const [loading, setLoading] = useState(false);
  const [metricsInput, setMetricsInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMetric = () => {
    if (metricsInput.trim() && !formData.metrics?.includes(metricsInput.trim())) {
      setFormData(prev => ({
        ...prev,
        metrics: [...(prev.metrics || []), metricsInput.trim()]
      }));
      setMetricsInput('');
    }
  };

  const removeMetric = (metric: string) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics?.filter(m => m !== metric) || []
    }));
  };

  return (
    <div className="card">
      <h3 className="text-lg font-medium text-term-text mb-4">Create Strategic Goal</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-term-text mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-term-border rounded-lg text-term-text bg-term-bg focus:ring-2 focus:ring-term-accent focus:border-term-accent"
            placeholder="What do you want to achieve?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-term-text mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-term-border rounded-lg text-term-text bg-term-bg focus:ring-2 focus:ring-term-accent focus:border-term-accent"
            placeholder="Describe your goal in detail..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-term-text mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Goal['type'] }))}
              className="w-full px-3 py-2 border border-term-border rounded-lg text-term-text bg-term-bg focus:ring-2 focus:ring-term-accent focus:border-term-accent"
            >
              <option value="sprint">Sprint (1-3 months)</option>
              <option value="short-term">Short-term (3-12 months)</option>
              <option value="long-term">Long-term (1-3 years)</option>
              <option value="vision">Vision (3+ years)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-term-text mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Goal['priority'] }))}
              className="w-full px-3 py-2 border border-term-border rounded-lg text-term-text bg-term-bg focus:ring-2 focus:ring-term-accent focus:border-term-accent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-term-text mb-1">Target Date</label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
              className="w-full px-3 py-2 border border-term-border rounded-lg text-term-text bg-term-bg focus:ring-2 focus:ring-term-accent focus:border-term-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-term-text mb-1">Success Metrics</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={metricsInput}
              onChange={(e) => setMetricsInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMetric())}
              className="flex-1 px-3 py-2 border border-term-border rounded-lg text-term-text bg-term-bg focus:ring-2 focus:ring-term-accent focus:border-term-accent"
              placeholder="How will you measure success?"
            />
            <button
              type="button"
              onClick={addMetric}
              className="px-4 py-2 bg-term-accent text-term-bg rounded-lg hover:bg-term-accent/90 transition-colors"
            >
              Add
            </button>
          </div>

          {formData.metrics && formData.metrics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.metrics.map((metric, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 bg-term-border text-term-text px-2 py-1 rounded text-sm"
                >
                  {metric}
                  <button
                    type="button"
                    onClick={() => removeMetric(metric)}
                    className="text-term-text-dim hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-term-text-dim hover:text-term-text transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.title.trim()}
            className="btn-primary"
          >
            {loading ? 'Creating...' : 'Create Goal'}
          </button>
        </div>
      </form>
    </div>
  );
}