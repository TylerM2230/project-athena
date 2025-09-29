import { useMemo, useState, useCallback, useEffect, memo } from 'react';
import Tree from 'react-d3-tree';
import { Task } from '../../types';
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
  Minimize,
  Move,
  RotateCcw,
  Brain,
  Battery,
  Focus
} from 'lucide-react';

interface TaskTreeNode {
  name: string;
  attributes?: {
    status: Task['status'];
    priority: Task['priority'];
    dueDate?: string;
    description?: string;
    id: string;
    customPositionX?: number;
    customPositionY?: number;
  };
  children?: TaskTreeNode[];
}

interface Props {
  tasks: Task[];
  onTaskUpdate?: (task: Task, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskSelect: (task: Task) => void;
}

// Dynamic node sizing based on content
const getNodeSize = (node: TaskTreeNode) => {
  const baseWidth = 280;
  const baseHeight = 100;
  const titleLength = node.name?.length || 0;
  const descLength = node.attributes?.description?.length || 0;
  
  return {
    x: Math.min(baseWidth + Math.max(0, (titleLength - 20) * 8), 400),
    y: baseHeight + (descLength > 50 ? 40 : descLength > 20 ? 20 : 0)
  };
};

// Position persistence utility
class PositionManager {
  private static STORAGE_KEY = 'task-tree-positions';
  
  static getPositions(): Record<string, { x: number; y: number }> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }
  
  static savePosition(taskId: string, position: { x: number; y: number }) {
    try {
      const positions = this.getPositions();
      positions[taskId] = position;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(positions));
    } catch (e) {
      console.warn('Failed to save position:', e);
    }
  }
  
  static clearPositions() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear positions:', e);
    }
  }
}

