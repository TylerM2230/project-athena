import { List, GitBranch } from 'lucide-react';

interface Props {
  viewMode: 'list' | 'tree';
  onViewChange: (mode: 'list' | 'tree') => void;
}

export function ViewToggle({ viewMode, onViewChange }: Props) {
  return (
    <div className="flex items-center border border-term-border rounded-lg overflow-hidden">
      <button
        onClick={() => onViewChange('list')}
        className={`flex items-center gap-2 px-3 py-2 text-xs font-mono transition-colors ${
          viewMode === 'list'
            ? 'bg-term-accent text-term-bg'
            : 'text-term-text hover:bg-term-bg-alt'
        }`}
      >
        <List className="h-4 w-4" />
        List
      </button>
      <button
        onClick={() => onViewChange('tree')}
        className={`flex items-center gap-2 px-3 py-2 text-xs font-mono transition-colors ${
          viewMode === 'tree'
            ? 'bg-term-accent text-term-bg'
            : 'text-term-text hover:bg-term-bg-alt'
        }`}
      >
        <GitBranch className="h-4 w-4" />
        Tree
      </button>
    </div>
  );
}