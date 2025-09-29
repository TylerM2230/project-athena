import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Task, CreateTaskRequest } from '../types';
import { AiSocraticGuide } from '../components/AiSocraticGuide';
import { TaskTreeView } from '../components/tasks/TaskTreeView';
import { TaskListView } from '../components/tasks/TaskListView';
import { ViewToggle } from '../components/tasks/ViewToggle';
import { TaskFormInline } from '../components/tasks/TaskFormInline';
import { TaskFilters, FilterOptions, SortOptions } from '../components/tasks/TaskFilters';
import { filterTasks, sortTasks } from '../utils/taskFilters';

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTaskForAI, setSelectedTaskForAI] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    priority: 'all',
    dueDate: 'all',
    readyToStart: false,
    quickWins: false,
    energyLevel: 'all'
  });
  const [sorting, setSorting] = useState<SortOptions>({
    sortBy: 'smart',
    sortOrder: 'desc'
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  // Calculate filtered and sorted tasks
  const filteredTasks = filterTasks(tasks, filters);
  const sortedTasks = sortTasks(filteredTasks, sorting, tasks);

  const fetchTasks = async () => {
    try {
      const tasksRes = await fetch('/api/tasks');
      const tasksData = await tasksRes.json();
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: CreateTaskRequest) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        const createdTask = await response.json();
        
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  const handleTasksCreated = () => {
    // Refresh tasks list to show new sub-tasks
    fetchTasks();
    setSelectedTaskForAI(null);
  };

  const updateTask = async (task: Task, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, ...updates })
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task? This will also delete all subtasks.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="title-terminal">strategic tasks</h1>
          <p className="subtitle-terminal">organize your objectives and transform overwhelming projects into empowered action with Athena's guidance</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            new task
          </button>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="mb-4">
        <TaskFilters
          filters={filters}
          sorting={sorting}
          onFiltersChange={setFilters}
          onSortingChange={setSorting}
          taskCount={tasks.length}
          filteredCount={sortedTasks.length}
        />
      </div>

      {/* create task form */}
      {showCreateForm && (
        <div className="card">
          <h2 className="text-lg font-mono text-term-text mb-4">Create New Task</h2>
          <TaskFormInline 
            onSubmit={createTask}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* tasks display */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-3 bg-term-border w-3/4 mb-2"></div>
              <div className="h-3 bg-term-border w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-2">
          {viewMode === 'tree' ? (
            <TaskTreeView
              tasks={sortedTasks}
              onTaskUpdate={updateTask}
              onTaskDelete={deleteTask}
              onTaskSelect={setSelectedTaskForAI}
            />
          ) : (
            <TaskListView
              tasks={sortedTasks}
              sortBy={sorting.sortBy as 'created' | 'priority' | 'deadline'}
              onTaskUpdate={updateTask}
              onTaskDelete={deleteTask}
              onTaskSelect={setSelectedTaskForAI}
            />
          )}
        </div>
      )}

      {/* AI Socratic Guide Modal */}
      {selectedTaskForAI && (
        <AiSocraticGuide
          task={selectedTaskForAI}
          onClose={() => setSelectedTaskForAI(null)}
          onTasksCreated={handleTasksCreated}
        />
      )}
    </div>
  );
}