export function TaskTreeView({ tasks, onTaskDelete, onTaskSelect }: Props) {
  const [translate, setTranslate] = useState({ x: 150, y: 100 });
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Neurodivergent-friendly helper functions (same as TaskListView)
  const getCognitiveLoad = (task: Task): 'low' | 'medium' | 'high' => {
    const title = task.title.toLowerCase();
    const description = (task.description || '').toLowerCase();

    const highLoadKeywords = ['create', 'design', 'plan', 'research', 'analyze', 'develop', 'build', 'write', 'strategize'];
    const mediumLoadKeywords = ['review', 'update', 'organize', 'prepare', 'schedule', 'coordinate'];
    const lowLoadKeywords = ['check', 'call', 'email', 'file', 'copy', 'send', 'delete'];

    const hasHighLoad = highLoadKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));
    const hasMediumLoad = mediumLoadKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));
    const hasLowLoad = lowLoadKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));

    if (hasHighLoad || task.priority === 'high') return 'high';
    if (hasLowLoad) return 'low';
    return 'medium';
  };

  const getEnergyRequirement = (task: Task): 'low' | 'medium' | 'high' => {
    const cognitiveLoad = getCognitiveLoad(task);
    const hasDeadline = !!task.dueDate;
    const isInProgress = task.status === 'in-progress';
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

    if (cognitiveLoad === 'high' || isOverdue) return 'high';
    if (cognitiveLoad === 'medium' || hasDeadline || isInProgress) return 'medium';
    return 'low';
  };

  const getFocusLevel = (task: Task): 'quick' | 'focused' | 'deep' => {
    const title = task.title.toLowerCase();
    const description = (task.description || '').toLowerCase();

    const quickKeywords = ['check', 'call', 'email', 'send', 'file', 'copy', 'delete', 'review'];
    const deepKeywords = ['create', 'design', 'plan', 'research', 'analyze', 'develop', 'build', 'write'];

    const isQuick = quickKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));
    const isDeep = deepKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));

    if (isQuick || task.title.length < 20) return 'quick';
    if (isDeep || task.priority === 'high') return 'deep';
    return 'focused';
  };

  // Load custom positions on mount
  useEffect(() => {
    setCustomPositions(PositionManager.getPositions());
  }, []);

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

  // Temporarily removing complex grouping for debugging

  // Optimized tree building with custom positions
  const treeData = useMemo(() => {
    // Simple test data first
    if (tasks.length === 0) {
      return {
        name: "No Tasks",
        children: []
      };
    }

    // Convert tasks to tree format - simplified for debugging
    const treeNodes: TaskTreeNode[] = tasks.map(task => ({
      name: task.title,
      attributes: {
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        description: task.description,
        id: task.id,
        customPositionX: customPositions[task.id]?.x,
        customPositionY: customPositions[task.id]?.y
      },
      children: []
    }));

    // Return simple structure with all tasks as children of root
    return {
      name: "All Tasks",
      children: treeNodes
    };
  }, [tasks, customPositions]);

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

  // Collision detection and snapping utility
  const snapToGrid = useCallback((position: { x: number; y: number }, gridSize: number = 20) => {
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize
    };
  }, []);

  const detectCollisions = useCallback((position: { x: number; y: number }, excludeId: string, nodeSize: { x: number; y: number }) => {
    const collisions: string[] = [];
    Object.entries(customPositions).forEach(([id, pos]) => {
      if (id !== excludeId) {
        const distance = Math.sqrt(
          Math.pow(position.x - pos.x, 2) + Math.pow(position.y - pos.y, 2)
        );
        const minDistance = Math.max(nodeSize.x, nodeSize.y) * 0.6;
        if (distance < minDistance) {
          collisions.push(id);
        }
      }
    });
    return collisions;
  }, [customPositions]);

  const findNearestSnapPosition = useCallback((position: { x: number; y: number }, excludeId: string) => {
    const snapDistance = 40;
    const potentialSnaps: { x: number; y: number; type: string }[] = [];

    // Add grid snap positions
    const gridSnap = snapToGrid(position);
    potentialSnaps.push({ ...gridSnap, type: 'grid' });

    // Add alignment snaps to other nodes
    Object.entries(customPositions).forEach(([id, pos]) => {
      if (id !== excludeId) {
        const horizontalAlign = { x: pos.x, y: position.y, type: 'horizontal' };
        const verticalAlign = { x: position.x, y: pos.y, type: 'vertical' };
        
        if (Math.abs(position.x - pos.x) < snapDistance) {
          potentialSnaps.push(horizontalAlign);
        }
        if (Math.abs(position.y - pos.y) < snapDistance) {
          potentialSnaps.push(verticalAlign);
        }
      }
    });

    // Find closest snap
    let closestSnap = position;
    let minDistance = Infinity;

    potentialSnaps.forEach(snap => {
      const distance = Math.sqrt(
        Math.pow(position.x - snap.x, 2) + Math.pow(position.y - snap.y, 2)
      );
      if (distance < minDistance && distance < snapDistance) {
        minDistance = distance;
        closestSnap = snap;
      }
    });

    return closestSnap;
  }, [customPositions, snapToGrid]);

  // Handle node drag operations
  const handleNodeDragStart = useCallback((nodeData: any, event: React.MouseEvent) => {
    if (nodeData.attributes?.id) {
      setIsDragging(nodeData.attributes.id);
      const rect = (event.target as Element).getBoundingClientRect();
      setDragOffset({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
      event.stopPropagation();
    }
  }, []);

  const handleNodeDragEnd = useCallback((nodeData: any, event: React.MouseEvent) => {
    if (isDragging && nodeData.attributes?.id) {
      const rect = event.currentTarget.getBoundingClientRect();
      const rawPosition = {
        x: event.clientX - rect.left - dragOffset.x,
        y: event.clientY - rect.top - dragOffset.y
      };
      
      const nodeSize = getNodeSize(nodeData);
      
      // Check for collisions and find snap position
      const collisions = detectCollisions(rawPosition, nodeData.attributes.id, nodeSize);
      let finalPosition = rawPosition;

      if (collisions.length === 0) {
        // No collisions, try to snap
        finalPosition = findNearestSnapPosition(rawPosition, nodeData.attributes.id);
      } else {
        // Collision detected, push away from other nodes
        let adjustedPosition = { ...rawPosition };
        collisions.forEach(collidingId => {
          const collidingPos = customPositions[collidingId];
          const dx = adjustedPosition.x - collidingPos.x;
          const dy = adjustedPosition.y - collidingPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = Math.max(nodeSize.x, nodeSize.y) * 0.8;
          
          if (distance < minDistance && distance > 0) {
            const pushFactor = (minDistance - distance) / distance;
            adjustedPosition.x += dx * pushFactor;
            adjustedPosition.y += dy * pushFactor;
          }
        });
        finalPosition = snapToGrid(adjustedPosition);
      }
      
      // Save position
      PositionManager.savePosition(nodeData.attributes.id, finalPosition);
      setCustomPositions(prev => ({
        ...prev,
        [nodeData.attributes.id]: finalPosition
      }));
      
      setIsDragging(null);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [isDragging, dragOffset, detectCollisions, findNearestSnapPosition, snapToGrid, customPositions]);

  const handleNodeClick = useCallback((nodeData: any) => {
    if (nodeData.attributes?.id && !isDragging) {
      const task = tasks.find(t => t.id === nodeData.attributes.id);
      if (task) {
        onTaskSelect(task);
      }
    }
  }, [tasks, onTaskSelect, isDragging]);

  // Memoized custom node component for better performance
  const CustomNode = memo(({ nodeDatum }: { nodeDatum: any }) => {
    const attributes = nodeDatum.attributes;

    // Skip rendering for virtual root nodes
    if (!attributes) {
      return (
        <g>
          <circle r="12" fill="#374151" stroke="#6B7280" strokeWidth="2" />
          <text fill="#9ca3af" strokeWidth="0" x="20" fontSize="16" fontWeight="500">
            {nodeDatum.name}
          </text>
        </g>
      );
    }

    const task = tasks.find(t => t.id === attributes.id);
    if (!task) return null;

    const priorityColor = getPriorityColor(attributes.priority);
    const overdue = isOverdue(attributes.dueDate);
    const nodeSize = getNodeSize(nodeDatum);
    const foreignObjectProps = {
      width: nodeSize.x,
      height: nodeSize.y + 40, // Extra space for indicators
      x: -nodeSize.x/2,
      y: -nodeSize.y/2 - 20
    };
    const isBeingDragged = isDragging === attributes.id;

    const cognitiveLoad = getCognitiveLoad(task);
    const energyRequirement = getEnergyRequirement(task);
    const focusLevel = getFocusLevel(task);

    return (
      <g className={isBeingDragged ? 'cursor-grabbing' : 'cursor-grab'}>
        <foreignObject {...foreignObjectProps}>
          <div
            className={`w-full h-full p-4 bg-term-bg-alt border-2 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 ${
              isBeingDragged ? 'shadow-xl scale-105 cursor-grabbing' : 'cursor-pointer hover:scale-[1.02]'
            } ${task.status === 'done' ? 'opacity-70' : ''}`}
            style={{
              borderColor: priorityColor,
              transform: isBeingDragged ? 'rotate(1deg) scale(1.05)' : 'scale(1)',
              transition: isBeingDragged ? 'transform 0.2s ease' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isBeingDragged ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : undefined,
              zIndex: isBeingDragged ? 1000 : 'auto'
            }}
            onClick={() => handleNodeClick(nodeDatum)}
          >
            {/* Drag handle */}
            <div
              className="absolute top-2 right-2 p-1 text-term-text-dim hover:text-term-accent cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleNodeDragStart(nodeDatum, e)}
              onMouseUp={(e) => handleNodeDragEnd(nodeDatum, e)}
              title="Drag to move"
            >
              <Move className="h-3 w-3" />
            </div>

            {/* Header with status and priority */}
            <div className="flex items-center gap-3 mb-3">
              <div className="hover:scale-110 transition-transform">
                {getStatusIcon(attributes.status)}
              </div>
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: `${priorityColor}15`,
                  color: priorityColor,
                  border: `1px solid ${priorityColor}40`
                }}
              >
                {getPriorityIcon(attributes.priority)}
                {attributes.priority}
              </div>
            </div>

            {/* Task title */}
            <h3 className={`font-medium text-sm mb-3 leading-snug ${
              attributes.status === 'done' ? 'line-through text-term-text-dim' : 'text-term-text'
            }`}>
              {nodeDatum.name}
            </h3>

            {/* Neurodivergent-friendly indicators */}
            <div className="flex flex-wrap gap-1 mb-3">
              <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-red-400/10 text-red-400 border border-red-400/20" title="Cognitive load">
                <Brain className="h-2.5 w-2.5" />
                <span className="text-[10px] font-medium">{cognitiveLoad}</span>
              </div>
              <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-blue-400/10 text-blue-400 border border-blue-400/20" title="Energy needed">
                <Battery className="h-2.5 w-2.5" />
                <span className="text-[10px] font-medium">{energyRequirement}</span>
              </div>
              <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-purple-400/10 text-purple-400 border border-purple-400/20" title="Focus type">
                <Focus className="h-2.5 w-2.5" />
                <span className="text-[10px] font-medium">{focusLevel}</span>
              </div>
            </div>

            {/* Description preview */}
            {attributes.description && (
              <p className="text-xs text-term-text-dim line-clamp-2 mb-3 leading-relaxed">
                {attributes.description}
              </p>
            )}

            {/* Due date */}
            {attributes.dueDate && (
              <div className={`flex items-center text-xs font-medium mb-3 ${
                overdue ? 'text-red-400' : 'text-term-text-dim'
              }`}>
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(attributes.dueDate)}
                {overdue && ' (overdue)'}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (task) onTaskSelect(task);
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-term-text-dim hover:text-term-accent hover:bg-term-accent/10 rounded transition-all"
                title="Get Athena's guidance"
              >
                <MessageCircle className="h-3 w-3" />
                <span>Athena</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskDelete(attributes.id);
                }}
                className="p-1 text-term-text-dim hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                title="Delete task"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </foreignObject>
      </g>
    );
  });

  // Create the render function for react-d3-tree
  const renderCustomNode = useCallback((nodeData: any) => {
    return <CustomNode nodeDatum={nodeData} />;
  }, []);

  const handleTreeTransform = useCallback((transform: any) => {
    if (transform && typeof transform.x === 'number' && typeof transform.y === 'number' && typeof transform.k === 'number') {
      setTranslate({ x: transform.x, y: transform.y });
      setZoom(transform.k);
    }
  }, []);

  // Reset all custom positions
  const handleResetPositions = useCallback(() => {
    PositionManager.clearPositions();
    setCustomPositions({});
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
          className="px-2 py-1 bg-term-bg border border-term-border text-term-text text-xs font-mono rounded hover:bg-term-bg-alt transition-colors flex items-center justify-center gap-1"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize className="h-3 w-3" /> : <Maximize className="h-3 w-3" />}
        </button>
        <button
          onClick={() => setZoom(Math.min(zoom * 1.2, 3))}
          className="px-2 py-1 bg-term-bg border border-term-border text-term-text text-xs font-mono rounded hover:bg-term-bg-alt transition-colors flex items-center justify-center"
        >
          +
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom * 0.8, 0.3))}
          className="px-2 py-1 bg-term-bg border border-term-border text-term-text text-xs font-mono rounded hover:bg-term-bg-alt transition-colors flex items-center justify-center"
        >
          −
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setTranslate({ x: 150, y: 100 });
          }}
          className="px-2 py-1 bg-term-bg border border-term-border text-term-text text-xs font-mono rounded hover:bg-term-bg-alt transition-colors flex items-center justify-center"
        >
          Reset View
        </button>
        <button
          onClick={handleResetPositions}
          className="px-2 py-1 bg-term-bg border border-term-border text-term-text text-xs font-mono rounded hover:bg-term-bg-alt transition-colors flex items-center justify-center gap-1"
          title="Reset all custom positions"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>

      {/* Tree Stats */}
      <div className="absolute top-16 left-4 bg-term-bg-alt border border-term-border text-term-text p-2 text-xs font-mono rounded z-20">
        <div>Tasks: {tasks.length}</div>
        <div>View: {zoom.toFixed(1)}x zoom</div>
      </div>

      {/* Tree visualization */}
      <Tree
        data={treeData}
        translate={translate}
        zoom={zoom}
        onUpdate={handleTreeTransform}
        orientation="vertical"
        pathFunc="step"
        nodeSize={{ x: 320, y: 140 }}
        renderCustomNodeElement={renderCustomNode}
        separation={{ siblings: 1.3, nonSiblings: 1.8 }}
        enableLegacyTransitions={false}
        draggable={true}
        zoomable={true}
        shouldCollapseNeighborNodes={false}
        collapsible={false}
      />

      {/* Enhanced Legend */}
      <div className="absolute bottom-4 left-4 bg-term-bg-alt border border-term-border rounded-lg p-3 text-xs max-w-xs">
        <h4 className="text-term-text font-medium mb-3">Strategic Map Guide</h4>
        <div className="space-y-2">
          {/* Status indicators */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Circle className="h-3 w-3 text-gray-400" />
              <span className="text-term-text-dim">To Do</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-amber-400" />
              <span className="text-term-text-dim">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span className="text-term-text-dim">Complete</span>
            </div>
          </div>

          {/* Neurodivergent indicators */}
          <div className="border-t border-term-border pt-2 mt-2">
            <h5 className="text-term-text font-medium mb-2">Task Insights</h5>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Brain className="h-3 w-3 text-red-400" />
                <span className="text-term-text-dim">Cognitive Load</span>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="h-3 w-3 text-blue-400" />
                <span className="text-term-text-dim">Energy Needed</span>
              </div>
              <div className="flex items-center gap-2">
                <Focus className="h-3 w-3 text-purple-400" />
                <span className="text-term-text-dim">Focus Type</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="border-t border-term-border pt-2 mt-2">
            <h5 className="text-term-text font-medium mb-2">Controls</h5>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Move className="h-3 w-3 text-term-accent" />
                <span className="text-term-text-dim">Drag to reposition</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-3 w-3 text-term-accent" />
                <span className="text-term-text-dim">Get Athena's guidance</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-3 w-3 text-term-accent" />
                <span className="text-term-text-dim">Reset layout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}