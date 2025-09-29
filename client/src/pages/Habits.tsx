import { useEffect, useState } from 'react';
import { Plus, BookOpen, Heart, Palette, Zap, User } from 'lucide-react';
import { HabitWithEntry, CreateHabitRequest, HabitCategory } from '../types';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitForm } from '../components/habits/HabitForm';

const categoryConfig = {
  learning: { icon: BookOpen, label: 'learning', description: 'knowledge & skills' },
  health: { icon: Heart, label: 'health', description: 'physical & mental wellness' },
  creativity: { icon: Palette, label: 'creativity', description: 'artistic expression' },
  productivity: { icon: Zap, label: 'productivity', description: 'efficiency & output' },
  personal: { icon: User, label: 'personal', description: 'growth & relationships' }
};

export function Habits() {
  const [habits, setHabits] = useState<HabitWithEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');

  useEffect(() => {
    fetchTodaysHabits();
  }, []);

  const fetchTodaysHabits = async () => {
    try {
      const response = await fetch('/api/habits/dashboard/today');
      const data = await response.json();
      setHabits(data);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (habitData: CreateHabitRequest) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitData)
      });

      if (response.ok) {
        await fetchTodaysHabits();
        setShowForm(false);
      }
    } catch (error) {
      console.error('Failed to create habit:', error);
    }
  };

  const handleCompleteHabit = async (habitId: string, status: 'completed' | 'skipped' | 'partial', notes?: string) => {
    try {
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        await fetchTodaysHabits();
      }
    } catch (error) {
      console.error('Failed to complete habit:', error);
    }
  };

  const filteredHabits = selectedCategory === 'all'
    ? habits
    : habits.filter(habit => habit.category === selectedCategory);

  const todayCompleted = habits.filter(h => h.todayEntry?.status === 'completed').length;
  const completionRate = habits.length > 0 ? (todayCompleted / habits.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in text-center">
        <h1 className="title-terminal">daily habits</h1>
        <p className="subtitle-terminal">
          build consistency, build success
        </p>
      </div>

      {/* Stats Overview */}
      <div className="animate-slide-up grid grid-cols-1 md:grid-cols-3 gap-4" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <div className="card text-center">
          <div className="text-2xl font-mono text-term-accent mb-2">
            {todayCompleted} / {habits.length}
          </div>
          <div className="text-sm font-mono text-term-text-dim">today</div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-mono text-term-accent mb-2">
            {Math.round(completionRate)}%
          </div>
          <div className="text-sm font-mono text-term-text-dim">completion</div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-mono text-term-accent mb-2">
            {habits.filter(h => h.todayEntry?.status === 'completed').length > 0 ? '🔥' : '○'}
          </div>
          <div className="text-sm font-mono text-term-text-dim">streak status</div>
        </div>
      </div>

      {/* Category Filter & Add Button */}
      <div className="animate-slide-up flex flex-wrap items-center justify-between gap-4" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-xs font-mono rounded border transition-colors ${
              selectedCategory === 'all'
                ? 'bg-term-accent text-term-bg border-term-accent'
                : 'border-term-border text-term-text-dim hover:border-term-text-dim'
            }`}
          >
            all
          </button>
          {Object.entries(categoryConfig).map(([category, config]) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as HabitCategory)}
              className={`px-3 py-1 text-xs font-mono rounded border transition-colors ${
                selectedCategory === category
                  ? 'bg-term-accent text-term-bg border-term-accent'
                  : 'border-term-border text-term-text-dim hover:border-term-text-dim'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>new habit</span>
        </button>
      </div>

      {/* Habits Grid */}
      <div className="animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-term-border rounded"></div>
                  <div className="h-4 bg-term-border flex-1 max-w-xs"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-term-border w-full"></div>
                  <div className="h-3 bg-term-border w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredHabits.length === 0 ? (
          <div className="card text-center py-12 space-y-4">
            <div className="text-term-accent font-mono text-4xl">○</div>
            <h3 className="font-mono text-lg text-term-text">
              {selectedCategory === 'all' ? 'no habits yet' : `no ${selectedCategory} habits`}
            </h3>
            <p className="text-sm text-term-text-dim font-mono max-w-md mx-auto">
              {selectedCategory === 'all'
                ? 'start building powerful daily routines that compound over time'
                : `create ${selectedCategory} habits to build consistency in this area`
              }
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center space-x-2 mt-4"
            >
              <Plus className="h-4 w-4" />
              <span>create first habit</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHabits.map((habit, index) => (
              <div
                key={habit.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
              >
                <HabitCard
                  habit={habit}
                  onComplete={handleCompleteHabit}
                  onEdit={() => {}} // TODO: Implement edit functionality
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Habit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-term-bg border border-term-border rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-mono text-term-text mb-4">create new habit</h2>
            <HabitForm
              onSubmit={handleCreateHabit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}