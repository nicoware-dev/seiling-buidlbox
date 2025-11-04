/** Main App component */

import { useState } from "react";
import ArtifactList from "./components/ArtifactList";
import KnowledgeSearch from "./components/KnowledgeSearch";
import NoteList from "./components/NoteList";
import RunPanel from "./components/RunPanel";
import TaskList from "./components/TaskList";
import seilingOsLogo from "./assets/icon.png";
import ThemeToggle from "./components/ThemeToggle";

type Tab = "tasks" | "notes" | "artifacts" | "knowledge" | "runs";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("tasks");
  const [taskFilter, setTaskFilter] = useState<"all" | "active" | "completed">(
    "all"
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1220] text-[var(--text)]">
      <header className="bg-white dark:bg-[#23272f] border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <img
              src={seilingOsLogo}
              alt="Seiling OS"
              className="w-50 h-50"
              width={65}
              height={65}
            />
            <div>
              <h1 className="text-3xl font-bold">Seiling OS</h1>
              <p className="text-gray-600 dark:text-gray-300">AI dev workspace</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="mb-6 border-b">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === "tasks"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === "notes"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab("artifacts")}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === "artifacts"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              Artifacts
            </button>
            <button
              onClick={() => setActiveTab("knowledge")}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === "knowledge"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              Knowledge
            </button>
            <button
              onClick={() => setActiveTab("runs")}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === "runs"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              Run Panel
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="bg-white dark:bg-[#23272f] rounded-lg shadow p-6 min-h-[600px] border dark:border-gray-700">
          {activeTab === "tasks" && (
            <div>
              {/* Task filters */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setTaskFilter("all")}
                  className={`px-3 py-1 rounded ${
                    taskFilter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 border dark:border-gray-600"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTaskFilter("active")}
                  className={`px-3 py-1 rounded ${
                    taskFilter === "active"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 border dark:border-gray-600"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setTaskFilter("completed")}
                  className={`px-3 py-1 rounded ${
                    taskFilter === "completed"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 border dark:border-gray-600"
                  }`}
                >
                  Completed
                </button>
              </div>
              <TaskList filter={taskFilter} />
            </div>
          )}

          {activeTab === "notes" && (
            <div className="h-[600px]">
              <NoteList />
            </div>
          )}

          {activeTab === "artifacts" && (
            <div className="h-[600px]">
              <ArtifactList />
            </div>
          )}

          {activeTab === "knowledge" && (
            <div>
              <KnowledgeSearch />
            </div>
          )}

          {activeTab === "runs" && (
            <div>
              <RunPanel />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
