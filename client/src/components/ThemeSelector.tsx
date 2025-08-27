import { useState } from 'react';
import { Check, Palette } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import type { ThemeCategory } from '../types/theme';
import clsx from 'clsx';

interface ThemePreviewProps {
  theme: any;
  isSelected: boolean;
  onSelect: () => void;
}

function ThemePreview({ theme, isSelected, onSelect }: ThemePreviewProps) {
  return (
    <button
      onClick={onSelect}
      className={clsx(
        "relative w-full p-4 rounded-lg border-2 transition-all duration-200",
        "hover:scale-105 hover:shadow-lg group",
        isSelected 
          ? "border-term-accent shadow-lg shadow-term-accent/20" 
          : "border-term-border hover:border-term-text-dim"
      )}
      style={{
        background: `linear-gradient(135deg, ${theme.colors.bg} 0%, ${theme.colors.bgAlt} 100%)`
      }}
    >
      {/* Theme preview content */}
      <div className="space-y-2 text-left">
        {/* Header bar simulation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.colors.error }}
            />
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.colors.warning }}
            />
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.colors.success }}
            />
          </div>
          {isSelected && (
            <Check 
              className="w-4 h-4" 
              style={{ color: theme.colors.accent }}
            />
          )}
        </div>
        
        {/* Content simulation */}
        <div className="space-y-1">
          <div 
            className="text-xs font-mono font-semibold"
            style={{ color: theme.colors.text }}
          >
            {theme.name}
          </div>
          <div 
            className="text-xs font-mono"
            style={{ color: theme.colors.textDim }}
          >
            {theme.description.length > 45 ? theme.description.substring(0, 45) + '...' : theme.description}
          </div>
          
          {/* Code-like elements */}
          <div className="flex items-center space-x-1 mt-2">
            <span 
              className="text-xs font-mono"
              style={{ color: theme.colors.accent }}
            >
              &gt;
            </span>
            <div 
              className="h-2 rounded"
              style={{ 
                backgroundColor: theme.colors.accent,
                width: '40px'
              }}
            />
            <div 
              className="h-2 rounded"
              style={{ 
                backgroundColor: theme.colors.textDim,
                width: '20px'
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Glow effect on hover */}
      <div 
        className={clsx(
          "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-200",
          isSelected && "opacity-20"
        )}
        style={{ backgroundColor: theme.colors.accent }}
      />
    </button>
  );
}

interface ThemeCategoryProps {
  category: ThemeCategory;
  themes: any[];
  selectedTheme: string;
  onThemeSelect: (themeId: string) => void;
}

function ThemeCategory({ category, themes, selectedTheme, onThemeSelect }: ThemeCategoryProps) {
  const categoryNames = {
    professional: 'Professional',
    vintage: 'Vintage',
    futuristic: 'Futuristic',
    minimal: 'Minimal'
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-mono text-term-text font-semibold capitalize">
        {categoryNames[category]}
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {themes.map((theme) => (
          <ThemePreview
            key={theme.id}
            theme={theme}
            isSelected={selectedTheme === theme.id}
            onSelect={() => onThemeSelect(theme.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function ThemeSelector() {
  const { currentTheme, getAvailableThemes, getThemesByType, switchTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);

  const allThemes = getAvailableThemes();
  const categories: ThemeCategory[] = ['professional', 'minimal', 'vintage', 'futuristic'];

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    switchTheme(themeId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Palette className="h-5 w-5 text-term-accent" />
        <h3 className="text-lg font-mono text-term-text font-semibold">Theme Selection</h3>
      </div>

      <div className="text-sm text-term-text-dim font-mono">
        Choose a theme that matches your workflow and aesthetic preferences.
      </div>

      {/* Theme Categories */}
      <div className="space-y-6">
        {categories.map((category) => {
          const themesInCategory = getThemesByType(category);
          if (themesInCategory.length === 0) return null;
          
          return (
            <ThemeCategory
              key={category}
              category={category}
              themes={themesInCategory}
              selectedTheme={selectedTheme}
              onThemeSelect={handleThemeSelect}
            />
          );
        })}
      </div>

      {/* Current selection info */}
      <div className="mt-6 p-4 bg-term-bg-alt rounded-lg border border-term-border">
        <div className="text-xs font-mono text-term-text-dim">
          Current theme: <span className="text-term-accent">{allThemes.find(t => t.id === selectedTheme)?.name}</span>
        </div>
      </div>
    </div>
  );
}