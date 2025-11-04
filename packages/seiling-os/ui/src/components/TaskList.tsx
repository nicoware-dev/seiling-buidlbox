/** Task list component */

import { useState } from "react";
import { useDeleteTask, useTasks, useUpdateTask } from "../hooks/useTasks";
import { Task } from "../services/api";
import TaskForm from "./TaskForm";

interface TaskListProps {
  filter?: "all" | "active" | "completed";
}

export default function TaskList({ filter = "all" }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Determine done filter
  const doneFilter: boolean | undefined =
    filter === "active" ? false : filter === "completed" ? true : undefined;

  const { data: tasks = [], isLoading, error } = useTasks(doneFilter);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleToggleDone = async (task: Task) => {
    await updateTask.mutateAsync({
      id: task.id,
      data: { done: !task.done },
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask.mutateAsync(id);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span>Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-400/40 rounded-lg">
        <div className="text-red-800 dark:text-red-300 font-medium mb-1">Error loading tasks</div>
        <div className="text-red-600 dark:text-red-200 text-sm">{String(error)}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <button
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          New Task
        </button>
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}

      {tasks.length === 0 ? (
        <div className="p-4 text-gray-500 dark:text-gray-300">No tasks found</div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2b3342]"
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => handleToggleDone(task)}
                className="w-5 h-5"
              />
              <div className="flex-1">
                <div
                  className={`font-medium ${
                    task.done ? "line-through text-gray-500" : ""
                  }`}
                >
                  {task.title}
                </div>
                {task.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {task.description}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="px-3 py-1 text-sm bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded hover:bg-red-300 dark:hover:bg-red-800/60"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

