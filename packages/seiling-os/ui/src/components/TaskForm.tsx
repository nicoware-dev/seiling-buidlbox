/** Task form component for creating/editing tasks */

import { useState } from "react";
import { useCreateTask, useUpdateTask } from "../hooks/useTasks";
import { Task } from "../services/api";

interface TaskFormProps {
  task?: Task | null;
  onClose: () => void;
}

export default function TaskForm({ task, onClose }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [done, setDone] = useState(task?.done || false);

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      if (task) {
        await updateTask.mutateAsync({
          id: task.id,
          data: { title, description: description || null, done },
        });
      } else {
        await createTask.mutateAsync({
          title,
          description: description || null,
          done,
        });
      }
      onClose();
    } catch (error) {
      // Error will be handled by React Query's onError
      console.error("Error saving task:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          {task ? "Edit Task" : "New Task"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                title.trim() === "" && createTask.isError
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-blue-500"
              }`}
              required
              placeholder="Enter task title..."
            />
            {title.trim() === "" && (
              <p className="text-xs text-red-600 mt-1">Title is required</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="done"
              checked={done}
              onChange={(e) => setDone(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="done" className="text-sm">
              Completed
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                createTask.isPending ||
                updateTask.isPending ||
                title.trim() === ""
              }
            >
              {createTask.isPending || updateTask.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Saving...
                </span>
              ) : task ? (
                "Update"
              ) : (
                "Create"
              )}
            </button>
          </div>
          {(createTask.isError || updateTask.isError) && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {String(createTask.error || updateTask.error)}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

