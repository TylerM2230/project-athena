import { useMemo, useState, useCallback, useEffect } from 'react';
import Tree from 'react-d3-tree';
import { Task, Note } from '../../types';
import { 
  Calendar, 
  FileText, 
  Trash2, 
  MessageCircle, 
  CheckCircle2, 
  Circle, 
  Clock,
  AlertCircle,
  Target,
  Zap,
  Maximize,
  Minimize
} from 'lucide-react';

interface TaskTreeNode {
  name: string;
  attributes?: {
    status: Task['status'];
    priority: Task['priority'];
    dueDate?: string;
    description?: string;
    noteCount: number;
    id: string;
  };
  children?: TaskTreeNode[];
}

interface Props {
  tasks: Task[];
  taskNotes: Record<string, Note[]>;
  onTaskUpdate?: (task: Task, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskSelect: (task: Task) => void;
}

const customNodeSize = { x: 300, y: 120 };
const foreignObjectProps = { width: customNodeSize.x, height: customNodeSize.y, x: -150, y: -60 };

export function TaskTreeView({ tasks, taskNotes, onTaskDelete, onTaskSelect }: Props) {
  const [translate, setTranslate] = useState({ x: 150, y: 100 });
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isFullscreen]);

  // Transform flat task list into hierarchical tree structure
  const treeData = useMemo(() => {
    const taskMap = new Map<string, Task>();
    tasks.forEach(task => taskMap.set(task.id, task));

    const buildTree = (parentId: string | null): TaskTreeNode[] => {
      return tasks
        .filter(task => task.parentId === parentId)
        .sort((a, b) => {
          // Sort by priority, then by due date
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          if (priorityDiff !== 0) return priorityDiff;
          
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        })
        .map(task => ({
          name: task.title,
          attributes: {
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
            description: task.description,
            noteCount: taskNotes[task.id]?.length || 0,
            id: task.id
          },
          children: buildTree(task.id)
        }));
    };

    const rootNodes = buildTree(null);
    
    // If no root nodes, return empty tree
    if (rootNodes.length === 0) {
      return {
        name: "No Tasks",
        children: []
      };
    }

    // If only one root node, return it directly
    if (rootNodes.length === 1) {
      return rootNodes[0];
    }

    // Multiple root nodes, create virtual root
    return {
      name: "All Tasks",
      children: rootNodes
    };
  }, [tasks, taskNotes]);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return '#ef4444'; // red-500
      case 'medium': return '#f59e0b'; // amber-500  
      case 'low': return '#10b981'; // emerald-500
      default: return '#6b7280'; // gray-500
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-amber-400" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-3 w-3" />;
      case 'medium': return <Target className="h-3 w-3" />;
      case 'low': return <Zap className="h-3 w-3" />;
      default: return null;
    }
  };

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const handleNodeClick = useCallback((nodeData: any) => {
    if (nodeData.attributes?.id) {
      const task = tasks.find(t => t.id === nodeData.attributes.id);
      if (task) {
        onTaskSelect(task);
      }
    }
  }, [tasks, onTaskSelect]);

  const renderCustomNode = ({ nodeDatum }: any) => {
    const attributes = nodeDatum.attributes;
    
    // Skip rendering for virtual root nodes
    if (!attributes) {
      return (
        <g>
          <circle r="8" fill="#374151" />
          <text fill="#9ca3af" strokeWidth="0" x="20" fontSize="14">
            {nodeDatum.name}
          </text>
        </g>
      );
    }

    const task = tasks.find(t => t.id === attributes.id);
    const priorityColor = getPriorityColor(attributes.priority);
    const overdue = isOverdue(attributes.dueDate);

    return (
      <g>
        <foreignObject {...foreignObjectProps}>
          <div
            className="w-full h-full p-3 bg-term-bg-alt border border-term-border rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
            style={{
              borderColor: priorityColor,
              borderWidth: '2px'
            }}
            onClick={() => handleNodeClick(nodeDatum)}
          >
            {/* Header with status and priority */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(attributes.status)}
                <div 
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono"
                  style={{ 
                    backgroundColor: `${priorityColor}20`,
                    color: priorityColor
                  }}
                >
                  {getPriorityIcon(attributes.priority)}
                  {attributes.priority}
                </div>
              </div>
              
              {attributes.noteCount > 0 && (
                <div className="flex items-center text-xs text-term-accent">
                  <FileText className="h-3 w-3 mr-1" />
                  {attributes.noteCount}
                </div>
              )}
            </div>

            {/* Task title */}
            <h3 className={`font-mono text-sm font-medium mb-1 line-clamp-2 ${
              attributes.status === 'done' ? 'line-through text-term-text-dim' : 'text-term-text'
            }`}>
              {nodeDatum.name}
            </h3>

            {/* Description preview */}
            {attributes.description && (
              <p className="text-xs text-term-text-dim font-mono line-clamp-1 mb-2">
                {attributes.description}
              </p>
            )}

            {/* Due date */}
            {attributes.dueDate && (
              <div className={`flex items-center text-xs font-mono ${
                overdue ? 'text-red-400' : 'text-term-text-dim'
              }`}>
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(attributes.dueDate)}
                {overdue && ' (overdue)'}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-1 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (task) onTaskSelect(task);
                }}
                className="p-1 text-term-text-dim hover:text-term-accent transition-colors"
                title="AI guidance"
              >
                <MessageCircle className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskDelete(attributes.id);
                }}
                className="p-1 text-term-text-dim hover:text-red-400 transition-colors"
                title="Delete task"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </foreignObject>
      </g>
    );
  };

  const handleTreeTransform = useCallback((transform: any) => {
    if (transform && typeof transform.x === 'number' && typeof transform.y === 'number' && typeof transform.k === 'number') {
      setTranslate({ x: transform.x, y: transform.y });
      setZoom(transform.k);
    }
  }, []);

  return (
    <div 
      className={`w-full border border-term-border rounded-lg bg-term-bg relative hide-scrollbar ${
        isFullscreen 
          ? 'fixed inset-0 z-50 h-screen rounded-none' 
          : 'h-[calc(100vh-24rem)] min-h-[500px]'
      }`} 
      style={{ overflow: 'hidden' }}
    >
      
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="px-2 py-1 bg-term-bg border border-term-border text-term-text text-xs font-mono rounded hover:bg-term-bg-alt transition-colors flex items-center gap-1"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize className="h-3 w-3" /> : <Maximize className="h-3 w-3" />}
        </button>
        <button
          onClick={() => setZoom(Math.min(zoom * 1.2, 3))}
          className="px-2 py-1 bg-term-bg border border-term-border text-term-text text-xs font-mono rounded hover:bg-term-bg-alt transition-colors"
        >
          +
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom * 0.8, 0.3))}
          className="px-2 py-1 bg-term-bg border border-term-border text-term-text text-xs font-mono rounded hover:bg-term-bg-alt transition-colors"
        >
          −
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setTranslate({ x: 150, y: 100 });
          }}
          className="px-2 py-1 bg-term-bg border border-term-border text-term-text text-xs font-mono rounded hover:bg-term-bg-alt transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Tree visualization */}
      <Tree
        data={treeData}
        translate={translate}
        zoom={zoom}
        onUpdate={handleTreeTransform}
        orientation="vertical"
        pathFunc="step"
        nodeSize={customNodeSize}
        renderCustomNodeElement={renderCustomNode}
        separation={{ siblings: 1.2, nonSiblings: 1.5 }}
        enableLegacyTransitions={false}
        draggable={true}
        zoomable={true}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-term-bg-alt border border-term-border rounded-lg p-3 text-xs font-mono">
        <h4 className="text-term-text font-medium mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 text-gray-400" />
            <span className="text-term-text-dim">Todo</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-amber-400" />
            <span className="text-term-text-dim">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span className="text-term-text-dim">Done</span>
          </div>
        </div>
      </div>
    </div>
  );
}