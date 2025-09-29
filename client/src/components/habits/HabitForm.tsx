import { useState } from 'react';
import { BookOpen, Heart, Palette, Zap, User } from 'lucide-react';
import { CreateHabitRequest, HabitCategory } from '../../types';

interface HabitFormProps {
  onSubmit: (habitData: CreateHabitRequest) => void;
  onCancel: () => void;
  initialData?: Partial<CreateHabitRequest>;
}

const categoryConfig = {
  learning: {
    icon: BookOpen,
    label: 'learning',
    description: 'knowledge & skills',
    examples: ['Read 30 minutes', 'Practice language', 'Study course']
  },
  health: {
    icon: Heart,
    label: 'health',
    description: 'physical & mental wellness',
    examples: ['Exercise 45 min', 'Meditate 10 min', 'Drink 8 glasses water']
  },
  creativity: {
    icon: Palette,
    label: 'creativity',
    description: 'artistic expression',
    examples: ['Write 500 words', 'Draw for 30 min', 'Music practice']
  },
  productivity: {
    icon: Zap,
    label: 'productivity',
    description: 'efficiency & output',
    examples: ['Plan tomorrow', 'Clear inbox', 'Review goals']
  },
  personal: {
    icon: User,
    label: 'personal',
    description: 'growth & relationships',
    examples: ['Call family', 'Journal 3 gratitudes', 'Practice mindfulness']
  }
};

const habitTemplates = {
  learning: [
    { title: 'Daily Reading', description: 'Read for 30 minutes' },
    { title: 'Language Practice', description: 'Study new language for 20 minutes' },
    { title: 'Skill Building', description: 'Practice a specific skill' }
  ],
  health: [
    { title: 'Daily Exercise', description: 'Physical activity for 45 minutes' },
    { title: 'Meditation', description: '10 minutes of mindfulness' },
    { title: 'Hydration', description: 'Drink 8 glasses of water' }
  ],
  creativity: [
    { title: 'Daily Writing', description: 'Write 500 words' },
    { title: 'Art Practice', description: 'Create something for 30 minutes' },
    { title: 'Content Creation', description: 'Film and post one video' }
  ],
  productivity: [
    { title: 'Daily Planning', description: 'Plan tomorrow\'s priorities' },
    { title: 'Inbox Zero', description: 'Clear email and messages' },
    { title: 'Goal Review', description: 'Review and adjust goals' }
  ],
  personal: [
    { title: 'Gratitude Practice', description: 'Write 3 things you\'re grateful for' },
    { title: 'Social Connection', description: 'Connect with family or friends' },
    { title: 'Self Reflection', description: 'Journal about your day' }
  ]
};

export function HabitForm({ onSubmit, onCancel, initialData }: HabitFormProps) {
  const [formData, setFormData] = useState<CreateHabitRequest>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'personal',
    targetFrequency: initialData?.targetFrequency || 'daily',
    targetCount: initialData?.targetCount || 1,
    icon: initialData?.icon || '',
    reminderTime: initialData?.reminderTime || '',
    goalId: initialData?.goalId || ''
  });

  const [showTemplates, setShowTemplates] = useState(!initialData?.title);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSubmit({
      ...formData,
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      icon: formData.icon?.trim() || undefined,
      reminderTime: formData.reminderTime?.trim() || undefined,
      goalId: formData.goalId?.trim() || undefined
    });
  };

  const handleTemplateSelect = (template: { title: string; description: string }) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      description: template.description
    }));
    setShowTemplates(false);
  };

  const CategoryIcon = categoryConfig[formData.category].icon;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category Selection */}
      <div>
        <label className="block text-sm font-mono text-term-text mb-2">category</label>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(categoryConfig).map(([category, config]) => {
            const Icon = config.icon;
            const isSelected = formData.category === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: category as HabitCategory }))}
                className={`p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-term-accent border-term-accent text-term-bg'
                    : 'border-term-border text-term-text-dim hover:border-term-text-dim'
                }`}
                title={config.description}
              >
                <Icon className="h-4 w-4 mx-auto" />
              </button>
            );
          })}
        </div>
        <p className="text-xs font-mono text-term-text-dim mt-1">
          {categoryConfig[formData.category].description}
        </p>
      </div>

      {/* Templates */}
      {showTemplates && (
        <div>
          <label className="block text-sm font-mono text-term-text mb-2">
            templates <span className="text-term-text-dim">(optional)</span>
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {habitTemplates[formData.category].map((template, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleTemplateSelect(template)}
                className="w-full text-left p-3 rounded-lg border border-term-border hover:border-term-text-dim transition-colors"
              >
                <div className="text-sm font-mono text-term-text">{template.title}</div>
                <div className="text-xs font-mono text-term-text-dim">{template.description}</div>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowTemplates(false)}
            className="text-xs font-mono text-term-accent hover:text-term-text mt-2"
          >
            skip templates
          </button>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-mono text-term-text mb-2">habit name</label>
        <div className="flex items-center space-x-2">
          <CategoryIcon className="h-5 w-5 text-term-text-dim" />
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Daily Reading"
            className="input-cyber flex-1"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-mono text-term-text mb-2">
          description <span className="text-term-text-dim">(optional)</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="e.g., Read for 30 minutes each morning"
          className="input-cyber w-full h-20 resize-none"
        />
      </div>

      {/* Frequency & Count */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-mono text-term-text mb-2">frequency</label>
          <select
            value={formData.targetFrequency}
            onChange={(e) => setFormData(prev => ({ ...prev, targetFrequency: e.target.value as 'daily' | 'weekly' }))}
            className="input-cyber w-full"
          >
            <option value="daily">daily</option>
            <option value="weekly">weekly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-mono text-term-text mb-2">
            target {formData.targetFrequency === 'weekly' ? 'per week' : ''}
          </label>
          <input
            type="number"
            min="1"
            max={formData.targetFrequency === 'weekly' ? 7 : 10}
            value={formData.targetCount}
            onChange={(e) => setFormData(prev => ({ ...prev, targetCount: parseInt(e.target.value) || 1 }))}
            className="input-cyber w-full"
          />
        </div>
      </div>

      {/* Optional Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-mono text-term-text mb-2">
            icon <span className="text-term-text-dim">(emoji)</span>
          </label>
          <input
            type="text"
            value={formData.icon}
            onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
            placeholder="📚"
            className="input-cyber w-full"
            maxLength={2}
          />
        </div>

        <div>
          <label className="block text-sm font-mono text-term-text mb-2">
            reminder time
          </label>
          <input
            type="time"
            value={formData.reminderTime}
            onChange={(e) => setFormData(prev => ({ ...prev, reminderTime: e.target.value }))}
            className="input-cyber w-full"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={!formData.title.trim()}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          create habit
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          cancel
        </button>
      </div>
    </form>
  );
}